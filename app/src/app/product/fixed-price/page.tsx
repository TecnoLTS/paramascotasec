import React from 'react'
import FixedPrice from '@/components/Product/Detail/FixedPrice'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductFixedPrice = async ({ searchParams }: { searchParams?: Promise<SearchParams> }) => {
    const resolvedSearchParams = await searchParams
    const { products, error } = await loadProducts()
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="fixed-price"
            products={products}
            productId={productId}
            error={error}
        >
            <FixedPrice data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductFixedPrice