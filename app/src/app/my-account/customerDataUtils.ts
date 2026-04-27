import type { AdminUserSummary, AddressData } from './types'

type MinimalUser = {
  name?: string | null
  email?: string | null
}

export type SavedAddressFields = {
  firstName: string
  lastName: string
  company: string
  country: string
  street: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
}

export type SavedAddressEntry = {
  id: number
  title: string
  billing: SavedAddressFields
  shipping: SavedAddressFields
  isSame: boolean
}

export const EMPTY_SAVED_ADDRESS_FIELDS: SavedAddressFields = {
  firstName: '',
  lastName: '',
  company: '',
  country: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
}

const hasAddressData = (address: SavedAddressFields) => {
  return Object.values(address).some((value) => String(value || '').trim() !== '')
}

export const normalizeSavedAddressFields = (
  value: unknown,
  fallback: Partial<SavedAddressFields> = {},
): SavedAddressFields => {
  const candidate = normalizeAddressCandidate(value) || {}

  return {
    firstName: String(candidate.firstName ?? fallback.firstName ?? '').trim(),
    lastName: String(candidate.lastName ?? fallback.lastName ?? '').trim(),
    company: String(candidate.company ?? fallback.company ?? '').trim(),
    country: String(candidate.country ?? fallback.country ?? '').trim(),
    street: String(candidate.street ?? fallback.street ?? '').trim(),
    city: String(candidate.city ?? fallback.city ?? '').trim(),
    state: String(candidate.state ?? fallback.state ?? '').trim(),
    zip: String(candidate.zip ?? fallback.zip ?? '').trim(),
    phone: String(candidate.phone ?? fallback.phone ?? '').trim(),
    email: String(candidate.email ?? fallback.email ?? '').trim(),
  }
}

export const createEmptySavedAddressEntry = (
  title = 'Dirección principal',
  index = 0,
): SavedAddressEntry => ({
  id: Date.now() + index,
  title,
  shipping: { ...EMPTY_SAVED_ADDRESS_FIELDS },
  billing: { ...EMPTY_SAVED_ADDRESS_FIELDS },
  isSame: true,
})

export const normalizeSavedAddressEntry = (value: unknown, index = 0): SavedAddressEntry | null => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const shippingCandidate = normalizeSavedAddressFields(source.shipping ?? null)
  const billingCandidate = normalizeSavedAddressFields(source.billing ?? null)
  const flatCandidate = normalizeSavedAddressFields(source)

  const shipping = hasAddressData(shippingCandidate)
    ? shippingCandidate
    : (hasAddressData(flatCandidate) ? flatCandidate : billingCandidate)
  const billing = hasAddressData(billingCandidate)
    ? billingCandidate
    : (hasAddressData(flatCandidate) ? flatCandidate : shipping)

  if (!hasAddressData(shipping) && !hasAddressData(billing)) {
    return null
  }

  const explicitSame = source.isSame
  const isSame = typeof explicitSame === 'boolean'
    ? explicitSame
    : !hasAddressData(billing) || shipping === billing || JSON.stringify(shipping) === JSON.stringify(billing)

  const idValue = Number(source.id)
  const titleValue = String(source.title ?? '').trim()
  const normalizedShipping = { ...shipping }
  const normalizedBilling = isSame ? { ...normalizedShipping } : { ...billing }

  return {
    id: Number.isFinite(idValue) && idValue > 0 ? idValue : (Date.now() + index),
    title: titleValue || (index === 0 ? 'Dirección principal' : `Dirección ${index + 1}`),
    shipping: normalizedShipping,
    billing: normalizedBilling,
    isSame,
  }
}

export const normalizeSavedAddresses = (value: unknown): SavedAddressEntry[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((entry, index) => normalizeSavedAddressEntry(entry, index))
    .filter((entry): entry is SavedAddressEntry => Boolean(entry))
}

export const parseAddress = (value: unknown): AddressData | string | null => {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') {
        return parsed as AddressData
      }
      return value
    } catch {
      return value
    }
  }
  if (typeof value === 'object') {
    return value as AddressData
  }
  return null
}

export const parseJsonValue = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }
  return value
}

export const normalizeAddressCandidate = (value: unknown): AddressData | null => {
  const parsed = parseAddress(value)
  if (!parsed) return null

  if (typeof parsed === 'string') {
    const line = parsed.trim()
    return line ? { street: line } : null
  }

  const source = parsed as Record<string, unknown>
  const firstName = String(source.firstName ?? source.first_name ?? '').trim()
  const lastName = String(source.lastName ?? source.last_name ?? '').trim()
  const company = String(source.company ?? source.businessName ?? source.business_name ?? '').trim()
  const street = String(source.street ?? source.address ?? source.line1 ?? source.address1 ?? '').trim()
  const city = String(source.city ?? '').trim()
  const state = String(source.state ?? source.province ?? '').trim()
  const zip = String(source.zip ?? source.postalCode ?? source.postal_code ?? '').trim()
  const country = String(source.country ?? '').trim()
  const phone = String(source.phone ?? source.mobile ?? '').trim()
  const email = String(source.email ?? '').trim()

  const hasData = [firstName, lastName, company, street, city, state, zip, country, phone, email].some(Boolean)
  if (!hasData) return null

  return {
    firstName,
    lastName,
    company,
    street,
    city,
    state,
    zip,
    country,
    phone,
    email,
  }
}

export const getAdminUserResolvedAddress = (adminUser: AdminUserSummary, profile: Record<string, unknown>): AddressData | null => {
  const rawAddresses = parseJsonValue(adminUser.addresses)
  if (Array.isArray(rawAddresses)) {
    for (const entry of rawAddresses) {
      const candidate =
        normalizeAddressCandidate((entry as Record<string, unknown>)?.shipping) ||
        normalizeAddressCandidate((entry as Record<string, unknown>)?.billing) ||
        normalizeAddressCandidate(entry)
      if (candidate) return candidate
    }
  }

  const profileAddress = normalizeAddressCandidate(
    profile.address || profile.billingAddress || profile.shippingAddress || null,
  )
  if (profileAddress) return profileAddress

  const profileInlineAddress = normalizeAddressCandidate(profile)
  if (profileInlineAddress) return profileInlineAddress

  const lastBilling = normalizeAddressCandidate(adminUser.last_billing_address)
  if (lastBilling) return lastBilling

  const lastShipping = normalizeAddressCandidate(adminUser.last_shipping_address)
  if (lastShipping) return lastShipping

  return null
}

export const formatAddress = (value: unknown) => {
  const addr = parseAddress(value)
  if (!addr || typeof addr === 'string') return addr || '-'
  const parts = [addr.street, addr.city, addr.state, addr.country, addr.zip].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : '-'
}

export const formatAddressLines = (value: unknown) => {
  const addr = parseAddress(value)
  if (!addr) return []
  if (typeof addr === 'string') return [addr]

  const nameLine = [addr.firstName, addr.lastName].filter(Boolean).join(' ')
  const cityLine = [addr.city, addr.state, addr.zip].filter(Boolean).join(', ')

  return [
    nameLine || null,
    addr.company || null,
    addr.street || null,
    cityLine || null,
    addr.country || null,
    addr.phone || null,
    addr.email || null,
  ].filter(Boolean) as string[]
}

export const getDefaultBillingAddress = (savedAddresses: SavedAddressEntry[]): AddressData | null => {
  if (!savedAddresses || savedAddresses.length === 0) return null
  return savedAddresses[0]?.billing || savedAddresses[0]?.shipping || null
}

export const getDefaultShippingAddress = (savedAddresses: SavedAddressEntry[]): AddressData | null => {
  if (!savedAddresses || savedAddresses.length === 0) return null
  return savedAddresses[0]?.shipping || savedAddresses[0]?.billing || null
}

export const getOrderItemsGrossSubtotal = (order: any) => {
  if (!order) return 0
  if (order.items_subtotal !== undefined && order.items_subtotal !== null) {
    const storedSubtotal = Number(order.items_subtotal ?? 0)
    if (Number.isFinite(storedSubtotal) && storedSubtotal >= 0) {
      return storedSubtotal
    }
  }
  if (Array.isArray(order.items)) {
    return order.items.reduce((acc: number, item: any) => {
      const lineNet = Number(item?.net_total ?? NaN)
      const lineTax = Number(item?.tax_amount ?? NaN)
      if (Number.isFinite(lineNet) && Number.isFinite(lineTax)) {
        return acc + lineNet + lineTax
      }
      return acc + Number(item.price ?? 0) * Number(item.quantity ?? 1)
    }, 0)
  }
  return Number(order.total ?? 0)
}

export const getOrderItemsNetSubtotal = (order: any) => {
  if (!order) return 0
  if (Array.isArray(order.items)) {
    const itemsNetTotal = order.items.reduce((acc: number, item: any) => {
      const lineNet = Number(item?.net_total ?? NaN)
      if (Number.isFinite(lineNet)) return acc + lineNet
      const unitNet = Number(item?.price_net ?? NaN)
      const quantity = Number(item?.quantity ?? 1)
      if (Number.isFinite(unitNet)) return acc + unitNet * quantity
      return acc
    }, 0)
    if (itemsNetTotal > 0) return itemsNetTotal
  }
  const grossSubtotal = getOrderItemsGrossSubtotal(order)
  const rate = Number(order?.vat_rate ?? 0)
  const multiplier = 1 + rate / 100
  return multiplier > 0 ? grossSubtotal / multiplier : grossSubtotal
}

export const getOrderShipping = (order: any) => {
  if (!order) return 0
  const stored = Number(order.shipping ?? 0)
  if (stored > 0) return stored
  const itemsSubtotal = getOrderItemsGrossSubtotal(order)
  const total = Number(order.total ?? itemsSubtotal)
  const shipping = total - itemsSubtotal
  return shipping > 0 ? shipping : 0
}

export const getOrderVatSubtotal = (order: any) => {
  if (!order) return 0
  const subtotal = Number(order.vat_subtotal ?? 0)
  if (subtotal > 0) return subtotal
  const rate = Number(order.vat_rate ?? 0)
  const itemsSubtotal = getOrderItemsGrossSubtotal(order)
  const multiplier = 1 + rate / 100
  return multiplier > 0 ? itemsSubtotal / multiplier : itemsSubtotal
}

export const getOrderVatAmount = (order: any) => {
  if (!order) return 0
  const amount = Number(order.vat_amount ?? 0)
  if (amount > 0) return amount
  if (Array.isArray(order.items)) {
    const itemsTaxAmount = order.items.reduce((acc: number, item: any) => {
      const lineTax = Number(item?.tax_amount ?? NaN)
      return Number.isFinite(lineTax) ? acc + lineTax : acc
    }, 0)
    if (itemsTaxAmount > 0) return itemsTaxAmount
  }
  const itemsSubtotal = getOrderItemsGrossSubtotal(order)
  const net = getOrderVatSubtotal(order)
  return itemsSubtotal - net
}

export const getItemNetPrice = (item: any, order: any) => {
  const storedUnitNet = Number(item?.price_net ?? NaN)
  if (Number.isFinite(storedUnitNet) && storedUnitNet >= 0) return storedUnitNet
  const storedLineNet = Number(item?.net_total ?? NaN)
  const quantity = Number(item?.quantity ?? 1)
  if (Number.isFinite(storedLineNet) && quantity > 0) {
    return storedLineNet / quantity
  }
  const rate = Number(order?.vat_rate ?? 0)
  const price = Number(item?.price ?? 0)
  const multiplier = 1 + rate / 100
  return multiplier > 0 ? price / multiplier : price
}

const ORDER_ITEM_IMAGE_FALLBACK = '/images/product/1.webp'

export const normalizeOrderItemImage = (value: unknown) => {
  const raw = String(value || '').trim()
  if (!raw) return ORDER_ITEM_IMAGE_FALLBACK
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/uploads/') || raw.startsWith('/images/')) return raw
  if (raw.startsWith('uploads/')) return `/${raw}`
  return raw.startsWith('/') ? raw : `/${raw}`
}

export const isDynamicOrderItemImage = (value: unknown) => {
  const src = normalizeOrderItemImage(value)
  return /^https?:\/\//i.test(src) || src.startsWith('/uploads/')
}

export const getOrderContact = (
  order: any,
  user: MinimalUser | null,
  savedAddresses: SavedAddressEntry[],
) => {
  if (!order) return { name: '-', email: '-', phone: '-' }

  const shippingRaw = parseAddress(order.shipping_address)
  const billingRaw = parseAddress(order.billing_address)
  const shipping: AddressData = typeof shippingRaw === 'string' || !shippingRaw ? {} : shippingRaw
  const billing: AddressData = typeof billingRaw === 'string' || !billingRaw ? {} : billingRaw
  const nameFromAddress = [shipping.firstName || billing.firstName, shipping.lastName || billing.lastName]
    .filter(Boolean)
    .join(' ')
  const defaultShipping = getDefaultShippingAddress(savedAddresses) || {}
  const defaultBilling = getDefaultBillingAddress(savedAddresses) || {}

  return {
    name: order.customer_name || nameFromAddress || user?.name || '-',
    email: order.customer_email || shipping.email || billing.email || defaultShipping.email || defaultBilling.email || user?.email || '-',
    phone: order.customer_phone || shipping.phone || billing.phone || defaultShipping.phone || defaultBilling.phone || '-',
  }
}
