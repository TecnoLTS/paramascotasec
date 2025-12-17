'use client'
import React from 'react'
import FixedPrice from '@/components/Product/Detail/FixedPrice'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductFixedPrice = () => (
    <ProductDetailPageLayout
        productPage="fixed-price"
        renderProduct={(products, productId) => <FixedPrice data={products} productId={productId} />}
    />
)

export default ProductFixedPrice
