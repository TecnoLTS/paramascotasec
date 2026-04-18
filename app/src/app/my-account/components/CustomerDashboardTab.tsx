'use client'

import { Archive, HourglassMedium, ReceiptX } from '@phosphor-icons/react/dist/ssr'

import Image from '@/components/Common/AppImage'

import type { Order } from '../types'

type StatusBadge = {
    label: string
    className: string
}

type CustomerDashboardTabProps = {
    pickupUserOrders: number
    canceledUserOrders: number
    totalUserOrders: number
    userOrdersLoading: boolean
    recentUserOrders: Order[]
    onOpenOrder: (order: Order) => void
    getStatusBadge: (status: string) => StatusBadge
    formatDateTime: (value: string, options?: Intl.DateTimeFormatOptions) => string
    normalizeOrderItemImage: (src?: string | null) => string
    isDynamicOrderItemImage: (src?: string | null) => boolean
}

export default function CustomerDashboardTab({
    pickupUserOrders,
    canceledUserOrders,
    totalUserOrders,
    userOrdersLoading,
    recentUserOrders,
    onOpenOrder,
    getStatusBadge,
    formatDateTime,
    normalizeOrderItemImage,
    isDynamicOrderItemImage,
}: CustomerDashboardTabProps) {
    return (
        <div className="tab !block overflow-hidden">
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary">Esperando Recojo</p>
                            <p className="mt-2 text-4xl font-semibold text-black">{pickupUserOrders}</p>
                        </div>
                        <div className="rounded-2xl bg-main/10 p-3 text-main">
                            <HourglassMedium size={24} weight="duotone" />
                        </div>
                    </div>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary">Pedidos Cancelados</p>
                            <p className="mt-2 text-4xl font-semibold text-black">{canceledUserOrders}</p>
                        </div>
                        <div className="rounded-2xl bg-red/10 p-3 text-red">
                            <ReceiptX size={24} weight="duotone" />
                        </div>
                    </div>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary">N&uacute;mero Total de Pedidos</p>
                            <p className="mt-2 text-4xl font-semibold text-black">{totalUserOrders}</p>
                        </div>
                        <div className="rounded-2xl bg-orange/10 p-3 text-orange">
                            <Archive size={24} weight="duotone" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-semibold text-main">Pedidos Recientes</h3>
                        <p className="mt-1 text-sm text-secondary">
                            Fecha, entrega, pago y estado de tus pedidos m&aacute;s recientes.
                        </p>
                    </div>
                </div>

                {userOrdersLoading ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-secondary">
                        Cargando pedidos...
                    </div>
                ) : recentUserOrders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-secondary">
                        A&uacute;n no tienes pedidos registrados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead>
                                <tr className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                                    <th className="pb-3 pr-4">Pedido</th>
                                    <th className="pb-3 pr-4">Productos</th>
                                    <th className="pb-3 pr-4">Entrega / Pago</th>
                                    <th className="pb-3 pr-4">Precio</th>
                                    <th className="pb-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentUserOrders.map((order) => {
                                    const badge = getStatusBadge(order.status)
                                    const firstItem = order.items?.[0]
                                    const itemsCount = order.items?.length ?? 0
                                    const deliveryMethod = String(order.delivery_method || '').trim().toLowerCase()
                                    const deliveryLabel =
                                        deliveryMethod === 'pickup'
                                            ? 'Retiro en tienda'
                                            : deliveryMethod === 'delivery'
                                              ? 'Env&iacute;o a domicilio'
                                              : 'Por confirmar'
                                    const paymentMethodRaw = String(order.payment_method || '').trim()
                                    const paymentMethod = paymentMethodRaw.toLowerCase()
                                    const paymentLabel =
                                        paymentMethod === 'cash' || paymentMethod === 'efectivo'
                                            ? 'Pago en efectivo'
                                            : paymentMethod === 'card' || paymentMethod === 'tarjeta'
                                              ? 'Tarjeta'
                                              : paymentMethod === 'transfer' || paymentMethod === 'transferencia'
                                                ? 'Transferencia'
                                                : paymentMethodRaw || 'Por confirmar'

                                    return (
                                        <tr
                                            key={order.id}
                                            className="cursor-pointer transition hover:bg-gray-50"
                                            onClick={() => onOpenOrder(order)}
                                        >
                                            <td className="py-4 pr-4 align-top">
                                                <div className="font-semibold text-black">{order.order_number}</div>
                                                <div className="mt-1 text-sm text-secondary">
                                                    {formatDateTime(order.created_at)}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4 align-top">
                                                {firstItem ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-100">
                                                            <Image
                                                                src={normalizeOrderItemImage(firstItem.product_image)}
                                                                alt={firstItem.product_name}
                                                                fill
                                                                sizes="56px"
                                                                className="object-cover"
                                                                unoptimized={isDynamicOrderItemImage(firstItem.product_image)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-black">{firstItem.product_name}</div>
                                                            <div className="text-sm text-secondary">
                                                                {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-secondary">Sin productos</span>
                                                )}
                                            </td>
                                            <td className="py-4 pr-4 align-top">
                                                <div className="text-sm font-medium text-black">{deliveryLabel}</div>
                                                <div className="mt-1 text-sm text-secondary">{paymentLabel}</div>
                                            </td>
                                            <td className="py-4 pr-4 align-top text-base font-semibold text-black">
                                                ${Number(order.total || 0).toFixed(2)}
                                            </td>
                                            <td className="py-4 align-top">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
