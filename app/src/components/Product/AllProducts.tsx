'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ProductType } from '@/type/ProductType'
import Product from './Product'
import { getCategoryLabel } from '@/data/petCategoryCards'

interface Props {
    data: Array<ProductType>;
    pageSize?: number;
}

const AllProducts: React.FC<Props> = ({ data, pageSize = 15 }) => {
    const [page, setPage] = useState<number>(1)
    const [activeCategory, setActiveCategory] = useState<string>('todos')
    const productsRef = useRef<HTMLDivElement>(null)

    const categories = useMemo(() => {
        const order = ['todos', 'descuentos', 'perros', 'gatos', 'juguetes', 'camas', 'accesorios', 'comederos', 'cuidado']

        const hasProductsFor = (category: string) => {
            if (category === 'descuentos') return data.some((product) => product.sale)
            if (category === 'perros') return data.some((product) => product.gender === 'dog')
            if (category === 'gatos') return data.some((product) => product.gender === 'cat')
            return data.some((product) => product.category === category)
        }

        return order.filter((category) => {
            if (category === 'todos') return true
            return hasProductsFor(category)
        })
    }, [data])

    const filteredData = useMemo(() => {
        if (activeCategory === 'todos') return data
        if (activeCategory === 'descuentos') return data.filter(product => product.sale)
        if (activeCategory === 'perros' || activeCategory === 'comida para perros') {
            return data.filter(product => product.gender === 'dog')
        }
        if (activeCategory === 'gatos' || activeCategory === 'comida para gatos') {
            return data.filter(product => product.gender === 'cat')
        }
        return data.filter(product => product.category === activeCategory)
    }, [activeCategory, data])

    useEffect(() => {
        if (!categories.includes(activeCategory)) {
            setActiveCategory('todos')
        }
    }, [activeCategory, categories])

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))

    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [filteredData, page, pageSize])

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category)
        setPage(1)
        productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const handlePageChange = (nextPage: number) => {
        const sanitized = Math.min(Math.max(nextPage, 1), totalPages)
        if (sanitized === page) return
        setPage(sanitized)
        productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div ref={productsRef} className="container md:py-10 py-5">
            <div className="heading flex flex-col items-center text-center">
                <div className="heading3">Todos los productos</div>
                <div className="heading6 font-normal text-secondary mt-2">Explora nuestro catálogo completo</div>
            </div>

            <div className="menu-tab flex items-center justify-center gap-2 p-1 bg-surface rounded-2xl md:mt-8 mt-6 flex-wrap">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`tab-item relative text-secondary text-button-uppercase py-2 px-5 cursor-pointer duration-300 rounded-2xl  ${activeCategory === category ? 'bg-[var(--blue)] text-white' : ''}`}
                                onClick={() => handleCategoryChange(category)}
                            >
                                {getCategoryLabel(category)}
                            </button>
                        ))}
            </div>

            <div className="list-product hide-product-sold grid lg:grid-cols-5 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
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
