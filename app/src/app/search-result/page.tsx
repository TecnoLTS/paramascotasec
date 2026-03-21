import React from 'react'
import SearchResultClient from './SearchResultClient'
import { loadProducts } from '@/lib/products.server'

type SearchParams = {
    query?: string | string[]
}

export const dynamic = 'force-dynamic'

export default async function SearchResult({ searchParams }: { searchParams?: Promise<SearchParams> }) {
    const resolvedSearchParams = await searchParams
    const { products, error } = await loadProducts()
    const query = typeof resolvedSearchParams?.query === 'string' ? resolvedSearchParams.query : null

    return (
        <SearchResultClient
            products={products}
            error={error}
            initialQuery={query}
        />
    )
}
