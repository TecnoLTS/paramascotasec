import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from './api/products'

const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

export const fetchProducts = async () => {
  // Evita romper el build cuando no hay base de datos disponible en la etapa de compilación.
  if (isBuild && !process.env.DATABASE_URL) return []

  try {
    return await listProducts()
  } catch (err) {
    if (isBuild) return []
    throw err
  }
}

export { listProducts, getProduct, createProduct, updateProduct, deleteProduct }
