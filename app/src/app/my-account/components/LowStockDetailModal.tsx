'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import type { InventoryManagementRow } from '../adminProductDerivations'

type LowStockDetailModalProps = {
    open: boolean;
    title: string;
    subtitle: string;
    accentColor: string;
    rows: InventoryManagementRow[];
    formatMoney: (value: any) => string;
    onClose: () => void;
    onViewInTable: () => void;
    onRestockProduct: (product: any) => void;
    onOpenProductBalance: (product: any) => void;
    onEditProduct: (product: any) => void;
}

const statusBadge = (row: InventoryManagementRow) => {
    if (row.stockStatus === 'critical') {
        return { label: 'Crítico', className: 'bg-red-100 text-red-700' }
    }
    if (row.stockStatus === 'low') {
        return { label: 'Bajo stock', className: 'bg-amber-100 text-amber-700' }
    }
    if (row.stockStatus === 'out') {
        return { label: 'Sin stock', className: 'bg-red-100 text-red-700' }
    }
    if (row.stockStatus === 'expiring') {
        return { label: 'Por vencer', className: 'bg-amber-100 text-amber-700' }
    }
    if (row.stockStatus === 'expired') {
        return { label: 'Vencido', className: 'bg-red-100 text-red-700' }
    }
    return { label: 'Disponible', className: 'bg-emerald-100 text-emerald-700' }
}

