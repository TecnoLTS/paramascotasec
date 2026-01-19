import React from 'react'
import { Metadata } from 'next'
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import Footer from '@/components/Footer/Footer'
import { getProduct, listProducts } from '@/lib/products'
import { ProductType } from '@/type/ProductType'

type SearchParams = {
    type?: string | string[]
    gender?: string | string[]
    category?: string | string[]
}

type Props = {
    searchParams: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const params = await searchParams
    const category = typeof params.category === 'string' ? params.category : ''
    const gender = typeof params.gender === 'string' ? params.gender : ''

    let title = 'Tienda Online'
    if (category) title = `${category.charAt(0).toUpperCase() + category.slice(1)} para Mascotas`
    if (gender) title += ` - ${gender.charAt(0).toUpperCase() + gender.slice(1)}`

    return {
        title: `${title} | ParaMascotasEC`,
        description: `Explora nuestra selección de productos de ${category || 'mascotas'} ${gender || ''}. Los mejores precios en Ecuador.`,
    }
}

export default async function BreadCrumb1({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams
    const type = typeof resolvedSearchParams?.type === 'string' ? resolvedSearchParams.type : null
    const gender = typeof resolvedSearchParams?.gender === 'string' ? resolvedSearchParams.gender : null
    const category = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams.category : null

    let products: ProductType[] = []
    let error: string | null = null
    try {
        products = await listProducts()
    } catch (e: any) {
        error = e.message || 'Error al cargar productos'
    }

    return (
        <>
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>
            {error ? (
                <div className="container py-10 text-center text-red-600">{error}</div>
            ) : !products.length ? (
                <div className="container py-10 text-center">No hay productos disponibles.</div>
            ) : (
                <ShopBreadCrumb1 data={products} productPerPage={9} dataType={type} gender={gender} category={category} />
            )}
            <Footer />
        </>
    )
}