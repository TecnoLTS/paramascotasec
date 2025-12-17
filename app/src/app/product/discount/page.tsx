'use client'
import React from 'react'
import Discount from '@/components/Product/Detail/Discount'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductDiscount = () => (
    <ProductDetailPageLayout
        productPage="discount"
        headerClassName="relative w-full style-discount"
        renderProduct={(products, productId) => <Discount data={products} productId={productId} />}
    />
)

export default ProductDiscount
