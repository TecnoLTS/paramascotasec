import React from 'react'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'

type Props = {
  productPage: string
  products: ProductType[]
  productId: string
  error?: string | null
  menuProps?: string
  headerClassName?: string
  children: React.ReactNode
}

const ProductDetailPageLayout: React.FC<Props> = ({
  productPage,
  products,
  productId,
  error = null,
  menuProps = 'bg-white',
  headerClassName = 'relative w-full',
  children,
}) => {
  const hasProducts = products.length > 0

  let content: React.ReactNode = null
  if (error) {
    content = <div className="container py-10 text-center text-red-600">{error}</div>
  } else if (!hasProducts) {
    content = <div className="container py-10 text-center">No hay productos disponibles.</div>
  } else {
    content = children
  }

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className={headerClassName}>
        <MenuOne props={menuProps} />
        {!error && hasProducts && (
          <BreadcrumbProduct data={products} productPage={productPage} productId={productId} />
        )}
      </div>
      {content}
      <Footer />
    </>
  )
}

export default ProductDetailPageLayout
