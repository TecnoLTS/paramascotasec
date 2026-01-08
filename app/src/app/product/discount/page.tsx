import React from 'react'
import Discount from '@/components/Product/Detail/Discount'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductDiscount = async ({ searchParams }: { searchParams?: Promise<SearchParams> }) => {
    const resolvedSearchParams = await searchParams
    const { products, error } = await loadProducts()
    const productId = typeof resolvedSearchParams?.id === 'string' ? resolvedSearchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="discount"
            headerClassName="relative w-full style-discount"
            products={products}
            productId={productId}
            error={error}
        >
            <Discount data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductDiscount