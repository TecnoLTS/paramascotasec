import React from 'react'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Default from '@/components/Product/Detail/Default';
import Footer from '@/components/Footer/Footer'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductDefault = async ({ searchParams }: { searchParams?: Promise<SearchParams> }) => {
    const resolvedSearchParams = await searchParams
    const { products, error } = await loadProducts()
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (products[0]?.id ?? '')

    return (
        <>
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-white" />
            </div>
            {error ? (
                <div className="container py-10 text-center text-red-600">{error}</div>
            ) : !products.length ? (
                <div className="container py-10 text-center">No hay productos disponibles.</div>
            ) : (
                <Default data={products} productId={productId} />
            )}
            <Footer />
        </>
    )
}

export default ProductDefault