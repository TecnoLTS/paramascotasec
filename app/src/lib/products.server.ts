import { fetchProducts } from '@/lib/products'
import { getProductPageSettings } from '@/lib/api/settings'
import { ProductType } from '@/type/ProductType'

export type ProductsLoadResult = {
  products: ProductType[]
  error: string | null
  pageSettings?: {
    deliveryEstimate: string
    viewerCount: number
    freeShippingThreshold: number
    supportHours: string
    returnDays: number
  }
}

export const loadProducts = async (): Promise<ProductsLoadResult> => {
  try {
    const [products, settingsResult] = await Promise.all([
      fetchProducts(),
      getProductPageSettings().catch(() => ({
        deliveryEstimate: '14 de enero - 18 de enero',
        viewerCount: 38,
        freeShippingThreshold: 75,
        supportHours: '8:30 AM a 10:00 PM',
        returnDays: 100,
      })),
    ])
    const withSettings = products.map((product) => ({ ...product, pageSettings: settingsResult }))
    return { products: withSettings, error: null, pageSettings: settingsResult }
  } catch (err: any) {
    return {
      products: [],
      error: err?.message ?? 'Error al cargar productos',
    }
  }
}
