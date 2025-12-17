'use client'
import React from 'react'
import BoughtTogether from '@/components/Product/Detail/BoughtTogether'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductBoughtTogether = () => (
    <ProductDetailPageLayout
        productPage="bought-together"
        renderProduct={(products, productId) => <BoughtTogether data={products} productId={productId} />}
    />
)

export default ProductBoughtTogether
