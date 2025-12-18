import { fetchProducts } from '@/lib/products'
import { ProductType } from '@/type/ProductType'

export type ProductsLoadResult = {
  products: ProductType[]
  error: string | null
}

export const loadProducts = async (): Promise<ProductsLoadResult> => {
  try {
    const products = await fetchProducts()
    return { products, error: null }
  } catch (err: any) {
    return {
      products: [],
      error: err?.message ?? 'Error al cargar productos',
    }
  }
}
