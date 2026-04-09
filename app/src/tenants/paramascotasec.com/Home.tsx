import React from 'react'
import dynamic from 'next/dynamic'
import MenuPet from '@/components/Header/Menu/MenuPet'
import SliderPet from '@/components/Slider/SliderPet'
import Footer from '@/components/Footer/Footer'
import ScrollToTopOnMount from '@/components/ScrollToTopOnMount'
import { ProductType } from '@/type/ProductType'

const Collection = dynamic(() => import('@/components/Pet/Collection'))
const Collection2 = dynamic(() => import('@/components/Pet/Collection2'))
const FeatureProduct = dynamic(() => import('@/components/Pet/FeatureProduct'))
const ChooseUs = dynamic(() => import('@/components/Pet/ChooseUs'))
const AllProducts = dynamic(() => import('@/components/Product/AllProducts'))
const Benefit = dynamic(() => import('@/components/Pet/Benefit'))
const Brand = dynamic(() => import('@/components/Pet/Brand'))

const ParamascotasecHome = ({
  products,
}: {
  products: ProductType[]
}) => {
  return (
    <>
      <ScrollToTopOnMount />
      <div id="header" className="relative w-full style-pet">
        <MenuPet searchProducts={products} />
        <SliderPet />
      </div>
      <Collection />
      <AllProducts data={products} />
      <Benefit props="md:py-10 py-5" />
      <ChooseUs />
      <FeatureProduct data={products} start={0} limit={4} />
      <Collection2 />
      <Brand products={products} />
      <Footer />
    </>
  )
}

export default ParamascotasecHome
