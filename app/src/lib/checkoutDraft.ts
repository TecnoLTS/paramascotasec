'use client'

export interface CheckoutDraftAddress {
    country: string
    state: string
    city: string
    zip: string
    street: string
    latitude: number | null
    longitude: number | null
    formattedAddress: string
    placeId: string
}

export interface CheckoutDraftData {
    note: string
    couponCode: string
    shipping: CheckoutDraftAddress
}

const CHECKOUT_DRAFT_KEY = 'checkoutDraft'

const defaultCheckoutDraft: CheckoutDraftData = {
    note: '',
    couponCode: '',
    shipping: {
        country: 'Ecuador',
        state: '',
        city: '',
        zip: '',
        street: '',
        latitude: null,
        longitude: null,
        formattedAddress: '',
        placeId: '',
    },
}

const canUseStorage = () => typeof window !== 'undefined'

export const normalizeCountryToEcuador = (value: string | null | undefined) => {
    const normalized = String(value || '').trim().toLowerCase()
    if (!normalized) return 'Ecuador'
    if (['ecuador', 'ec', 'república del ecuador', 'republica del ecuador'].includes(normalized)) {
        return 'Ecuador'
    }
    return String(value || '').trim()
}

export const isCountryEcuador = (value: string | null | undefined) => normalizeCountryToEcuador(value) === 'Ecuador'

export const loadCheckoutDraft = (): CheckoutDraftData => {
    if (!canUseStorage()) return defaultCheckoutDraft

    try {
        const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY)
        if (!raw) return defaultCheckoutDraft
        const parsed = JSON.parse(raw) as Partial<CheckoutDraftData>
        return {
            note: String(parsed.note || ''),
            couponCode: String(parsed.couponCode || ''),
            shipping: {
                country: normalizeCountryToEcuador(parsed.shipping?.country),
                state: String(parsed.shipping?.state || ''),
                city: String(parsed.shipping?.city || ''),
                zip: String(parsed.shipping?.zip || ''),
                street: String(parsed.shipping?.street || ''),
                latitude: typeof parsed.shipping?.latitude === 'number' ? parsed.shipping.latitude : null,
                longitude: typeof parsed.shipping?.longitude === 'number' ? parsed.shipping.longitude : null,
                formattedAddress: String(parsed.shipping?.formattedAddress || ''),
                placeId: String(parsed.shipping?.placeId || ''),
            },
        }
    } catch {
        return defaultCheckoutDraft
    }
}

export const saveCheckoutDraft = (partial: Partial<CheckoutDraftData>) => {
    if (!canUseStorage()) return

    const current = loadCheckoutDraft()
    const next: CheckoutDraftData = {
        note: partial.note ?? current.note,
        couponCode: partial.couponCode ?? current.couponCode,
        shipping: {
            country: normalizeCountryToEcuador(partial.shipping?.country ?? current.shipping.country),
            state: partial.shipping?.state ?? current.shipping.state,
            city: partial.shipping?.city ?? current.shipping.city,
            zip: partial.shipping?.zip ?? current.shipping.zip,
            street: partial.shipping?.street ?? current.shipping.street,
            latitude: partial.shipping?.latitude ?? current.shipping.latitude,
            longitude: partial.shipping?.longitude ?? current.shipping.longitude,
            formattedAddress: partial.shipping?.formattedAddress ?? current.shipping.formattedAddress,
            placeId: partial.shipping?.placeId ?? current.shipping.placeId,
        },
    }

    localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(next))
}

export const clearCheckoutDraft = () => {
    if (!canUseStorage()) return
    localStorage.removeItem(CHECKOUT_DRAFT_KEY)
}
