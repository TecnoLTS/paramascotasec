import { fetchJson, requestApi } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'
import { ProductType } from '@/type/ProductType'
import { mapProductToDto, mapProductsToDto } from '@/lib/productMapper'

let cachedProducts: ProductType[] | null = null
let cachedProductsAt = 0
let inFlightProductsRequest: Promise<ProductType[]> | null = null

const getClientProductsCacheTtlMs = () => (
  process.env.NODE_ENV === 'development' ? 5000 : 60000
)

const shouldUseClientProductsCache = () => typeof window !== 'undefined'

const getCachedClientProducts = () => {
  if (!shouldUseClientProductsCache() || !cachedProducts) return null
  if (Date.now() - cachedProductsAt >= getClientProductsCacheTtlMs()) return null
  return cachedProducts
}

const setCachedClientProducts = (products: ProductType[]) => {
  if (!shouldUseClientProductsCache()) return
  cachedProducts = products
  cachedProductsAt = Date.now()
}

const invalidateClientProductsCache = () => {
  cachedProducts = null
  cachedProductsAt = 0
  inFlightProductsRequest = null
}

export const listProducts = async () => {
  const cached = getCachedClientProducts()
  if (cached) {
    return cached
  }

  if (shouldUseClientProductsCache() && inFlightProductsRequest) {
    return inFlightProductsRequest
  }

  const request = fetchJson<unknown>(apiEndpoints.products)
    .then((data) => {
      if (!Array.isArray(data)) {
        if (typeof window === 'undefined') {
          console.error('listProducts recibió un payload no válido:', data)
        }
        return []
      }

      const mappedProducts = mapProductsToDto(data)
      setCachedClientProducts(mappedProducts)
      return mappedProducts
    })
    .finally(() => {
      inFlightProductsRequest = null
    })

  if (shouldUseClientProductsCache()) {
    inFlightProductsRequest = request
  }

  return request
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
  }).finally(() => {
    invalidateClientProductsCache()
  })

export const updateProduct = (id: string, payload: Partial<ProductType>) =>
  requestApi<ProductType>(apiEndpoints.product(id), {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).finally(() => {
    invalidateClientProductsCache()
  })

export const deleteProduct = (id: string) =>
  requestApi<{ ok: boolean }>(apiEndpoints.product(id), { method: 'DELETE' }).finally(() => {
    invalidateClientProductsCache()
  })
