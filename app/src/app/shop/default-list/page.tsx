import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopSidebarList from '@/components/Shop/ShopSidebarList'
import Footer from '@/components/Footer/Footer'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    type?: string | string[]
    category?: string | string[]
    gender?: string | string[]
}

export default async function DefaultList({ searchParams }: { searchParams?: Promise<SearchParams> }) {
    const resolvedSearchParams = await searchParams
    const type = typeof resolvedSearchParams?.type === 'string' ? resolvedSearchParams.type : null
    const category = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams.category : null
    const gender = typeof resolvedSearchParams?.gender === 'string' ? resolvedSearchParams.gender : null
    const { products, error } = await loadProducts()

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>
            {error ? (
                <div className="container py-10 text-center text-red-600">{error}</div>
            ) : !products.length ? (
                <div className="container py-10 text-center">No hay productos disponibles.</div>
            ) : (
                <ShopSidebarList data={products} productPerPage={4} dataType={type} category={category} gender={gender} />
            )}
            <Footer />
        </>
    )
}