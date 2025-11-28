'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ProductType } from '@/type/ProductType'
import Product from './Product'

interface Props {
    data: Array<ProductType>;
    pageSize?: number;
    visibleCategories?: string[];
    maxCategories?: number;
}

const AllProducts: React.FC<Props> = ({ data, pageSize = 8, visibleCategories, maxCategories = 6 }) => {
    const [page, setPage] = useState<number>(1)
    const [activeCategory, setActiveCategory] = useState<string>('todos')

    const categoryCounts = useMemo(() => {
        return data.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] ?? 0) + 1
            return acc
        }, {} as Record<string, number>)
    }, [data])

    const computedCategories = useMemo(() => {
        const sortedByCount = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([category]) => category)

        if (visibleCategories?.length) {
            return visibleCategories.filter(cat => sortedByCount.includes(cat))
        }

        return sortedByCount.slice(0, maxCategories)
    }, [categoryCounts, maxCategories, visibleCategories])

    const categories = useMemo(() => ['todos', ...computedCategories], [computedCategories])

    const filteredData = useMemo(() => {
        if (activeCategory === 'todos') return data
        return data.filter(product => product.category === activeCategory)
    }, [activeCategory, data])

    useEffect(() => {
        setPage(1)
    }, [activeCategory])

    useEffect(() => {
        if (activeCategory !== 'todos' && !computedCategories.includes(activeCategory)) {
            setActiveCategory('todos')
        }
    }, [activeCategory, computedCategories])

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))

    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [filteredData, page, pageSize])

    const handlePageChange = (nextPage: number) => {
        setPage(Math.min(Math.max(nextPage, 1), totalPages))
    }

    return (
        <div className="container md:py-10 py-5">
            <div className="heading flex flex-col items-center text-center">
                <div className="heading3">Todos los productos</div>
                <div className="heading6 font-normal text-secondary mt-2">Explora nuestro catálogo completo</div>
            </div>

            <div className="menu-tab flex items-center justify-center gap-2 p-1 bg-surface rounded-2xl md:mt-8 mt-6 flex-wrap">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`tab-item relative text-secondary text-button-uppercase py-2 px-5 cursor-pointer duration-300 rounded-2xl ${activeCategory === category ? 'bg-black text-white' : ''}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
                {paginatedProducts.map((product) => (
                    <Product data={product} type='grid' key={product.id} style='style-1' />
                ))}
            </div>

            <div className="pagination flex items-center justify-center gap-2 md:mt-12 mt-8">
                <button
                    className={`button-main bg-white text-black border border-line px-4 py-2 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    Anterior
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNumber = idx + 1
                    const isActive = pageNumber === page
                    return (
                        <button
                            key={pageNumber}
                            className={`w-10 h-10 rounded-xl text-button-uppercase duration-300 ${isActive ? 'bg-black text-white' : 'bg-surface text-secondary hover:text-black'}`}
                            onClick={() => handlePageChange(pageNumber)}
                        >
                            {pageNumber}
                        </button>
                    )
                })}
                <button
                    className={`button-main bg-white text-black border border-line px-4 py-2 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    Siguiente
                </button>
            </div>
        </div>
    )
}

export default AllProducts
