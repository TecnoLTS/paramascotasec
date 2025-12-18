import React from 'react'
import OutOfStock from '@/components/Product/Detail/OutOfStock'
import ProductDetailPageLayout from '@/components/Product/ProductDetailPageLayout'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    id?: string | string[]
}

const ProductOutOfStock = async ({ searchParams }: { searchParams?: SearchParams }) => {
    const { products, error } = await loadProducts()
    const productId = typeof searchParams?.id === 'string' ? searchParams.id : (products[0]?.id ?? '')

    return (
        <ProductDetailPageLayout
            productPage="out-of-stock"
            products={products}
            productId={productId}
            error={error}
        >
            <OutOfStock data={products} productId={productId} />
        </ProductDetailPageLayout>
    )
}

export default ProductOutOfStock
