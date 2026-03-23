export interface DashboardStats {
    totalSales: {
        amount: number;
        progress: { percentage: number; current: number; previous: number };
    };
    newOrders: {
        count: number;
        progress: { percentage: number; current: number; previous: number };
    };
    newClients: {
        count: number;
        progress: { percentage: number; current: number; previous: number };
    };
    monthlyPerformance: Array<{ day: string, total: number }>;
    salesTrend30Days?: Array<{ day: string, total: number }>;
    topProducts?: Array<{ name: string, sold: number, revenue: number }>;
    salesByCategory?: Array<{ category: string, total: number }>;
    productAnalysis?: { averageMargin: number, lowMarginOpportunities: number, totalMonitored: number };
    tax?: { rate: number; multiplier: number };
    businessMetrics?: {
        averageOrderValue: number;
        salesSummary?: { gross?: number; net?: number; vat?: number; shipping?: number };
        profitStats: { revenue: number, cost: number, shipping_cost?: number, profit: number, margin: number, roi?: number };
        inventoryValue: { market_value: number, cost_value: number, total_items: number };
        ordersByStatus: Array<{ status: string, count: number }>;
        recentOrders: Array<{ id: string, user_name: string, total: number, status: string, created_at: string }>;
        salesDeepDive?: {
            daily: {
                current: Array<{ day: string, total: string }>;
                previous: Array<{ day: string, total: string }>;
            };
            categories: Array<{ category: string, current: string, previous: string, growth: number }>;
        };
        inventoryDeepDive?: {
            highValueItems: Array<{ name: string, quantity: number, cost: string, total_cost: string }>;
            riskItems: Array<{ name: string, quantity: number }>;
            expiringItems?: Array<{
                id?: string;
                legacy_id?: string;
                name: string;
                quantity: number | string;
                expiration_date: string;
                expiration_alert_days?: number | string;
                days_to_expire: number | string;
            }>;
            expiredItems?: Array<{
                id?: string;
                legacy_id?: string;
                name: string;
                quantity: number | string;
                expiration_date: string;
                days_expired: number | string;
            }>;
            health: {
                out_of_stock: number | string;
                low_stock: number | string;
                overstock: number | string;
                expired_products?: number | string;
                expiring_products?: number | string;
            };
        };
        aovDeepDive?: {
            distribution: Array<{ bucket: string, count: number, revenue: string }>;
        };
        traceability?: {
            orders: Array<{
                id: string;
                created_at: string;
                status: string;
                user_name?: string;
                gross: number;
                net: number;
                vat: number;
                shipping: number;
            }>;
            products: Array<{
                product_id: string;
                product_name: string;
                category: string;
                units_sold: number;
                gross_revenue?: number;
                net_revenue: number;
                vat_amount?: number;
                shipping_amount?: number;
                order_refs: string[];
            }>;
            categories: Array<{
                category: string;
                gross_revenue?: number;
                net_revenue: number;
                vat_amount?: number;
                shipping_amount?: number;
                order_refs: string[];
            }>;
        };
        productSalesRanking?: {
            period: { start: string; end: string };
            selectedMonth?: string;
            historicalPeriod?: { start: string | null; end: string | null };
            monthlyTotals: { units_sold: number; net_revenue: number };
            monthlyFinancial?: {
                orders_count: number;
                gross: number;
                net: number;
                vat: number;
                shipping: number;
                cost: number;
                profit: number;
                margin: number;
            };
            historicalTotals: { units_sold: number; net_revenue: number };
            historicalFinancial?: {
                orders_count: number;
                gross: number;
                net: number;
                vat: number;
                shipping: number;
                cost: number;
                profit: number;
                margin: number;
            };
            monthlyRanking: Array<{
                product_id: string;
                product_name: string;
                category: string;
                month_orders_count: number;
                month_units_sold: number;
                month_gross_revenue: number;
                month_net_revenue: number;
                month_vat_amount: number;
                month_shipping_amount: number;
                month_cost: number;
                month_profit: number;
                month_margin: number;
                historical_orders_count: number;
                historical_units_sold: number;
                historical_gross_revenue: number;
                historical_net_revenue: number;
                historical_vat_amount: number;
                historical_shipping_amount: number;
                historical_cost: number;
                historical_profit: number;
                historical_margin: number;
            }>;
            historicalRanking: Array<{
                product_id: string;
                product_name: string;
                category: string;
                month_orders_count: number;
                month_units_sold: number;
                month_gross_revenue: number;
                month_net_revenue: number;
                month_vat_amount: number;
                month_shipping_amount: number;
                month_cost: number;
                month_profit: number;
                month_margin: number;
                historical_orders_count: number;
                historical_units_sold: number;
                historical_gross_revenue: number;
                historical_net_revenue: number;
                historical_vat_amount: number;
                historical_shipping_amount: number;
                historical_cost: number;
                historical_profit: number;
                historical_margin: number;
            }>;
        };
    };
    strategicAlerts?: Array<{ type: 'critical' | 'warning' | 'info', message: string, action: string }>;
}

