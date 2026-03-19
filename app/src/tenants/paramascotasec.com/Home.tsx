import React from 'react'
import MenuPet from '@/components/Header/Menu/MenuPet'
import SliderPet from '@/components/Slider/SliderPet'
import Collection from '@/components/Pet/Collection'
import Collection2 from '@/components/Pet/Collection2'
import FeatureProduct from '@/components/Pet/FeatureProduct'
import ChooseUs from '@/components/Pet/ChooseUs'
import AllProducts from '@/components/Product/AllProducts'
import Benefit from '@/components/Pet/Benefit'
import Brand from '@/components/Pet/Brand'
import Footer from '@/components/Footer/Footer'
import ScrollToTopOnMount from '@/components/ScrollToTopOnMount'
import { CategoryCard } from '@/lib/tenant'
import { ProductType } from '@/type/ProductType'

const ParamascotasecHome = ({
  products,
  categories,
}: {
  products: ProductType[]
  categories: CategoryCard[]
}) => {
  const featuredSecondaryCategories = ['cuidado', 'gatos', 'perros']
    .map((categoryId) => categories.find((category) => category.id.toLowerCase() === categoryId))
    .filter((category): category is CategoryCard => Boolean(category))

  return (
    <>
      <ScrollToTopOnMount />
      <div id="header" className="relative w-full style-pet">
        <MenuPet searchProducts={products} />
        <SliderPet />
      </div>
      <Collection categories={categories} />
      <AllProducts data={products} />
      <Benefit props="md:py-10 py-5" />
      <ChooseUs />
      <FeatureProduct data={products} start={0} limit={4} />
      <Collection2 categories={featuredSecondaryCategories} />
      <Brand products={products} />
      <Footer />
    </>
  )
}

export default ParamascotasecHome
