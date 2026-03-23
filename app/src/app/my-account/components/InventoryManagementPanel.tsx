'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

type InventorySummary = {
    totalSkus: number;
    totalUnits: number;
    totalCost: number;
    totalMarket: number;
    out: number;
    low: number;
    expiring: number;
    expired: number;
}

type PurchaseInvoicesSummary = {
    totalInvoices: number;
    totalUnits: number;
    totalAmount: number;
    suppliersCount: number;
}

type InventoryManagementPanelProps = {
    summary: InventorySummary;
    rows: any[];
    searchQuery: string;
    statusFilter: 'all' | 'available' | 'low' | 'out' | 'expiring' | 'expired';
    typeFilter: 'all' | 'perishable' | 'nonperishable';
    purchaseInvoicesSummary: PurchaseInvoicesSummary;
    recentPurchaseInvoices: any[];
    purchaseInvoicesLoading: boolean;
    hasPerishableProducts: boolean;
    lowStockThreshold: number;
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: 'all' | 'available' | 'low' | 'out' | 'expiring' | 'expired') => void;
    onTypeFilterChange: (value: 'all' | 'perishable' | 'nonperishable') => void;
    onClearFilters: () => void;
    onNavigateToProducts: () => void;
    onNewProduct: () => void;
    onReloadPurchaseInvoices: () => void;
    onOpenPurchaseInvoice: (id: string) => void;
    onOpenProductBalance: (product: any) => void;
    onEditProduct: (product: any) => void;
    onRestockProduct: (product: any) => void;
    formatMoney: (value: number | string | null | undefined) => string;
    formatIsoDate: (value?: string | null) => string;
    formatDateEcuador: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
    formatDateTimeEcuador: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
}

const INVENTORY_STATUS_OPTIONS: Array<{ key: InventoryManagementPanelProps['statusFilter']; label: string }> = [
    { key: 'all', label: 'Todos los estados' },
    { key: 'available', label: 'Disponible' },
    { key: 'low', label: 'Bajo stock' },
    { key: 'out', label: 'Sin stock' },
    { key: 'expiring', label: 'Por vencer' },
    { key: 'expired', label: 'Vencidos' },
]

const INVENTORY_TYPE_OPTIONS: Array<{ key: InventoryManagementPanelProps['typeFilter']; label: string }> = [
    { key: 'all', label: 'Todos los tipos' },
    { key: 'perishable', label: 'Solo perecederos' },
    { key: 'nonperishable', label: 'Solo no perecederos' },
]

