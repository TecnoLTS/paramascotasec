'use client'

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { ProductType } from '@/type/ProductType'
import Product from './Product'
import { getCatalogBrandStats, isProductOnSale } from '@/lib/catalog'
import { buildProductSearchIndex, filterProductsBySearch, sanitizeProductSearchQuery } from '@/lib/productSearch'

interface Props {
    data: Array<ProductType>;
    pageSize?: number;
}

const getBrandLabel = (brand: string, offersFilterId: string) => {
    if (brand === 'todas') return 'Todas'
    if (brand === offersFilterId) return 'Ofertas'
    return brand
}

const AllProducts: React.FC<Props> = ({ data, pageSize = 15 }) => {
    const offersFilterId = '__offers__'
    const [page, setPage] = useState<number>(1)
    const [activeBrand, setActiveBrand] = useState<string>('todas')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [showAllBrands, setShowAllBrands] = useState<boolean>(false)
    const previewBrandCount = 10

    const productsRef = useRef<HTMLDivElement | null>(null)
    const deferredSearchQuery = useDeferredValue(searchQuery)

    const brandStats = useMemo(() => getCatalogBrandStats(data), [data])
    const productSearchIndex = useMemo(() => buildProductSearchIndex(data), [data])
    const offersCount = useMemo(() => data.filter((product) => isProductOnSale(product)).length, [data])
    const brands = useMemo(
        () => ['todas', offersFilterId, ...brandStats.map((item) => item.brand)],
        [brandStats]
    )
    const effectiveSearchQuery = useMemo(() => sanitizeProductSearchQuery(deferredSearchQuery), [deferredSearchQuery])
    const searchMatchedProducts = useMemo(() => {
        if (!effectiveSearchQuery) {
            return data
        }

        return filterProductsBySearch(data, effectiveSearchQuery, productSearchIndex)
    }, [data, effectiveSearchQuery, productSearchIndex])
    const matchedBrandCounts = useMemo(() => {
        const counts = new Map<string, number>()
        searchMatchedProducts.forEach((product) => {
            const brand = (product.brand ?? '').trim()
            if (!brand) return
            counts.set(brand, (counts.get(brand) ?? 0) + 1)
        })
        return counts
    }, [searchMatchedProducts])
    const matchedBrandCount = useMemo(() => matchedBrandCounts.size, [matchedBrandCounts])
    const matchedOffersCount = useMemo(
        () => searchMatchedProducts.filter((product) => isProductOnSale(product)).length,
        [searchMatchedProducts]
    )
    const brandProductCounts = useMemo(
        () => new Map(brandStats.map((item) => [item.brand, item.productCount])),
        [brandStats]
    )
    const filteredBrands = useMemo(() => {
        if (!effectiveSearchQuery) {
            return brands
        }

        const visibleBrands = new Set<string>(['todas', offersFilterId, activeBrand])
        brandStats.forEach((item) => {
            if (matchedBrandCounts.has(item.brand)) {
                visibleBrands.add(item.brand)
            }
        })

        return brands.filter((brand) => visibleBrands.has(brand))
    }, [activeBrand, brandStats, brands, effectiveSearchQuery, matchedBrandCounts])
    const visibleBrands = useMemo(() => {
        if (effectiveSearchQuery) {
            return filteredBrands
        }

        if (brandStats.length <= previewBrandCount || showAllBrands) {
            return filteredBrands
        }

        const defaultBrands = new Set([
            'todas',
            offersFilterId,
            ...brandStats.slice(0, previewBrandCount).map((item) => item.brand),
            activeBrand,
        ])

        return filteredBrands.filter((brand) => defaultBrands.has(brand))
    }, [activeBrand, brandStats, effectiveSearchQuery, filteredBrands, showAllBrands])
    const visibleBrandCount = useMemo(
        () => visibleBrands.filter((brand) => brand !== 'todas' && brand !== offersFilterId).length,
        [visibleBrands]
    )

    const filteredData = useMemo(() => {
        let scopedData = data

        if (activeBrand === offersFilterId) {
            scopedData = data.filter((product) => isProductOnSale(product))
        } else if (activeBrand !== 'todas') {
            scopedData = data.filter((product) => (product.brand ?? '').trim() === activeBrand)
        }

        if (!effectiveSearchQuery) {
            return scopedData
        }

        return filterProductsBySearch(scopedData, effectiveSearchQuery, productSearchIndex)
    }, [activeBrand, data, effectiveSearchQuery, productSearchIndex])

    useEffect(() => {
        if (!brands.includes(activeBrand)) {
            setActiveBrand('todas')
        }
    }, [activeBrand, brands])

    useEffect(() => {
        setPage(1)
    }, [effectiveSearchQuery])

    useEffect(() => {
        if (brandStats.length <= previewBrandCount && showAllBrands) {
            setShowAllBrands(false)
        }
    }, [brandStats.length, showAllBrands])

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

    const handleBrandChange = (brand: string) => {
        setActiveBrand(brand)
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
            <div ref={productsRef} className="heading flex flex-col items-center text-center">
                <div className="heading3">Todos los productos</div>
                <div className="heading6 font-normal text-secondary mt-2">
                    Explora nuestro catálogo completo
                </div>
            </div>

            <div className="menu-tab md:mt-8 mt-6">
                <div className="rounded-[32px] border border-line bg-white px-4 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6 lg:px-7">
                    <div className="flex flex-col gap-4 border-b border-line pb-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="text-left">
                            <div className="caption1 font-semibold uppercase tracking-[0.18em] text-[var(--blue)]">
                                Marcas
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <div className="text-button font-semibold text-black">Explora por marca</div>
                                <div className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">
                                    {brandStats.length} marcas
                                </div>
                            </div>
                        </div>

                        {!effectiveSearchQuery && brandStats.length > previewBrandCount && (
                            <button
                                className="inline-flex w-fit items-center justify-center rounded-full border border-line bg-surface px-4 py-2 text-button text-black duration-300 hover:border-[var(--blue)] hover:bg-white hover:text-[var(--blue)]"
                                onClick={() => setShowAllBrands((current) => !current)}
                            >
                                {showAllBrands ? 'Mostrar menos marcas' : `Ver todas las marcas (${brandStats.length})`}
                            </button>
                        )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative flex-1">
                            <input
                                aria-label="Buscar en el catalogo"
                                autoComplete="off"
                                className="h-12 w-full rounded-full border border-[rgba(0,127,155,0.18)] bg-white pl-5 pr-24 text-[15px] text-black shadow-[0_8px_20px_rgba(15,23,42,0.05)] outline-none duration-300 placeholder:text-[rgba(15,23,42,0.45)] focus:border-[var(--blue)] focus:shadow-[0_12px_28px_rgba(0,127,155,0.12)]"
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Buscar por marca, producto, categoría o SKU"
                                spellCheck={false}
                                type="search"
                                value={searchQuery}
                            />
                            {searchQuery ? (
                                <button
                                    className="absolute right-3 top-1/2 inline-flex h-8 min-w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(0,127,155,0.14)] bg-[rgba(0,127,155,0.06)] px-3 text-[12px] font-semibold text-[var(--blue)] duration-300 hover:bg-[rgba(0,127,155,0.12)] hover:text-black"
                                    onClick={() => setSearchQuery('')}
                                    type="button"
                                >
                                    Limpiar
                                </button>
                            ) : (
                                <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--blue)]">
                                    Buscar
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                            <div className="inline-flex items-center rounded-full bg-surface px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">
                                {filteredData.length} producto{filteredData.length === 1 ? '' : 's'}
                            </div>
                            <div className="inline-flex items-center rounded-full bg-surface px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">
                                {effectiveSearchQuery ? `${matchedBrandCount} marcas` : `${brandStats.length} marcas`}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                        {visibleBrands.map((brand) => {
                            const isActive = activeBrand === brand
                            const count = effectiveSearchQuery
                                ? brand === 'todas'
                                    ? searchMatchedProducts.length
                                    : brand === offersFilterId
                                        ? matchedOffersCount
                                        : (matchedBrandCounts.get(brand) ?? 0)
                                : brand === 'todas'
                                    ? data.length
                                    : brand === offersFilterId
                                        ? offersCount
                                        : (brandProductCounts.get(brand) ?? 0)

                            return (
                                <button
                                    key={brand}
                                    aria-pressed={isActive}
                                    className={`tab-item inline-flex min-h-[48px] items-center gap-2.5 rounded-full border px-4 py-2.5 text-left font-semibold duration-300 ${isActive ? 'border-[var(--blue)] bg-[var(--blue)] text-white shadow-[0_10px_24px_rgba(0,127,155,0.24)]' : 'border-line bg-white text-secondary shadow-sm hover:-translate-y-0.5 hover:border-[var(--blue)] hover:text-[var(--blue)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]'}`}
                                    onClick={() => handleBrandChange(brand)}
                                >
                                    <span className="text-[14px] leading-[20px] sm:text-[15px] sm:leading-[22px]">
                                        {getBrandLabel(brand, offersFilterId)}
                                    </span>
                                    <span className={`min-w-[30px] rounded-full px-2.5 py-1 text-center text-[11px] font-semibold leading-[1] ${isActive ? 'bg-white/18 text-white' : 'bg-surface text-secondary'}`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {effectiveSearchQuery && matchedBrandCount === 0 && (
                        <div className="mt-4 rounded-[20px] border border-dashed border-line px-4 py-3 text-left">
                            <div className="caption1 text-secondary">
                                No hubo coincidencias. Prueba con otra palabra o limpia la búsqueda.
                            </div>
                        </div>
                    )}

                    {effectiveSearchQuery ? (
                        <div className="mt-4 flex flex-col gap-2 rounded-[20px] bg-surface px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between">
                            <div className="caption1 text-secondary">
                                {filteredData.length} resultado{filteredData.length === 1 ? '' : 's'} y {matchedBrandCount} marca{matchedBrandCount === 1 ? '' : 's'} para &quot;{effectiveSearchQuery}&quot;.
                            </div>
                            <button
                                className="text-button font-semibold text-[var(--blue)] duration-300 hover:text-black"
                                onClick={() => setSearchQuery('')}
                            >
                                Limpiar búsqueda
                            </button>
                        </div>
                    ) : brandStats.length > previewBrandCount && !showAllBrands && (
                        <div className="mt-4 flex flex-col gap-2 rounded-[20px] bg-surface px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between">
                            <div className="caption1 text-secondary">
                                Mostrando {visibleBrandCount} de {brandStats.length} marcas.
                            </div>
                            <button
                                className="text-button font-semibold text-[var(--blue)] duration-300 hover:text-black"
                                onClick={() => setShowAllBrands(true)}
                            >
                                Ver el resto del catalogo
                            </button>
                        </div>
                    )}
                </div>
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
