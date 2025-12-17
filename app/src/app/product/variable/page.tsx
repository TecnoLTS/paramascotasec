'use client'
import React from 'react'
import VariableProduct from '@/components/Product/Detail/VariableProduct'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'

const ProductVariableProduct = () => (
    <ProductDetailPageLayout
        productPage="variable"
        renderProduct={(products, productId) => <VariableProduct data={products} productId={productId} />}
    />
)

export default ProductVariableProduct
