export { apiEndpoints } from './endpoints'
export { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from './products'
export { fetchJson, requestApi } from '@/lib/apiClient'

// Endpoints ligeros disponibles para chequeo rápido de salud/demo.
export type HealthResponse = { ok: boolean; message: string; timestamp: string }
export const healthApi = () => fetchJson<HealthResponse>(apiEndpoints.health)
export const ejemploApi = () => fetchJson<HealthResponse>(apiEndpoints.ejemplo)
export const ejemplo2Api = () => fetchJson<HealthResponse>(apiEndpoints.ejemplo2)
