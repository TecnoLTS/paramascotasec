import React from 'react'
import Sale from '@/components/Product/Detail/Sale'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductThumbnailBottom = async ({ searchParams }: { searchParams?: Promise<SearchParams> }) => {
    const resolvedSearchParams = await searchParams
    const { products, error } = await loadProducts()
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="sale"
            products={products}
            productId={productId}
            error={error}
        >
            <Sale data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductThumbnailBottom