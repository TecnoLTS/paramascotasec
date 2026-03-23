import { ProductType } from '@/type/ProductType'
import { getProductReviewCount } from '@/lib/catalog'
import { versionLocalImagePath } from '@/lib/staticAsset'

export function generateProductJsonLd(
    product: ProductType,
    options?: { baseUrl?: string; brandName?: string }
) {
    const siteUrl = (options?.baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
    const brandName = options?.brandName ?? 'ParaMascotasEC'

    const reviewCount = getProductReviewCount(product)

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: product.brand || brandName,
        },
        offers: {
            '@type': 'Offer',
            url: `${siteUrl}/product/default?id=${product.id}`,
            priceCurrency: 'USD',
            price: product.price,
            availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
        },
        aggregateRating: product.rate > 0 && reviewCount > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: product.rate,
            reviewCount,
        } : undefined,
    }
}

export function generateOrganizationJsonLd(options?: { baseUrl?: string; name?: string; logo?: string; sameAs?: string[] }) {
    const siteUrl = (options?.baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
    const name = options?.name ?? 'ParaMascotasEC'

    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url: siteUrl,
        logo: options?.logo ?? `${siteUrl}${versionLocalImagePath('/images/brand/LogoVerde150.svg')}`,
        sameAs: options?.sameAs ?? [
            'https://www.facebook.com/paramascotasec',
            'https://www.instagram.com/paramascotasec',
        ],
    }
}
