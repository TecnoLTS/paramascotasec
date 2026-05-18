'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type CheckoutLocationAddress = {
    country?: string
    street?: string
    city?: string
    state?: string
    zip?: string
    latitude?: number | null
    longitude?: number | null
    formattedAddress?: string
    placeId?: string
    distanceKm?: number | null
    shippingZone?: 'free_radius' | 'standard_delivery' | string
}

type StoreLocationConfig = {
    address: string
    latitude: number | null
    longitude: number | null
    freeShippingRadiusKm: number
}

type CheckoutLocationPickerProps = {
    address: CheckoutLocationAddress
    storeLocation: StoreLocationConfig
    apiKey?: string
    usageConfig?: {
        minSearchLength?: number
        lookupCooldownSeconds?: number
        maxLookupsPerSession?: number
    }
    sessionStorageNamespace?: string
    onAddressChange: (partial: Partial<CheckoutLocationAddress>) => void
}

type MapsWindow = Window & typeof globalThis & {
    google?: any
    __googleMapsApiPromise?: Promise<any>
    __googleMapsApiResolve?: (() => void) | null
    __googleMapsApiReject?: ((error: Error) => void) | null
}

type CachedLookupEntry = {
    value: Partial<CheckoutLocationAddress>
    expiresAt: number
}

type SessionUsageState = {
    count: number
}

type PlaceSuggestion = {
    description: string
    placeId: string
}

const DEFAULT_CENTER = { lat: -0.148306, lng: -78.490870 }
const DEFAULT_ZOOM = 15
const CACHE_TTL_MS = 1000 * 60 * 60 * 24
const DEFAULT_MIN_SEARCH_LENGTH = 3
const DEFAULT_LOOKUP_COOLDOWN_MS = 2500
const DEFAULT_MAX_LOOKUPS_PER_SESSION = 12
const SUGGESTION_DEBOUNCE_MS = 300

const toFiniteNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const hasValidCoordinates = (latitude: unknown, longitude: unknown) => {
    const lat = toFiniteNumber(latitude)
    const lng = toFiniteNumber(longitude)

    return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const safeReadSessionStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback

    try {
        const raw = window.sessionStorage.getItem(key)
        if (!raw) return fallback
        const parsed = JSON.parse(raw) as T
        return parsed ?? fallback
    } catch {
        return fallback
    }
}

const safeWriteSessionStorage = (key: string, value: unknown) => {
    if (typeof window === 'undefined') return

    try {
        window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
        // ignore storage issues
    }
}

const safeReadLookupCache = (cacheKey: string): Record<string, CachedLookupEntry> => {
    const cache = safeReadSessionStorage<Record<string, CachedLookupEntry>>(cacheKey, {})
    const now = Date.now()
    const nextEntries = Object.entries(cache).filter(([, entry]) => Number(entry?.expiresAt ?? 0) > now)
    return Object.fromEntries(nextEntries)
}

const writeLookupCache = (cacheKey: string, cache: Record<string, CachedLookupEntry>) => {
    safeWriteSessionStorage(cacheKey, cache)
}

const buildSearchCacheKey = (query: string) => `search:${query.trim().toLowerCase()}`
const buildPlaceCacheKey = (placeId: string) => `place:${placeId.trim()}`
const buildCoordsCacheKey = (latitude: number, longitude: number) => `coords:${latitude.toFixed(5)},${longitude.toFixed(5)}`

const getAddressComponent = (components: any[], type: string, fallback = '') => {
    const match = components.find((component) => Array.isArray(component?.types) && component.types.includes(type))
    return String(match?.long_name || match?.short_name || fallback).trim()
}

