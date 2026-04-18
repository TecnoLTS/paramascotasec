'use client'

import React from 'react'
import Image from '@/components/Common/AppImage'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import type { ProductPublicationFilter } from '../types'
import { getAdminProductEntityId, resolveProductVariantLabel } from '../productFormUtils'

type AdminProductAdvancedFilters = {
    category: string;
    supplier: string;
    brand: string;
    species: string;
    tax: 'all' | 'taxed' | 'exempt';
}

type AdminProductFilterOption = { value: string; label: string; count: number }

const normalizeAdminGroupText = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

const compareAdminLabels = (left: string, right: string) =>
    left.localeCompare(right, 'es', { sensitivity: 'base', numeric: true })

const getProductVariantMeta = (product: any) => {
    const attributes = product?.attributes || {}
    const normalizedLabel = String(
        resolveProductVariantLabel(String(product?.productType || product?.category || ''), attributes, product) || ''
    ).trim()
    const color = String(attributes.color || '').trim()
    const size = String(attributes.size || '').trim()
    const presentation = String(attributes.presentation || attributes.weight || '').trim()
    const sku = String(attributes.sku || '').trim()

    const badges = Array.from(new Set(
        [normalizedLabel, color, size, presentation]
            .map((value) => String(value || '').trim())
            .filter((value) => value && !/^(n\/?a|na)$/i.test(value))
    )).slice(0, 3)

    return {
        badges,
        sku,
    }
}

type ProductsManagementPanelProps = {
    products: any[];
    summary: {
        all: number;
        published: number;
        hidden: number;
        publishable: number;
        blocked: number;
        withStock: number;
        noStock: number;
        withPrice: number;
        noPrice: number;
    };
    activeFilter: ProductPublicationFilter;
    activeQuickFilter: 'all' | 'publishable' | 'blocked' | 'with-stock' | 'no-stock' | 'no-price';
    searchQuery: string;
    advancedFilters: AdminProductAdvancedFilters;
    filterOptions: {
        categories: AdminProductFilterOption[];
        suppliers: AdminProductFilterOption[];
        brands: AdminProductFilterOption[];
        species: AdminProductFilterOption[];
    };
    hasPerishableProducts: boolean;
    onFilterChange: (filter: ProductPublicationFilter) => void;
    onQuickFilterChange: (filter: 'all' | 'publishable' | 'blocked' | 'with-stock' | 'no-stock' | 'no-price') => void;
    onSearchChange: (value: string) => void;
    onAdvancedFiltersChange: (filters: AdminProductAdvancedFilters) => void;
    onClearAdvancedFilters: () => void;
    onNewProduct: () => void;
    onEditProduct: (product: any) => void;
    onRestockProduct: (product: any) => void;
    onDuplicateVariant: (product: any) => void;
    onDeleteProduct: (id: string) => void;
    onTogglePublication: (product: any, nextPublished: boolean) => void;
    publicationPendingIds: Record<string, boolean>;
    isProductEligibleForPublication: (product: any) => boolean;
    getProductExpirationMeta: (product: any) => {
        isFood: boolean;
        expirationDate: string;
        badge: { label: string; className: string };
    };
    formatIsoDate: (value?: string | null) => string;
}

const FILTER_OPTIONS: Array<{ key: ProductPublicationFilter; label: string }> = [
    { key: 'all', label: 'Todos' },
    { key: 'published', label: 'Publicados' },
    { key: 'hidden', label: 'Ocultos' }
]

