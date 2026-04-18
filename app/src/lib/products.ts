import {
  listProducts,
  getProduct,
  createProduct as createProductRequest,
  updateProduct as updateProductRequest,
  deleteProduct as deleteProductRequest,
} from './api/products'
import { groupCatalogProducts } from './catalog'
import type { ProductType } from '@/type/ProductType'

const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
let cachedGroupedProducts: ProductType[] | null = null
let cachedGroupedProductsAt = 0
let inFlightGroupedProductsRequest: Promise<ProductType[]> | null = null

const getClientGroupedProductsCacheTtlMs = () => (
  process.env.NODE_ENV === 'development' ? 5000 : 60000
)

const shouldUseClientGroupedProductsCache = () => typeof window !== 'undefined'

const getCachedGroupedProducts = () => {
  if (!shouldUseClientGroupedProductsCache() || !cachedGroupedProducts) return null
  if (Date.now() - cachedGroupedProductsAt >= getClientGroupedProductsCacheTtlMs()) return null
  return cachedGroupedProducts
}

const setCachedGroupedProducts = (products: ProductType[]) => {
  if (!shouldUseClientGroupedProductsCache()) return
  cachedGroupedProducts = products
  cachedGroupedProductsAt = Date.now()
}

const invalidateGroupedProductsCache = () => {
  cachedGroupedProducts = null
  cachedGroupedProductsAt = 0
  inFlightGroupedProductsRequest = null
}

export const fetchProducts = async () => {
  // Evita romper el build cuando no hay base de datos disponible en la etapa de compilación.
  if (isBuild && !process.env.DATABASE_URL) return []

  const cachedProducts = getCachedGroupedProducts()
  if (cachedProducts) {
    return cachedProducts
  }

  if (shouldUseClientGroupedProductsCache() && inFlightGroupedProductsRequest) {
    return inFlightGroupedProductsRequest
  }

  try {
    const request = listProducts()
      .then((products) => {
        const groupedProducts = groupCatalogProducts(products)
        setCachedGroupedProducts(groupedProducts)
        return groupedProducts
      })
      .finally(() => {
        inFlightGroupedProductsRequest = null
      })

    if (shouldUseClientGroupedProductsCache()) {
      inFlightGroupedProductsRequest = request
    }

    return request
  } catch (err) {
    if (isBuild) return []
    throw err
  }
}

export const createProduct = (...args: Parameters<typeof createProductRequest>) =>
  createProductRequest(...args).finally(() => {
    invalidateGroupedProductsCache()
  })

export const updateProduct = (...args: Parameters<typeof updateProductRequest>) =>
  updateProductRequest(...args).finally(() => {
    invalidateGroupedProductsCache()
  })

export const deleteProduct = (...args: Parameters<typeof deleteProductRequest>) =>
  deleteProductRequest(...args).finally(() => {
    invalidateGroupedProductsCache()
  })

export { listProducts, getProduct }
