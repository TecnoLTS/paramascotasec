import React from 'react'
import dynamic from 'next/dynamic'
import MenuPet from '@/components/Header/Menu/MenuPet'
import SliderPet from '@/components/Slider/SliderPet'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import { buildCatalogCategoryCards } from '@/lib/catalog'
import { getCategoryCards, getHomeSecondaryCategoryCards } from '@/data/petCategoryCards'

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
  const availableCategoryIds = buildCatalogCategoryCards(products).map((category) => category.id)
  const availableCategoryIdSet = new Set(availableCategoryIds.map((categoryId) => categoryId.toLowerCase()))
  const homeCategories = getCategoryCards().filter((category) =>
    category.id === 'todos' || availableCategoryIdSet.has(category.id.toLowerCase())
  )
  const homeFeaturedCategories = getHomeSecondaryCategoryCards().filter((category) =>
    availableCategoryIdSet.has(category.id.toLowerCase())
  )
  const footerCategoryIds = availableCategoryIds.filter((categoryId) => categoryId.toLowerCase() !== 'todos')

  return (
    <>
      <header id="header" className="relative w-full style-pet">
        <MenuPet searchProducts={products} availableCategoryIds={availableCategoryIds} />
      </header>
      <main id="main-content">
        <SliderPet />
        <Collection categories={homeCategories} />
        <AllProducts data={products} />
        <Benefit props="md:py-10 py-5" />
        <ChooseUs />
        <FeatureProduct data={products} start={0} limit={4} />
        <Collection2 categories={homeFeaturedCategories} />
        <Brand products={products} />
      </main>
      <Footer categoryIds={footerCategoryIds} />
    </>
  )
}

export default ParamascotasecHome
