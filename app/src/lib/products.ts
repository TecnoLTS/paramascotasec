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

const invalidateGroupedProductsCache = () => {
}

export const fetchProducts = async (options?: { fresh?: boolean }) => {
  // Evita romper el build cuando no hay base de datos disponible en la etapa de compilación.
  if (isBuild && !process.env.DATABASE_URL) return []
  try {
    const products = await listProducts({ cache: 'no-store' })
    return groupCatalogProducts(products)
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
