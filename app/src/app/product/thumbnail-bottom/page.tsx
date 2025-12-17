'use client'
import React from 'react'
import Sale from '@/components/Product/Detail/Sale'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductThumbnailBottom = () => (
    <ProductDetailPageLayout
        productPage="sale"
        renderProduct={(products, productId) => <Sale data={products} productId={productId} />}
    />
)

export default ProductThumbnailBottom
