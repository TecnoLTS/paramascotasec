import React from 'react'
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopBreadCrumbImg from '@/components/Shop/ShopBreadCrumbImg';
import Footer from '@/components/Footer/Footer'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    type?: string | string[]
}

export default async function BreadcrumbImg({ searchParams }: { searchParams?: SearchParams }) {
    const type = typeof searchParams?.type === 'string' ? searchParams.type : null
    const { products, error } = await loadProducts()

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
                <ShopBreadCrumbImg data={products} productPerPage={12} dataType={type} />
            )}
            <Footer />
        </>
    )
}
