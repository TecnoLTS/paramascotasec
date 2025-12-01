'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import productData from '@/data/Product.json'
import Footer from '@/components/Footer/Footer'

export default function BreadCrumb1() {
    const searchParams = useSearchParams()
    let [type,setType] = useState<string | null | undefined>()
    let datatype = searchParams.get('type')
    let gender = searchParams.get('gender')
    let category = searchParams.get('category')

    useEffect(() => {
        setType(datatype);
    }, [datatype]);
    

    return (
        <>
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>
            <ShopBreadCrumb1 data={productData} productPerPage={9} dataType={type} gender={gender} category={category} />
            <Footer />      
        </>
    )
}
