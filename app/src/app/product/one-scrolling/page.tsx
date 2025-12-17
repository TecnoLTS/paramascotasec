'use client'
import React from 'react'
import Grouped from '@/components/Product/Detail/Grouped'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductOneScrolling = () => (
    <ProductDetailPageLayout
        productPage="grouped"
        renderProduct={(products, productId) => <Grouped data={products} productId={productId} />}
    />
)

export default ProductOneScrolling
