import React from 'react'
import VariableProduct from '@/components/Product/Detail/VariableProduct'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductCombinedOne = async ({ searchParams }: { searchParams?: Promise<SearchParams> }) => {
    const resolvedSearchParams = await searchParams
    const { products, error } = await loadProducts()
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (products[0]?.id ?? '')

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

export default ProductCombinedOne