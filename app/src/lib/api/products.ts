import { fetchJson, requestApi } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'
import { ProductType } from '@/type/ProductType'

export const listProducts = () => fetchJson<ProductType[]>(apiEndpoints.products)

export const getProduct = (id: string) =>
  fetchJson<ProductType>(apiEndpoints.product(id))

export const createProduct = (payload: Partial<ProductType>) =>
  requestApi<ProductType>(apiEndpoints.products, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const updateProduct = (id: string, payload: Partial<ProductType>) =>
  requestApi<ProductType>(apiEndpoints.product(id), {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const deleteProduct = (id: string) =>
  requestApi<{ ok: boolean }>(apiEndpoints.product(id), { method: 'DELETE' })