export default React.memo(function ProductsManagementPanel({
    products,
    summary,
    activeFilter,
    activeQuickFilter,
    searchQuery,
    advancedFilters,
    filterOptions,
    hasPerishableProducts,
    onFilterChange,
    onQuickFilterChange,
    onSearchChange,
    onAdvancedFiltersChange,
    onClearAdvancedFilters,
    onNewProduct,
    onEditProduct,
    onRestockProduct,
    onDuplicateVariant,
    onDeleteProduct,
    onTogglePublication,
    publicationPendingIds,
    isProductEligibleForPublication,
    getProductExpirationMeta,
    formatIsoDate,
}: ProductsManagementPanelProps) {
    const hasAdvancedFilters = searchQuery.trim().length > 0
        || advancedFilters.category !== 'all'
        || advancedFilters.supplier !== 'all'
        || advancedFilters.brand !== 'all'
        || advancedFilters.species !== 'all'
        || advancedFilters.tax !== 'all'

    const getCount = React.useCallback((filter: ProductPublicationFilter) => {
        if (filter === 'published') return summary.published
        if (filter === 'hidden') return summary.hidden
        return summary.all
    }, [summary])

    const quickFilters = React.useMemo(() => ([
        { key: 'all', label: 'Todos', count: summary.all },
        { key: 'publishable', label: 'Publicables', count: summary.publishable },
        { key: 'blocked', label: 'Bloqueados', count: summary.blocked },
        { key: 'with-stock', label: 'Con stock', count: summary.withStock },
        { key: 'no-stock', label: 'Sin stock', count: summary.noStock },
        { key: 'no-price', label: 'Sin precio', count: summary.noPrice },
    ]), [summary])

    const activeFilterChips = React.useMemo(() => {
        const chips: Array<{ key: keyof AdminProductAdvancedFilters | 'search'; label: string; value?: string }> = []

        if (searchQuery.trim()) {
            chips.push({ key: 'search', label: 'Búsqueda', value: searchQuery.trim() })
        }
        if (advancedFilters.category !== 'all') {
            chips.push({ key: 'category', label: 'Categoría', value: filterOptions.categories.find((item) => item.value === advancedFilters.category)?.label ?? advancedFilters.category })
        }
        if (advancedFilters.supplier !== 'all') {
            chips.push({ key: 'supplier', label: 'Proveedor', value: filterOptions.suppliers.find((item) => item.value === advancedFilters.supplier)?.label ?? advancedFilters.supplier })
        }
        if (advancedFilters.brand !== 'all') {
            chips.push({ key: 'brand', label: 'Marca', value: filterOptions.brands.find((item) => item.value === advancedFilters.brand)?.label ?? advancedFilters.brand })
        }
        if (advancedFilters.species !== 'all') {
            chips.push({ key: 'species', label: 'Mascota', value: filterOptions.species.find((item) => item.value === advancedFilters.species)?.label ?? advancedFilters.species })
        }
        if (advancedFilters.tax !== 'all') {
            chips.push({ key: 'tax', label: 'Impuesto', value: advancedFilters.tax === 'taxed' ? 'Con IVA' : 'IVA 0%' })
        }

        return chips
    }, [advancedFilters, filterOptions, searchQuery])

    const handleSelectFilterChange = (key: keyof AdminProductAdvancedFilters, value: string) => {
        onAdvancedFiltersChange({
            ...advancedFilters,
            [key]: value,
        })
    }

    const clearSingleFilter = (key: keyof AdminProductAdvancedFilters | 'search') => {
        if (key === 'search') {
            onSearchChange('')
            return
        }

        onAdvancedFiltersChange({
            ...advancedFilters,
            [key]: 'all',
        })
    }

    const sortedProducts = React.useMemo(() => {
        return [...products].sort((left, right) => {
            const nameComparison = compareAdminLabels(String(left?.name || ''), String(right?.name || ''))
            if (nameComparison !== 0) return nameComparison
            return compareAdminLabels(
                String(getAdminProductEntityId(left) || ''),
                String(getAdminProductEntityId(right) || '')
            )
        })
    }, [products])

    return (
        <div className="tab text-content w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="heading5">Gestión de Productos</div>
                    <p className="text-sm text-secondary mt-1">
                        Mostrando {products.length} de {summary.all} productos.
                    </p>
                </div>
                <button className="button-main py-2 px-6" onClick={onNewProduct}>Nuevo Producto</button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {FILTER_OPTIONS.map((option) => {
                    const isActive = activeFilter === option.key
                    return (
                        <button
                            key={option.key}
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${isActive ? 'border-black bg-black text-white shadow-sm' : 'border-line bg-white text-black hover:bg-surface'}`}
                            onClick={() => onFilterChange(option.key)}
                        >
                            <span>{option.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20 text-white' : 'bg-surface text-secondary'}`}>
                                {getCount(option.key)}
                            </span>
                        </button>
                    )
                })}
            </div>

            <div className="mb-6 rounded-[28px] border border-line bg-white px-4 py-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)] sm:px-5">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative flex-1">
                            <Icon.MagnifyingGlass size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--blue)]" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder="Buscar por marca, producto, categoría, SKU, proveedor o mascota"
                                spellCheck={false}
                                className="h-12 w-full rounded-full border border-[rgba(0,127,155,0.18)] bg-white pl-12 pr-24 text-[15px] text-black shadow-[0_8px_20px_rgba(15,23,42,0.05)] outline-none transition-all placeholder:text-[rgba(15,23,42,0.45)] focus:border-[var(--blue)] focus:shadow-[0_12px_28px_rgba(0,127,155,0.12)]"
                            />
                            {searchQuery.trim() ? (
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 inline-flex h-8 min-w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(0,127,155,0.14)] bg-[rgba(0,127,155,0.06)] px-3 text-[12px] font-semibold text-[var(--blue)] transition-all hover:bg-[rgba(0,127,155,0.12)] hover:text-black"
                                    onClick={() => onSearchChange('')}
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
                                {products.length} producto{products.length === 1 ? '' : 's'}
                            </div>
                            {hasAdvancedFilters && (
                                <div className="inline-flex items-center rounded-full bg-surface px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">
                                    Filtros activos
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">Categoría</span>
                            <select
                                value={advancedFilters.category}
                                onChange={(event) => handleSelectFilterChange('category', event.target.value)}
                                className="h-11 rounded-2xl border border-line bg-white px-4 text-sm outline-none transition-all focus:border-black"
                            >
                                <option value="all">Todas</option>
                                {filterOptions.categories.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label} ({option.count})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">Proveedor</span>
                            <select
                                value={advancedFilters.supplier}
                                onChange={(event) => handleSelectFilterChange('supplier', event.target.value)}
                                className="h-11 rounded-2xl border border-line bg-white px-4 text-sm outline-none transition-all focus:border-black"
                            >
                                <option value="all">Todos</option>
                                {filterOptions.suppliers.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label} ({option.count})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">Marca</span>
                            <select
                                value={advancedFilters.brand}
                                onChange={(event) => handleSelectFilterChange('brand', event.target.value)}
                                className="h-11 rounded-2xl border border-line bg-white px-4 text-sm outline-none transition-all focus:border-black"
                            >
                                <option value="all">Todas</option>
                                {filterOptions.brands.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label} ({option.count})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">Mascota</span>
                            <select
                                value={advancedFilters.species}
                                onChange={(event) => handleSelectFilterChange('species', event.target.value)}
                                className="h-11 rounded-2xl border border-line bg-white px-4 text-sm outline-none transition-all focus:border-black"
                            >
                                <option value="all">Todas</option>
                                {filterOptions.species.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label} ({option.count})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">Impuestos</span>
                            <select
                                value={advancedFilters.tax}
                                onChange={(event) => handleSelectFilterChange('tax', event.target.value as AdminProductAdvancedFilters['tax'])}
                                className="h-11 rounded-2xl border border-line bg-white px-4 text-sm outline-none transition-all focus:border-black"
                            >
                                <option value="all">Todos</option>
                                <option value="exempt">IVA 0%</option>
                                <option value="taxed">Con IVA</option>
                            </select>
                        </label>
                    </div>

                    {activeFilterChips.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {activeFilterChips.map((chip) => (
                                <button
                                    key={`${chip.key}-${chip.value ?? ''}`}
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-full bg-[rgba(0,127,155,0.08)] px-3 py-2 text-[12px] font-semibold text-[var(--blue)] transition-all hover:bg-[rgba(0,127,155,0.14)] hover:text-black"
                                    onClick={() => clearSingleFilter(chip.key)}
                                >
                                    <Icon.X size={12} weight="bold" />
                                    <span>{chip.label}: {chip.value}</span>
                                </button>
                            ))}
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-[12px] font-semibold text-secondary transition-all hover:border-black hover:text-black"
                                onClick={onClearAdvancedFilters}
                            >
                                <Icon.X size={12} weight="bold" />
                                Limpiar todo
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {quickFilters.map((filter) => {
                    const isActive = activeQuickFilter === filter.key
                    return (
                        <button
                            key={filter.key}
                            type="button"
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${isActive ? 'border-black bg-black text-white shadow-sm' : 'border-line bg-white text-secondary hover:bg-surface hover:text-black'}`}
                            onClick={() => onQuickFilterChange(filter.key as ProductsManagementPanelProps['activeQuickFilter'])}
                        >
                            <span>{filter.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? 'bg-white/20 text-white' : 'bg-surface text-secondary'}`}>
                                {filter.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-line">
                            <th className="pb-4 font-bold text-secondary">Imagen</th>
                            <th className="pb-4 font-bold text-secondary">Producto</th>
                            <th className="pb-4 font-bold text-secondary">Stock</th>
                            {hasPerishableProducts && (
                                <th className="pb-4 font-bold text-secondary">Vencimiento</th>
                            )}
                            <th className="pb-4 font-bold text-secondary">Publicado</th>
                            <th className="pb-4 font-bold text-secondary">Precio</th>
                            <th className="pb-4 font-bold text-secondary">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedProducts.length > 0 ? sortedProducts.map((product) => {
                            const expirationMeta = getProductExpirationMeta(product)
                            const canPublish = isProductEligibleForPublication(product)
                            const productId = getAdminProductEntityId(product)
                            const publicationPending = Boolean(publicationPendingIds[productId])
                            const itemKey = productId || String(product?.id || product?.name || Math.random())
                            const variantMeta = getProductVariantMeta(product)
                            const imageSrc = (product.thumbImage && product.thumbImage.length > 0
                                ? product.thumbImage[0]
                                : (product.images && product.images.length > 0 ? product.images[0] : '/images/product/1000x1000.png')) as string

                            return (
                                <tr key={itemKey} className="border-b border-line last:border-0 hover:bg-surface duration-300">
                                    <td className="py-4">
                                        <div className="w-12 h-12 bg-line rounded-lg overflow-hidden">
                                            <Image
                                                src={imageSrc}
                                                width={100}
                                                height={100}
                                                alt={product.name}
                                                unoptimized={imageSrc.startsWith('/uploads/') || imageSrc.startsWith('/images/')}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="space-y-2">
                                            <div className="font-semibold">{product.name}</div>
                                            {(variantMeta.badges.length > 0 || variantMeta.sku) && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {variantMeta.badges.map((badge) => (
                                                        <span
                                                            key={`${itemKey}-${badge}`}
                                                            className="inline-flex rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-secondary"
                                                        >
                                                            {badge}
                                                        </span>
                                                    ))}
                                                    {variantMeta.sku && (
                                                        <span className="text-[11px] text-secondary">
                                                            SKU: {variantMeta.sku}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4">{product.quantity ?? 0} unidades</td>
                                    {hasPerishableProducts && (
                                        <td className="py-4">
                                            {expirationMeta.isFood ? (
                                                <div className="space-y-1">
                                                    <div className="text-xs font-semibold">{formatIsoDate(expirationMeta.expirationDate)}</div>
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${expirationMeta.badge.className}`}>
                                                        {expirationMeta.badge.label}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-secondary">-</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="py-4">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={product.published !== false}
                                                disabled={publicationPending || (!canPublish && product.published === false)}
                                                className={`relative inline-flex h-11 w-24 items-center rounded-full border-2 transition-all shadow-sm ${
                                                    product.published !== false
                                                        ? 'border-emerald-700 bg-emerald-500'
                                                        : canPublish
                                                            ? 'border-slate-400 bg-slate-100'
                                                            : 'border-amber-300 bg-amber-50'
                                                } ${publicationPending || (!canPublish && product.published === false) ? 'cursor-not-allowed opacity-80' : 'hover:scale-[1.02] hover:shadow-md'}`}
                                                onClick={() => onTogglePublication(product, product.published === false)}
                                                title={!canPublish && product.published === false ? 'Necesita precio y stock para publicarse' : (product.published !== false ? 'Despublicar artículo' : 'Publicar artículo')}
                                            >
                                                <span
                                                    className={`pointer-events-none absolute inset-y-0 flex items-center text-[10px] font-bold uppercase tracking-[0.08em] ${
                                                        product.published !== false
                                                            ? 'left-3 text-emerald-100'
                                                            : canPublish
                                                                ? 'right-3 text-slate-700'
                                                                : 'right-2 text-amber-700'
                                                    }`}
                                                >
                                                    {product.published !== false ? 'Activo' : (canPublish ? 'Off' : 'Lock')}
                                                </span>
                                                <span
                                                    className={`inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-white shadow transition-transform border border-black/10 ${
                                                        product.published !== false ? 'translate-x-14' : 'translate-x-1'
                                                    }`}
                                                >
                                                    {product.published !== false ? (
                                                        <Icon.Check size={16} weight="bold" className="text-emerald-600" />
                                                    ) : canPublish ? (
                                                        <Icon.X size={16} weight="bold" className="text-slate-500" />
                                                    ) : (
                                                        <Icon.Lock size={14} weight="bold" className="text-amber-600" />
                                                    )}
                                                </span>
                                            </button>
                                            <span className={`inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                publicationPending
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : product.published !== false
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : canPublish
                                                            ? 'bg-slate-200 text-slate-700'
                                                            : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {publicationPending ? 'Guardando...' : (product.published !== false ? 'Publicado' : (canPublish ? 'Oculto' : 'Bloqueado'))}
                                            </span>
                                            {!canPublish && (
                                                <span className="text-[11px] text-amber-700 font-medium">
                                                    Requiere precio y stock
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 font-bold">${Number(product.price).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-4">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="p-2 hover:bg-line rounded-full transition-colors"
                                                onClick={() => onRestockProduct(product)}
                                                title="Registrar compra"
                                            >
                                                <Icon.Package size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-line rounded-full transition-colors" onClick={() => onEditProduct(product)}><Icon.PencilSimple size={18} /></button>
                                            <button
                                                type="button"
                                                className="p-2 hover:bg-line rounded-full transition-colors"
                                                onClick={() => onDuplicateVariant(product)}
                                                title="Duplicar variante"
                                            >
                                                <Icon.Copy size={18} />
                                            </button>
                                            <button
                                                className="p-2 hover:bg-line rounded-full transition-colors text-red"
                                                onClick={() => onDeleteProduct(productId)}
                                            >
                                                <Icon.Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={hasPerishableProducts ? 7 : 6} className="py-8 text-center text-secondary">
                                    No se encontraron productos para este filtro.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
})
