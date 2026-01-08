import React from 'react'
import BoughtTogether from '@/components/Product/Detail/BoughtTogether'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductBoughtTogether = async ({ searchParams }: { searchParams?: Promise<SearchParams> }) => {
    const resolvedSearchParams = await searchParams
    const { products, error } = await loadProducts()
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="bought-together"
            products={products}
            productId={productId}
            error={error}
        >
            <BoughtTogether data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductBoughtTogether