'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

type SalesSummaryLike = {
    gross?: number
    net?: number
    vat?: number
    shipping?: number
}

type ProfitStatsLike = {
    cost?: number
    profit?: number
    margin?: number
    roi?: number
}

type RecentOrderLike = {
    id: string
    created_at: string
    total?: number
    vat_amount?: number
    vat_subtotal?: number
    shipping?: number
}

type TraceabilityOrderLike = {
    id: string
    created_at: string
    net: number
    vat: number
    shipping: number
    gross: number
}

type TraceabilityProductLike = {
    product_id?: string
    product_name: string
    category?: string
    units_sold?: number
    net_revenue: number
    order_refs?: string[] | string
}

type BalancesPanelProps = {
    netSales: number
    salesSummary?: SalesSummaryLike | null
    profitStats?: ProfitStatsLike | null
    recentOrders: RecentOrderLike[]
    traceabilityOrders: TraceabilityOrderLike[]
    traceabilityProducts: TraceabilityProductLike[]
    formatMoney: (value: number | string | null | undefined) => string
    formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string
    onOpenOrder: (orderId: string) => void
    onOpenProfitAnalysis: () => void
    onOpenMargins: () => void
    onOpenOrders: () => void
    onOpenTaxes: () => void
}

function BalanceMetricCard({
    label,
    value,
    caption,
    valueClassName = '',
}: {
    label: string
    value: string
    caption: string
    valueClassName?: string
}) {
    return (
        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
            <div className="text-xs uppercase text-secondary font-bold mb-1">{label}</div>
            <div className={`heading5 ${valueClassName}`}>{value}</div>
            <div className="text-[11px] text-secondary mt-1">{caption}</div>
        </div>
    )
}

