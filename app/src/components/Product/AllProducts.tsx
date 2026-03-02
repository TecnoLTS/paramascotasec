'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ProductType } from '@/type/ProductType'
import Product from './Product'
import { getCategoryCards, getCategoryFilter, getCategoryLabel } from '@/data/petCategoryCards'
import { useTenant } from '@/context/TenantContext'

interface Props {
    data: Array<ProductType>;
    pageSize?: number;
}

const AllProducts: React.FC<Props> = ({ data, pageSize = 15 }) => {
    const tenant = useTenant()
    const [page, setPage] = useState<number>(1)
    const [activeCategory, setActiveCategory] = useState<string>('todos')

    // ⬇️ Ref apuntando al bloque donde dice "Todos los productos"
    const productsRef = useRef<HTMLDivElement | null>(null)

    const categories = useMemo(() => {
        const order = getCategoryCards(tenant.id).map((category) => category.id.toLowerCase())
        const uniqueOrder = Array.from(new Set(order))

        const hasProductsFor = (categoryId: string) => {
            if (categoryId === 'descuentos') return data.some((product) => product.sale)
            const filter = getCategoryFilter(categoryId, tenant.id)
            return data.some((product) => {
                let matches = true
                if (filter.category) {
                    matches = product.category === filter.category
                }
                if (filter.gender) {
                    matches = matches && product.gender === filter.gender
                }
                return matches
            })
        }

        return uniqueOrder.filter((categoryId) => {
            if (categoryId === 'todos') return true
            return hasProductsFor(categoryId)
        })
    }, [data, tenant.id])

    const filteredData = useMemo(() => {
        if (activeCategory === 'todos') return data
        if (activeCategory === 'descuentos') return data.filter(product => product.sale)
        const filter = getCategoryFilter(activeCategory, tenant.id)
        return data.filter(product => {
            let matches = true
            if (filter.category) {
                matches = product.category === filter.category
            }
            if (filter.gender) {
                matches = matches && product.gender === filter.gender
            }
            return matches
        })
    }, [activeCategory, data, tenant.id])

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

    const scrollToProducts = () => {
        setTimeout(() => {
            if (!productsRef.current) return;

            const rect = productsRef.current.getBoundingClientRect();
            const scrollTop = rect.top + window.scrollY;

            // mide el header sticky
            const headerHeight = document.querySelector('.header')?.clientHeight ?? 120;

            window.scrollTo({
                top: scrollTop - headerHeight - 30, // extra margen
                behavior: 'smooth'
            });
        }, 50);
    };

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category)
        setPage(1)
        scrollToProducts()
    }

    const handlePageChange = (nextPage: number) => {
        const sanitized = Math.min(Math.max(nextPage, 1), totalPages)
        if (sanitized === page) return
        setPage(sanitized)
        scrollToProducts()
    }

    return (
        <div className="container md:py-10 py-5">
            {/* ⬇️ El ref está justo en el bloque donde está el título */}
            <div ref={productsRef} className="heading flex flex-col items-center text-center">
                <div className="heading3">Todos los productos</div>
                <div className="heading6 font-normal text-secondary mt-2">
                    Explora nuestro catálogo completo
                </div>
            </div>

            <div className="menu-tab flex items-center justify-center gap-2 p-1 bg-surface rounded-2xl md:mt-8 mt-6 flex-wrap">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`tab-item relative text-secondary font-semibold text-[14px] leading-[20px] sm:text-[15px] sm:leading-[22px] lg:text-[16px] lg:leading-[24px] py-2 px-4 sm:py-2.5 sm:px-6 cursor-pointer duration-300 rounded-2xl ${activeCategory === category ? 'bg-[var(--blue)] text-white' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {getCategoryLabel(category, tenant.id)}
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
