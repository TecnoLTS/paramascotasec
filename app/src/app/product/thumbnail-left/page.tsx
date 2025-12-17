'use client'
import React from 'react'
import Default from '@/components/Product/Detail/Default'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductThumbnailLeft = () => (
    <ProductDetailPageLayout
        productPage="default"
        renderProduct={(products, productId) => <Default data={products} productId={productId} />}
    />
)

export default ProductThumbnailLeft
