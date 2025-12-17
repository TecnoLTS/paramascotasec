'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopFilterCanvas from '@/components/Shop/ShopFilterCanvas'
import Footer from '@/components/Footer/Footer'
import useProducts from '@/hooks/useProducts'

export default function FilterCanvasProductFive() {
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const { products, loading, error } = useProducts()

    let content: React.ReactNode = null
    if (loading) {
        content = <div className="container py-10 text-center">Cargando productos...</div>
    } else if (error) {
        content = <div className="container py-10 text-center text-red-600">{error}</div>
    } else if (!products.length) {
        content = <div className="container py-10 text-center">No hay productos disponibles.</div>
    } else {
        content = <ShopFilterCanvas data={products} productPerPage={12} dataType={type} productStyle="style-5" />
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
