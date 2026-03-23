'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import type { ProductProcurementDetail, SalesRankingRow } from '../types'

type ProductProcurementDetailModalProps = {
    open: boolean;
    loading: boolean;
    detail: ProductProcurementDetail | null;
    salesProduct: SalesRankingRow | null;
    currentPeriod: { start?: string | null; end?: string | null };
    historicalPeriod: { start?: string | null; end?: string | null };
    formatMoney: (value: any) => string;
    formatIsoDate: (value?: string | null) => string;
    onClose: () => void;
    onOpenPurchaseInvoice: (id: string) => void;
}

const lotSourceLabel = (sourceType: string) => {
    switch (sourceType) {
        case 'purchase_invoice':
            return 'Factura de compra'
        case 'stock_reconciliation':
            return 'Conciliación de stock'
        default:
            return sourceType || 'Sin origen'
    }
}

const renderMetricCard = (label: string, value: string | number, caption?: string, highlightClass = '') => (
    <div className="p-4 rounded-xl border border-line bg-white">
        <div className="text-[10px] uppercase font-bold text-secondary">{label}</div>
        <div className={`text-lg font-bold mt-1 ${highlightClass}`}>{value}</div>
        {caption && <div className="text-xs text-secondary mt-1">{caption}</div>}
    </div>
)

