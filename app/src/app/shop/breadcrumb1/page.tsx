import React from 'react'
import { Metadata } from 'next'
import { getSiteConfig } from '@/lib/site'
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import Footer from '@/components/Footer/Footer'
import { fetchProducts } from '@/lib/products'
import { orderProductsFoodFirst } from '@/lib/shopProductOrdering'
import { ProductType } from '@/type/ProductType'
import { buildCatalogCategoryCards } from '@/lib/catalog'

type SearchParams = {
    type?: string | string[]
    gender?: string | string[]
    category?: string | string[]
    query?: string | string[]
}

type Props = {
    searchParams: Promise<SearchParams>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const site = getSiteConfig()
    const params = await searchParams
    const category = typeof params.category === 'string' ? params.category : ''
    const gender = typeof params.gender === 'string' ? params.gender : ''

    let title = 'Tienda Online'
    if (category) title = `${category.charAt(0).toUpperCase() + category.slice(1)}`
    if (gender) title += ` - ${gender.charAt(0).toUpperCase() + gender.slice(1)}`

    return {
        title: `${title} | ${site.name}`,
        description: `Explora nuestra seleccion de productos de ${category || 'catalogo'} ${gender || ''}.`,
    }
}

export default async function BreadCrumb1({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams
    const type = typeof resolvedSearchParams?.type === 'string' ? resolvedSearchParams.type : null
    const gender = typeof resolvedSearchParams?.gender === 'string' ? resolvedSearchParams.gender : null
    const category = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams.category : null
    const query = typeof resolvedSearchParams?.query === 'string' ? resolvedSearchParams.query : null

    let products: ProductType[] = []
    try {
        products = orderProductsFoodFirst(await fetchProducts())
    } catch (error) {
        console.error('No se pudieron cargar productos en BreadCrumb1:', error)
    }
    const availableCategoryIds = buildCatalogCategoryCards(products).map((category) => category.id)
    const footerCategoryIds = availableCategoryIds.filter((categoryId) => categoryId.toLowerCase() !== 'todos')

    return (
        <>
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" searchProducts={products} availableCategoryIds={availableCategoryIds} />
            </div>
            {!products.length ? (
                <div className="container py-10 text-center">No hay productos disponibles.</div>
            ) : (
                <ShopBreadCrumb1 data={products} productPerPage={9} dataType={type} gender={gender} category={category} searchQuery={query} />
            )}
            <Footer categoryIds={footerCategoryIds} />
        </>
    )
}
