import type { MetadataRoute } from 'next'
import { getCanonicalSiteUrl } from '@/lib/publicUrl'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getCanonicalSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/cart',
          '/checkout',
          '/checkout2',
          '/login',
          '/register',
          '/forgot-password',
          '/my-account',
          '/wishlist',
        ],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
  }
}
