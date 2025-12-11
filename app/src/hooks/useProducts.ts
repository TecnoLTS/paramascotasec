import { useEffect, useState } from 'react'
import { ProductType } from '@/type/ProductType'
import { fetchProducts } from '@/lib/products'

type UseProductsResult = {
  products: ProductType[]
  loading: boolean
  error: string | null
}

const useProducts = (): UseProductsResult => {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (err: any) {
        setError(err?.message ?? 'Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { products, loading, error }
}

export default useProducts
