'use client'

import React, { useState } from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import ShopCollection from '@/components/Shop/ShopCollection'
import Footer from '@/components/Footer/Footer'
import useProducts from '@/hooks/useProducts'

export default function Collection() {
    const { products, loading, error } = useProducts()

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Shop Collection' subHeading='Collection' />
            </div>
            {loading ? (
                <div className="container py-10 text-center">Cargando productos...</div>
            ) : error ? (
                <div className="container py-10 text-center text-red-600">{error}</div>
            ) : (
                <ShopCollection data={products} />
            )}
            <Footer />
        </>
    )
}
