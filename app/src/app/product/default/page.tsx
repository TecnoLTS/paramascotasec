'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
//import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import Default from '@/components/Product/Detail/Default';
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'

const ProductDefault = () => {
    const searchParams = useSearchParams()
    const productId = searchParams.get('id')
    const [products, setProducts] = useState<ProductType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                if (!productId) throw new Error('Producto no especificado')
                const res = await fetch(`/api/products`, { cache: 'no-store' })
                if (!res.ok) throw new Error('No se pudo cargar el producto')
                const data = await res.json()
                setProducts(data)
            } catch (err: any) {
                setError(err?.message ?? 'Error al cargar producto')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [productId])

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-white" />
                
            </div>
            {loading ? (
                <div className="container py-10 text-center">Cargando producto...</div>
            ) : error ? (
                <div className="container py-10 text-center text-red-600">{error}</div>
            ) : (
                <Default data={products} productId={productId} />
            )}
            <Footer />
        </>
    )
}

export default ProductDefault
