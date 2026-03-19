'use client'

import React from 'react'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import type { ProductPublicationFilter } from '../types'
import { getAdminProductEntityId } from '../productFormUtils'

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
    hasPerishableProducts: boolean;
    onFilterChange: (filter: ProductPublicationFilter) => void;
    onQuickFilterChange: (filter: 'all' | 'publishable' | 'blocked' | 'with-stock' | 'no-stock' | 'no-price') => void;
    onSearchChange: (value: string) => void;
    onNewProduct: () => void;
    onEditProduct: (product: any) => void;
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
    hasPerishableProducts,
    onFilterChange,
    onQuickFilterChange,
    onSearchChange,
    onNewProduct,
    onEditProduct,
    onDuplicateVariant,
    onDeleteProduct,
    onTogglePublication,
    publicationPendingIds,
    isProductEligibleForPublication,
    getProductExpirationMeta,
    formatIsoDate,
}: ProductsManagementPanelProps) {
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

            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar por marca, producto, categoría o SKU"
                    className="w-full max-w-[520px] rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-all focus:border-black"
                />
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
                        {products.length > 0 ? products.map((product) => {
                            const expirationMeta = getProductExpirationMeta(product)
                            const canPublish = isProductEligibleForPublication(product)
                            const productId = getAdminProductEntityId(product)
                            const publicationPending = Boolean(publicationPendingIds[productId])
                            const imageSrc = (product.thumbImage && product.thumbImage.length > 0
                                ? product.thumbImage[0]
                                : (product.images && product.images.length > 0 ? product.images[0] : '/images/product/1000x1000.png')) as string

                            return (
                                <tr key={product.id} className="border-b border-line last:border-0 hover:bg-surface duration-300">
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
                                    <td className="py-4 font-semibold">{product.name}</td>
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
