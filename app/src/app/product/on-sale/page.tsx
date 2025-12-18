import React from 'react'
import OnSale from '@/components/Product/Detail/OnSale'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductOnSale = async ({ searchParams }: { searchParams?: SearchParams }) => {
    const { products, error } = await loadProducts()
    const productId = typeof searchParams?.id === 'string' ? searchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="on-sale"
            products={products}
            productId={productId}
            error={error}
        >
            <OnSale data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductOnSale
