'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import type { PurchaseInvoiceDetail } from '../types'

type PurchaseInvoiceDetailModalProps = {
    open: boolean;
    loading: boolean;
    invoice: PurchaseInvoiceDetail | null;
    onClose: () => void;
    formatMoney: (value: any) => string;
    formatIsoDate: (value?: string | null) => string;
    formatDateTime: (value: string, options?: Intl.DateTimeFormatOptions) => string;
}

export default function PurchaseInvoiceDetailModal({
    open,
    loading,
    invoice,
    onClose,
    formatMoney,
    formatIsoDate,
    formatDateTime,
}: PurchaseInvoiceDetailModalProps) {
    if (!open) return null

    const normalizeBooleanLike = (value: unknown) => {
        if (typeof value === 'boolean') return value
        if (typeof value === 'number') return value !== 0
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase()
            if (['1', 'true', 'yes', 'y', 'on', 'si', 'sí'].includes(normalized)) return true
            if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false
        }
        return false
    }

    return (
        <div
            className="fixed inset-0 z-[215] flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl"
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
                <div className="p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl">
                    <div>
                        <h4 className="heading4">
                            {invoice?.invoice_number
                                ? `Factura ${invoice.invoice_number}`
                                : 'Factura de compra'}
                        </h4>
                        <div className="text-secondary text-sm mt-1">
                            {invoice?.supplier_name || 'Cargando detalle...'}
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

                <div className="p-6 overflow-y-auto flex-1">
                    {loading && !invoice ? (
                        <div className="py-16 text-center text-sm text-secondary">
                            Cargando detalle de la factura de compra...
                        </div>
                    ) : invoice ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-4 rounded-xl border border-line bg-surface">
                                    <div className="text-[10px] uppercase font-bold text-secondary">Proveedor</div>
                                    <div className="text-sm font-semibold mt-1">{invoice.supplier_name || '-'}</div>
                                    <div className="text-xs text-secondary mt-1">{invoice.supplier_document || 'Sin documento'}</div>
                                </div>
                                <div className="p-4 rounded-xl border border-line bg-surface">
                                    <div className="text-[10px] uppercase font-bold text-secondary">Fecha factura</div>
                                    <div className="text-sm font-semibold mt-1">{formatIsoDate(invoice.issued_at)}</div>
                                    <div className="text-xs text-secondary mt-1">
                                        Registro: {invoice.created_at ? formatDateTime(invoice.created_at, { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-line bg-surface">
                                    <div className="text-[10px] uppercase font-bold text-secondary">Productos</div>
                                    <div className="text-sm font-semibold mt-1">{invoice.items.length.toLocaleString('es-EC')} líneas</div>
                                    <div className="text-xs text-secondary mt-1">
                                        {invoice.items.reduce((acc, item) => acc + Number(item.quantity ?? 0), 0).toLocaleString('es-EC')} unidades
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-line bg-surface">
                                    <div className="text-[10px] uppercase font-bold text-secondary">Total compra</div>
                                    <div className="text-sm font-semibold mt-1">{formatMoney(invoice.total)}</div>
                                    <div className="text-xs text-secondary mt-1">Subtotal: {formatMoney(invoice.subtotal)} • IVA: {formatMoney(invoice.tax_total)}</div>
                                </div>
                            </div>

                            {(invoice.notes || invoice.metadata) && (
                                <div className="p-4 rounded-xl border border-line bg-white mb-6">
                                    <div className="text-[10px] uppercase font-bold text-secondary mb-2">Observaciones</div>
                                    {invoice.notes && (
                                        <p className="text-sm text-black whitespace-pre-wrap">{invoice.notes}</p>
                                    )}
                                    {invoice.metadata && Object.keys(invoice.metadata).length > 0 && (
                                        <div className="text-xs text-secondary mt-3">
                                            Metadata: {JSON.stringify(invoice.metadata)}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="overflow-x-auto rounded-xl border border-line">
                                <table className="w-full min-w-[760px] text-left">
                                    <thead className="bg-surface border-b border-line">
                                            <tr className="text-[11px] uppercase font-bold text-secondary">
                                                <th className="px-4 py-3">Producto</th>
                                                <th className="px-4 py-3">Categoría</th>
                                                <th className="px-4 py-3 text-right">Cantidad</th>
                                                <th className="px-4 py-3 text-right">Costo unitario</th>
                                                <th className="px-4 py-3 text-right">IVA</th>
                                                <th className="px-4 py-3 text-right">Total línea</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                        {invoice.items.map((item) => {
                                            const metadata = item.metadata || {}
                                            const taxRate = Number(metadata.tax_rate ?? 0)
                                            const taxExempt = normalizeBooleanLike(metadata.tax_exempt ?? false)
                                            const taxAmount = taxExempt || taxRate <= 0
                                                ? 0
                                                : Number(metadata.tax_amount ?? (Number(item.line_total ?? 0) * (taxRate / 100)))

                                            return (
                                                <tr key={item.id} className="hover:bg-surface/40">
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-semibold">{item.product_name_snapshot || item.product_id || 'Producto sin nombre'}</div>
                                                        <div className="text-xs text-secondary">{item.brand || 'Sin marca'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{item.category || '-'}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{Number(item.quantity ?? 0).toLocaleString('es-EC')}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{formatMoney(item.unit_cost)}</td>
                                                    <td className="px-4 py-3 text-right text-sm">{formatMoney(taxAmount)}</td>
                                                    <td className="px-4 py-3 text-right text-sm font-semibold">{formatMoney(Number(item.line_total ?? 0) + taxAmount)}</td>
                                                </tr>
                                            )
                                        })}
                                        {invoice.items.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-secondary">
                                                    Esta factura no tiene líneas registradas.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="py-16 text-center text-sm text-secondary">
                            No se encontró el detalle de la factura seleccionada.
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
