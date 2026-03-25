'use client'

import React from 'react'
import Image from '@/components/Common/AppImage'
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { isDynamicOrderItemImage, normalizeOrderItemImage } from '../customerDataUtils'
import { normalizeStatus } from '../statusDisplay'

type OrderDetailModalProps = {
    open: boolean;
    order: any | null;
    orderContact: { name: string; email: string; phone: string };
    statusBadge: { label: string; className: string };
    canViewInvoice: boolean;
    canManageStatus: boolean;
    onClose: () => void;
    onViewInvoice: () => void;
    onUpdateStatus: (status: string) => void;
    formatDateTime: (value: string) => string;
    formatMoney: (value: any) => string;
    getVatSubtotal: (order: any) => number;
    getVatAmount: (order: any) => number;
    getShipping: (order: any) => number;
    getItemNetPrice: (item: any, order: any) => number;
}

export default function OrderDetailModal({
    open,
    order,
    orderContact,
    statusBadge,
    canViewInvoice,
    canManageStatus,
    onClose,
    onViewInvoice,
    onUpdateStatus,
    formatDateTime,
    formatMoney,
    getVatSubtotal,
    getVatAmount,
    getShipping,
    getItemNetPrice,
}: OrderDetailModalProps) {
    const [pendingStatus, setPendingStatus] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!open) {
            setPendingStatus(null)
        }
    }, [open])

    if (!open || !order) return null

    const shipping = getShipping(order)
    const mixedVatRates = Boolean(order?.mixed_vat_rates)
    const vatRateLabel = mixedVatRates
        ? 'IVA aplicado'
        : `IVA (${Number(order?.vat_rate ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)`
    const pendingStatusLabel = pendingStatus === 'processing'
        ? 'marcar el pedido como En proceso'
        : pendingStatus === 'shipped'
            ? 'marcar el pedido como Enviado'
            : pendingStatus === 'delivered'
                ? 'marcar el pedido como Completado'
                : pendingStatus === 'canceled'
                    ? 'cancelar el pedido'
                    : ''
    const showInvoiceButton = canViewInvoice && ['completed', 'delivered'].includes(normalizeStatus(order?.status))

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl">
                    <div>
                        <h4 className="heading4">Pedido #{order.id}</h4>
                        <div className="text-secondary text-sm mt-1">{formatDateTime(order.created_at)}</div>
                    </div>
                    <button onClick={onClose} className="text-secondary hover:text-black">
                        <Icon.X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-surface rounded-xl p-6 border border-line">
                            <h6 className="heading6 mb-4 flex items-center gap-2">
                                <Icon.User size={20} /> Cliente
                            </h6>
                            <div className="space-y-2">
                                <div className="font-bold text-lg">{orderContact.name}</div>
                                <div className="text-secondary">{orderContact.email}</div>
                                <div className="text-secondary">{orderContact.phone !== '-' ? orderContact.phone : 'Sin teléfono'}</div>
                            </div>
                        </div>
                        <div className="bg-surface rounded-xl p-6 border border-line flex flex-col justify-between">
                            <h6 className="heading6 mb-4 flex items-center gap-2">
                                <Icon.Receipt size={20} /> Resumen
                            </h6>
                            <div className="space-y-3">
                                <div className="grid grid-cols-[1fr_120px] items-center">
                                    <span className="text-secondary">Subtotal sin IVA</span>
                                    <span className="font-bold tabular-nums text-right">{formatMoney(getVatSubtotal(order))}</span>
                                </div>
                                {Number(getVatAmount(order)) > 0 && (
                                    <div className="grid grid-cols-[1fr_120px] items-center">
                                        <span className="text-secondary">{vatRateLabel}</span>
                                        <span className="font-bold tabular-nums text-right">{formatMoney(getVatAmount(order))}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-[1fr_120px] items-center">
                                    <span className="text-secondary">Envío</span>
                                    <span className={`font-bold tabular-nums text-right ${shipping === 0 ? 'text-success' : 'text-[#111827]'}`}>
                                        {shipping === 0 ? 'Gratis' : formatMoney(shipping)}
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-line grid grid-cols-[1fr_120px] items-center">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-xl font-bold text-primary tabular-nums text-right">{formatMoney(order?.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="heading6">Productos del Pedido</h6>
                            <span className="bg-line px-3 py-1 rounded-full text-xs font-bold">{order.items?.length || 0} ítems</span>
                        </div>
                        <div className="overflow-x-auto border border-line rounded-xl">
                            <table className="w-full text-left table-fixed">
                                <thead className="bg-surface border-b border-line text-xs uppercase text-secondary font-bold">
                                    <tr>
                                        <th className="px-6 py-4 w-[55%]">Producto</th>
                                        <th className="px-6 py-4 w-[12%] text-center">Cant.</th>
                                        <th className="px-6 py-4 w-[16%] text-right tabular-nums">Precio</th>
                                        <th className="px-6 py-4 w-[17%] text-right tabular-nums">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {order.items?.map((item: any) => {
                                        const unitNetPrice = Number(getItemNetPrice(item, order))
                                        const imageSrc = normalizeOrderItemImage(item.product_image)
                                        return (
                                            <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-line rounded-lg overflow-hidden border border-line flex-shrink-0">
                                                            <Image
                                                                src={imageSrc}
                                                                alt={item.product_name}
                                                                width={48}
                                                                height={48}
                                                                sizes="48px"
                                                                className="w-full h-full object-cover"
                                                                unoptimized={isDynamicOrderItemImage(item.product_image)}
                                                            />
                                                        </div>
                                                        <span className="font-medium text-sm">{item.product_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right tabular-nums">${unitNetPrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 text-right font-bold text-primary tabular-nums">${(unitNetPrice * item.quantity).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-line flex flex-col gap-4 bg-white rounded-b-2xl">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${statusBadge.className}`}>
                            Estado: {statusBadge.label}
                        </span>
                    </div>
                    {pendingStatus && (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                            <div className="text-sm">
                                <div className="font-semibold text-amber-900">Confirmación requerida</div>
                                <div className="text-amber-800">
                                    Confirma que deseas {pendingStatusLabel}.
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${pendingStatus === 'canceled'
                                        ? 'bg-red text-white hover:bg-red/90'
                                        : 'bg-black text-white hover:bg-primary'
                                        }`}
                                    onClick={() => {
                                        onUpdateStatus(pendingStatus)
                                        setPendingStatus(null)
                                    }}
                                >
                                    Confirmar
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg border border-line hover:bg-white transition-all text-sm font-semibold"
                                    onClick={() => setPendingStatus(null)}
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2 md:justify-end">
                        {showInvoiceButton && (
                            <button className="px-4 py-2 rounded-lg bg-black text-white hover:bg-primary transition-all text-sm font-semibold" onClick={onViewInvoice}>
                                Imprimir factura
                            </button>
                        )}
                        {canManageStatus && (
                            <>
                                <button
                                    className="px-4 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold"
                                    onClick={() => setPendingStatus('processing')}
                                >
                                    En proceso
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold"
                                    onClick={() => setPendingStatus('shipped')}
                                >
                                    Enviado
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-black text-white hover:bg-primary transition-all text-sm font-semibold"
                                    onClick={() => setPendingStatus('delivered')}
                                >
                                    Completado
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg border border-red text-red hover:bg-red/10 transition-all text-sm font-semibold"
                                    onClick={() => setPendingStatus('canceled')}
                                >
                                    Cancelar
                                </button>
                            </>
                        )}
                        <button className="px-5 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold" onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
