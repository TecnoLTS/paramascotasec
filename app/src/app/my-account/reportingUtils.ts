import type {
  DashboardStats,
  ProductDetailMetric,
  PurchaseInvoiceSummary,
  SalesRankingRow,
} from './types'

type ProductSalesRanking = DashboardStats['businessMetrics'] extends infer BM
  ? BM extends { productSalesRanking?: infer PR } ? PR : never
  : never

export const summarizeStrategicAlerts = (
  strategicAlerts: Array<{ type: 'critical' | 'warning' | 'info'; message: string; action: string }>,
) => {
  return strategicAlerts.reduce((acc, alert) => {
    if (alert.type === 'critical') acc.critical += 1
    if (alert.type === 'warning') acc.warning += 1
    if (alert.type === 'info') acc.info += 1
    return acc
  }, { critical: 0, warning: 0, info: 0 })
}

export const filterStrategicAlerts = (
  strategicAlerts: Array<{ type: 'critical' | 'warning' | 'info'; message: string; action: string }>,
  severity: 'all' | 'critical' | 'warning' | 'info',
) => {
  if (severity === 'all') return strategicAlerts
  return strategicAlerts.filter((alert) => alert.type === severity)
}

export const buildSalesRankingRows = (
  productSalesRanking: ProductSalesRanking | undefined,
  salesRankingView: 'month' | 'historical',
): SalesRankingRow[] => {
  if (!productSalesRanking) return []
  const source = salesRankingView === 'month'
    ? productSalesRanking.monthlyRanking
    : productSalesRanking.historicalRanking
  return source.map((item) => ({
    product_id: item.product_id,
    product_name: item.product_name,
    category: item.category,
    orders_count: salesRankingView === 'month' ? Number(item.month_orders_count ?? 0) : Number(item.historical_orders_count ?? 0),
    units_sold: salesRankingView === 'month' ? Number(item.month_units_sold ?? 0) : Number(item.historical_units_sold ?? 0),
    gross_revenue: salesRankingView === 'month' ? Number(item.month_gross_revenue ?? 0) : Number(item.historical_gross_revenue ?? 0),
    net_revenue: salesRankingView === 'month' ? Number(item.month_net_revenue ?? 0) : Number(item.historical_net_revenue ?? 0),
    vat_amount: salesRankingView === 'month' ? Number(item.month_vat_amount ?? 0) : Number(item.historical_vat_amount ?? 0),
    shipping_amount: salesRankingView === 'month' ? Number(item.month_shipping_amount ?? 0) : Number(item.historical_shipping_amount ?? 0),
    cost: salesRankingView === 'month' ? Number(item.month_cost ?? 0) : Number(item.historical_cost ?? 0),
    profit: salesRankingView === 'month' ? Number(item.month_profit ?? 0) : Number(item.historical_profit ?? 0),
    margin: salesRankingView === 'month' ? Number(item.month_margin ?? 0) : Number(item.historical_margin ?? 0),
    month_orders_count: Number(item.month_orders_count ?? 0),
    month_units_sold: Number(item.month_units_sold ?? 0),
    month_gross_revenue: Number(item.month_gross_revenue ?? 0),
    month_net_revenue: Number(item.month_net_revenue ?? 0),
    month_vat_amount: Number(item.month_vat_amount ?? 0),
    month_shipping_amount: Number(item.month_shipping_amount ?? 0),
    month_cost: Number(item.month_cost ?? 0),
    month_profit: Number(item.month_profit ?? 0),
    month_margin: Number(item.month_margin ?? 0),
    historical_orders_count: Number(item.historical_orders_count ?? 0),
    historical_units_sold: Number(item.historical_units_sold ?? 0),
    historical_gross_revenue: Number(item.historical_gross_revenue ?? 0),
    historical_net_revenue: Number(item.historical_net_revenue ?? 0),
    historical_vat_amount: Number(item.historical_vat_amount ?? 0),
    historical_shipping_amount: Number(item.historical_shipping_amount ?? 0),
    historical_cost: Number(item.historical_cost ?? 0),
    historical_profit: Number(item.historical_profit ?? 0),
    historical_margin: Number(item.historical_margin ?? 0),
  }))
}

export const buildSalesTrendPreview = (salesTrendRows: Array<{ day: string; total: number }>) => {
  const rows = salesTrendRows.slice(-8)
  const max = Math.max(...rows.map((item) => Number(item.total ?? 0)), 1)
  return { rows, max }
}

export const summarizeInventoryRows = (inventoryManagementRows: Array<{
  stock: number
  inventoryCost: number
  inventoryMarket: number
  stockStatus: 'available' | 'low' | 'out' | 'expiring' | 'expired'
}>) => {
  return inventoryManagementRows.reduce((acc, row) => {
    acc.totalSkus += 1
    acc.totalUnits += row.stock
    acc.totalCost += row.inventoryCost
    acc.totalMarket += row.inventoryMarket
    if (row.stockStatus === 'out') acc.out += 1
    if (row.stockStatus === 'low') acc.low += 1
    if (row.stockStatus === 'expiring') acc.expiring += 1
    if (row.stockStatus === 'expired') acc.expired += 1
    return acc
  }, { totalSkus: 0, totalUnits: 0, totalCost: 0, totalMarket: 0, out: 0, low: 0, expiring: 0, expired: 0 })
}

export const summarizePurchaseInvoices = (recentPurchaseInvoices: PurchaseInvoiceSummary[]) => {
  const summary = recentPurchaseInvoices.reduce((acc, invoice) => {
    acc.totalInvoices += 1
    acc.totalUnits += Number(invoice.units_total ?? 0)
    acc.totalAmount += Number(invoice.total ?? 0)
    if (invoice.supplier_name) {
      acc.suppliers.add(String(invoice.supplier_name).trim().toUpperCase())
    }
    return acc
  }, {
    totalInvoices: 0,
    totalUnits: 0,
    totalAmount: 0,
    suppliers: new Set<string>(),
  })

  return {
    totalInvoices: summary.totalInvoices,
    totalUnits: summary.totalUnits,
    totalAmount: summary.totalAmount,
    suppliersCount: summary.suppliers.size,
  }
}

export const buildProductBreakdownMeta = (
  dashboardStats: DashboardStats | null,
  selectedProductMetric: ProductDetailMetric,
  vatRate: number,
) => {
  switch (selectedProductMetric) {
    case 'gross':
      return {
        title: 'Venta Total por Producto',
        subtitle: 'Incluye IVA y prorrateo de envío según participación en ventas netas.',
        total: Number(dashboardStats?.businessMetrics?.salesSummary?.gross ?? 0),
      }
    case 'vat':
      return {
        title: 'IVA Cobrado por Producto',
        subtitle: 'Estimación por producto usando la tasa de IVA aplicada al catálogo.',
        total: Number(dashboardStats?.businessMetrics?.salesSummary?.vat ?? 0),
      }
    case 'shipping':
      return {
        title: 'Envío Cobrado por Producto',
        subtitle: 'Distribución proporcional al peso de cada producto en ventas netas.',
        total: Number(dashboardStats?.businessMetrics?.salesSummary?.shipping ?? 0),
      }
    case 'profit':
      return {
        title: 'Utilidad Bruta por Producto',
        subtitle: 'Utilidad estimada = venta neta del producto - costo acumulado vendido.',
        total: Number(dashboardStats?.businessMetrics?.profitStats?.profit ?? 0),
      }
    case 'inventory':
      return {
        title: 'Valor de Inventario por Producto',
        subtitle: 'Costo inmovilizado actual por SKU (stock x costo unitario).',
        total: Number(dashboardStats?.businessMetrics?.inventoryValue?.cost_value ?? 0),
      }
    case 'net':
    default:
      return {
        title: 'Venta Neta por Producto',
        subtitle: 'Sin IVA ni envío. Basado en pedidos no cancelados.',
        total: Number(dashboardStats?.businessMetrics?.salesSummary?.net ?? 0),
      }
  }
}

export const buildSalesProductBreakdown = (
  dashboardStats: DashboardStats | null,
  adminProductsList: any[],
  parseMoney: (value: any) => number,
  selectedProductMetric: ProductDetailMetric,
  vatRate: number,
) => {
  const products = dashboardStats?.businessMetrics?.traceability?.products || []
  const vatRateForBreakdown = Number(dashboardStats?.tax?.rate ?? vatRate ?? 0)
  const vatMultiplierForBreakdown = 1 + (vatRateForBreakdown / 100)
  const totalNet = products.reduce((acc, item) => acc + Number(item.net_revenue ?? 0), 0)
  const totalShipping = Number(dashboardStats?.businessMetrics?.salesSummary?.shipping ?? 0)

  const costByProductId = new Map<string, number>(
    (adminProductsList || []).map((product: any) => {
      const productId = String(product.id ?? '')
      const cost = parseMoney(product.business?.cost ?? product.cost)
      return [productId, cost]
    }),
  )

  return products
    .map((item) => {
      const net = Number(item.net_revenue ?? 0)
      const gross = vatMultiplierForBreakdown > 0 ? net * vatMultiplierForBreakdown : net
      const vat = Math.max(gross - net, 0)
      const shipping = totalNet > 0 ? (totalShipping * net) / totalNet : 0
      const units = Number(item.units_sold ?? 0)
      const unitCost = costByProductId.get(String(item.product_id ?? '')) ?? 0
      const cost = Math.max(unitCost * units, 0)
      const profit = net - cost
      const metricValue = selectedProductMetric === 'gross'
        ? gross
        : selectedProductMetric === 'vat'
          ? vat
          : selectedProductMetric === 'shipping'
            ? shipping
            : selectedProductMetric === 'profit'
              ? profit
              : net

      return {
        ...item,
        units,
        net,
        gross,
        vat,
        shipping,
        cost,
        profit,
        metricValue,
      }
    })
    .sort((a, b) => b.metricValue - a.metricValue)
}

export const buildInventoryProductBreakdown = (
  adminProductsList: any[],
  parseMoney: (value: any) => number,
) => {
  return (adminProductsList || [])
    .map((product: any) => {
      const quantity = Number(product.quantity ?? 0)
      const unitCost = parseMoney(product.business?.cost ?? product.cost)
      const unitPrice = parseMoney(product.price)
      const inventoryCost = Math.max(quantity * unitCost, 0)
      const inventoryMarket = Math.max(quantity * unitPrice, 0)
      return {
        id: String(product.id ?? ''),
        name: String(product.name ?? 'Producto sin nombre'),
        category: String(product.category ?? 'Sin categoría'),
        quantity,
        unitCost,
        unitPrice,
        inventoryCost,
        inventoryMarket,
      }
    })
    .sort((a, b) => b.inventoryCost - a.inventoryCost)
}
