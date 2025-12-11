'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import Footer from '@/components/Footer/Footer'
import useProducts from '@/hooks/useProducts'

export default function DefaultGrid() {
    const searchParams = useSearchParams()
    let type = searchParams.get('type')
    let gender = searchParams.get('gender')
    let category = searchParams.get('category')
    const { products, loading, error } = useProducts()

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>
            {loading ? (
                <div className="container py-10 text-center">Cargando productos...</div>
            ) : error ? (
                <div className="container py-10 text-center text-red-600">{error}</div>
            ) : (
                <ShopBreadCrumb1 data={products} productPerPage={9} dataType={type} gender={gender} category={category} />
            )}
            <Footer />      
        </>
    )
}