export default React.memo(function InventoryManagementPanel({
    summary,
    rows,
    searchQuery,
    statusFilter,
    typeFilter,
    purchaseInvoicesSummary,
    recentPurchaseInvoices,
    purchaseInvoicesLoading,
    hasPerishableProducts,
    lowStockThreshold,
    onSearchChange,
    onStatusFilterChange,
    onTypeFilterChange,
    onClearFilters,
    onNavigateToProducts,
    onNewProduct,
    onReloadPurchaseInvoices,
    onOpenPurchaseInvoice,
    onOpenProductBalance,
    onEditProduct,
    onRestockProduct,
    formatMoney,
    formatIsoDate,
    formatDateEcuador,
    formatDateTimeEcuador,
}: InventoryManagementPanelProps) {
    return (
        <div className="tab text-content w-full">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
                <div>
                    <div className="heading5">Gestion de Inventario</div>
                    <p className="text-secondary text-sm mt-1">
                        Controla stock, perecibles, vencimientos y valor inmovilizado del catalogo.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg border border-line text-sm font-semibold hover:bg-surface transition-all"
                        onClick={onNavigateToProducts}
                    >
                        Ver catalogo
                    </button>
                    <button type="button" className="button-main py-2 px-6" onClick={onNewProduct}>
                        Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => onStatusFilterChange('all')}
                    className={`p-4 rounded-xl border text-left transition-all ${statusFilter === 'all' ? 'border-black bg-surface' : 'border-line bg-white hover:border-black'}`}
                >
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">SKUs en inventario</div>
                    <div className="text-2xl font-bold">{summary.totalSkus}</div>
                    <div className="text-xs text-secondary mt-1">{summary.totalUnits.toLocaleString('es-EC')} unidades</div>
                </button>
                <button
                    type="button"
                    onClick={() => onStatusFilterChange('out')}
                    className={`p-4 rounded-xl border text-left transition-all ${statusFilter === 'out' ? 'border-red-500 bg-red-50' : 'border-line bg-white hover:border-red-500'}`}
                >
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">Sin stock</div>
                    <div className="text-2xl font-bold text-red">{summary.out}</div>
                    <div className="text-xs text-secondary mt-1">Reposicion inmediata</div>
                </button>
                <button
                    type="button"
                    onClick={() => onStatusFilterChange('low')}
                    className={`p-4 rounded-xl border text-left transition-all ${statusFilter === 'low' ? 'border-amber-500 bg-amber-50' : 'border-line bg-white hover:border-amber-500'}`}
                >
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">Bajo stock</div>
                    <div className="text-2xl font-bold text-amber-700">{summary.low}</div>
                    <div className="text-xs text-secondary mt-1">Umbral operativo: {lowStockThreshold} uds o menos</div>
                </button>
                <button
                    type="button"
                    onClick={() => onStatusFilterChange('expiring')}
                    className={`p-4 rounded-xl border text-left transition-all ${statusFilter === 'expiring' ? 'border-amber-500 bg-amber-50' : 'border-line bg-white hover:border-amber-500'}`}
                >
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">Por vencer</div>
                    <div className="text-2xl font-bold text-amber-700">{summary.expiring}</div>
                    <div className="text-xs text-secondary mt-1">Solo productos perecederos</div>
                </button>
                <button
                    type="button"
                    onClick={() => onStatusFilterChange('expired')}
                    className={`p-4 rounded-xl border text-left transition-all ${statusFilter === 'expired' ? 'border-red-500 bg-red-50' : 'border-line bg-white hover:border-red-500'}`}
                >
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">Vencidos</div>
                    <div className="text-2xl font-bold text-red">{summary.expired}</div>
                    <div className="text-xs text-secondary mt-1">Bloqueados para venta</div>
                </button>
                <button
                    type="button"
                    onClick={() => onStatusFilterChange('all')}
                    className="p-4 rounded-xl border border-line bg-white hover:border-black transition-all text-left"
                >
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">Capital al costo</div>
                    <div className="text-2xl font-bold">{formatMoney(summary.totalCost)}</div>
                    <div className="text-xs text-secondary mt-1">Suma del costo de compra de todo el stock</div>
                </button>
                <button
                    type="button"
                    onClick={() => onStatusFilterChange('all')}
                    className="p-4 rounded-xl border border-line bg-white hover:border-black transition-all text-left"
                >
                    <div className="text-[10px] uppercase font-bold text-secondary mb-1">Valor de venta</div>
                    <div className="text-2xl font-bold">{formatMoney(summary.totalMarket)}</div>
                    <div className="text-xs text-secondary mt-1">Precio de venta total si se liquida todo el stock</div>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
                <div className="xl:col-span-2 p-5 rounded-2xl border border-line bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                            <div className="heading6">Ultimas facturas de compra</div>
                            <p className="text-sm text-secondary mt-1">
                                Trazabilidad reciente de ingresos de inventario y costos de compra.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-line text-sm font-semibold hover:bg-surface transition-all"
                            onClick={onReloadPurchaseInvoices}
                            disabled={purchaseInvoicesLoading}
                        >
                            {purchaseInvoicesLoading ? 'Actualizando...' : 'Actualizar facturas'}
                        </button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-line">
                        <table className="w-full min-w-[760px] text-left">
                            <thead className="bg-surface border-b border-line">
                                <tr className="text-[11px] uppercase font-bold text-secondary">
                                    <th className="px-3 py-3">Factura</th>
                                    <th className="px-3 py-3">Proveedor</th>
                                    <th className="px-3 py-3">Fecha</th>
                                    <th className="px-3 py-3 text-right">Productos</th>
                                    <th className="px-3 py-3 text-right">Unidades</th>
                                    <th className="px-3 py-3 text-right">Total</th>
                                    <th className="px-3 py-3">Accion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {recentPurchaseInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-surface/40">
                                        <td className="px-3 py-3">
                                            <div className="text-sm font-semibold">{invoice.invoice_number || '-'}</div>
                                            <div className="text-xs text-secondary">{invoice.notes || 'Sin observaciones'}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="text-sm">{invoice.supplier_name || '-'}</div>
                                            <div className="text-xs text-secondary">{invoice.supplier_document || 'Sin documento'}</div>
                                        </td>
                                        <td className="px-3 py-3 text-sm">
                                            <div>{formatIsoDate(invoice.issued_at)}</div>
                                            <div className="text-xs text-secondary">{formatDateTimeEcuador(invoice.created_at, { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-3 py-3 text-right text-sm">{Number(invoice.products_count ?? 0).toLocaleString('es-EC')}</td>
                                        <td className="px-3 py-3 text-right text-sm">{Number(invoice.units_total ?? 0).toLocaleString('es-EC')}</td>
                                        <td className="px-3 py-3 text-right text-sm font-semibold">{formatMoney(invoice.total)}</td>
                                        <td className="px-3 py-3">
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold hover:bg-surface transition-all"
                                                onClick={() => onOpenPurchaseInvoice(invoice.id)}
                                            >
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!purchaseInvoicesLoading && recentPurchaseInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-8 text-center text-sm text-secondary">
                                            Aun no hay facturas de compra registradas para este tenant.
                                        </td>
                                    </tr>
                                )}
                                {purchaseInvoicesLoading && (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-8 text-center text-sm text-secondary">
                                            Cargando facturas de compra...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-line bg-white">
                    <div className="heading6 mb-4">Resumen de compras</div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-surface border border-line">
                            <div className="text-[10px] uppercase font-bold text-secondary">Facturas recientes</div>
                            <div className="text-2xl font-bold mt-1">{purchaseInvoicesSummary.totalInvoices.toLocaleString('es-EC')}</div>
                            <div className="text-xs text-secondary mt-1">Cargadas en este panel</div>
                        </div>
                        <div className="p-4 rounded-xl bg-surface border border-line">
                            <div className="text-[10px] uppercase font-bold text-secondary">Unidades compradas</div>
                            <div className="text-2xl font-bold mt-1">{purchaseInvoicesSummary.totalUnits.toLocaleString('es-EC')}</div>
                            <div className="text-xs text-secondary mt-1">Suma de las facturas listadas</div>
                        </div>
                        <div className="p-4 rounded-xl bg-surface border border-line">
                            <div className="text-[10px] uppercase font-bold text-secondary">Monto comprado</div>
                            <div className="text-2xl font-bold mt-1">{formatMoney(purchaseInvoicesSummary.totalAmount)}</div>
                            <div className="text-xs text-secondary mt-1">
                                {purchaseInvoicesSummary.suppliersCount.toLocaleString('es-EC')} proveedor(es) registrados
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-2xl border border-line bg-white mb-4">
                <div className="flex flex-col xl:flex-row gap-3 xl:items-center">
                    <div className="relative flex-1">
                        <Icon.MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            className="w-full rounded-full border border-line bg-white pl-12 pr-4 py-4 text-sm outline-none transition-all focus:border-black"
                            placeholder="Buscar por marca, producto, categoria, SKU, lote o proveedor"
                            value={searchQuery}
                            onChange={(event) => onSearchChange(event.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 xl:w-auto">
                        <select
                            className="min-w-[220px] rounded-full border border-line bg-white px-4 py-4 text-sm outline-none transition-all focus:border-black"
                            value={statusFilter}
                            onChange={(event) => onStatusFilterChange(event.target.value as InventoryManagementPanelProps['statusFilter'])}
                        >
                            {INVENTORY_STATUS_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className="min-w-[220px] rounded-full border border-line bg-white px-4 py-4 text-sm outline-none transition-all focus:border-black"
                            value={typeFilter}
                            onChange={(event) => onTypeFilterChange(event.target.value as InventoryManagementPanelProps['typeFilter'])}
                        >
                            {INVENTORY_TYPE_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className="rounded-full border border-line px-5 py-4 text-sm font-semibold hover:bg-surface transition-all"
                            onClick={onClearFilters}
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="text-sm text-secondary">
                        {rows.length.toLocaleString('es-EC')} productos encontrados
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-secondary">
                        <span className="rounded-full bg-surface px-3 py-1"><strong className="text-black">Registrar compra:</strong> repone stock con factura</span>
                        <span className="rounded-full bg-surface px-3 py-1"><strong className="text-black">Balance:</strong> abre el detalle por compra/lote</span>
                        <span className="rounded-full bg-surface px-3 py-1"><strong className="text-black">Costo unitario:</strong> valor de compra por unidad</span>
                        <span className="rounded-full bg-surface px-3 py-1"><strong className="text-black">PVP:</strong> precio de venta por unidad</span>
                        <span className="rounded-full bg-surface px-3 py-1"><strong className="text-black">Capital al costo:</strong> costo unitario x stock actual</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-line bg-white">
                <table className="w-full min-w-[1180px] text-left">
                    <thead className="border-b border-line bg-surface">
                        <tr className="text-[11px] uppercase font-bold text-secondary">
                            <th className="px-4 py-3 min-w-[280px]">Producto</th>
                            <th className="px-4 py-3 min-w-[180px]">Inventario</th>
                            {hasPerishableProducts && (
                                <th className="px-4 py-3 min-w-[170px]">Vencimiento</th>
                            )}
                            <th className="px-4 py-3 min-w-[170px]">Trazabilidad</th>
                            <th className="px-4 py-3 min-w-[260px]">Ultima compra</th>
                            <th className="px-4 py-3 min-w-[180px]">Precios</th>
                            <th className="px-4 py-3 min-w-[120px]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {rows.map((row) => {
                            const stockBadge = row.stockStatus === 'expired'
                                ? { label: 'Vencido', className: 'bg-red-100 text-red-700' }
                                : row.stockStatus === 'expiring'
                                    ? { label: 'Por vencer', className: 'bg-amber-100 text-amber-700' }
                                    : row.stockStatus === 'out'
                                        ? { label: 'Sin stock', className: 'bg-red-100 text-red-700' }
                                        : row.stockStatus === 'low'
                                            ? { label: 'Bajo stock', className: 'bg-amber-100 text-amber-700' }
                                            : { label: 'Disponible', className: 'bg-emerald-100 text-emerald-700' }

                            return (
                                <tr key={row.internalId} className="align-top hover:bg-surface/40">
                                    <td className="px-4 py-4">
                                        <div className="max-w-[320px] space-y-1">
                                            <div className="text-sm font-semibold break-words">{row.name}</div>
                                            <div className="text-xs text-secondary">{row.category}</div>
                                            <div className="text-xs text-secondary break-all">
                                                SKU: <span className="font-medium text-black">{row.sku || '-'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-2">
                                            <div className={`text-lg font-bold ${row.stock <= 0 ? 'text-red' : 'text-black'}`}>
                                                {row.stock.toLocaleString('es-EC')} uds
                                            </div>
                                            <div className="text-xs text-secondary">
                                                {row.isPerishable ? 'Perecedero (Alimento)' : 'No perecedero'}
                                            </div>
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${stockBadge.className}`}>
                                                {stockBadge.label}
                                            </span>
                                        </div>
                                    </td>
                                    {hasPerishableProducts && (
                                        <td className="px-4 py-4">
                                            {row.isPerishable ? (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-semibold">{formatIsoDate(row.expirationMeta.expirationDate)}</div>
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${row.expirationMeta.badge.className}`}>
                                                        {row.expirationMeta.badge.label}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-secondary">No perecedero</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-4 py-4">
                                        <div className="space-y-1 text-sm">
                                            <div>Lote: <span className="font-medium">{row.lotCode || '-'}</span></div>
                                            <div className="break-words">Ubicacion: <span className="font-medium">{row.storageLocation || '-'}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium break-words">{row.supplier || '-'}</div>
                                            <div className="text-xs text-secondary">
                                                Entradas: {Number(row.purchaseEntriesCount ?? 0).toLocaleString('es-EC')} • Comprado: {Number(row.purchasedUnits ?? 0).toLocaleString('es-EC')}
                                            </div>
                                            {row.lastPurchaseInvoiceNumber ? (
                                                <div className="space-y-1 pt-1">
                                                    {row.lastPurchaseInvoiceId ? (
                                                        <button
                                                            type="button"
                                                            className="text-sm font-semibold text-left underline underline-offset-2 break-all"
                                                            onClick={() => onOpenPurchaseInvoice(row.lastPurchaseInvoiceId)}
                                                        >
                                                            {row.lastPurchaseInvoiceNumber}
                                                        </button>
                                                    ) : (
                                                        <div className="text-sm font-semibold break-all">{row.lastPurchaseInvoiceNumber}</div>
                                                    )}
                                                    <div className="text-xs text-secondary">
                                                        {row.lastPurchaseIssuedAt
                                                            ? formatIsoDate(row.lastPurchaseIssuedAt)
                                                            : formatDateEcuador(row.lastPurchaseReceivedAt)} • {formatMoney(row.lastPurchaseUnitCost)} x {Number(row.lastPurchaseQuantity ?? 0).toLocaleString('es-EC')}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-secondary pt-1">Sin factura enlazada</div>
                                            )}
                                            {row.openLotsCount > 1 && (
                                                <div className="text-xs text-amber-700 pt-1">
                                                    Mezcla activa de {row.openLotsCount} compras/lotes.
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1 text-sm">
                                            <div>Costo ponderado stock: <span className="font-semibold">{formatMoney(row.weightedUnitCost)}</span></div>
                                            <div>PVP unitario: <span className="font-semibold">{formatMoney(row.unitPrice)}</span></div>
                                            <div>Margen stock actual: <span className={`font-semibold ${row.weightedMargin < 0 ? 'text-red' : 'text-black'}`}>{Number(row.weightedMargin ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span></div>
                                            {row.lastPurchaseUnitCost > 0 && (
                                                <div>Margen última compra: <span className={`font-semibold ${row.lastPurchaseMargin < 0 ? 'text-red' : 'text-black'}`}>{Number(row.lastPurchaseMargin ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span></div>
                                            )}
                                            <div>Capital al costo: <span className="font-semibold">{formatMoney(row.inventoryCost)}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold hover:bg-surface transition-all"
                                                onClick={() => onOpenProductBalance(row.source)}
                                            >
                                                Balance
                                            </button>
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-lg border border-black bg-black text-white text-xs font-semibold hover:bg-primary transition-all"
                                                onClick={() => onRestockProduct(row.source)}
                                            >
                                                Registrar compra
                                            </button>
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold hover:bg-surface transition-all"
                                                onClick={() => onEditProduct(row.source)}
                                            >
                                                Editar
                                            </button>
                                            {row.lastPurchaseInvoiceId && (
                                                <button
                                                    type="button"
                                                    className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold hover:bg-surface transition-all"
                                                    onClick={() => onOpenPurchaseInvoice(row.lastPurchaseInvoiceId)}
                                                >
                                                    Factura
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={hasPerishableProducts ? 7 : 6} className="px-3 py-8 text-center text-sm text-secondary">
                                    No hay productos para los filtros actuales.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
})
