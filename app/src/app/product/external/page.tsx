'use client'
import React from 'react'
import External from '@/components/Product/Detail/External'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductExternal = () => (
    <ProductDetailPageLayout
        productPage="external"
        renderProduct={(products, productId) => <External data={products} productId={productId} />}
    />
)

export default ProductExternal
