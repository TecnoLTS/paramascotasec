import { ProductType } from '@/type/ProductType'

const buildApiUrl = () => {
  const explicitBase = process.env.NEXT_PUBLIC_BASE_URL
  if (explicitBase) return `${explicitBase.replace(/\/$/, '')}/api/products`

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, '')}/api/products`

  // Fallback para dev/local dentro del contenedor
  return `http://localhost:${process.env.PORT ?? 3000}/api/products`
}

export const fetchProducts = async (): Promise<ProductType[]> => {
  const res = await fetch(buildApiUrl(), {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('No se pudieron cargar los productos desde la API')
  }

  return res.json()
}
