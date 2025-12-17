'use client'
import React from 'react'
import Sidebar from '@/components/Product/Detail/Sidebar'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductSidebar = () => (
    <ProductDetailPageLayout
        productPage="sidebar"
        renderProduct={(products, productId) => <Sidebar data={products} productId={productId} />}
    />
)

export default ProductSidebar
