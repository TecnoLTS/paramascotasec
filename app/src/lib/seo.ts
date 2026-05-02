import { ProductType } from '@/type/ProductType'
import { getProductDetailRouteId, getProductReviewCount, getProductSku } from '@/lib/catalog'
import { versionLocalImagePath } from '@/lib/staticAsset'
import type { SiteConfig } from '@/config/siteConfig'
import { getCanonicalSiteUrl } from '@/lib/publicUrl'

const toAbsoluteUrl = (baseUrl: string, path?: string | null) => {
    if (!path) return undefined
    if (/^https?:\/\//i.test(path)) return path
    const normalizedBase = baseUrl.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${normalizedBase}${normalizedPath}`
}

export function generateProductJsonLd(
    product: ProductType,
    options?: { baseUrl?: string; brandName?: string }
) {
    const siteUrl = (options?.baseUrl ?? getCanonicalSiteUrl()).replace(/\/$/, '')
    const brandName = options?.brandName ?? 'ParaMascotasEC'

    const reviewCount = getProductReviewCount(product)

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${siteUrl}/product/default?id=${getProductDetailRouteId(product)}#product`,
        name: product.name,
        sku: getProductSku(product) || product.internalId || product.id,
        category: product.category,
        image: product.images.map((image) => toAbsoluteUrl(siteUrl, image)).filter(Boolean),
        description: product.description,
        url: `${siteUrl}/product/default?id=${getProductDetailRouteId(product)}`,
        brand: {
            '@type': 'Brand',
            name: product.brand || brandName,
        },
        offers: {
            '@type': 'Offer',
            url: `${siteUrl}/product/default?id=${getProductDetailRouteId(product)}`,
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
    const siteUrl = (options?.baseUrl ?? getCanonicalSiteUrl()).replace(/\/$/, '')
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

export function generateWebSiteJsonLd(site: SiteConfig) {
    const siteUrl = getCanonicalSiteUrl()

    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: site.name,
        alternateName: site.shortName,
        url: siteUrl,
        inLanguage: 'es-EC',
        description: site.description,
        publisher: {
            '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/search-result?query={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    }
}

export function generatePetStoreJsonLd(site: SiteConfig) {
    const siteUrl = getCanonicalSiteUrl()
    const logo = toAbsoluteUrl(siteUrl, versionLocalImagePath(site.logo.src))
    const sameAs = [site.social.facebook, site.social.instagram, site.social.twitter, site.social.youtube]
        .filter((url): url is string => Boolean(url))

    return {
        '@context': 'https://schema.org',
        '@type': 'PetStore',
        '@id': `${siteUrl}/#organization`,
        name: site.name,
        alternateName: site.shortName,
        url: siteUrl,
        logo,
        image: logo,
        description: site.description,
        areaServed: {
            '@type': 'Country',
            name: 'Ecuador',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: site.contact.whatsappLabel,
            contactType: 'customer service',
            areaServed: 'EC',
            availableLanguage: ['Spanish', 'es-EC'],
        },
        sameAs,
        knowsAbout: [
            'alimento para perros',
            'alimento para gatos',
            'ropa para mascotas',
            'accesorios para mascotas',
            'salud y cuidado para mascotas',
            'tienda online para mascotas en Ecuador',
        ],
    }
}
