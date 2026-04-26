import React from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import { headers } from 'next/headers'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Default from '@/components/Product/Detail/Default';
import Footer from '@/components/Footer/Footer'
import { loadProducts } from '@/lib/products.server'
import { generateProductJsonLd } from '@/lib/seo'
import { buildCatalogCategoryCards, findCatalogProduct } from '@/lib/catalog'
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

    const { products } = await loadProducts({ fresh: true })
    const product = findCatalogProduct(products, id)
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
    const requestHeaders = await headers()
    const nonce = requestHeaders.get('x-nonce') || undefined
    const site = getSiteConfig()
    const resolvedSearchParams = await searchParams
    const { products: productsWithSettings } = await loadProducts({ fresh: true })
    const availableCategoryIds = buildCatalogCategoryCards(productsWithSettings).map((category) => category.id)
    const footerCategoryIds = availableCategoryIds.filter((categoryId) => categoryId.toLowerCase() !== 'todos')
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (productsWithSettings[0]?.id ?? '')
    const currentProduct = findCatalogProduct(productsWithSettings, productId)

    return (
        <>
            {currentProduct && (
                <script
                    nonce={nonce}
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
                <MenuOne props="bg-white" searchProducts={productsWithSettings} availableCategoryIds={availableCategoryIds} />
            </div>
            {!productsWithSettings.length ? (
                <div className="container py-10 text-center">No hay productos disponibles.</div>
            ) : !currentProduct ? (
                <div className="container py-16 text-center">
                    <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8">
                        <h1 className="heading5">Producto no disponible</h1>
                        <p className="mt-3 text-secondary">
                            Este producto ya no está publicado o se quedó sin stock.
                        </p>
                    </div>
                </div>
            ) : (
                <Default data={productsWithSettings} productId={productId} />
            )}
            <Footer categoryIds={footerCategoryIds} />
        </>
    )
}

export default ProductDefault
