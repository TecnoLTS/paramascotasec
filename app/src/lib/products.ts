import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from './api/products'
import { groupCatalogProducts } from './catalog'

const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

export const fetchProducts = async () => {
  // Evita romper el build cuando no hay base de datos disponible en la etapa de compilación.
  if (isBuild && !process.env.DATABASE_URL) return []

  try {
    const products = await listProducts()
    return groupCatalogProducts(products)
  } catch (err) {
    if (isBuild) return []
    throw err
  }
}

export { listProducts, getProduct, createProduct, updateProduct, deleteProduct }
