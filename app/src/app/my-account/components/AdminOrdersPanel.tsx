'use client'

import React from 'react'

import type { Order } from '../types'

type AdminOrdersPanelProps = {
    activeOrders: string | undefined;
    counts: Record<string, number>;
    orders: Order[];
    onFilterChange: (value: string) => void;
    onViewOrder: (orderId: string) => void;
    getStatusBadge: (status: string) => { label: string; className: string };
    formatDateTime: (value: string) => string;
}

const ADMIN_ORDER_FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Nuevos' },
    { id: 'processing', label: 'En proceso' },
    { id: 'delivery', label: 'Enviados' },
    { id: 'completed', label: 'Completados' },
    { id: 'canceled', label: 'Cancelados' }
]

export default React.memo(function AdminOrdersPanel({
    activeOrders,
    counts,
    orders,
    onFilterChange,
    onViewOrder,
    getStatusBadge,
    formatDateTime,
}: AdminOrdersPanelProps) {
    const getDeliveryMethodLabel = (order: Order) => {
        const method = String(order.delivery_method || '').trim().toLowerCase()
        if (method === 'pickup') return 'Retiro'
        if (method === 'delivery') return 'Envío'
        return 'Por definir'
    }

    const getPaymentMethodLabel = (order: Order) => {
        const methodRaw = String(order.payment_method || '').trim()
        const method = methodRaw.toLowerCase()
        if (!method) return 'Por definir'
        if (['cash', 'efectivo'].includes(method)) return 'Pago en efectivo'
        if (['card', 'tarjeta'].includes(method)) return 'Pago con tarjeta'
        if (['transfer', 'transferencia'].includes(method)) return 'Transferencia'
        return methodRaw
    }

    return (
        <div className="tab text-content w-full">
            <div className="heading5 pb-6">Todos los Pedidos</div>
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {ADMIN_ORDER_FILTERS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${activeOrders === tab.id
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-secondary border-line hover:bg-surface'
                            }`}
                        onClick={() => onFilterChange(tab.id)}
                    >
                        {tab.label} ({counts[tab.id] ?? 0})
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-line">
                            <th className="pb-4 font-bold text-secondary text-sm">ID PEDIDO</th>
                            <th className="pb-4 font-bold text-secondary text-sm">CLIENTE</th>
                            <th className="pb-4 font-bold text-secondary text-sm">FECHA Y HORA</th>
                            <th className="pb-4 font-bold text-secondary text-sm">ENTREGA / PAGO</th>
                            <th className="pb-4 font-bold text-secondary text-sm">TOTAL</th>
                            <th className="pb-4 font-bold text-secondary text-sm">ESTADO</th>
                            <th className="pb-4 font-bold text-secondary text-sm">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? orders.map((order) => {
                            const badge = getStatusBadge(order.status)

                            return (
                                <tr key={order.id} className="border-b border-line last:border-0 hover:bg-surface duration-300 text-sm">
                                    <td className="py-4 font-bold">#{order.id}</td>
                                    <td className="py-4">
                                        <div className="font-semibold text-black">{order.user_name || 'Cliente'}</div>
                                        <div className="text-xs text-secondary">{order.user_email || 'Sin correo visible'}</div>
                                    </td>
                                    <td className="py-4">
                                        <div className="font-medium text-black">{formatDateTime(order.created_at)}</div>
                                    </td>
                                    <td className="py-4">
                                        <div className="font-medium text-black">{getDeliveryMethodLabel(order)}</div>
                                        <div className="text-xs text-secondary mt-1">{getPaymentMethodLabel(order)}</div>
                                        <div className="text-xs text-secondary mt-1">
                                            {(order.items_count ?? 0) > 0 ? `${order.items_count} ítems` : 'Sin ítems'}{String(order.order_notes || '').trim() ? ' · Con nota del cliente' : ''}
                                        </div>
                                    </td>
                                    <td className="py-4 font-bold">${Number(order.total).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-4">
                                        <span className={`tag px-3 py-1 rounded-full text-xs font-semibold bg-opacity-10 ${badge.className}`}>
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <button className="text-button-uppercase text-xs underline font-bold" onClick={() => onViewOrder(order.id)}>
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-secondary">
                                    No se encontraron pedidos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
})