function BalancesPanel({
    netSales,
    salesSummary,
    profitStats,
    recentOrders,
    traceabilityOrders,
    traceabilityProducts,
    formatMoney,
    formatDate,
    onOpenOrder,
    onOpenProfitAnalysis,
    onOpenMargins,
    onOpenOrders,
    onOpenTaxes,
}: BalancesPanelProps) {
    const gross = Number(salesSummary?.gross ?? 0)
    const net = Number(salesSummary?.net ?? 0)
    const vat = Number(salesSummary?.vat ?? 0)
    const shipping = Number(salesSummary?.shipping ?? 0)
    const cost = Number(profitStats?.cost ?? 0)
    const profit = Number(profitStats?.profit ?? 0)
    const margin = Number(profitStats?.margin ?? 0)
    const roi = Number(profitStats?.roi ?? 0)

    return (
        <div className="tab text-content w-full">
            <div className="text-gray-400 text-sm">Balance General (Informacion critica para decisiones)</div>
            <div className="heading2 mt-2">{formatMoney(netSales)}</div>
            <div className="text-secondary text-sm mt-1">Ventas netas (sin IVA ni envio)</div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
                <BalanceMetricCard label="Venta total" value={formatMoney(gross)} caption="Incluye IVA + envio" />
                <BalanceMetricCard label="IVA por pagar" value={formatMoney(vat)} caption="Impuesto cobrado" />
                <BalanceMetricCard label="Envio cobrado" value={formatMoney(shipping)} caption="Ingreso operativo" />
                <BalanceMetricCard label="Costo (COGS)" value={`-${formatMoney(cost)}`} caption="Costo real de producto" valueClassName="text-orange-600" />
                <BalanceMetricCard label="Utilidad bruta" value={formatMoney(profit)} caption="Sin IVA ni envio" valueClassName="text-success" />
                <BalanceMetricCard label="Margen neto" value={`${margin.toFixed(1)}%`} caption="Utilidad / ventas netas" />
                <BalanceMetricCard label="ROI" value={`${roi.toFixed(1)}%`} caption="Utilidad / costo" />
                <BalanceMetricCard label="Venta neta" value={formatMoney(net)} caption="Base real de ingresos" />
            </div>

            <div className="mt-8 p-5 bg-surface rounded-xl border border-line">
                <div className="text-xs uppercase text-secondary font-bold mb-3">Acciones recomendadas</div>
                <div className="flex flex-wrap gap-3">
                    <button type="button" className="px-4 py-2 rounded-lg border border-line text-sm font-semibold bg-white hover:bg-surface" onClick={onOpenProfitAnalysis}>
                        Analizar rentabilidad
                    </button>
                    <button type="button" className="px-4 py-2 rounded-lg border border-line text-sm font-semibold bg-white hover:bg-surface" onClick={onOpenMargins}>
                        Ajustar margenes
                    </button>
                    <button type="button" className="px-4 py-2 rounded-lg border border-line text-sm font-semibold bg-white hover:bg-surface" onClick={onOpenOrders}>
                        Revisar pedidos
                    </button>
                    <button type="button" className="px-4 py-2 rounded-lg border border-line text-sm font-semibold bg-white hover:bg-surface" onClick={onOpenTaxes}>
                        IVA y costos de envio
                    </button>
                </div>
            </div>

            <div className="heading6 mb-4 mt-10">Movimientos recientes (neto, IVA, envio)</div>
            <div className="flex flex-col gap-4">
                {recentOrders.slice(0, 6).map((order) => {
                    const orderNet = Number(order.vat_subtotal ?? (Number(order.total ?? 0) - Number(order.vat_amount ?? 0) - Number(order.shipping ?? 0)))
                    const orderVat = Number(order.vat_amount ?? 0)
                    const orderShipping = Number(order.shipping ?? 0)
                    return (
                        <div key={order.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-surface rounded-xl border border-line">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-success bg-opacity-10 text-success rounded-full flex items-center justify-center">
                                    <Icon.ArrowDownLeft weight="bold" />
                                </div>
                                <div>
                                    <div className="font-bold">Pedido #{order.id}</div>
                                    <div className="text-secondary text-xs">{formatDate(order.created_at)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-right text-sm md:w-[340px]">
                                <div>
                                    <div className="text-[10px] uppercase text-secondary">Neto</div>
                                    <div className="font-bold tabular-nums">{formatMoney(orderNet)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase text-secondary">IVA</div>
                                    <div className="font-bold tabular-nums">{formatMoney(orderVat)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase text-secondary">Envio</div>
                                    <div className="font-bold tabular-nums">{formatMoney(orderShipping)}</div>
                                </div>
                            </div>
                            <button type="button" className="px-3 py-1.5 rounded-lg border border-line text-xs font-bold hover:bg-white" onClick={() => onOpenOrder(order.id)}>
                                Ver pedido
                            </button>
                        </div>
                    )
                })}
                {recentOrders.length === 0 && (
                    <div className="text-center py-4 text-secondary">No hay transacciones recientes.</div>
                )}
            </div>

            <div className="mt-10 p-5 bg-surface rounded-xl border border-line">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <h6 className="heading6">Trazabilidad de cifras</h6>
                    <span className="text-xs text-secondary font-semibold">Fuente: pedidos completados o entregados + productos vendidos</span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="bg-white border border-line rounded-lg p-4">
                        <div className="text-xs uppercase font-bold text-secondary mb-3">Pedidos que componen las ventas</div>
                        <div className="flex flex-col gap-2">
                            {traceabilityOrders.slice(0, 6).map((order) => (
                                <button
                                    key={order.id}
                                    type="button"
                                    className="text-left p-3 rounded-lg border border-line hover:bg-surface transition-colors"
                                    onClick={() => onOpenOrder(order.id)}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-bold text-sm">#{order.id}</span>
                                        <span className="text-xs text-secondary">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-2 text-[11px]">
                                        <div>
                                            <div className="text-secondary uppercase">Neto</div>
                                            <div className="font-bold tabular-nums">{formatMoney(order.net)}</div>
                                        </div>
                                        <div>
                                            <div className="text-secondary uppercase">IVA</div>
                                            <div className="font-bold tabular-nums">{formatMoney(order.vat)}</div>
                                        </div>
                                        <div>
                                            <div className="text-secondary uppercase">Envio</div>
                                            <div className="font-bold tabular-nums">{formatMoney(order.shipping)}</div>
                                        </div>
                                        <div>
                                            <div className="text-secondary uppercase">Total</div>
                                            <div className="font-bold tabular-nums">{formatMoney(order.gross)}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {traceabilityOrders.length === 0 && (
                                <div className="text-sm text-secondary">Sin pedidos para trazabilidad.</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-line rounded-lg p-4">
                        <div className="text-xs uppercase font-bold text-secondary mb-3">Productos que explican las ventas netas</div>
                        <div className="flex flex-col gap-3">
                            {traceabilityProducts.slice(0, 6).map((product, idx) => {
                                const refs = Array.isArray(product.order_refs)
                                    ? product.order_refs
                                    : String(product.order_refs || '').split(',').map((value) => value.trim()).filter(Boolean)
                                return (
                                    <div key={`${product.product_id || product.product_name}-${idx}`} className="p-3 rounded-lg border border-line">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="font-semibold text-sm">{product.product_name}</div>
                                            <div className="font-bold tabular-nums">{formatMoney(product.net_revenue)}</div>
                                        </div>
                                        <div className="text-xs text-secondary mt-1">
                                            Categoria: <span className="font-semibold capitalize">{product.category || 'Sin categoria'}</span> | Unidades: <span className="font-semibold">{Number(product.units_sold || 0)}</span>
                                        </div>
                                        <div className="text-xs text-secondary mt-1 break-words">
                                            Pedidos: {refs.length > 0 ? refs.join(', ') : 'Sin referencia'}
                                        </div>
                                    </div>
                                )
                            })}
                            {traceabilityProducts.length === 0 && (
                                <div className="text-sm text-secondary">Sin productos vendidos para trazabilidad.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(BalancesPanel)
