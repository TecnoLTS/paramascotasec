import React from 'react'
import SearchResultClient from './SearchResultClient'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    query?: string | string[]
}

export default async function SearchResult({ searchParams }: { searchParams?: SearchParams }) {
    const { products, error } = await loadProducts()
    const query = typeof searchParams?.query === 'string' ? searchParams.query : null

    return (
        <SearchResultClient
            products={products}
            error={error}
            initialQuery={query}
        />
    )
}
