import { ProductType } from '@/type/ProductType'

export function generateProductJsonLd(product: ProductType) {
    const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'ParaMascotasEC',
        },
        offers: {
            '@type': 'Offer',
            url: `${siteUrl}/product/default?id=${product.id}`,
            priceCurrency: 'USD',
            price: product.price,
            availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
        },
        aggregateRating: product.rate > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: product.rate,
            reviewCount: product.sold || 1,
        } : undefined,
    }
}

export function generateOrganizationJsonLd() {
    const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ParaMascotasEC',
        url: siteUrl,
        logo: `${siteUrl}/images/logo.png`, // Verify path
        sameAs: [
            'https://www.facebook.com/paramascotasec',
            'https://www.instagram.com/paramascotasec',
        ],
    }
}