export default function LowStockDetailModal({
    open,
    title,
    subtitle,
    accentColor,
    rows,
    formatMoney,
    onClose,
    onViewInTable,
    onRestockProduct,
    onOpenProductBalance,
    onEditProduct,
}: LowStockDetailModalProps) {
    if (!open) return null

    const sortedRows = [...rows].sort((a, b) => {
        const statusOrder: Record<string, number> = { expired: 0, expiring: 1, out: 2, critical: 3, low: 4, available: 5 }
        return (statusOrder[a.stockStatus] ?? 99) - (statusOrder[b.stockStatus] ?? 99)
    })

    const suggestRestockQty = (row: InventoryManagementRow) => {
        if (row.stockStatus === 'out') return Math.max(row.reorderPoint * 2, 10)
        return Math.max(row.reorderPoint - row.stock + Math.ceil(row.reorderPoint * 0.5), 1)
    }

    const totalSuggestions = sortedRows.reduce((sum, r) => sum + suggestRestockQty(r), 0)
    const totalEstimatedCost = sortedRows.reduce((sum, r) => sum + suggestRestockQty(r) * r.weightedUnitCost, 0)

    return (
        <div
            className="fixed inset-0 z-[210] flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl"
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
                <div className={`p-6 border-b border-line flex justify-between items-center rounded-t-2xl`}
                    style={{ backgroundColor: accentColor === 'red' ? '#fef2f2' : accentColor === 'amber' ? '#fffbeb' : '#ffffff' }}
                >
                    <div>
                        <h4 className="heading4">{title}</h4>
                        <div className="text-secondary text-sm mt-1">{subtitle}</div>
                    </div>
                    <button onClick={onClose} className="text-secondary hover:text-black">
                        <Icon.X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                    {sortedRows.length === 0 ? (
                        <div className="py-12 text-center text-sm text-secondary">
                            No hay productos en esta categoría.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 rounded-xl border border-line bg-surface">
                                    <div className="text-[10px] uppercase font-bold text-secondary">Productos</div>
                                    <div className="text-xl font-bold mt-1">{sortedRows.length}</div>
                                </div>
                                <div className="p-3 rounded-xl border border-line bg-surface">
                                    <div className="text-[10px] uppercase font-bold text-secondary">Unidades totales</div>
                                    <div className="text-xl font-bold mt-1">{sortedRows.reduce((s, r) => s + r.stock, 0).toLocaleString('es-EC')}</div>
                                </div>
                                <div className="p-3 rounded-xl border border-line bg-surface">
                                    <div className="text-[10px] uppercase font-bold text-secondary">Capital inmovilizado</div>
                                    <div className="text-xl font-bold mt-1">{formatMoney(sortedRows.reduce((s, r) => s + r.inventoryCost, 0))}</div>
                                </div>
                                <div className="p-3 rounded-xl border border-line bg-surface">
                                    <div className="text-[10px] uppercase font-bold text-secondary">Compra sugerida</div>
                                    <div className="text-xl font-bold mt-1">{totalSuggestions.toLocaleString('es-EC')} uds</div>
                                    <div className="text-xs text-secondary mt-0.5">{formatMoney(totalEstimatedCost)} estimado</div>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-line">
                                <table className="w-full min-w-[800px] text-left">
                                    <thead className="bg-surface border-b border-line">
                                        <tr className="text-[11px] uppercase font-bold text-secondary">
                                            <th className="px-4 py-3 min-w-[200px]">Producto</th>
                                            <th className="px-4 py-3 text-right">Stock</th>
                                            <th className="px-4 py-3 text-right">Reorder</th>
                                            <th className="px-4 py-3 text-right">Crítico</th>
                                            <th className="px-4 py-3 text-right">Cobertura</th>
                                            <th className="px-4 py-3 text-right">Costo U.</th>
                                            <th className="px-4 py-3 text-right">Sugerencia</th>
                                            <th className="px-4 py-3">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {sortedRows.map((row) => (
                                            <tr key={row.internalId} className="hover:bg-surface/40 align-top">
                                                <td className="px-4 py-3">
                                                    <div className="max-w-[220px] space-y-1">
                                                        <div className="text-sm font-semibold break-words">{row.name}</div>
                                                        <div className="text-xs text-secondary">{row.category}</div>
                                                        <div className="text-xs text-secondary break-all">
                                                            SKU: <span className="font-medium text-black">{row.sku || '-'}</span>
                                                        </div>
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(row).className}`}>
                                                            {statusBadge(row).label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`text-lg font-bold ${row.stock <= 0 ? 'text-red' : row.stock <= row.criticalPoint ? 'text-red' : 'text-amber-700'}`}>
                                                        {row.stock.toLocaleString('es-EC')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm">{row.reorderPoint.toLocaleString('es-EC')}</td>
                                                <td className="px-4 py-3 text-right text-sm">{row.criticalPoint.toLocaleString('es-EC')}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`text-sm font-semibold ${row.coverageDays != null && row.coverageDays < 15 ? 'text-red' : 'text-black'}`}>
                                                        {row.coverageDays != null ? `${row.coverageDays.toLocaleString('es-EC')} d` : '—'}
                                                    </span>
                                                    {row.avgMonthlySales > 0 && (
                                                        <div className="text-xs text-secondary">{row.avgMonthlySales.toFixed(1)} uds/mes</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm">{formatMoney(row.weightedUnitCost)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="text-sm font-semibold text-emerald-700">+{suggestRestockQty(row).toLocaleString('es-EC')}</div>
                                                    <div className="text-xs text-secondary">{formatMoney(suggestRestockQty(row) * row.weightedUnitCost)}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1 rounded-lg border border-black bg-black text-white text-xs font-semibold hover:bg-primary transition-all"
                                                            onClick={() => onRestockProduct(row.source)}
                                                        >
                                                            Registrar compra
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1 rounded-lg border border-line text-xs font-semibold hover:bg-surface transition-all"
                                                            onClick={() => onOpenProductBalance(row.source)}
                                                        >
                                                            Balance
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1 rounded-lg border border-line text-xs font-semibold hover:bg-surface transition-all"
                                                            onClick={() => onEditProduct(row.source)}
                                                        >
                                                            Editar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalSuggestions > 0 && (
                                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                                    <div className="flex items-start gap-3">
                                        <Icon.Lightbulb size={20} className="text-emerald-700 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-sm font-semibold text-emerald-900">Sugerencia de reabastecimiento</div>
                                            <div className="text-xs text-emerald-800 mt-1">
                                                Se recomienda comprar <strong>{totalSuggestions.toLocaleString('es-EC')} unidades</strong> en total
                                                (costo estimado: <strong>{formatMoney(totalEstimatedCost)}</strong>) para llevar estos productos
                                                a un nivel saludable de inventario.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-5 border-t border-line flex justify-between items-center bg-white rounded-b-2xl">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg border border-line text-sm font-semibold hover:bg-surface transition-all"
                        onClick={onViewInTable}
                    >
                        Ver todos en tabla principal
                    </button>
                    <button
                        className="px-5 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
