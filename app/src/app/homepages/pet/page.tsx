import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuPet from '@/components/Header/Menu/MenuPet'
import SliderPet from '@/components/Slider/SliderPet'
import Banner from '@/components/Pet/Banner'
import Collection from '@/components/Pet/Collection'
import TabFeatures from '@/components/Pet/TabFeatures'
import ChooseUs from '@/components/Pet/ChooseUs'
import Banner2 from '@/components/Pet/Banner2'
import FeatureProduct from '@/components/Pet/FeatureProduct'
import Benefit from '@/components/Pet/Benefit'
import Instagram from '@/components/Pet/Instagram'
import Brand from '@/components/Pet/Brand'
import Footer from '@/components/Footer/Footer'
import ModalNewsletter from '@/components/Modal/ModalNewsletter'
import { fetchProducts } from '@/lib/products'
import { orderProductsFoodFirst } from '@/lib/shopProductOrdering'
export const dynamic = 'force-dynamic'

export default async function HomePet() {
    const products = orderProductsFoodFirst(await fetchProducts({ fresh: true }))

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan='New customers save 10% with the code GET102222' />
            <div id="header" className='relative w-full style-pet'>
                <MenuPet searchProducts={products} />
                <SliderPet />
            </div>
            <Banner />
            <Collection />
            <TabFeatures data={products} start={0} limit={4} />
            <ChooseUs />
            <Banner2 />
            <FeatureProduct data={products} start={0} limit={4} />
            <Benefit props="md:mt-20 mt-10 md:pt-20 pt-10 border-t border-line" />
            <Instagram />
            <Brand />
            <Footer />
            <ModalNewsletter />
        </>
    )
}
