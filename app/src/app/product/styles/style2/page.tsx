import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopFilterCanvas from '@/components/Shop/ShopFilterCanvas'
import Footer from '@/components/Footer/Footer'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    type?: string | string[]
}

export default async function FilterCanvasProductTwo({ searchParams }: { searchParams?: SearchParams }) {
    const type = typeof searchParams?.type === 'string' ? searchParams.type : null
    const { products, error } = await loadProducts()

    let content: React.ReactNode = null
    if (error) {
        content = <div className="container py-10 text-center text-red-600">{error}</div>
    } else if (!products.length) {
        content = <div className="container py-10 text-center">No hay productos disponibles.</div>
    } else {
        content = <ShopFilterCanvas data={products} productPerPage={12} dataType={type} productStyle="style-2" />
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className="relative w-full">
                <MenuOne props="bg-transparent" />
            </div>
            {content}
            <Footer />
        </>
    )
}
