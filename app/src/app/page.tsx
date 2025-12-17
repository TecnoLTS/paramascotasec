import React from 'react'
import MenuPet from '@/components/Header/Menu/MenuPet'
import SliderPet from '@/components/Slider/SliderPet'
import Collection from '@/components/Pet/Collection'
import Collection2 from '@/components/Pet/Collection'
import ChooseUs from '@/components/Pet/ChooseUs'
import Banner2 from '@/components/Pet/Banner2'
import FeatureProduct from '@/components/Pet/FeatureProduct'
import AllProducts from '@/components/Product/AllProducts'
import Brand from '@/components/Pet/Brand'
import Benefit from '@/components/Pet/Benefit'
import Footer from '@/components/Footer/Footer'
import petCategoryCards from '@/data/petCategoryCards'
import { fetchProducts } from '@/lib/products'

export default async function HomePet() {
    const products = await fetchProducts()

    return (
        <>
            <div id="header" className="relative w-full style-pet">
                <MenuPet />
            </div>
            <SliderPet />
            <Collection categories={petCategoryCards} />
            <AllProducts data={products} />
            <Benefit props="md:py-10 py-5" />
            <Banner2 />
            <ChooseUs />
            <FeatureProduct data={products} start={0} limit={4} />
            <Collection2 />
            <Brand />
            <Footer />
        </>
    )
}
