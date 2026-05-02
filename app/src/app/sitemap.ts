import type { MetadataRoute } from 'next'
import { getProductDetailRouteId, buildCatalogCategoryCards } from '@/lib/catalog'
import { fetchProducts } from '@/lib/products'
import { getCategoryUrl } from '@/data/petCategoryCards'
import { getCanonicalSiteUrl, toCanonicalUrl } from '@/lib/publicUrl'
import type { ProductType } from '@/type/ProductType'

export const dynamic = 'force-dynamic'

const getValidDate = (value?: string | null) => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const getProductLastModified = (product: ProductType) => {
  const variantDates = product.variantOptions
    ?.flatMap((variant) => [variant.product.updatedAt, variant.product.createdAt])
    .map(getValidDate)
    .filter((date): date is Date => Boolean(date)) ?? []

  const productDates = [product.updatedAt, product.createdAt]
    .map(getValidDate)
    .filter((date): date is Date => Boolean(date))

  const latestTime = [...productDates, ...variantDates]
    .reduce((latest, date) => Math.max(latest, date.getTime()), 0)

  return latestTime > 0 ? new Date(latestTime) : new Date()
}

const isIndexableProduct = (product: ProductType) =>
  product.published !== false && Boolean(getProductDetailRouteId(product))

const getProductUrl = (baseUrl: string, product: ProductType) => {
  const params = new URLSearchParams({ id: String(getProductDetailRouteId(product)) })
  return `${baseUrl}/product/default?${params.toString()}`
}

const uniqueSitemapEntries = (entries: MetadataRoute.Sitemap) => {
  const seen = new Set<string>()
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getCanonicalSiteUrl()
  const generatedAt = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/shop/breadcrumb1',
    '/pages/about',
    '/pages/contact',
    '/pages/faqs',
    '/pages/preguntas-frecuentes',
    '/pages/politica-de-privacidad',
    '/pages/terminos-y-condiciones',
    '/pages/customer-feedbacks',
    '/pages/store-list',
  ].map((path) => ({
    url: toCanonicalUrl(path),
    lastModified: generatedAt,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/shop/breadcrumb1' ? 0.9 : 0.5,
  }))

  try {
    const products = (await fetchProducts({ fresh: true })).filter(isIndexableProduct)
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: getProductUrl(baseUrl, product),
      lastModified: getProductLastModified(product),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    const categoryRoutes: MetadataRoute.Sitemap = buildCatalogCategoryCards(products)
      .filter((category) => category.id.toLowerCase() !== 'todos')
      .map((category) => ({
        url: toCanonicalUrl(getCategoryUrl(category.id)),
        lastModified: generatedAt,
        changeFrequency: 'daily',
        priority: 0.75,
      }))

    return uniqueSitemapEntries([...staticRoutes, ...categoryRoutes, ...productRoutes])
  } catch (err) {
    console.error('No se pudo generar sitemap dinámico', err)
    return staticRoutes
  }
}
