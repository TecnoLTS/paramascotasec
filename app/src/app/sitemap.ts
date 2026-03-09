import type { MetadataRoute } from 'next'
import { listProducts } from '@/lib/products'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/shop/breadcrumb1',
    '/cart',
    '/checkout',
    '/login',
    '/register',
    '/wishlist',
    '/my-account',
    '/order-tracking',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }))

  if (isBuild) {
    return staticRoutes
  }

  try {
    const products = await listProducts()
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/default?id=${product.id}`,
      lastModified: new Date(), // Ideally we'd have a updatedAt field
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    // We could add categories too if we had a list
    const categories = Array.from(new Set(products.map(p => p.category)))
    const categoryRoutes: MetadataRoute.Sitemap = categories.map(cat => ({
      url: `${baseUrl}/shop/breadcrumb1?category=${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...categoryRoutes, ...productRoutes]
  } catch (err) {
    console.error('No se pudo generar sitemap dinámico', err)
    return staticRoutes
  }
}
