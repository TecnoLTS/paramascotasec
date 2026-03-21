import React from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Default from '@/components/Product/Detail/Default';
import Footer from '@/components/Footer/Footer'
import { listProducts } from '@/lib/products'
import { getProductPageSettings } from '@/lib/api/settings'
import { generateProductJsonLd } from '@/lib/seo'
import { findCatalogProduct, groupCatalogProducts } from '@/lib/catalog'
import { getSiteConfig } from '@/lib/site'

type SearchParams = {
    id?: string | string[]
}

type Props = {
    searchParams: Promise<SearchParams>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata(
    { searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedSearchParams = await searchParams
    const id = typeof resolvedSearchParams.id === 'string' ? resolvedSearchParams.id : ''

    if (!id) return {}

    const groupedProducts = groupCatalogProducts(await listProducts())
    const product = findCatalogProduct(groupedProducts, id)
    if (!product) return { title: 'Producto no encontrado' }

    const previousImages = (await parent).openGraph?.images || []
    const ogImages = product.thumbImage && product.thumbImage.length > 0
        ? [product.thumbImage[0], ...previousImages]
        : previousImages

    return {
        title: product.name,
        description: product.description.substring(0, 160),
        openGraph: {
            title: product.name,
            description: product.description.substring(0, 160),
            images: ogImages,
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description.substring(0, 160),
            images: product.thumbImage && product.thumbImage.length > 0 ? [product.thumbImage[0]] : [],
        },
    }
}

const ProductDefault = async ({ searchParams }: Props) => {
    const site = getSiteConfig()
    const resolvedSearchParams = await searchParams
    const [rawProducts, pageSettings] = await Promise.all([
        listProducts(),
        getProductPageSettings().catch(() => ({
            deliveryEstimate: '14 de enero - 18 de enero',
            viewerCount: 38,
            freeShippingThreshold: 75,
            supportHours: '8:30 AM a 10:00 PM',
            returnDays: 100,
        })),
    ])
    const groupedProducts = groupCatalogProducts(rawProducts)
    const productsWithSettings = groupedProducts.map((product) => ({ ...product, pageSettings }))
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (productsWithSettings[0]?.id ?? '')
    const currentProduct = findCatalogProduct(productsWithSettings, productId)

    return (
        <>
            {currentProduct && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                            generateProductJsonLd(currentProduct, {
                                baseUrl: site.baseUrl,
                                brandName: site.name,
                            })
                        )
                    }}
                />
            )}
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-white" />
            </div>
            {!productsWithSettings.length ? (
                <div className="container py-10 text-center">No hay productos disponibles.</div>
            ) : (
                <Default data={productsWithSettings} productId={productId} />
            )}
            <Footer />
        </>
    )
}

export default ProductDefault
