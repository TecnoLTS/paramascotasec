'use client'
import React from 'react'
import OnSale from '@/components/Product/Detail/OnSale'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductOnSale = () => (
    <ProductDetailPageLayout
        productPage="on-sale"
        renderProduct={(products, productId) => <OnSale data={products} productId={productId} />}
    />
)

export default ProductOnSale