const buildStreet = (components: any[], formattedAddress: string): string => {
    const route = getAddressComponent(components, 'route')
    const streetNumber = getAddressComponent(components, 'street_number')
    const sublocality = getAddressComponent(components, 'sublocality_level_1') || getAddressComponent(components, 'sublocality')
    const neighborhood = getAddressComponent(components, 'neighborhood')
    const premise = getAddressComponent(components, 'premise') || getAddressComponent(components, 'subpremise')
    const intersection = getAddressComponent(components, 'intersection')
    const landmark = getAddressComponent(components, 'landmark')

    const parts: string[] = []

    if (route && streetNumber) {
        parts.push(`${route} ${streetNumber}`)
    } else if (route) {
        parts.push(route)
    } else if (intersection) {
        parts.push(intersection)
    } else if (premise) {
        parts.push(premise)
    }

    const extra: string[] = []
    if (neighborhood && neighborhood !== sublocality) extra.push(neighborhood)
    if (sublocality) extra.push(sublocality)
    if (landmark) extra.push(landmark)
    if (extra.length > 0) parts.push(extra.join(', '))

    const joined = parts.join(' — ').trim()
    if (joined.length >= 6) return joined

    const sub = [neighborhood, sublocality, premise, intersection, landmark].filter(Boolean).find(s => (s?.length ?? 0) >= 6)
    if (sub) return sub

    const fa = formattedAddress.trim()
    if (fa) {
        const partsFa = fa.split(',').map(s => s.trim()).filter(Boolean)
        return partsFa.slice(0, 3).join(', ')
    }

    return sublocality || route || ''
}

const parsePlaceDetails = (place: any) => {
    const components = Array.isArray(place?.address_components) ? place.address_components : []
    const sublocality = getAddressComponent(components, 'sublocality_level_1') || getAddressComponent(components, 'sublocality')
    const city =
        getAddressComponent(components, 'locality')
        || getAddressComponent(components, 'administrative_area_level_2')
        || getAddressComponent(components, 'sublocality_level_1')
    const state = getAddressComponent(components, 'administrative_area_level_1')
    const zip = getAddressComponent(components, 'postal_code')
    const formattedAddress = String(place?.formatted_address || '').trim()

    return {
        street: buildStreet(components, formattedAddress),
        city,
        state,
        zip,
        country: getAddressComponent(components, 'country', 'Ecuador') || 'Ecuador',
        formattedAddress,
        placeId: String(place?.place_id || '').trim(),
    }
}

const buildSelectionPayload = (place: any, latitude: number, longitude: number): Partial<CheckoutLocationAddress> => {
    const parsed = parsePlaceDetails(place)

    return {
        street: parsed.street,
        city: parsed.city,
        state: parsed.state,
        zip: parsed.zip,
        country: parsed.country || 'Ecuador',
        formattedAddress: parsed.formattedAddress,
        placeId: parsed.placeId,
        latitude,
        longitude,
    }
}

