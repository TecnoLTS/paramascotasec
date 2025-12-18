import React from 'react'
import FixedPrice from '@/components/Product/Detail/FixedPrice'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductFixedPrice = async ({ searchParams }: { searchParams?: SearchParams }) => {
    const { products, error } = await loadProducts()
    const productId = typeof searchParams?.id === 'string' ? searchParams.id : (products[0]?.id ?? '')

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
