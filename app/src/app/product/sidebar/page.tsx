import React from 'react'
import Sidebar from '@/components/Product/Detail/Sidebar'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductSidebar = async ({ searchParams }: { searchParams?: SearchParams }) => {
    const { products, error } = await loadProducts()
    const productId = typeof searchParams?.id === 'string' ? searchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="sidebar"
            products={products}
            productId={productId}
            error={error}
        >
            <Sidebar data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductSidebar
