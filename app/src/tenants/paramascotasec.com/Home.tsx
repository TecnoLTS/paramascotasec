import React from 'react'
import dynamic from 'next/dynamic'
import MenuPet from '@/components/Header/Menu/MenuPet'
import SliderPet from '@/components/Slider/SliderPet'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import { buildCatalogCategoryCards } from '@/lib/catalog'
import type { ProductBrandReference, ProductCategoryImageReference } from '@/lib/productReferenceData'

const Collection = dynamic(() => import('@/components/Pet/Collection'))
const Collection2 = dynamic(() => import('@/components/Pet/Collection2'))
const DeferredFeatureProduct = dynamic(() => import('@/components/Pet/DeferredFeatureProduct'))
const ChooseUs = dynamic(() => import('@/components/Pet/ChooseUs'))
const DeferredAllProducts = dynamic(() => import('@/components/Product/DeferredAllProducts'))
const Benefit = dynamic(() => import('@/components/Pet/Benefit'))
const Brand = dynamic(() => import('@/components/Pet/Brand'))

const normalizeHomeCategoryId = (value: string) => {
  const normalized = value.trim().toLocaleLowerCase('es-EC')
  if (normalized === 'ofertas') return 'descuentos'
  if (normalized === 'todas') return 'todos'
  if (['cuidado', 'cuidados', 'higiene'].includes(normalized)) return 'salud'
  return normalized
}

const buildReferenceCategoryIdSet = (categories: ProductCategoryImageReference[]) =>
  new Set(categories.map((category) => normalizeHomeCategoryId(category.name)).filter(Boolean))

const ParamascotasecHome = ({
  products,
  brandLogos = [],
  publicCategories = [],
}: {
  products: ProductType[]
  brandLogos?: ProductBrandReference[]
  publicCategories?: ProductCategoryImageReference[]
}) => {
  const topSectionCategories = publicCategories.filter(
    (category) => category.showInTopSection !== false
  )

  const featuredSectionCategories = publicCategories.filter(
    (category) => category.showInFeaturedSection !== false
  )
  const hasPublicCategoryControls = publicCategories.length > 0
  const topSectionCategoryIds = buildReferenceCategoryIdSet(topSectionCategories)
  const featuredSectionCategoryIds = buildReferenceCategoryIdSet(featuredSectionCategories)

  const topCategoryCards = buildCatalogCategoryCards(products, undefined, {
    referenceCategories: topSectionCategories,
  })

  const featuredCategoryCards = buildCatalogCategoryCards(products, undefined, {
    referenceCategories: featuredSectionCategories,
  })

  const allCategoryCards = buildCatalogCategoryCards(products, undefined, {
    referenceCategories: publicCategories,
  })

  const availableCategoryIds = allCategoryCards.map((category) => category.id)
  const availableCategoryIdSet = new Set(availableCategoryIds.map((categoryId) => categoryId.toLowerCase()))
  const homeCategories = topCategoryCards.filter((category) => {
    const categoryId = category.id.toLowerCase()
    return categoryId !== 'todos'
      && availableCategoryIdSet.has(categoryId)
      && (!hasPublicCategoryControls || topSectionCategoryIds.has(normalizeHomeCategoryId(category.id)))
  })
  const homeFeaturedCategories = featuredCategoryCards
    .filter((category) => (
      !['todos', 'descuentos'].includes(category.id.toLowerCase())
      && (!hasPublicCategoryControls || featuredSectionCategoryIds.has(normalizeHomeCategoryId(category.id)))
    ))
    .slice(0, 3)
  const footerCategoryIds = availableCategoryIds

  return (
    <>
      <header id="header" className="relative w-full style-pet">
        <MenuPet searchProducts={products} availableCategoryIds={availableCategoryIds} />
      </header>
      <main id="main-content">
        <SliderPet />
        <Collection categories={homeCategories} />
        <DeferredAllProducts data={products} categoryIds={availableCategoryIds} />
        <Benefit props="md:py-10 py-5" />
        <ChooseUs />
        <DeferredFeatureProduct data={products} start={0} limit={4} />
        <Collection2 categories={homeFeaturedCategories} />
        <Brand products={products} brandReferences={brandLogos} />
      </main>
      <Footer categoryIds={footerCategoryIds} />
    </>
  )
}

export default ParamascotasecHome
