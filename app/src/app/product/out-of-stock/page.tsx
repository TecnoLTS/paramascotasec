'use client'
import React from 'react'
import OutOfStock from '@/components/Product/Detail/OutOfStock'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductOutOfStock = () => (
    <ProductDetailPageLayout
        productPage="out-of-stock"
        renderProduct={(products, productId) => <OutOfStock data={products} productId={productId} />}
    />
)

export default ProductOutOfStock
