import React from 'react'
import CountdownTimer from '@/components/Product/Detail/CountdownTimer'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductTwoScrolling = async ({ searchParams }: { searchParams?: Promise<SearchParams> }) => {
    const resolvedSearchParams = await searchParams
    const { products, error } = await loadProducts()
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="countdown-timer"
            products={products}
            productId={productId}
            error={error}
        >
            <CountdownTimer data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductTwoScrolling