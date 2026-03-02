import { fetchJson, requestApi } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'

export type ProductPageSettings = {
  deliveryEstimate: string
  viewerCount: number
  freeShippingThreshold: number
  supportHours: string
  returnDays: number
}

export type PricingMargins = {
  baseMargin: number
  minMargin: number
  targetMargin: number
  promoBuffer: number
}

export type PricingCalc = {
  rounding: number
  strategy: 'cost_plus' | 'target_margin' | 'competitive'
  includeVatInPvp: boolean
  shippingBuffer: number
}

export type PricingRules = {
  bulkThreshold: number
  bulkDiscount: number
  clearanceThreshold: number
  clearanceDiscount: number
}

export type StoreStatusSettings = {
  salesEnabled: boolean
  message: string
  updatedAt?: string | null
  updatedBy?: string | null
}

export const getProductPageSettings = () =>
  fetchJson<ProductPageSettings>(apiEndpoints.settings.productPage)

export const updateProductPageSettings = (payload: Partial<ProductPageSettings>) =>
  requestApi<ProductPageSettings>(apiEndpoints.settings.productPage, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const getPricingMargins = () =>
  fetchJson<PricingMargins>(apiEndpoints.settings.pricingMargins)

export const updatePricingMargins = (payload: PricingMargins) =>
  requestApi<PricingMargins>(apiEndpoints.settings.pricingMargins, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const getPricingCalc = () =>
  fetchJson<PricingCalc>(apiEndpoints.settings.pricingCalc)

export const updatePricingCalc = (payload: PricingCalc) =>
  requestApi<PricingCalc>(apiEndpoints.settings.pricingCalc, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const getPricingRules = () =>
  fetchJson<PricingRules>(apiEndpoints.settings.pricingRules)

export const updatePricingRules = (payload: PricingRules) =>
  requestApi<PricingRules>(apiEndpoints.settings.pricingRules, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const getStoreStatus = () =>
  fetchJson<StoreStatusSettings>(apiEndpoints.settings.storeStatus)

export const updateStoreStatus = (payload: StoreStatusSettings) =>
  requestApi<StoreStatusSettings>(apiEndpoints.settings.storeStatus, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const getPublicStoreStatus = () =>
  fetchJson<StoreStatusSettings>(apiEndpoints.settings.publicStoreStatus)