export interface Order {
    id: string;
    user_name?: string;
    total: number;
    status: string;
    created_at: string;
    order_notes?: string | null;
    items?: Array<{
        order_id: string;
        product_id: string;
        product_name: string;
        product_image?: string | null;
        quantity: number;
        price: number;
    }>;
}

export interface ShippingProvider {
    id: number;
    name: string;
    status: string;
}

export interface ShippingPickup {
    id?: number | string;
    provider?: string;
    provider_name?: string;
    status?: string;
    scheduled_at?: string;
    date?: string;
    window?: string;
    reference?: string;
    order_id?: string | number;
    notes?: string;
}

export interface AdminUserSummary {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    email_verified?: boolean | null;
    document_type?: string | null;
    document_number?: string | null;
    business_name?: string | null;
    resolvedCompany?: string | null;
    resolvedPhone?: string | null;
    resolvedAddressText?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    orders_total?: number | string | null;
    orders_active?: number | string | null;
    orders_completed?: number | string | null;
    total_spent?: number | string | null;
    last_order_at?: string | null;
    last_order_id?: string | null;
    profile?: Record<string, any> | string | null;
    addresses?: any;
    last_shipping_address?: Record<string, any> | string | null;
    last_billing_address?: Record<string, any> | string | null;
}

export type DeepDiveView = 'sales' | 'profit' | 'aov' | 'inventory' | 'product-breakdown'
export type ProductDetailMetric = 'gross' | 'net' | 'vat' | 'shipping' | 'profit' | 'inventory'
export type AdminReportSection = 'general' | 'sales' | 'balance' | 'inventory' | 'traceability'
export type AdminMenuGroupKey = 'monitoring' | 'reporting' | 'catalog' | 'operations' | 'finance'
export type ProductPublicationFilter = 'all' | 'published' | 'hidden'
export type ProductEditorMode = 'create' | 'edit' | 'duplicate-variant' | 'restock'

export type PurchaseInvoiceFormState = {
    invoiceNumber: string;
    supplierName: string;
    supplierDocument: string;
    issuedAt: string;
    notes: string;
}

export type PurchaseInvoiceSummary = {
    id: string;
    invoice_number: string;
    supplier_name: string;
    supplier_document?: string | null;
    issued_at: string;
    subtotal: number;
    tax_total: number;
    total: number;
    notes?: string | null;
    created_at: string;
    items_count: number;
    units_total: number;
    products_count: number;
}

export type PurchaseInvoiceDetailItem = {
    id: string;
    product_id: string;
    product_name_snapshot?: string | null;
    quantity: number;
    unit_cost: number;
    line_total: number;
    created_at?: string | null;
    category?: string | null;
    brand?: string | null;
    metadata?: Record<string, any> | null;
}

export type PurchaseInvoiceDetail = {
    id: string;
    invoice_number: string;
    supplier_name: string;
    supplier_document?: string | null;
    issued_at: string;
    subtotal: number;
    tax_total: number;
    total: number;
    notes?: string | null;
    metadata?: Record<string, any> | null;
    created_at?: string | null;
    updated_at?: string | null;
    items: PurchaseInvoiceDetailItem[];
}

export type ProductProcurementLotDetail = {
    id: string;
    source_type: string;
    source_ref?: string | null;
    purchase_invoice_id?: string | null;
    purchase_invoice_item_id?: string | null;
    invoice_number?: string | null;
    supplier_name?: string | null;
    supplier_document?: string | null;
    issued_at?: string | null;
    received_at?: string | null;
    created_at?: string | null;
    purchased_quantity: number;
    consumed_quantity: number;
    remaining_quantity: number;
    unit_cost: number;
    purchase_total: number;
    remaining_cost_total: number;
    estimated_remaining_net_revenue: number;
    estimated_remaining_gross_revenue: number;
    estimated_remaining_profit: number;
    estimated_remaining_margin: number;
    status: 'open' | 'consumed';
}

