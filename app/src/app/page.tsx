import React from 'react'
import MenuPet from '@/components/Header/Menu/MenuPet'
import SliderPet from '@/components/Slider/SliderPet'
import Banner from '@/components/Pet/Banner'
import Collection from '@/components/Pet/Collection'
import Collection2 from '@/components/Cosmetic1/Collection'
import Collection3 from '@/components/Home1/Collection'
import Collection4 from '@/components/Jewelry/Collection'
import productData from '@/data/Product.json'
import TabFeatures from '@/components/Pet/TabFeatures'
import ChooseUs from '@/components/Pet/ChooseUs'
import Banner2 from '@/components/Pet/Banner2'
import FeatureProduct from '@/components/Pet/FeatureProduct'
import AllProducts from '@/components/Product/AllProducts'
import Instagram from '@/components/Pet/Instagram'
import Brand from '@/components/Home1/Brand'
import Benefit from '@/components/Home1/Benefit'
import Footer from '@/components/Footer/Footer'
import petCategoryCards from '@/data/petCategoryCards'

export default function HomePet() {
    return (
        <>
            <div id="header" className='relative w-full style-pet'>
                <MenuPet />
            </div>
            <SliderPet />
            
            {/*<Benefit props="md:py-10 py-5" />*/}
            <Collection categories={petCategoryCards} />
            <AllProducts data={productData} />
            <Benefit props="md:py-10 py-5" />
            <Banner2 />
            <ChooseUs />
            {/*<TabFeatures data={productData} start={0} limit={1} />*/}
            <FeatureProduct data={productData} start={0} limit={4} />
            {/*                             <Banner />*/}            <Collection2 />

            {/*<Instagram />*/}
            <Brand />
            <Footer />
        </>
    )
}
