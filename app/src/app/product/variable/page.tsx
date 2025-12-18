import React from 'react'
import VariableProduct from '@/components/Product/Detail/VariableProduct'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductVariableProduct = async ({ searchParams }: { searchParams?: SearchParams }) => {
    const { products, error } = await loadProducts()
    const productId = typeof searchParams?.id === 'string' ? searchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="variable"
            products={products}
            productId={productId}
            error={error}
        >
            <VariableProduct data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductVariableProduct
