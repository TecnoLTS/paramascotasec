'use client'
import React from 'react'
import CountdownTimer from '@/components/Product/Detail/CountdownTimer'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductTwoScrolling = () => (
    <ProductDetailPageLayout
        productPage="countdown-timer"
        renderProduct={(products, productId) => <CountdownTimer data={products} productId={productId} />}
    />
)

export default ProductTwoScrolling