export default function ProductProcurementDetailModal({
    open,
    loading,
    detail,
    salesProduct,
    currentPeriod,
    historicalPeriod,
    formatMoney,
    formatIsoDate,
    onClose,
    onOpenPurchaseInvoice,
}: ProductProcurementDetailModalProps) {
    if (!open) return null

    const lots = detail?.lots || []
    const openLots = lots.filter((lot) => lot.remaining_quantity > 0)

    return (
        <div
            className="fixed inset-0 z-[220] flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl"
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
                <div className="p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl">
                    <div>
                        <h4 className="heading4">
                            {detail?.product_name ? `Balance de ${detail.product_name}` : 'Balance del producto'}
                        </h4>
                        <div className="text-secondary text-sm mt-1">
                            {detail?.category || 'Cargando detalle de compras y márgenes...'}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-secondary hover:text-black disabled:opacity-50"
                        disabled={loading}
                    >
                        <Icon.X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {loading && !detail ? (
                        <div className="py-16 text-center text-sm text-secondary">
                            Cargando balance por compras del producto...
                        </div>
                    ) : detail ? (
                        <>
                            {detail.has_unlinked_stock && (
                                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
                                    <div className="text-sm font-semibold">Hay stock sin factura de compra asociada.</div>
                                    <div className="text-xs mt-1">
                                        Ese remanente proviene de conciliaciones antiguas o ajustes. El margen sigue calculándose,
                                        pero conviene normalizarlo con compras reales para que el balance sea impecable.
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {renderMetricCard('PVP actual', formatMoney(detail.price_gross), 'Precio de venta vigente')}
                                {renderMetricCard('Costo ponderado stock', formatMoney(detail.weighted_unit_cost), 'Costo real promedio del stock vivo')}
                                {renderMetricCard('Capital al costo', formatMoney(detail.remaining_cost_total), `${Number(detail.remaining_units_total ?? 0).toLocaleString('es-EC')} unidades remanentes`)}
                                {renderMetricCard('Margen stock actual', `${Number(detail.weighted_margin ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`, 'Según el costo ponderado actual', detail.weighted_margin < 0 ? 'text-red' : 'text-success')}
                                {renderMetricCard('Compras registradas', Number(detail.entries_count ?? 0).toLocaleString('es-EC'), `${Number(detail.open_lots_count ?? 0).toLocaleString('es-EC')} lotes abiertos`)}
                                {renderMetricCard('Unidades compradas', Number(detail.purchased_units_total ?? 0).toLocaleString('es-EC'), `${Number(detail.consumed_units_total ?? 0).toLocaleString('es-EC')} consumidas / ${Number(detail.remaining_units_total ?? 0).toLocaleString('es-EC')} vigentes`)}
                                {renderMetricCard('Costo abierto mínimo', formatMoney(detail.min_unit_cost), 'Compra más barata todavía en stock')}
                                {renderMetricCard('Costo abierto máximo', formatMoney(detail.max_unit_cost), 'Compra más cara todavía en stock')}
                            </div>

                            {salesProduct && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-xl border border-line bg-surface">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-xs uppercase font-bold text-secondary">Utilidad realizada del mes</div>
                                            <div className="text-xs font-semibold text-secondary">
                                                {currentPeriod.start || '-'} → {currentPeriod.end || '-'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {renderMetricCard('Unidades vendidas', Number(salesProduct.month_units_sold ?? 0).toLocaleString('es-EC'))}
                                            {renderMetricCard('Venta neta', formatMoney(salesProduct.month_net_revenue))}
                                            {renderMetricCard('Costo', formatMoney(salesProduct.month_cost))}
                                            {renderMetricCard('Utilidad', formatMoney(salesProduct.month_profit), undefined, Number(salesProduct.month_profit ?? 0) < 0 ? 'text-red' : 'text-success')}
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl border border-line bg-surface">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-xs uppercase font-bold text-secondary">Utilidad realizada histórica</div>
                                            <div className="text-xs font-semibold text-secondary">
                                                {historicalPeriod.start || '-'} → {historicalPeriod.end || '-'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {renderMetricCard('Unidades vendidas', Number(salesProduct.historical_units_sold ?? 0).toLocaleString('es-EC'))}
                                            {renderMetricCard('Venta neta', formatMoney(salesProduct.historical_net_revenue))}
                                            {renderMetricCard('Costo', formatMoney(salesProduct.historical_cost))}
                                            {renderMetricCard('Utilidad', formatMoney(salesProduct.historical_profit), undefined, Number(salesProduct.historical_profit ?? 0) < 0 ? 'text-red' : 'text-success')}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-5 rounded-xl border border-line bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="heading6">Stock actual por compra</div>
                                        <div className="text-sm text-secondary mt-1">
                                            Cada fila representa el stock que sigue vivo según la compra/lote original.
                                        </div>
                                    </div>
                                    <div className="text-xs text-secondary">
                                        FIFO activo: las ventas consumen primero las compras más antiguas.
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-line">
                                    <table className="w-full min-w-[980px] text-left">
                                        <thead className="bg-surface border-b border-line">
                                            <tr className="text-[11px] uppercase font-bold text-secondary">
                                                <th className="px-4 py-3">Compra</th>
                                                <th className="px-4 py-3">Proveedor</th>
                                                <th className="px-4 py-3 text-right">Comprado</th>
                                                <th className="px-4 py-3 text-right">Consumido</th>
                                                <th className="px-4 py-3 text-right">Restante</th>
                                                <th className="px-4 py-3 text-right">Costo unitario</th>
                                                <th className="px-4 py-3 text-right">Capital restante</th>
                                                <th className="px-4 py-3 text-right">Margen estimado</th>
                                                <th className="px-4 py-3 text-right">Utilidad estimada</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {openLots.map((lot) => (
                                                <tr key={lot.id} className="hover:bg-surface/40">
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-semibold">{lot.invoice_number || lotSourceLabel(lot.source_type)}</div>
                                                        <div className="text-xs text-secondary">
                                                            {formatIsoDate(lot.issued_at || lot.received_at || lot.created_at)} • {lotSourceLabel(lot.source_type)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm">{lot.supplier_name || 'Sin proveedor enlazado'}</div>
                                                        <div className="text-xs text-secondary">{lot.supplier_document || lot.source_ref || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm">{Number(lot.purchased_quantity ?? 0).toLocaleString('es-EC')}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{Number(lot.consumed_quantity ?? 0).toLocaleString('es-EC')}</td>
                                                    <td className="px-4 py-3 text-right text-sm font-semibold">{Number(lot.remaining_quantity ?? 0).toLocaleString('es-EC')}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{formatMoney(lot.unit_cost)}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{formatMoney(lot.remaining_cost_total)}</td>
                                                    <td className={`px-4 py-3 text-right text-sm font-semibold ${lot.estimated_remaining_margin < 0 ? 'text-red' : 'text-success'}`}>
                                                        {Number(lot.estimated_remaining_margin ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                                    </td>
                                                    <td className={`px-4 py-3 text-right text-sm font-semibold ${lot.estimated_remaining_profit < 0 ? 'text-red' : 'text-success'}`}>
                                                        {formatMoney(lot.estimated_remaining_profit)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {openLots.length === 0 && (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-secondary">
                                                        No hay stock remanente asociado a compras activas para este producto.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl border border-line bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="heading6">Historial de compras y lotes</div>
                                        <div className="text-sm text-secondary mt-1">
                                            Aquí ves cada compra del producto y cuánto de esa compra ya se consumió.
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-line">
                                    <table className="w-full min-w-[980px] text-left">
                                        <thead className="bg-surface border-b border-line">
                                            <tr className="text-[11px] uppercase font-bold text-secondary">
                                                <th className="px-4 py-3">Factura / origen</th>
                                                <th className="px-4 py-3">Fecha</th>
                                                <th className="px-4 py-3">Proveedor</th>
                                                <th className="px-4 py-3 text-right">Comprado</th>
                                                <th className="px-4 py-3 text-right">Consumido</th>
                                                <th className="px-4 py-3 text-right">Restante</th>
                                                <th className="px-4 py-3 text-right">Costo unitario</th>
                                                <th className="px-4 py-3 text-right">Total compra</th>
                                                <th className="px-4 py-3">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {lots.map((lot) => (
                                                <tr key={`${lot.id}-history`} className="hover:bg-surface/40">
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-semibold">
                                                            {lot.purchase_invoice_id ? (
                                                                <button
                                                                    type="button"
                                                                    className="underline underline-offset-2"
                                                                    onClick={() => onOpenPurchaseInvoice(lot.purchase_invoice_id!)}
                                                                >
                                                                    {lot.invoice_number || 'Factura sin número'}
                                                                </button>
                                                            ) : (
                                                                lotSourceLabel(lot.source_type)
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-secondary">{lot.source_ref || lot.id}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{formatIsoDate(lot.issued_at || lot.received_at || lot.created_at)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm">{lot.supplier_name || 'Sin proveedor enlazado'}</div>
                                                        <div className="text-xs text-secondary">{lot.supplier_document || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm">{Number(lot.purchased_quantity ?? 0).toLocaleString('es-EC')}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{Number(lot.consumed_quantity ?? 0).toLocaleString('es-EC')}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{Number(lot.remaining_quantity ?? 0).toLocaleString('es-EC')}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{formatMoney(lot.unit_cost)}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{formatMoney(lot.purchase_total)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${lot.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface text-secondary'}`}>
                                                            {lot.status === 'open' ? 'Con remanente' : 'Consumida'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {lots.length === 0 && (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-secondary">
                                                        Este producto todavía no tiene compras/lotes registrados.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-16 text-center text-sm text-secondary">
                            No se encontró el detalle de balance del producto.
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-line flex justify-end bg-white rounded-b-2xl">
                    <button
                        className="px-5 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
