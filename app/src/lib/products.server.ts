import { unstable_cache } from 'next/cache'
import { fetchProducts } from '@/lib/products'
import { getProductPageSettings } from '@/lib/api/settings'
import { orderProductsFoodFirst } from '@/lib/shopProductOrdering'
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

type LoadProductsOptions = {
  fresh?: boolean
}

const defaultProductPageSettings = {
  deliveryEstimate: '14 de enero - 18 de enero',
  viewerCount: 38,
  freeShippingThreshold: 75,
  supportHours: '8:30 AM a 10:00 PM',
  returnDays: 100,
}

const getCachedProducts = unstable_cache(
  async () => fetchProducts(),
  ['catalog-products'],
  { revalidate: 60, tags: ['catalog-products'] },
)

const getCachedProductPageSettings = unstable_cache(
  async () => getProductPageSettings().catch(() => defaultProductPageSettings),
  ['catalog-product-page-settings'],
  { revalidate: 300, tags: ['catalog-product-page-settings'] },
)

export const loadProducts = async (options: LoadProductsOptions = {}): Promise<ProductsLoadResult> => {
  try {
    const useFreshProducts = options.fresh === true
    const [products, settingsResult] = await Promise.all([
      useFreshProducts ? fetchProducts({ fresh: true }) : getCachedProducts(),
      getCachedProductPageSettings(),
    ])
    const withSettings = orderProductsFoodFirst(products).map((product) => ({ ...product, pageSettings: settingsResult }))
    return { products: withSettings, error: null, pageSettings: settingsResult }
  } catch (err: any) {
    return {
      products: [],
      error: err?.message ?? 'Error al cargar productos',
    }
  }
}
