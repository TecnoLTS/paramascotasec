'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import Footer from '@/components/Footer/Footer'
import useProducts from '@/hooks/useProducts'

export default function BreadCrumb1() {
    const searchParams = useSearchParams()
    let [type,setType] = useState<string | null | undefined>()
    let datatype = searchParams.get('type')
    let gender = searchParams.get('gender')
    let category = searchParams.get('category')
    const { products, loading, error } = useProducts()

    useEffect(() => {
        setType(datatype);
    }, [datatype]);
    

    return (
        <>
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