export type ProductProcurementDetail = {
    product_id: string;
    legacy_id?: string | null;
    product_name: string;
    category: string;
    price_gross: number;
    price_net: number;
    entries_count: number;
    open_lots_count: number;
    purchased_units_total: number;
    consumed_units_total: number;
    remaining_units_total: number;
    remaining_cost_total: number;
    weighted_unit_cost: number;
    weighted_margin: number;
    weighted_profit: number;
    min_unit_cost: number;
    max_unit_cost: number;
    has_unlinked_stock: boolean;
    lots: ProductProcurementLotDetail[];
}

export type ProductFormState = {
    id: string;
    name: string;
    price: string;
    pvp: string;
    cost: string;
    taxExempt: boolean;
    quantity: string;
    category: string;
    brand: string;
    description: string;
    productType: string;
    published: boolean;
    attributes: Record<string, string>;
    purchaseInvoice: PurchaseInvoiceFormState;
    thumbImages: Array<{ url: string; width: string; height: string }>;
    galleryImages: Array<{ url: string; width: string; height: string }>;
}

export type AddressData = {
    firstName?: string;
    lastName?: string;
    company?: string;
    country?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
}

export type SalesRankingRow = {
    product_id: string;
    product_name: string;
    category: string;
    orders_count: number;
    units_sold: number;
    gross_revenue: number;
    net_revenue: number;
    vat_amount: number;
    shipping_amount: number;
    cost: number;
    profit: number;
    margin: number;
    month_orders_count: number;
    month_units_sold: number;
    month_gross_revenue: number;
    month_net_revenue: number;
    month_vat_amount: number;
    month_shipping_amount: number;
    month_cost: number;
    month_profit: number;
    month_margin: number;
    historical_orders_count: number;
    historical_units_sold: number;
    historical_gross_revenue: number;
    historical_net_revenue: number;
    historical_vat_amount: number;
    historical_shipping_amount: number;
    historical_cost: number;
    historical_profit: number;
    historical_margin: number;
}

export type LocalSaleLineItem = {
    productId: string;
    internalId: string;
    name: string;
    category: string;
    sku: string;
    image: string;
    stock: number;
    quantity: number;
    price: number;
    cost: number;
}

export type LocalSaleQuote = {
    subtotal: number;
    items_subtotal_before_discount?: number;
    vat_rate: number;
    vat_subtotal: number;
    vat_amount: number;
    mixed_vat_rates?: boolean;
    shipping: number;
    shipping_base?: number;
    shipping_tax_rate?: number;
    shipping_tax_amount?: number;
    discount_code?: string | null;
    discount_total?: number;
    discounts_applied?: Array<{ code?: string; amount?: number; type?: string; value?: number }>;
    discount_rejections?: Array<{ code?: string; reason?: string; message?: string }>;
    total: number;
    items?: Array<{ product_id: string; quantity: number; price: number; total: number }>;
}

export type LocalSaleSubmissionResult = {
    status: 'success' | 'error';
    orderId: string | null;
    orderStatus?: string | null;
    message: string;
    customerName: string;
    documentNumber: string | null;
    paymentMethod: string;
    total: number;
    itemCount: number;
    units: number;
    createdAt: string;
    invoiceAvailable: boolean;
}

export type PosShiftSummary = {
    orders_count: number;
    sales_total: number;
    cash_sales: number;
    electronic_sales: number;
    sales_by_payment: {
        cash: number;
        card: number;
        transfer: number;
        mixed: number;
        other: number;
    };
    movement_income: number;
    movement_expense: number;
    movement_adjustments: number;
    expected_cash: number;
    closing_cash: number | null;
    difference_cash: number | null;
    period: { start: string | null; end: string | null };
}

export type PosShift = {
    id: string;
    opened_by_user_id: string;
    opened_at: string;
    opening_cash: number;
    status: 'open' | 'closed';
    open_notes?: string | null;
    closed_by_user_id?: string | null;
    closed_at?: string | null;
    closing_cash?: number | null;
    close_notes?: string | null;
    expected_cash?: number | null;
    difference_cash?: number | null;
    summary?: PosShiftSummary;
}

export type PosMovement = {
    id: number;
    shift_id: string;
    type: 'income' | 'expense' | 'withdrawal' | 'deposit' | 'adjustment';
    amount: number;
    description?: string | null;
    created_by_user_id: string;
    created_at: string;
}
