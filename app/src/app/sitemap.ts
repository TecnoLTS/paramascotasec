import type { MetadataRoute } from 'next'
import { fetchProducts } from '@/lib/products'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/cart',
    '/checkout',
    '/login',
    '/register',
    '/wishlist',
    '/shop/breadcrumb1',
  ].map((path) => ({
    url: `${baseUrl}${path || '/'}`,
    lastModified: new Date(),
  }))

  try {
    const products = await fetchProducts()
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => {
      const updatedAt = (product as any)?.updatedAt
      return {
        url: `${baseUrl}/product/default?id=${product.id}`,
        lastModified: updatedAt ? new Date(updatedAt) : new Date(),
      }
    })
    return [...staticRoutes, ...productRoutes]
  } catch (err) {
    console.error('No se pudo generar sitemap dinámico de productos', err)
    return staticRoutes
  }
}
