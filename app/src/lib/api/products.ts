import { fetchJson, requestApi } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'
import { ProductType } from '@/type/ProductType'
import { mapProductToDto, mapProductsToDto } from '@/lib/productMapper'

export const listProducts = async () => {
  const data = await fetchJson<unknown>(apiEndpoints.products)

  if (!Array.isArray(data)) {
    if (typeof window === 'undefined') {
      console.error('listProducts recibió un payload no válido:', data)
    }
    return []
  }

  return mapProductsToDto(data)
}

export const getProduct = async (id: string) => {
  const data = await fetchJson<any>(apiEndpoints.product(id))
  return mapProductToDto(data)
}

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
