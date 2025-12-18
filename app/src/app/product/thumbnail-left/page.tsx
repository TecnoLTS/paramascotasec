import React from 'react'
import Default from '@/components/Product/Detail/Default'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductThumbnailLeft = async ({ searchParams }: { searchParams?: SearchParams }) => {
    const { products, error } = await loadProducts()
    const productId = typeof searchParams?.id === 'string' ? searchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="default"
            products={products}
            productId={productId}
            error={error}
        >
            <Default data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductThumbnailLeft
