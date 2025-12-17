'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopSidebarList from '@/components/Shop/ShopSidebarList'
import Footer from '@/components/Footer/Footer'
import useProducts from '@/hooks/useProducts'

export default function SidebarList() {
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const gender = searchParams.get('gender')
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
                <ShopSidebarList data={products} productPerPage={4} dataType={type} category={category} gender={gender} />
            )}
            <Footer />
        </>
    )
}
