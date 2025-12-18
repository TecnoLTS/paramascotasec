import React from 'react'
import External from '@/components/Product/Detail/External'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductCombinedTwo = async ({ searchParams }: { searchParams?: SearchParams }) => {
    const { products, error } = await loadProducts()
    const productId = typeof searchParams?.id === 'string' ? searchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="external"
            products={products}
            productId={productId}
            error={error}
        >
            <External data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductCombinedTwo
