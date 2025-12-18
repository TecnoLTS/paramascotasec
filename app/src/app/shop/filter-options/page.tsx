import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import ShopFilterOptions from '@/components/Shop/ShopFilterOptions'
import Footer from '@/components/Footer/Footer'
import { loadProducts } from '@/lib/products.server'

export default async function FilterOptions() {
    const { products, error } = await loadProducts()

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>
            {error ? (
                <div className="container py-10 text-center text-red-600">{error}</div>
            ) : !products.length ? (
                <div className="container py-10 text-center">No hay productos disponibles.</div>
            ) : (
                <ShopFilterOptions data={products} productPerPage={12} />
            )}
            <Footer />
        </>
    )
}
