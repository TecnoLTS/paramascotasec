'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import Footer from '@/components/Footer/Footer'
import useProducts from '@/hooks/useProducts'
import { ProductType } from '@/type/ProductType'

type Props = {
  productPage: string
  menuProps?: string
  headerClassName?: string
  renderProduct: (products: ProductType[], productId: string) => React.ReactNode
}

const ProductDetailPageLayout: React.FC<Props> = ({
  productPage,
  renderProduct,
  menuProps = 'bg-white',
  headerClassName = 'relative w-full',
}) => {
  const searchParams = useSearchParams()
  const { products, loading, error } = useProducts()
  const productId = searchParams.get('id') ?? products[0]?.id ?? ''
  const hasProducts = products.length > 0

  let content: React.ReactNode = null
  if (loading) {
    content = <div className="container py-10 text-center">Cargando productos...</div>
  } else if (error) {
    content = <div className="container py-10 text-center text-red-600">{error}</div>
  } else if (!hasProducts) {
    content = <div className="container py-10 text-center">No hay productos disponibles.</div>
  } else {
    content = renderProduct(products, productId)
  }

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className={headerClassName}>
        <MenuOne props={menuProps} />
        {!loading && !error && hasProducts && (
          <BreadcrumbProduct data={products} productPage={productPage} productId={productId} />
        )}
      </div>
      {content}
      <Footer />
    </>
  )
}

export default ProductDetailPageLayout
