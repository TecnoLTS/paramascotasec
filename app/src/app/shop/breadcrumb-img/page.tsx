'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopBreadCrumbImg from '@/components/Shop/ShopBreadCrumb1';
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType';

export default function BreadcrumbImg() {
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const [products, setProducts] = useState<ProductType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/products', { cache: 'no-store' })
                if (!res.ok) throw new Error('No se pudieron cargar los productos')
                const data = await res.json()
                setProducts(data)
            } catch (err: any) {
                setError(err?.message ?? 'Error al cargar productos')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

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
                <ShopBreadCrumbImg data={products} productPerPage={12} dataType={type} />
            )}
            <Footer />
        </>
    )
}