const loadGoogleMapsApi = async (apiKey: string) => {
    const mapsWindow = window as MapsWindow
    if (mapsWindow.google?.maps?.places) {
        return mapsWindow.google
    }

    if (mapsWindow.__googleMapsApiPromise) {
        return mapsWindow.__googleMapsApiPromise
    }

    mapsWindow.__googleMapsApiPromise = new Promise((resolve, reject) => {
        mapsWindow.__googleMapsApiResolve = () => resolve(mapsWindow.google)
        mapsWindow.__googleMapsApiReject = reject

        const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps-checkout="true"]')
        if (existingScript) {
            return
        }

        const callbackName = '__checkoutGoogleMapsInit'
        ;(window as any)[callbackName] = () => {
            mapsWindow.__googleMapsApiResolve?.()
            mapsWindow.__googleMapsApiResolve = null
            mapsWindow.__googleMapsApiReject = null
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=es&region=EC&callback=${callbackName}`
        script.async = true
        script.defer = true
        script.dataset.googleMapsCheckout = 'true'
        script.onerror = () => {
            const error = new Error('No se pudo cargar Google Maps.')
            mapsWindow.__googleMapsApiReject?.(error)
            mapsWindow.__googleMapsApiPromise = undefined
            mapsWindow.__googleMapsApiResolve = null
            mapsWindow.__googleMapsApiReject = null
        }
        document.head.appendChild(script)
    })

    return mapsWindow.__googleMapsApiPromise
}

export default function CheckoutLocationPicker({
    address,
    storeLocation,
    apiKey,
    usageConfig,
    sessionStorageNamespace = 'checkout',
    onAddressChange,
}: CheckoutLocationPickerProps) {
    const inputId = useId()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const mapElementRef = useRef<HTMLDivElement | null>(null)
    const googleRef = useRef<any>(null)
    const geocoderRef = useRef<any>(null)
    const autocompleteServiceRef = useRef<any>(null)
    const placesServiceRef = useRef<any>(null)
    const autocompleteSessionTokenRef = useRef<any>(null)
    const mapRef = useRef<any>(null)
    const userMarkerRef = useRef<any>(null)
    const storeMarkerRef = useRef<any>(null)
    const freeRadiusCircleRef = useRef<any>(null)
    const hydratedSelectionKeyRef = useRef<string | null>(null)
    const lastLookupAtRef = useRef(0)
    const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(apiKey ? 'idle' : 'error')
    const [pickerError, setPickerError] = useState<string | null>(
        apiKey ? null : 'Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar el mapa del checkout.',
    )
    const [searchQuery, setSearchQuery] = useState(address.formattedAddress || '')
    const [searchingAddress, setSearchingAddress] = useState(false)
    const [locatingUser, setLocatingUser] = useState(false)
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
    const [sessionUsage, setSessionUsage] = useState<SessionUsageState>({ count: 0 })
    const minSearchLength = Math.max(3, Number(usageConfig?.minSearchLength ?? DEFAULT_MIN_SEARCH_LENGTH))
    const lookupCooldownMs = Math.max(0, Number(usageConfig?.lookupCooldownSeconds ?? (DEFAULT_LOOKUP_COOLDOWN_MS / 1000))) * 1000
    const maxLookupsPerSession = Math.max(1, Number(usageConfig?.maxLookupsPerSession ?? DEFAULT_MAX_LOOKUPS_PER_SESSION))
    const sessionUsageKey = `${sessionStorageNamespace}:googleMapsUsage`
    const lookupCacheKey = `${sessionStorageNamespace}:googleMapsCache`

    const storeHasCoordinates = hasValidCoordinates(storeLocation.latitude, storeLocation.longitude)
    const currentSelectionHasCoordinates = hasValidCoordinates(address.latitude, address.longitude)
    const storeCenter = storeHasCoordinates
        ? { lat: Number(storeLocation.latitude), lng: Number(storeLocation.longitude) }
        : DEFAULT_CENTER

    const canSpendLookup = useMemo(() => sessionUsage.count < maxLookupsPerSession, [maxLookupsPerSession, sessionUsage.count])

    useEffect(() => {
        setSessionUsage(safeReadSessionStorage<SessionUsageState>(sessionUsageKey, { count: 0 }))
    }, [sessionUsageKey])

    useEffect(() => {
        setSearchQuery(address.formattedAddress || '')
    }, [address.formattedAddress])

    const reserveLookup = () => {
        const next = { count: sessionUsage.count + 1 }
        setSessionUsage(next)
        safeWriteSessionStorage(sessionUsageKey, next)
    }

    const readCachedLookup = (key: string): Partial<CheckoutLocationAddress> | null => {
        const cache = safeReadLookupCache(lookupCacheKey)
        writeLookupCache(lookupCacheKey, cache)
        return cache[key]?.value ?? null
    }

    const writeCachedLookup = (key: string, value: Partial<CheckoutLocationAddress>) => {
        const cache = safeReadLookupCache(lookupCacheKey)
        cache[key] = {
            value,
            expiresAt: Date.now() + CACHE_TTL_MS,
        }
        writeLookupCache(lookupCacheKey, cache)
    }

    const resetAutocompleteSession = () => {
        const googleMaps = googleRef.current
        if (!googleMaps?.maps?.places?.AutocompleteSessionToken) return
        autocompleteSessionTokenRef.current = new googleMaps.maps.places.AutocompleteSessionToken()
    }

    const assertCanLookup = () => {
        if (!canSpendLookup) {
            throw new Error('No pudimos procesar más búsquedas por ahora. Intenta nuevamente en unos minutos.')
        }

        const now = Date.now()
        if (now - lastLookupAtRef.current < lookupCooldownMs) {
            throw new Error('Espera un momento antes de hacer otra consulta.')
        }

        lastLookupAtRef.current = now
    }

    const ensureMapObjects = () => {
        if (!googleRef.current || !mapElementRef.current) return false

        const googleMaps = googleRef.current
        if (!mapRef.current) {
            mapRef.current = new googleMaps.maps.Map(mapElementRef.current, {
                center: currentSelectionHasCoordinates
                    ? { lat: Number(address.latitude), lng: Number(address.longitude) }
                    : storeCenter,
                zoom: DEFAULT_ZOOM,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                gestureHandling: 'cooperative',
            })

            userMarkerRef.current = new googleMaps.maps.Marker({
                map: mapRef.current,
                draggable: true,
                title: 'Ubicación de entrega',
            })
            userMarkerRef.current.setVisible(false)

            googleMaps.maps.event.addListener(userMarkerRef.current, 'dragend', (event: any) => {
                const latitude = event?.latLng?.lat?.()
                const longitude = event?.latLng?.lng?.()
                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
                void reverseGeocode(latitude, longitude)
            })

            googleMaps.maps.event.addListener(mapRef.current, 'click', (event: any) => {
                const latitude = event?.latLng?.lat?.()
                const longitude = event?.latLng?.lng?.()
                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
                void reverseGeocode(latitude, longitude)
            })
        }

        if (storeHasCoordinates && !storeMarkerRef.current) {
            storeMarkerRef.current = new googleMaps.maps.Marker({
                map: mapRef.current,
                position: storeCenter,
                title: 'Local comercial',
                icon: {
                    path: googleMaps.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#1f3b3b',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                },
            })
        }

        if (storeHasCoordinates && !freeRadiusCircleRef.current) {
            freeRadiusCircleRef.current = new googleMaps.maps.Circle({
                map: mapRef.current,
                center: storeCenter,
                radius: Math.max(0, Number(storeLocation.freeShippingRadiusKm || 0)) * 1000,
                fillColor: '#86efac',
                fillOpacity: 0.12,
                strokeColor: '#16a34a',
                strokeOpacity: 0.7,
                strokeWeight: 1.5,
                clickable: false,
            })
        }

        return true
    }

    const updateMarkerPosition = (latitude: number, longitude: number, shouldCenter = true) => {
        if (!ensureMapObjects() || !userMarkerRef.current || !mapRef.current) return

        const position = { lat: latitude, lng: longitude }
        userMarkerRef.current.setPosition(position)
        userMarkerRef.current.setVisible(true)
        if (shouldCenter) {
            mapRef.current.panTo(position)
            mapRef.current.setZoom(Math.max(Number(mapRef.current.getZoom?.() || DEFAULT_ZOOM), DEFAULT_ZOOM))
        }
    }

    const applyResolvedSelection = (partial: Partial<CheckoutLocationAddress>, shouldCenter = true) => {
        const latitude = toFiniteNumber(partial.latitude)
        const longitude = toFiniteNumber(partial.longitude)
        if (latitude === null || longitude === null) return

        setPickerError(null)
        setSuggestions([])
        if (partial.formattedAddress) {
            setSearchQuery(partial.formattedAddress)
        }
        onAddressChange({
            ...partial,
            country: 'Ecuador',
            latitude,
            longitude,
        })
        updateMarkerPosition(latitude, longitude, shouldCenter)
    }

    const resolveGeocodeResponse = (result: any, fallbackLabel = '') => {
        const latitude = result?.geometry?.location?.lat?.()
        const longitude = result?.geometry?.location?.lng?.()
        if (!result || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error('No encontramos una dirección válida. Ajusta la búsqueda o selecciona el punto en el mapa.')
        }

        const payload = buildSelectionPayload(result, latitude, longitude)
        const possibleKeys = [
            payload.formattedAddress ? buildSearchCacheKey(payload.formattedAddress) : '',
            payload.placeId ? buildPlaceCacheKey(payload.placeId) : '',
            fallbackLabel ? buildSearchCacheKey(fallbackLabel) : '',
            buildCoordsCacheKey(latitude, longitude),
        ].filter(Boolean)

        possibleKeys.forEach((key) => writeCachedLookup(key, payload))
        applyResolvedSelection(payload)
    }

    const reverseGeocode = async (latitude: number, longitude: number) => {
        if (!googleRef.current || !geocoderRef.current) {
            applyResolvedSelection({ latitude, longitude, country: 'Ecuador' })
            return
        }

        const cacheKey = buildCoordsCacheKey(latitude, longitude)
        const cached = readCachedLookup(cacheKey)
        if (cached) {
            applyResolvedSelection(cached)
            return
        }

        try {
            assertCanLookup()
            const response = await geocoderRef.current.geocode({
                location: { lat: latitude, lng: longitude },
            })
            reserveLookup()

            const firstResult = response?.results?.[0]
            if (!firstResult) {
                throw new Error('No pudimos resolver esa ubicación. Prueba otro punto del mapa.')
            }

            resolveGeocodeResponse(firstResult)
        } catch (error) {
            applyResolvedSelection({
                latitude,
                longitude,
                country: 'Ecuador',
                formattedAddress: searchQuery.trim() || address.formattedAddress || '',
            })
            setPickerError(error instanceof Error ? error.message : 'No pudimos resolver esa ubicación del mapa.')
        }
    }

    useEffect(() => {
        if (!apiKey) return

        let active = true
        setApiStatus('loading')
        loadGoogleMapsApi(apiKey)
            .then((googleMaps) => {
                if (!active) return
                googleRef.current = googleMaps
                geocoderRef.current = new googleMaps.maps.Geocoder()
                autocompleteServiceRef.current = new googleMaps.maps.places.AutocompleteService()
                placesServiceRef.current = new googleMaps.maps.places.PlacesService(document.createElement('div'))
                resetAutocompleteSession()
                setApiStatus('ready')
                setPickerError(null)
            })
            .catch((error) => {
                if (!active) return
                setApiStatus('error')
                setPickerError(error instanceof Error ? error.message : 'No se pudo inicializar Google Maps.')
            })

        return () => {
            active = false
        }
    }, [apiKey])

    useEffect(() => {
        if (apiStatus !== 'ready') return
        ensureMapObjects()

        if (freeRadiusCircleRef.current && storeHasCoordinates) {
            freeRadiusCircleRef.current.setCenter(storeCenter)
            freeRadiusCircleRef.current.setRadius(Math.max(0, Number(storeLocation.freeShippingRadiusKm || 0)) * 1000)
        }

        if (storeMarkerRef.current && storeHasCoordinates) {
            storeMarkerRef.current.setPosition(storeCenter)
        }
    }, [apiStatus, storeCenter.lat, storeCenter.lng, storeHasCoordinates, storeLocation.freeShippingRadiusKm])

    useEffect(() => {
        if (apiStatus !== 'ready' || !currentSelectionHasCoordinates) return
        updateMarkerPosition(Number(address.latitude), Number(address.longitude), true)
    }, [apiStatus, currentSelectionHasCoordinates, address.latitude, address.longitude])

    useEffect(() => {
        if (apiStatus !== 'ready' || !currentSelectionHasCoordinates) return

        const latitude = Number(address.latitude)
        const longitude = Number(address.longitude)
        const hydrationKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}|${String(address.placeId || '').trim()}|${String(address.formattedAddress || '').trim()}`
        if (hydratedSelectionKeyRef.current === hydrationKey) {
            return
        }

        hydratedSelectionKeyRef.current = hydrationKey

        const hasResolvedAddress =
            String(address.formattedAddress || '').trim() !== ''
            || String(address.placeId || '').trim() !== ''
            || String(address.street || '').trim() !== ''
            || String(address.city || '').trim() !== ''

        if (hasResolvedAddress) {
            applyResolvedSelection({
                ...address,
                latitude,
                longitude,
                country: address.country || 'Ecuador',
            }, true)
            return
        }

        void reverseGeocode(latitude, longitude)
    }, [
        apiStatus,
        currentSelectionHasCoordinates,
        address.latitude,
        address.longitude,
        address.formattedAddress,
        address.placeId,
        address.street,
        address.city,
        address.country,
    ])

    useEffect(() => {
        if (apiStatus !== 'ready' || !autocompleteServiceRef.current || !googleRef.current) {
            setSuggestions([])
            return
        }

        const normalizedQuery = searchQuery.trim()
        const selectedAddress = String(address.formattedAddress || '').trim()

        if (!normalizedQuery || normalizedQuery.length < minSearchLength || normalizedQuery === selectedAddress) {
            setSuggestions([])
            setLoadingSuggestions(false)
            return
        }

        let cancelled = false
        const timeoutId = window.setTimeout(() => {
            const googleMaps = googleRef.current
            setLoadingSuggestions(true)
            autocompleteServiceRef.current.getPlacePredictions(
                {
                    input: normalizedQuery,
                    componentRestrictions: { country: 'ec' },
                    region: 'ec',
                    types: ['address'],
                    sessionToken: autocompleteSessionTokenRef.current,
                },
                (predictions: any[] = [], status: string) => {
                    if (cancelled) return
                    setLoadingSuggestions(false)

                    if (status !== googleMaps.maps.places.PlacesServiceStatus.OK) {
                        setSuggestions([])
                        return
                    }

                    setSuggestions(
                        predictions.slice(0, 5).map((prediction) => ({
                            description: String(prediction?.description || '').trim(),
                            placeId: String(prediction?.place_id || '').trim(),
                        })).filter((prediction) => prediction.description && prediction.placeId),
                    )
                },
            )
        }, SUGGESTION_DEBOUNCE_MS)

        return () => {
            cancelled = true
            window.clearTimeout(timeoutId)
        }
    }, [address.formattedAddress, apiStatus, minSearchLength, searchQuery])

    const resolvePlaceFromDetails = async (placeId: string, fallbackLabel = '') => {
        if (!placesServiceRef.current || !googleRef.current) {
            throw new Error('Google Maps aún se está cargando. Espera un momento e inténtalo otra vez.')
        }

        const placeCacheKey = buildPlaceCacheKey(placeId)
        const cached = readCachedLookup(placeCacheKey)
        if (cached) {
            applyResolvedSelection(cached)
            resetAutocompleteSession()
            return
        }

        assertCanLookup()
        const googleMaps = googleRef.current

        const placeResult = await new Promise<any>((resolve, reject) => {
            placesServiceRef.current.getDetails(
                {
                    placeId,
                    fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
                    sessionToken: autocompleteSessionTokenRef.current,
                },
                (result: any, status: string) => {
                    if (status !== googleMaps.maps.places.PlacesServiceStatus.OK || !result) {
                        reject(new Error('No se pudo cargar esa dirección sugerida.'))
                        return
                    }

                    resolve(result)
                },
            )
        })

        reserveLookup()
        resolveGeocodeResponse(placeResult, fallbackLabel)
        resetAutocompleteSession()
    }

    const handleSearchAddress = async (queryOverride?: string) => {
        const normalizedQuery = (queryOverride ?? searchQuery).trim()
        if (normalizedQuery.length < minSearchLength) {
            setPickerError(`Escribe al menos ${minSearchLength} caracteres antes de buscar.`)
            return
        }

        if (apiStatus !== 'ready' || !geocoderRef.current) {
            setPickerError('Google Maps aún se está cargando. Espera un momento e inténtalo otra vez.')
            return
        }

        const cacheKey = buildSearchCacheKey(normalizedQuery)
        const cached = readCachedLookup(cacheKey)
        if (cached) {
            applyResolvedSelection(cached)
            return
        }

        setSearchingAddress(true)
        setPickerError(null)
        try {
            const matchingSuggestion = suggestions.find((suggestion) => suggestion.description.trim() === normalizedQuery)
            if (matchingSuggestion) {
                await resolvePlaceFromDetails(matchingSuggestion.placeId, matchingSuggestion.description)
                return
            }

            if (suggestions[0]) {
                await resolvePlaceFromDetails(suggestions[0].placeId, suggestions[0].description)
                return
            }

            assertCanLookup()
            const response = await geocoderRef.current.geocode({
                address: normalizedQuery,
                componentRestrictions: { country: 'EC' },
                region: 'EC',
            })
            reserveLookup()

            const firstResult = response?.results?.[0]
            resolveGeocodeResponse(firstResult, normalizedQuery)
            resetAutocompleteSession()
        } catch (error) {
            setPickerError(error instanceof Error ? error.message : 'No se pudo buscar esa dirección.')
        } finally {
            setSearchingAddress(false)
        }
    }

    const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
        if (apiStatus !== 'ready' || !geocoderRef.current) {
            setPickerError('Google Maps aún se está cargando. Espera un momento e inténtalo otra vez.')
            return
        }

        setSearchQuery(suggestion.description)
        setSuggestions([])
        setSearchingAddress(true)
        setPickerError(null)
        try {
            await resolvePlaceFromDetails(suggestion.placeId, suggestion.description)
        } catch (error) {
            setPickerError(error instanceof Error ? error.message : 'No se pudo cargar esa sugerencia.')
        } finally {
            setSearchingAddress(false)
        }
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setPickerError('Tu navegador no soporta geolocalización.')
            return
        }

        if (apiStatus !== 'ready') {
            setPickerError('Google Maps aún se está cargando. Espera un momento e inténtalo otra vez.')
            return
        }

        setLocatingUser(true)
        setPickerError(null)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocatingUser(false)
                void reverseGeocode(position.coords.latitude, position.coords.longitude)
            },
            (error) => {
                setLocatingUser(false)
                if (error.code === error.PERMISSION_DENIED) {
                    setPickerError('No diste permiso para acceder a tu ubicación actual.')
                    return
                }
                setPickerError('No pudimos obtener tu ubicación actual.')
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        )
    }

    return (
        <div className="space-y-4 rounded-xl border border-[#d1d5db] bg-[#f8fafc] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="relative flex-1">
                    <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-[#111827]">
                        Buscar dirección
                    </label>
                    <input
                        ref={inputRef}
                        id={inputId}
                        type="text"
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value)
                            setPickerError(null)
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                if (suggestions[0]) {
                                    void handleSelectSuggestion(suggestions[0])
                                    return
                                }
                                void handleSearchAddress()
                            }
                            if (event.key === 'Escape') {
                                setSuggestions([])
                            }
                        }}
                        placeholder="Escribe tu dirección"
                        className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm placeholder:text-[#9ca3af] focus:border-transparent focus:ring-2 focus:ring-[#2e4d4d]/60"
                        autoComplete="off"
                        disabled={!apiKey}
                    />
                    {(loadingSuggestions || suggestions.length > 0) && (
                        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#dbe4ea] bg-white shadow-lg">
                            {loadingSuggestions && (
                                <div className="px-4 py-3 text-sm text-[#64748b]">Buscando sugerencias...</div>
                            )}
                            {!loadingSuggestions && suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.placeId}
                                    type="button"
                                    onMouseDown={(event) => {
                                        event.preventDefault()
                                        void handleSelectSuggestion(suggestion)
                                    }}
                                    className="block w-full border-b border-[#eef2f7] px-4 py-3 text-left text-sm text-[#111827] transition-colors hover:bg-[#f8fafc] last:border-b-0"
                                >
                                    {suggestion.description}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locatingUser || !apiKey || apiStatus === 'loading'}
                    className="rounded-lg border border-[#1f3b3b] px-4 py-2.5 text-sm font-medium text-[#1f3b3b] transition-colors hover:bg-[#1f3b3b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {locatingUser ? 'Ubicando...' : 'Mi ubicación actual'}
                </button>
            </div>

            <p className="text-sm text-[#6b7280]">
                Escribe y elige una sugerencia, presiona Enter si quieres buscar el texto exacto, usa tu ubicación actual o selecciona el punto exacto en el mapa.
            </p>

            <div className="rounded-lg border border-[#dbe4ea] bg-white p-3 text-sm text-[#475569]">
                <p className="font-medium text-[#111827]">Local base</p>
                <p className="mt-1">{storeLocation.address}</p>
                <p className="mt-1 text-xs text-[#64748b]">
                    Dentro de {Number(storeLocation.freeShippingRadiusKm || 0).toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} km el envío es gratis.
                </p>
            </div>

            <div className="relative">
                <div
                    ref={mapElementRef}
                    className="h-[320px] w-full overflow-hidden rounded-xl border border-[#dbe4ea] bg-[#e2e8f0]"
                    aria-label="Mapa de ubicación de entrega"
                />
                {apiStatus !== 'ready' && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 p-6 text-center text-sm text-[#475569]">
                        {apiStatus === 'loading' ? 'Cargando Google Maps...' : 'Configura Google Maps para habilitar la selección de ubicación.'}
                    </div>
                )}
            </div>

            {address.formattedAddress && (
                <div className="rounded-lg border border-[#dbe4ea] bg-white p-3 text-sm text-[#475569]">
                    <p className="font-medium text-[#111827]">Ubicación seleccionada</p>
                    <p className="mt-1">{address.formattedAddress}</p>
                    {currentSelectionHasCoordinates && (
                        <p className="mt-2 text-xs text-[#64748b]">
                            Coordenadas: {Number(address.latitude).toFixed(6)}, {Number(address.longitude).toFixed(6)}
                        </p>
                    )}
                </div>
            )}

            <div className="rounded-lg border border-[#dbe4ea] bg-white p-3 text-xs text-[#64748b]">
                Haz clic en el mapa o arrastra el marcador para afinar el punto exacto de entrega y calcular correctamente si aplica el envío gratis.
            </div>

            {pickerError && (
                <p className="text-sm text-[#b91c1c]">{pickerError}</p>
            )}
        </div>
    )
}
