'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import type { Order } from '../types'

type CustomerOrdersPanelProps = {
    activeOrders: string | undefined;
    orders: Order[];
    loading: boolean;
    onFilterChange: (order: string) => void;
    onOpenOrder: (order: Order) => void;
    getStatusBadge: (status: string) => { label: string; className: string };
    getItemNetPrice: (item: any, order: Order) => number;
}

const ORDER_FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'delivery', label: 'Enviados' },
    { id: 'completed', label: 'Completados' },
    { id: 'canceled', label: 'Cancelados' }
]

export default React.memo(function CustomerOrdersPanel({
    activeOrders,
    orders,
    loading,
    onFilterChange,
    onOpenOrder,
    getStatusBadge,
    getItemNetPrice,
}: CustomerOrdersPanelProps) {
    return (
        <div className="tab text-content overflow-hidden w-full p-7 border border-line rounded-xl">
            <h6 className="heading6">Tus Pedidos</h6>
            <div className="w-full">
                <div className="menu-tab flex flex-wrap gap-2 border-b border-line mt-3 pb-3">
                    {ORDER_FILTERS.map((item) => (
                        <button
                            key={item.id}
                            className={`item relative px-3 sm:px-4 py-2 text-secondary text-center duration-300 hover:text-black border-b-2 text-xs sm:text-sm ${activeOrders === item.id ? 'active border-black' : 'border-transparent'}`}
                            onClick={() => onFilterChange(item.id)}
                        >
                            <span className="relative text-button z-[1]">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="list_order">
                {loading && (
                    <div className="text-center py-6 text-secondary">Cargando pedidos...</div>
                )}
                {!loading && orders.length === 0 && (
                    <div className="text-center py-6 text-secondary">No tienes pedidos en este estado.</div>
                )}
                {!loading && orders.map((order) => {
                    const badge = getStatusBadge(order.status)

                    return (
                        <div key={order.id} className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 p-5 border-b border-line">
                                <div className="flex items-center gap-2">
                                    <strong className="text-title">Número de Pedido:</strong>
                                    <strong className="order_number text-button uppercase">{order.id}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    <strong className="text-title">Estado del pedido:</strong>
                                    <span className={`tag px-4 py-1.5 rounded-full bg-opacity-10 ${badge.className} caption1 font-semibold`}>{badge.label}</span>
                                </div>
                            </div>
                            <div className="list_prd px-5">
                                {(order.items && order.items.length > 0) ? (
                                    order.items.map((item, idx) => (
                                        <div key={`${order.id}-${idx}`} className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line last:border-0">
                                            <Link href="/product/default" className="flex items-center gap-5">
                                                <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                    <Image
                                                        src={item.product_image || '/images/product/1000x1000.png'}
                                                        width={1000}
                                                        height={1000}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="prd_name text-title">{item.product_name}</div>
                                                    <div className="caption1 text-secondary mt-2">
                                                        <span>{item.quantity} unidad{item.quantity === 1 ? '' : 'es'}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="text-title">
                                                <span className="prd_quantity">{item.quantity}</span>
                                                <span> X </span>
                                                <span className="prd_price">${Number(getItemNetPrice(item, order)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-5 text-secondary">Sin productos asociados.</div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-4 p-5">
                                <button className="button-main" onClick={() => onOpenOrder(order)}>
                                    Detalles del Pedido
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
})
