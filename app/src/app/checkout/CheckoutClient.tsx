'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
import { Package, Truck, CreditCard, Building2, Banknote } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { createOrder, getQuote } from '@/lib/api'
import { login, register, requestOtp, verifyOtp } from '@/lib/api/auth'
import { fetchJson, requestApi } from '@/lib/apiClient'
import { clearCheckoutDraft, isCountryEcuador, loadCheckoutDraft, normalizeCountryToEcuador, saveCheckoutDraft } from '@/lib/checkoutDraft'

interface AddressData {
    firstName: string;
    lastName: string;
    company: string;
    documentType: string;
    documentNumber: string;
    country: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
}

interface SavedAddress {
    id: string;
    title: string;
    billing: AddressData;
    shipping: AddressData;
    isSame: boolean;
}

const emptyAddress: AddressData = {
    firstName: '',
    lastName: '',
    company: '',
    documentType: '',
    documentNumber: '',
    country: 'Ecuador',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
};

const ensureEcuadorAddress = (address: AddressData): AddressData => ({
    ...address,
    country: 'Ecuador',
})

const fallbackItems = [
    {
        id: 'sample-1',
        name: 'Off-The-Shoulder Blouse',
        size: 'M',
        color: 'Pink',
        quantity: 2,
        price: 32.0,
        image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
    {
        id: 'sample-2',
        name: 'Raglan Sleeve T-Shirt',
        size: 'XS',
        color: 'White',
        quantity: 1,
        price: 28.0,
        image: 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=500',
    }
]

const fallbackSubtotal = fallbackItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

const Checkout = () => {
    const [shippingRates, setShippingRates] = useState<{ delivery: number; pickup: number; taxRate: number }>({ delivery: 0, pickup: 0, taxRate: 0 })
    const [shippingRatesLoaded, setShippingRatesLoaded] = useState(false)

    const [showLogin, setShowLogin] = useState(false)
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'transfer' | 'cash'>('credit')
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
    const [transferSecondsLeft, setTransferSecondsLeft] = useState(600)
    const [transferOrderRef, setTransferOrderRef] = useState(() => Math.floor(1000 + Math.random() * 9000))
    const [transferReference, setTransferReference] = useState('')
    const [transferAmount, setTransferAmount] = useState('')
    const [transferProofName, setTransferProofName] = useState('')
    const [guestOrderId, setGuestOrderId] = useState<string | null>(null)
    const [orderNotes, setOrderNotes] = useState('')

    // Address management state
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string>('one-time')
    const [tempAddress, setTempAddress] = useState<AddressData>(emptyAddress)
    const [billingAddress, setBillingAddress] = useState<AddressData>(emptyAddress)
    const [useBillingSame, setUseBillingSame] = useState(true)
    const [overwriteOriginal, setOverwriteOriginal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
    const { cartState, clearCart, removeFromCart } = useCart()
    const router = useRouter()
    const [availableProductIds, setAvailableProductIds] = useState<Set<string> | null>(null)
    const removedMissingRef = useRef<Set<string>>(new Set())
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loginForm, setLoginForm] = useState({ email: '', password: '' })
    const [loginLoading, setLoginLoading] = useState(false)
    const [contactInfo, setContactInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        documentType: '',
        documentNumber: '',
        businessName: ''
    })
    const [registering, setRegistering] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [otpCode, setOtpCode] = useState('')
    const [otpLoading, setOtpLoading] = useState(false)
    const [otpVerified, setOtpVerified] = useState(false)
    const [otpModalOpen, setOtpModalOpen] = useState(false)
    const keepOneTimeSelectionRef = useRef(false)

    const mergeAddressFields = (current: AddressData, incoming?: Partial<AddressData>) => {
        if (!incoming) return current
        const next = { ...current }
        Object.entries(incoming).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            if (typeof value === 'string' && value.trim() === '') return
            ;(next as any)[key] = value
        })
        next.country = normalizeCountryToEcuador(next.country)
        return next
    }

    useEffect(() => {
        const draft = loadCheckoutDraft()
        setOrderNotes(draft.note)
        setTempAddress((prev) => mergeAddressFields(prev, draft.shipping))
        setBillingAddress((prev) => mergeAddressFields(prev, { country: 'Ecuador' }))

        const saved = localStorage.getItem('savedAddresses') || localStorage.getItem('userAddresses')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setSavedAddresses(parsed)
                if (parsed.length > 0) {
                    setSelectedAddressId(parsed[0].id)
                    setTempAddress(mergeAddressFields(ensureEcuadorAddress(emptyAddress), parsed[0].shipping))
                    setBillingAddress((prev) => mergeAddressFields(prev, parsed[0].billing))
                    setUseBillingSame(!!parsed[0].isSame)
                }
            } catch (e) {
                console.error('Error parsing addresses', e)
            }
        }
    }, [])

    useEffect(() => {
        fetchJson<{ delivery: number; pickup: number; tax_rate?: number }>('/api/settings/shipping')
            .then((data) => {
                if (data && typeof data.delivery === 'number' && typeof data.pickup === 'number') {
                    setShippingRates({
                        delivery: data.delivery,
                        pickup: data.pickup,
                        taxRate: typeof data.tax_rate === 'number' ? data.tax_rate : 0
                    })
                }
            })
            .catch(() => {})
            .finally(() => setShippingRatesLoaded(true))
    }, [])

    useEffect(() => {
        const token = localStorage.getItem('authToken')
        setIsLoggedIn(!!token)
        if (!token) return

        const userRaw = localStorage.getItem('user')
        let email = ''
        let name = ''
        if (userRaw) {
            try {
                const user = JSON.parse(userRaw)
                email = user?.email || ''
                name = user?.name || ''
            } catch (e) {
                console.error('Error parsing user', e)
            }
        }

        requestApi<{ name?: string; profile?: { firstName?: string; lastName?: string; phone?: string; documentType?: string; documentNumber?: string; businessName?: string } }>('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                const profile = res.body.profile || {}
                const fullName = res.body.name || name || ''
                const [firstName, ...rest] = fullName.split(' ')
                setContactInfo((prev) => ({
                    ...prev,
                    firstName: profile.firstName || firstName || '',
                    lastName: profile.lastName || rest.join(' ') || '',
                    email: email || '',
                    phone: profile.phone || ''
                }))
                setBillingAddress((prev) => mergeAddressFields(prev, {
                    documentType: profile.documentType,
                    documentNumber: profile.documentNumber,
                    company: profile.businessName
                }))
            })
            .catch((err) => {
                console.error('No se pudo cargar el perfil', err)
                if (name || email) {
                    const [firstName, ...rest] = name.split(' ')
                    setContactInfo((prev) => ({
                        ...prev,
                        firstName: prev.firstName || firstName || '',
                        lastName: prev.lastName || rest.join(' ') || '',
                        email: prev.email || email || ''
                    }))
                }
            })
    }, [])

    useEffect(() => {
        if (!isLoggedIn) return
        const token = localStorage.getItem('authToken')
        if (!token) return
        requestApi<{ profile?: { documentType?: string; documentNumber?: string; businessName?: string } }>('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                const profile = res.body.profile || {}
                setBillingAddress((prev) => mergeAddressFields(prev, {
                    documentType: profile.documentType,
                    documentNumber: profile.documentNumber,
                    company: profile.businessName
                }))
            })
            .catch(() => {})
    }, [isLoggedIn])

    const handleLoginSubmit = async () => {
        if (!loginForm.email.trim() || !loginForm.password.trim()) {
            setMessage({ text: 'Ingresa tu correo y contraseña.', type: 'error' })
            return
        }
        setLoginLoading(true)
        try {
            const res = await login({ email: loginForm.email, password: loginForm.password })
            localStorage.setItem('authToken', res.token)
            localStorage.setItem('user', JSON.stringify(res.user))
            setIsLoggedIn(true)
            setShowLogin(false)
            setMessage({ text: 'Sesión iniciada correctamente.', type: 'success' })
        } catch (err: any) {
            setMessage({ text: err?.message || 'No se pudo iniciar sesión.', type: 'error' })
        } finally {
            setLoginLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('authToken')
        if (!token) return
        requestApi<{ addresses: SavedAddress[] }>('/api/user/addresses', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                const addresses = Array.isArray(res.body.addresses) ? res.body.addresses : []
                if (addresses.length > 0) {
                    setSavedAddresses(addresses)
                    setSelectedAddressId(addresses[0].id)
                    setTempAddress(mergeAddressFields(ensureEcuadorAddress(emptyAddress), addresses[0].shipping))
                    setBillingAddress((prev) => mergeAddressFields(prev, addresses[0].billing))
                    setUseBillingSame(!!addresses[0].isSame)
                    return
                }

                // Fallback: use local addresses if backend has none, then sync to account
                const stored = localStorage.getItem('savedAddresses') || localStorage.getItem('userAddresses')
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored) as SavedAddress[]
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setSavedAddresses(parsed)
                            setSelectedAddressId(parsed[0].id)
                            setTempAddress(mergeAddressFields(ensureEcuadorAddress(emptyAddress), parsed[0].shipping))
                            setBillingAddress((prev) => mergeAddressFields(prev, parsed[0].billing))
                            setUseBillingSame(!!parsed[0].isSame)
                            requestApi('/api/user/addresses', {
                                method: 'PUT',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ addresses: parsed })
                            }).catch(() => {})
                        }
                    } catch {
                        // ignore parse errors
                    }
                }
            })
            .catch((err) => {
                console.error('No se pudieron cargar las direcciones', err)
            })
    }, [])

    useEffect(() => {
        if (!isLoggedIn) return
        if (savedAddresses.length === 0) return
        if (selectedAddressId === 'one-time') {
            if (keepOneTimeSelectionRef.current) return
            const first = savedAddresses[0]
            setSelectedAddressId(first.id)
            setTempAddress(mergeAddressFields(ensureEcuadorAddress(emptyAddress), first.shipping))
            setBillingAddress((prev) => mergeAddressFields(prev, first.billing))
            setUseBillingSame(!!first.isSame)
        }
    }, [isLoggedIn, savedAddresses, selectedAddressId])

    useEffect(() => {
        const draft = loadCheckoutDraft()
        const shippingDraftChanged =
            draft.shipping.state !== tempAddress.state
            || draft.shipping.city !== tempAddress.city
            || draft.shipping.zip !== tempAddress.zip
            || draft.shipping.country !== normalizeCountryToEcuador(tempAddress.country)
        const noteChanged = draft.note !== orderNotes

        if (!shippingDraftChanged && !noteChanged) return

        saveCheckoutDraft({
            note: orderNotes,
            shipping: {
                country: 'Ecuador',
                state: tempAddress.state,
                city: tempAddress.city,
                zip: tempAddress.zip,
            },
        })
    }, [orderNotes, tempAddress.state, tempAddress.city, tempAddress.zip, tempAddress.country])

    useEffect(() => {
        let mounted = true
        fetchJson<any[]>('/api/products')
            .then((products) => {
                if (!mounted) return
                const ids = new Set<string>()
                products.forEach((p) => {
                    if (p?.id !== undefined && p?.id !== null) ids.add(String(p.id))
                    if (p?.legacyId !== undefined && p?.legacyId !== null) ids.add(String(p.legacyId))
                })
                setAvailableProductIds(ids)
            })
            .catch((err) => {
                console.error('No se pudo cargar el catálogo para validar el carrito', err)
            })
        return () => {
            mounted = false
        }
    }, [])


    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target
        setTempAddress(prev => {
            const nextValue = id === 'country' ? 'Ecuador' : value
            const updated = { ...prev, [id]: nextValue, country: 'Ecuador' }
            if (useBillingSame) {
                const addressFields = {
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    country: 'Ecuador',
                    street: updated.street,
                    city: updated.city,
                    state: updated.state,
                    zip: updated.zip,
                    phone: updated.phone,
                    email: updated.email
                }
                setBillingAddress(current => ({
                    ...current,
                    ...addressFields
                }))
            }
            return updated
        })
    }

    const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target
        const field = target.name || target.id
        if (!field) return
        setBillingAddress(prev => ({
            ...prev,
            [field]: field === 'country' ? 'Ecuador' : target.value,
            country: 'Ecuador'
        }))
    }

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target
        setContactInfo(prev => ({ ...prev, [id]: value }))
    }

    const validateContactInfo = () => {
        if (isLoggedIn) return true
        if (!contactInfo.firstName.trim() || !contactInfo.lastName.trim() || !contactInfo.email.trim() || !contactInfo.phone.trim()) {
            setMessage({ text: 'Completa nombre, apellido, correo y teléfono para continuar.', type: 'error' })
            return false
        }
        const emailOk = /\S+@\S+\.\S+/.test(contactInfo.email)
        if (!emailOk) {
            setMessage({ text: 'Ingresa un correo válido.', type: 'error' })
            return false
        }
        if (!contactInfo.password || contactInfo.password.length < 12) {
            setMessage({ text: 'La contraseña debe tener al menos 12 caracteres.', type: 'error' })
            return false
        }
        if (contactInfo.password !== contactInfo.confirmPassword) {
            setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' })
            return false
        }
        if (!contactInfo.documentType.trim() || !contactInfo.documentNumber.trim()) {
            setMessage({ text: 'Completa el tipo y número de identificación para la facturación.', type: 'error' })
            return false
        }
        return true
    }

    const validateShippingAddress = () => {
        if (deliveryMethod !== 'delivery') return true
        if (!tempAddress.country.trim() || !tempAddress.city.trim() || !tempAddress.zip.trim() || !tempAddress.street.trim()) {
            setMessage({ text: 'Completa país, ciudad, código postal y dirección para el envío.', type: 'error' })
            return false
        }
        if (!isCountryEcuador(tempAddress.country)) {
            setMessage({ text: 'Solo realizamos envíos dentro de Ecuador.', type: 'error' })
            return false
        }
        return true
    }

    const validateBillingAddress = () => {
        const docType = isLoggedIn ? billingAddress.documentType : contactInfo.documentType
        const docNumber = isLoggedIn ? billingAddress.documentNumber : contactInfo.documentNumber
        if (!docType.trim() || !docNumber.trim()) {
            if (!isLoggedIn) {
                setMessage({
                    text: 'Completa el tipo y número de identificación para la facturación.',
                    type: 'error'
                })
            }
            return false
        }
        if (deliveryMethod !== 'delivery') return true
        if (useBillingSame) return true
        if (!billingAddress.country.trim() || !billingAddress.city.trim() || !billingAddress.zip.trim() || !billingAddress.street.trim()) {
            setMessage({ text: 'Completa país, ciudad, código postal y dirección para la facturación.', type: 'error' })
            return false
        }
        if (!isCountryEcuador(billingAddress.country)) {
            setMessage({ text: 'La dirección de facturación debe estar en Ecuador.', type: 'error' })
            return false
        }
        return true
    }

    const handleRegister = async () => {
        setRegistering(true)
        try {
            const fullName = `${contactInfo.firstName} ${contactInfo.lastName}`.trim()
            const newAddress: SavedAddress = {
                id: String(Date.now()),
                title: 'Dirección principal',
                billing: {
                    ...billingAddress,
                    firstName: contactInfo.firstName,
                    lastName: contactInfo.lastName,
                    email: contactInfo.email,
                    phone: contactInfo.phone
                },
                shipping: {
                    ...ensureEcuadorAddress(tempAddress),
                    firstName: contactInfo.firstName,
                    lastName: contactInfo.lastName,
                    email: contactInfo.email,
                    phone: contactInfo.phone
                },
                isSame: useBillingSame
            }

            await register({
                name: fullName,
                email: contactInfo.email,
                password: contactInfo.password,
                documentType: contactInfo.documentType,
                documentNumber: contactInfo.documentNumber,
                businessName: contactInfo.businessName,
                skipVerificationEmail: true
            })
            await requestOtp({ email: contactInfo.email })
            setOtpSent(true)
            setOtpModalOpen(true)
            setMessage({
                text: 'Cuenta creada. Te enviamos un código al correo para verificarlo.',
                type: 'success'
            })
            setSavedAddresses([newAddress])
            setSelectedAddressId(newAddress.id.toString())
            setTempAddress(mergeAddressFields(ensureEcuadorAddress(emptyAddress), newAddress.shipping))
            setBillingAddress((prev) => mergeAddressFields(prev, newAddress.billing))
            const localAddresses = [newAddress]
            localStorage.setItem('savedAddresses', JSON.stringify(localAddresses))
            localStorage.setItem('userAddresses', JSON.stringify(localAddresses))
        } catch (err: any) {
            setMessage({ text: err?.message || 'No se pudo crear la cuenta.', type: 'error' })
        } finally {
            setRegistering(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (!otpCode.trim()) {
            setMessage({ text: 'Ingresa el código de verificación.', type: 'error' })
            return
        }
        setOtpLoading(true)
        try {
            await verifyOtp({ email: contactInfo.email, code: otpCode.trim() })
            const res = await login({ email: contactInfo.email, password: contactInfo.password })
            localStorage.setItem('authToken', res.token)
            localStorage.setItem('user', JSON.stringify(res.user))
            setIsLoggedIn(true)
            setOtpVerified(true)
            setOtpModalOpen(false)
            const pending = localStorage.getItem('userAddresses') || localStorage.getItem('savedAddresses')
            if (pending) {
                try {
                    const parsed = JSON.parse(pending)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        await requestApi('/api/user/addresses', {
                            method: 'PUT',
                            headers: {
                                Authorization: `Bearer ${res.token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ addresses: parsed })
                        })
                        setSavedAddresses(parsed)
                        setSelectedAddressId(parsed[0].id)
                        setTempAddress(mergeAddressFields(ensureEcuadorAddress(emptyAddress), parsed[0].shipping))
                        setBillingAddress((prev) => mergeAddressFields(prev, parsed[0].billing))
                        setUseBillingSame(!!parsed[0].isSame)
                    }
                } catch {
                    // ignore sync errors
                }
            }
            setMessage({ text: 'Correo verificado. Continuemos con tu compra.', type: 'success' })
            setCurrentStep(2)
        } catch (err: any) {
            setMessage({ text: err?.message || 'No se pudo verificar el código.', type: 'error' })
        } finally {
            setOtpLoading(false)
        }
    }

    const handleResendOtp = async () => {
        setOtpLoading(true)
        try {
            await requestOtp({ email: contactInfo.email })
            setMessage({ text: 'Te enviamos un nuevo código.', type: 'success' })
        } catch (err: any) {
            setMessage({ text: err?.message || 'No se pudo reenviar el código.', type: 'error' })
        } finally {
            setOtpLoading(false)
        }
    }

    const handleConfirmStep1 = async () => {
        if (!validateContactInfo()) return
        if (!validateShippingAddress()) return
        if (!validateBillingAddress()) {
            if (isLoggedIn) {
                try {
                    const token = localStorage.getItem('authToken')
                    if (token) {
                        const res = await requestApi<{ profile?: { documentType?: string; documentNumber?: string; businessName?: string } }>('/api/user/profile', {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        const profile = res.body.profile || {}
                        if (profile.documentType && profile.documentNumber) {
                            setBillingAddress((prev) => mergeAddressFields(prev, {
                                documentType: profile.documentType,
                                documentNumber: profile.documentNumber,
                                company: profile.businessName
                            }))
                            return
                        }
                    }
                } catch (err) {
                    // noop: we'll show the validation error below
                }
                setMessage({
                    text: 'Tus datos de facturación no se pudieron cargar. Verifícalos en Mi cuenta.',
                    type: 'error'
                })
            }
            return
        }
        if (!isLoggedIn) {
            if (!otpVerified) {
                if (!otpSent) {
                    handleRegister()
                } else {
                    setMessage({ text: 'Ingresa el código que enviamos a tu correo para continuar.', type: 'error' })
                    setOtpModalOpen(true)
                }
                return
            }
            return
        }
        if (overwriteOriginal && selectedAddressId !== 'one-time') {
            const updated = savedAddresses.map(addr =>
                addr.id === selectedAddressId
                    ? {
                        ...addr,
                        shipping: tempAddress,
                        billing: useBillingSame
                            ? {
                                ...tempAddress,
                                documentType: billingAddress.documentType,
                                documentNumber: billingAddress.documentNumber,
                                company: billingAddress.company
                            }
                            : billingAddress,
                        isSame: useBillingSame
                    }
                    : addr
            )
            setSavedAddresses(updated)
            localStorage.setItem('userAddresses', JSON.stringify(updated))
        }
        setCurrentStep(2)
    }

    const [quote, setQuote] = useState<{
        subtotal: number
        shipping: number
        total: number
        vat_rate?: number
        vat_subtotal?: number
        vat_amount?: number
        discount_total?: number
    } | null>(null)

    const normalizedCart = useMemo(
        () =>
            cartState.cartArray.map((item) => ({
                id: item.id,
                name: item.name || 'Producto',
                size: item.selectedSize || item.sizes?.[0] || '—',
                color: item.selectedColor || item.variation?.[0]?.color || '—',
                quantity: item.quantity,
                price: item.price,
                image: item.thumbImage?.[0]
                    || item.images?.[0]
                    || item.variation?.[0]?.image
                    || item.variation?.[0]?.colorImage
                    || '/images/placeholder.jpg',
            })),
        [cartState.cartArray]
    )

    useEffect(() => {
        const updateQuote = async () => {
            if (normalizedCart.length === 0) return;
            if (availableProductIds) {
                const missing = normalizedCart.filter((item) => !availableProductIds.has(String(item.id)))
                if (missing.length > 0) {
                    missing.forEach((item) => {
                        const id = String(item.id)
                        removeFromCart(id)
                        if (!removedMissingRef.current.has(id)) {
                            removedMissingRef.current.add(id)
                        }
                    })
                    setMessage({
                        text: 'Se eliminaron productos que ya no están disponibles. Revisa tu carrito.',
                        type: 'error'
                    })
                    return
                }
            }
            try {
                const res = await getQuote({
                    items: normalizedCart.map(i => ({ product_id: i.id, quantity: i.quantity })),
                    delivery_method: deliveryMethod
                });
                if (res?.storeDisabled) {
                    setQuote(null)
                    setMessage({
                        text: String(res?.message || 'Tienda temporalmente en mantenimiento. Intenta más tarde.'),
                        type: 'error'
                    })
                    return
                }
                setQuote(res);
            } catch (err) {
                const backendMessage = err instanceof Error ? err.message.trim() : ''
                if (backendMessage.includes('Producto no encontrado')) {
                    const missingId = backendMessage.split(':').pop()?.trim()
                    if (missingId) {
                        removeFromCart(String(missingId))
                        setMessage({
                            text: 'Se eliminó un producto que ya no está disponible. Revisa tu carrito.',
                            type: 'error'
                        })
                        return
                    }
                }
                if (backendMessage && backendMessage !== 'Error interno del servidor') {
                    setMessage({ text: backendMessage, type: 'error' })
                    return
                }
                console.error("Error fetching quote", err);
                setMessage({ text: 'No se pudo calcular el total del pedido.', type: 'error' })
            }
        };
        updateQuote();
    }, [normalizedCart, deliveryMethod, removeFromCart, availableProductIds]);

    const items = normalizedCart
    const subtotal = quote?.subtotal || 0
    const shipping = quote?.shipping || 0
    const fallbackDeliveryFee = shippingRatesLoaded ? shippingRates.delivery : 0
    const fallbackPickupFee = shippingRatesLoaded ? shippingRates.pickup : 0
    const deliveryFeeLabel = deliveryMethod === 'delivery' ? (shipping || fallbackDeliveryFee) : fallbackPickupFee
    const total = quote?.total || 0
    const vatRateValue = Number(quote?.vat_rate ?? 0)
    const vatNetSubtotal = Number(quote?.vat_subtotal ?? 0)
    const vatAmount = Number(quote?.vat_amount ?? 0)
    const discountTotal = Number(quote?.discount_total ?? 0)

    useEffect(() => {
        if (normalizedCart.length === 0) {
            router.push('/cart')
        }
    }, [normalizedCart, router])

    useEffect(() => {
        if (paymentMethod !== 'transfer') {
            setTransferSecondsLeft(600)
        }
    }, [paymentMethod])

    useEffect(() => {
        if (deliveryMethod === 'pickup') {
            setUseBillingSame(false)
        }
    }, [deliveryMethod])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const isStep1 = currentStep === 1
    const isStep2 = currentStep === 2
    const isStep3 = currentStep === 3

    const handleConfirmStep2 = () => {
        if (paymentMethod === 'transfer') {
            if (!transferReference.trim() || !transferAmount.trim()) {
                setMessage({ text: 'Ingresa la referencia y el monto de la transferencia.', type: 'error' })
                return
            }
        }
        setCurrentStep(3)
    }

    const handleFinalizeOrder = async () => {
        if (!isLoggedIn) {
            setMessage({ text: 'Debes iniciar sesión para comprar.', type: 'error' })
            return
        }
        if (!validateContactInfo()) {
            setCurrentStep(1);
            return
        }
        if (!validateShippingAddress()) {
            setCurrentStep(1)
            return
        }
        if (!validateBillingAddress()) {
            setCurrentStep(1)
            return
        }

        setLoading(true);
        setMessage(null);

        try {
            const shippingAddress = {
                ...ensureEcuadorAddress(tempAddress),
                ...contactInfo
            }
            const billingAddressPayload = (deliveryMethod === 'delivery' && useBillingSame)
                ? {
                    ...shippingAddress,
                    documentType: billingAddress.documentType,
                    documentNumber: billingAddress.documentNumber,
                    company: billingAddress.company
                }
                : { ...ensureEcuadorAddress(billingAddress), ...contactInfo }
            const orderData = {
                total, // This is just for local UI, backend will re-calculate.
                status: 'pending',
                delivery_method: deliveryMethod,
                shipping_address: shippingAddress,
                billing_address: billingAddressPayload,
                order_notes: orderNotes.trim() || null,
                payment_details: paymentMethod === 'transfer' ? {
                    reference: transferReference,
                    amount: transferAmount,
                    proof_name: transferProofName || null
                } : null,
                payment_method: paymentMethod,
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };

            const created = await createOrder(orderData);
            const orderId = created?.id || created?.order?.id || null
            if (!isLoggedIn && orderId) {
                setGuestOrderId(orderId)
                setMessage({ text: `¡Pedido realizado con éxito! Tu número de pedido es ${orderId}.`, type: 'success' })
            } else {
                setMessage({ text: '¡Pedido realizado con éxito!', type: 'success' })
            }
            clearCheckoutDraft();
            clearCart();

            setTimeout(() => {
                if (isLoggedIn) {
                    router.push('/my-account');
                }
            }, 2000);

        } catch (err: any) {
            setMessage({ text: err.message || 'Error al procesar el pedido', type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {message && (
                <div className={`fixed top-5 right-5 z-[200] p-4 rounded-lg shadow-2xl border ${message.type === 'success' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'} animate-fadeIn`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <Icon.CheckCircle size={24} weight="fill" /> : <Icon.Warning size={24} weight="fill" />}
                        <span className="font-semibold">{message.text}</span>
                    </div>
                </div>
            )}
            {!isLoggedIn && otpSent && !otpVerified && otpModalOpen && (
                <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#e5e7eb]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[#111827]">Verifica tu correo</h3>
                            <button
                                type="button"
                                onClick={() => setOtpModalOpen(false)}
                                className="text-[#9ca3af] hover:text-[#111827]"
                                aria-label="Cerrar"
                            >
                                <Icon.X size={18} weight="bold" />
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-[#6b7280]">
                            Te enviamos un código de 6 dígitos a <span className="font-medium text-[#111827]">{contactInfo.email}</span>.
                        </p>
                        <form
                            className="mt-4 space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleVerifyOtp()
                            }}
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Código de verificación"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                className="w-full border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                            />
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#1f3b3b] text-white rounded-lg px-4 py-2.5 font-medium hover:bg-[#2e4d4d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={otpLoading}
                                >
                                    {otpLoading ? 'Verificando...' : 'Verificar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="flex-1 border border-[#1f3b3b] text-[#1f3b3b] rounded-lg px-4 py-2.5 font-medium hover:bg-[#2e4d4d1a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={otpLoading}
                                >
                                    Reenviar código
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div id="header" className='relative w-full'>
                <MenuOne />
            </div>
            <div className="bg-[#f7f8fb] py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#111827]">Checkout</h1>
                        <p className="mt-2 text-sm text-[#6b7280]">Complete su pedido en pocos pasos</p>
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { step: 1 as const, label: 'Envío' },
                                { step: 2 as const, label: 'Pago' },
                                { step: 3 as const, label: 'Confirmación' },
                            ].map(({ step, label }) => {
                                const active = currentStep === step
                                const done = currentStep > step
                                return (
                                    <div
                                        key={step}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${active ? 'border-[#2e4d4d] bg-[#2e4d4d1a]' : 'border-[#e5e7eb]'
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${active || done ? 'bg-[#2e4d4d] text-white' : 'bg-[#e5e7eb] text-[#6b7280]'
                                                }`}
                                        >
                                            {done ? '✓' : step}
                                        </div>
                                        <div className={`text-sm font-medium ${active ? 'text-[#1f3b3b]' : 'text-[#6b7280]'}`}>{label}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {isStep1 && (
                                <>
                                    {!isLoggedIn && (
                                        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                            <div
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => setShowLogin(!showLogin)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#6b7280]">¿Ya tienes cuenta?</span>
                                                    <button className="text-[#2e4d4d] hover:text-[#1f3b3b] font-medium">
                                                        Iniciar sesión
                                                    </button>
                                                </div>
                                                <Icon.CaretDown
                                                    className={`text-[#9ca3af] transition-transform ${showLogin ? 'rotate-180' : ''}`}
                                                    size={20}
                                                    weight="bold"
                                                />
                                            </div>

                                            {showLogin && (
                                                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        value={loginForm.email}
                                                        onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="Contraseña"
                                                        value={loginForm.password}
                                                        onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                    />
                                                    <button
                                                        className="sm:col-span-2 bg-[#1f3b3b] text-white rounded-lg px-4 py-2.5 font-medium hover:bg-[#2e4d4d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                                        onClick={handleLoginSubmit}
                                                        disabled={loginLoading}
                                                    >
                                                        {loginLoading ? 'Ingresando...' : 'Iniciar sesión'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                        <h2 className="text-xl font-semibold text-[#111827] mb-4">Información de contacto</h2>
                                        {isLoggedIn ? (
                                            <div className="text-sm text-[#6b7280]">
                                                <p className="text-[#111827] font-medium">{contactInfo.firstName} {contactInfo.lastName}</p>
                                                <p>{contactInfo.email || 'Sin correo registrado'}</p>
                                                <p>{contactInfo.phone || 'Sin teléfono registrado'}</p>
                                                <p className="mt-3 text-xs">Usaremos la información de tu cuenta para el pedido.</p>
                                            </div>
                                        ) : (
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    placeholder="Nombre *"
                                                    value={contactInfo.firstName}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    placeholder="Apellido *"
                                                    value={contactInfo.lastName}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    placeholder="Email *"
                                                    value={contactInfo.email}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    placeholder="Teléfono *"
                                                    value={contactInfo.phone}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <select
                                                    id="documentType"
                                                    value={contactInfo.documentType}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent bg-white"
                                                >
                                                    <option value="">Tipo de identificación *</option>
                                                    <option value="Cédula">Cédula</option>
                                                    <option value="RUC">RUC</option>
                                                    <option value="Pasaporte">Pasaporte</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    id="documentNumber"
                                                    placeholder="Número de identificación *"
                                                    value={contactInfo.documentNumber}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    id="businessName"
                                                    placeholder="Razón social (opcional)"
                                                    value={contactInfo.businessName}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2"
                                                />
                                                <input
                                                    type="password"
                                                    id="password"
                                                    placeholder="Contraseña (mínimo 12 caracteres) *"
                                                    value={contactInfo.password}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    placeholder="Confirmar contraseña *"
                                                    value={contactInfo.confirmPassword}
                                                    onChange={handleContactChange}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <div className="sm:col-span-2 text-xs text-[#6b7280]">
                                                    Necesitas una cuenta para comprar. La cuenta se creará con estos datos.
                                                </div>
                                            </div>
                                        )}
                                        {!isLoggedIn && otpSent && !otpVerified && (
                                            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-[#6b7280]">
                                                <span>Te enviamos un código a tu correo. Revísalo para continuar.</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setOtpModalOpen(true)}
                                                    className="text-[#2e4d4d] font-medium hover:underline text-left"
                                                >
                                                    Verificar correo
                                                </button>
                                            </div>
                                        )}
                                        {isLoggedIn && (
                                            <div className="mt-4 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-[#111827]">Datos de facturación</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push('/my-account')}
                                                        className="text-xs font-medium text-[#2e4d4d] hover:underline"
                                                    >
                                                        Editar en mi cuenta
                                                    </button>
                                                </div>
                                                <div className="mt-2 text-sm text-[#374151] space-y-1">
                                                    <p>Tipo de identificación: {billingAddress.documentType || '—'}</p>
                                                    <p>Número de identificación: {billingAddress.documentNumber || '—'}</p>
                                                    {billingAddress.company && <p>Razón social: {billingAddress.company}</p>}
                                                </div>
                                                {(!billingAddress.documentType || !billingAddress.documentNumber) && (
                                                    <p className="mt-2 text-xs text-[#b45309]">Necesitamos estos datos para emitir la factura.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                        <h2 className="text-xl font-semibold text-[#111827] mb-4">Método de entrega</h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDeliveryMethod('delivery')}
                                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${deliveryMethod === 'delivery'
                                                    ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                    : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                    }`}
                                            >
                                                <Truck className={`w-8 h-8 mb-2 ${deliveryMethod === 'delivery' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                                <span className="font-medium text-[#111827]">Envío a domicilio</span>
                                                <span className="text-sm text-[#6b7280] mt-1">${deliveryFeeLabel.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </button>
                                            <button
                                                onClick={() => setDeliveryMethod('pickup')}
                                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${deliveryMethod === 'pickup'
                                                    ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                    : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                    }`}
                                            >
                                                <Package className={`w-8 h-8 mb-2 ${deliveryMethod === 'pickup' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                                <span className="font-medium text-[#111827]">Retiro en tienda</span>
                                                <span className="text-sm text-[#6b7280] mt-1">
                                                    {fallbackPickupFee === 0 ? 'Gratis' : `$${fallbackPickupFee.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                </span>
                                            </button>
                                        </div>

                                        {deliveryMethod === 'delivery' && (
                                            <div className="mt-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium text-[#111827]">Dirección de envío</h3>
                                                    {savedAddresses.length > 0 && (
                                                        <select
                                                            className="text-sm border border-[#e5e7eb] rounded-lg px-3 py-1.5"
                                                            value={selectedAddressId}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setSelectedAddressId(val);
                                                                if (val !== 'one-time') {
                                                                    keepOneTimeSelectionRef.current = false
                                                                    const addr = savedAddresses.find(a => a.id === val);
                                                                    if (addr) {
                                                                        setTempAddress(mergeAddressFields(ensureEcuadorAddress(emptyAddress), addr.shipping));
                                                                        setBillingAddress((prev) => mergeAddressFields(prev, addr.billing));
                                                                        setUseBillingSame(!!addr.isSame);
                                                                    }
                                                                    setOverwriteOriginal(false);
                                                                } else {
                                                                    keepOneTimeSelectionRef.current = true
                                                                    setTempAddress(emptyAddress);
                                                                }
                                                            }}
                                                        >
                                                            {savedAddresses.map(addr => (
                                                                <option key={addr.id} value={addr.id}>{addr.title}</option>
                                                            ))}
                                                            <option value="one-time">Usar otra dirección (un solo uso)</option>
                                                        </select>
                                                    )}
                                                </div>

                                                {selectedAddressId !== 'one-time' && isLoggedIn && savedAddresses.length > 0 ? (
                                                    <div className="text-sm text-[#6b7280] space-y-1">
                                                        <p className="text-[#111827] font-medium">{tempAddress.firstName} {tempAddress.lastName}</p>
                                                        <p>{tempAddress.street}</p>
                                                        <p>{tempAddress.city}{tempAddress.state ? `, ${tempAddress.state}` : ''} {tempAddress.zip}</p>
                                                        <p>{tempAddress.country}</p>
                                                        {tempAddress.phone && <p>{tempAddress.phone}</p>}
                                                        <p className="mt-2 text-xs">Dirección registrada en tu cuenta.</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <select
                                                            id="country"
                                                            value={tempAddress.country}
                                                            onChange={handleAddressChange}
                                                            className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2 bg-white"
                                                        >
                                                            <option value="Ecuador">Ecuador</option>
                                                        </select>
                                                        <input
                                                            type="text"
                                                            id="city"
                                                            placeholder="Ciudad *"
                                                            value={tempAddress.city}
                                                            onChange={handleAddressChange}
                                                            className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="text"
                                                            id="zip"
                                                            placeholder="Código Postal *"
                                                            value={tempAddress.zip}
                                                            onChange={handleAddressChange}
                                                            className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="text"
                                                            id="street"
                                                            placeholder="Calle y número *"
                                                            value={tempAddress.street}
                                                            onChange={handleAddressChange}
                                                            className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2"
                                                        />

                                                        {selectedAddressId !== 'one-time' && (
                                                            <div className="sm:col-span-2 flex items-center gap-2 p-3 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                                                                <input
                                                                    type="checkbox"
                                                                    id="overwrite"
                                                                    checked={overwriteOriginal}
                                                                    onChange={(e) => setOverwriteOriginal(e.target.checked)}
                                                                    className="w-4 h-4 cursor-pointer text-[#2e4d4d] focus:ring-[#2e4d4d]"
                                                                />
                                                                <label htmlFor="overwrite" className="text-sm cursor-pointer text-[#6b7280]">Actualizar esta dirección guardada con los nuevos cambios</label>
                                                            </div>
                                                        )}

                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {deliveryMethod === 'pickup' && (
                                            <div className="mt-6 p-4 bg-[#2e4d4d1a] rounded-lg border border-[#2e4d4d]/30">
                                                <p className="text-sm text-[#374151]">
                                                    <strong>Dirección de la tienda:</strong><br />
                                                    Av. Principal 123, Local 45<br />
                                                    Ciudad, CP 12345<br />
                                                    Horario: Lun-Vie 9:00-18:00
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-6 space-y-2">
                                            <h3 className="font-medium text-[#111827]">Nota del pedido</h3>
                                            <textarea
                                                placeholder="Entrega, referencias o indicaciones adicionales"
                                                rows={3}
                                                value={orderNotes}
                                                onChange={(e) => setOrderNotes(e.target.value)}
                                                className="w-full border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <p className="text-sm text-[#6b7280]">
                                                Esta nota se guarda en el pedido y la verá el equipo al preparar la compra.
                                            </p>
                                        </div>

                                        <div className="mt-6 space-y-6">
                                            {deliveryMethod === 'delivery' && (
                                                <div className="flex items-center gap-2 p-3 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                                                    <input
                                                        type="checkbox"
                                                        id="billingSame"
                                                        checked={useBillingSame}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked
                                                            setUseBillingSame(checked)
                                                            if (checked) {
                                                                const addressFields = {
                                                                    firstName: tempAddress.firstName,
                                                                    lastName: tempAddress.lastName,
                                                                    country: tempAddress.country,
                                                                    street: tempAddress.street,
                                                                    city: tempAddress.city,
                                                                    state: tempAddress.state,
                                                                    zip: tempAddress.zip,
                                                                    phone: tempAddress.phone,
                                                                    email: tempAddress.email
                                                                }
                                                                setBillingAddress(current => ({
                                                                    ...current,
                                                                    ...addressFields
                                                                }))
                                                            }
                                                        }}
                                                        className="w-4 h-4 cursor-pointer text-[#2e4d4d] focus:ring-[#2e4d4d]"
                                                    />
                                                    <label htmlFor="billingSame" className="text-sm cursor-pointer text-[#6b7280]">
                                                        Usar esta misma dirección para la facturación
                                                    </label>
                                                </div>
                                            )}

                                            {!useBillingSame && (
                                                <div className="space-y-4">
                                                    <h3 className="font-medium text-[#111827]">Dirección de facturación</h3>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <select
                                                            name="country"
                                                            value={billingAddress.country}
                                                            onChange={handleBillingAddressChange}
                                                            className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2 bg-white"
                                                        >
                                                            <option value="Ecuador">Ecuador</option>
                                                        </select>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            placeholder="Ciudad *"
                                                            value={billingAddress.city}
                                                            onChange={handleBillingAddressChange}
                                                            className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="zip"
                                                            placeholder="Código Postal *"
                                                            value={billingAddress.zip}
                                                            onChange={handleBillingAddressChange}
                                                            className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="street"
                                                            placeholder="Calle y número *"
                                                            value={billingAddress.street}
                                                            onChange={handleBillingAddressChange}
                                                            className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                             
                                    </div>
                                </>
                            )}

                            {isStep2 && (
                                <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                    <h2 className="text-xl font-semibold text-[#111827] mb-4">Método de pago</h2>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setPaymentMethod('credit')}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'credit'
                                                ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                }`}
                                        >
                                            <CreditCard className={`w-5 h-5 ${paymentMethod === 'credit' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                            <span className="font-medium text-[#111827]">Tarjeta de crédito/débito</span>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('transfer')}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'transfer'
                                                ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                }`}
                                        >
                                            <Building2 className={`w-5 h-5 ${paymentMethod === 'transfer' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                            <span className="font-medium text-[#111827]">Transferencia bancaria</span>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'cash'
                                                ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                }`}
                                        >
                                            <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                            <span className="font-medium text-[#111827]">Pago en efectivo</span>
                                        </button>
                                    </div>

                                    {paymentMethod === 'credit' && (
                                        <div className="mt-6 space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Número de tarjeta"
                                                className="w-full border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="MM/AA"
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="CVV"
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 text-[#2e4d4d] border-[#e5e7eb] rounded focus:ring-[#2e4d4d]" />
                                                <span className="text-sm text-[#6b7280]">Guardar tarjeta para futuras compras</span>
                                            </label>
                                        </div>
                                    )}

                                    {paymentMethod === 'transfer' && (
                                        <div className="mt-6 p-4 bg-[#f3f4f6] rounded-lg border border-[#e5e7eb] space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-[#374151] font-medium">Transferencia bancaria</p>
                                            </div>
                                            <p className="text-sm text-[#374151]">
                                                <strong>Datos bancarios:</strong><br />
                                                Banco: Banco Ejemplo<br />
                                                Cuenta: 1234567890<br />
                                                IBAN: ES91 2100 0418 4502 0005 1332<br />
                                                Concepto: Pedido #{transferOrderRef}
                                            </p>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Referencia de pago"
                                                    value={transferReference}
                                                    onChange={(e) => setTransferReference(e.target.value)}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Monto pagado"
                                                    value={transferAmount}
                                                    onChange={(e) => setTransferAmount(e.target.value)}
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <label className="sm:col-span-2 border border-dashed border-[#2e4d4d] bg-white rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[#f8fafc] transition-colors">
                                                    <span className="w-9 h-9 rounded-full bg-[#2e4d4d]/10 text-[#2e4d4d] flex items-center justify-center">
                                                        <Icon.UploadSimple size={18} weight="bold" />
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-[#111827]">Adjuntar comprobante (opcional, recomendado)</p>
                                                        <p className="text-xs text-[#6b7280]">
                                                            {transferProofName ? transferProofName : 'PNG, JPG o PDF'}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setTransferProofName(e.target.files?.[0]?.name || '')}
                                                        className="hidden"
                                                        accept=".png,.jpg,.jpeg,.pdf"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'cash' && (
                                        <div className="mt-6 p-4 bg-[#fef9c3] rounded-lg border border-[#fde68a]">
                                            <p className="text-sm text-[#374151]">
                                                El pago se realizará al momento de {deliveryMethod === 'pickup' ? 'recoger' : 'recibir'} el pedido.
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-between">
                                        <button
                                            className="text-sm font-medium text-[#1f3b3b] border border-[#1f3b3b] rounded-lg px-4 py-2 hover:bg-[#2e4d4d1a] transition-colors"
                                            onClick={() => setCurrentStep(1)}
                                        >
                                            Volver a envío
                                        </button>
                                        <button
                                            className="bg-[#1f3b3b] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-[#2e4d4d] transition-colors"
                                            onClick={handleConfirmStep2}
                                        >
                                            Ir a resumen
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isStep3 && (
                                <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                    <h2 className="text-xl font-semibold text-[#111827] mb-6">Confirmación de Pedido</h2>
                                    {!isLoggedIn && guestOrderId && (
                                        <div className="mb-6 p-4 rounded-xl border border-[#d1fae5] bg-[#ecfdf5] text-[#065f46] text-sm font-medium">
                                            Tu número de pedido es <span className="font-bold">{guestOrderId}</span>. Guárdalo para seguimiento.
                                        </div>
                                    )}

                                    <div className="grid sm:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <h3 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-3">Contacto</h3>
                                            <p className="text-[#111827] font-medium">{contactInfo.firstName} {contactInfo.lastName}</p>
                                            <p className="text-sm text-[#6b7280]">{contactInfo.email}</p>
                                            <p className="text-sm text-[#6b7280]">{contactInfo.phone}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-3">Entrega</h3>
                                            {deliveryMethod === 'pickup' ? (
                                                <p className="text-sm text-[#374151]">Retiro en tienda (Gratis)</p>
                                            ) : (
                                                <>
                                                    <p className="text-[#111827] font-medium">{tempAddress.street}</p>
                                                    <p className="text-sm text-[#6b7280]">{tempAddress.city}, {tempAddress.zip}</p>
                                                    <p className="text-sm text-[#6b7280]">{tempAddress.country}</p>
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-3">Método de Pago</h3>
                                            <p className="text-[#111827] font-medium">
                                                {paymentMethod === 'credit' && 'Tarjeta de Crédito/Débito'}
                                                {paymentMethod === 'transfer' && 'Transferencia Bancaria'}
                                                {paymentMethod === 'cash' && 'Pago en Efectivo'}
                                            </p>
                                            {paymentMethod === 'transfer' && (
                                                <div className="text-sm text-[#6b7280] mt-2 space-y-1">
                                                    <p>Referencia: {transferReference || '—'}</p>
                                                    <p>Monto: {transferAmount ? `$${Number(transferAmount).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</p>
                                                    {transferProofName && <p>Comprobante: {transferProofName}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-8">
                                        <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                                            <Icon.CheckCircle weight="fill" />
                                            Revisa que toda la información sea correcta antes de confirmar.
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t border-[#e5e7eb]">
                                        <button
                                            className="text-sm font-medium text-[#1f3b3b] hover:underline"
                                            onClick={() => setCurrentStep(2)}
                                        >
                                            ← Volver a pago
                                        </button>
                                        <button
                                            className="bg-[#1f3b3b] text-white rounded-lg px-8 py-3 font-bold hover:bg-[#2e4d4d] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleFinalizeOrder}
                                            disabled={loading}
                                        >
                                            {loading ? 'Procesando...' : 'Finalizar Compra'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb] sticky top-8">
                                <h2 className="text-xl font-semibold text-[#111827] mb-4">Resumen del pedido</h2>

                                <div className="space-y-4 mb-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#f3f4f6] flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.currentTarget
                                                        if (!target.dataset.fallback) {
                                                            target.dataset.fallback = 'true'
                                                            target.src = '/images/placeholder.jpg'
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-medium text-[#111827] truncate">{item.name || 'Producto'}</h3>
                                                        {(item.size !== '—' || item.color !== '—') && (
                                                            <p className="text-xs text-[#6b7280] mt-1">
                                                                {[item.size, item.color].filter((val) => val && val !== '—').join(' / ') || '—'}
                                                            </p>
                                                        )}
                                                        <span className="text-xs text-[#6b7280] mt-1 inline-block">x{item.quantity}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-[#111827] text-right whitespace-nowrap">
                                                        ${(item.price * item.quantity).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-[#e5e7eb] pt-4 space-y-2">
                                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm">
                                        <span className="text-[#6b7280]">Subtotal sin IVA</span>
                                        <span className="text-[#111827] text-right tabular-nums">${vatNetSubtotal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    {vatRateValue > 0 && (
                                        <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm">
                                            <span className="text-[#6b7280]">IVA ({vatRateValue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</span>
                                            <span className="text-[#111827] text-right tabular-nums">${vatAmount.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {discountTotal > 0 && (
                                        <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm">
                                            <span className="text-[#6b7280]">Descuento</span>
                                            <span className="text-green-600 text-right tabular-nums">-${discountTotal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm">
                                        <span className="text-[#6b7280]">Envío</span>
                                        <span className="text-[#111827] text-right tabular-nums">
                                            {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-[#e5e7eb] pt-2 mt-2">
                                        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                            <span className="text-lg font-semibold text-[#111827]">Total</span>
                                            <span className="text-lg font-semibold text-[#111827] text-right tabular-nums">${total.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="w-full mt-6 bg-[#1f3b3b] text-white rounded-lg px-6 py-3 font-medium hover:bg-[#2e4d4d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    onClick={() => {
                                        if (currentStep === 1) {
            handleConfirmStep1()
        } else if (currentStep === 2) {
            handleConfirmStep2()
        } else if (currentStep === 3) {
                                            handleFinalizeOrder()
                                        }
                                    }}
                                    disabled={(currentStep === 3 && loading) || (currentStep === 1 && registering)}
                                >
                                    {currentStep === 3
                                        ? (loading ? 'Procesando...' : 'Finalizar compra')
                                        : (currentStep === 1 && !isLoggedIn
                                            ? (registering ? 'Creando cuenta...' : 'Crear cuenta y continuar')
                                            : 'Continuar')}
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6b7280]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Pago seguro y encriptado</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Checkout
