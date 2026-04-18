'use client'

import dynamic from 'next/dynamic'

const ProductEditorModal = dynamic(() => import('./ProductEditorModal'), {
    ssr: false,
})
const PurchaseInvoiceDetailModal = dynamic(() => import('./PurchaseInvoiceDetailModal'), {
    ssr: false,
})
const ProductProcurementDetailModal = dynamic(() => import('./ProductProcurementDetailModal'), {
    ssr: false,
})
const SalesProductDetailModal = dynamic(() => import('./SalesProductDetailModal'), {
    ssr: false,
})
const OrderDetailModal = dynamic(() => import('./OrderDetailModal'), {
    ssr: false,
})

type AccountModalsProps = {
    isProductModalOpen: boolean
    editingProduct: any | null
    adminProductsList: any[]
    productEditorMode: any
    productEditorInitialForm: any
    vatMultiplier: number
    normalizedMargins: any
    normalizedCalc: any
    productReferenceData: any
    openReferenceCatalog: (key: any) => void
    activeTab?: string
    onCloseProductModal: () => void
    onProductsUpdated: (products: any[]) => void
    onRefreshPurchaseInvoices: () => Promise<void>
    onSessionExpired: () => void
    showNotification: (text: string, type?: 'success' | 'error') => void
    isPurchaseInvoiceModalOpen: boolean
    purchaseInvoiceDetailLoading: boolean
    selectedPurchaseInvoice: any | null
    closePurchaseInvoiceModal: () => void
    formatMoney: (value: any) => string
    formatIsoDate: (value?: string | null) => string
    formatDateTimeEcuador: (value: string, options?: Intl.DateTimeFormatOptions) => string
    isProductProcurementModalOpen: boolean
    productProcurementDetailLoading: boolean
    selectedProductProcurementDetail: any | null
    selectedProcurementSalesProduct: any | null
    currentPeriod: { start: string | null; end: string | null }
    historicalPeriod: { start: string | null; end: string | null }
    closeProductProcurementModal: () => void
    handleOpenPurchaseInvoice: (id: string) => void
    isSalesProductModalOpen: boolean
    selectedSalesProduct: any | null
    onCloseSalesProductModal: () => void
    isOrderModalOpen: boolean
    selectedOrder: any | null
    selectedOrderContact: { name: string; email: string; phone: string }
    statusBadge: { label: string; className: string }
    canViewInvoice: boolean
    canManageStatus: boolean
    canCancelOrder: boolean
    onCloseOrderModal: () => void
    onViewInvoice: () => void
    onUpdateOrderStatus: (status: string) => void
    getVatSubtotal: (order: any) => number
    getVatAmount: (order: any) => number
    getShipping: (order: any) => number
    getItemNetPrice: (item: any, order: any) => number
}

export default function AccountModals({
    isProductModalOpen,
    editingProduct,
    adminProductsList,
    productEditorMode,
    productEditorInitialForm,
    vatMultiplier,
    normalizedMargins,
    normalizedCalc,
    productReferenceData,
    openReferenceCatalog,
    activeTab,
    onCloseProductModal,
    onProductsUpdated,
    onRefreshPurchaseInvoices,
    onSessionExpired,
    showNotification,
    isPurchaseInvoiceModalOpen,
    purchaseInvoiceDetailLoading,
    selectedPurchaseInvoice,
    closePurchaseInvoiceModal,
    formatMoney,
    formatIsoDate,
    formatDateTimeEcuador,
    isProductProcurementModalOpen,
    productProcurementDetailLoading,
    selectedProductProcurementDetail,
    selectedProcurementSalesProduct,
    currentPeriod,
    historicalPeriod,
    closeProductProcurementModal,
    handleOpenPurchaseInvoice,
    isSalesProductModalOpen,
    selectedSalesProduct,
    onCloseSalesProductModal,
    isOrderModalOpen,
    selectedOrder,
    selectedOrderContact,
    statusBadge,
    canViewInvoice,
    canManageStatus,
    canCancelOrder,
    onCloseOrderModal,
    onViewInvoice,
    onUpdateOrderStatus,
    getVatSubtotal,
    getVatAmount,
    getShipping,
    getItemNetPrice,
}: AccountModalsProps) {
    return (
        <>
            {isProductModalOpen && (
                <ProductEditorModal
                    open={isProductModalOpen}
                    editingProduct={editingProduct}
                    existingProducts={adminProductsList}
                    editorMode={productEditorMode}
                    initialForm={productEditorInitialForm}
                    vatMultiplier={vatMultiplier}
                    normalizedMargins={normalizedMargins}
                    normalizedCalc={normalizedCalc}
                    referenceData={productReferenceData}
                    onOpenReferenceCatalog={openReferenceCatalog}
                    activeTab={activeTab}
                    onClose={onCloseProductModal}
                    onProductsUpdated={onProductsUpdated}
                    onRefreshPurchaseInvoices={onRefreshPurchaseInvoices}
                    onSessionExpired={onSessionExpired}
                    showNotification={showNotification}
                />
            )}

            {isPurchaseInvoiceModalOpen && (
                <PurchaseInvoiceDetailModal
                    open={isPurchaseInvoiceModalOpen}
                    loading={purchaseInvoiceDetailLoading}
                    invoice={selectedPurchaseInvoice}
                    onClose={closePurchaseInvoiceModal}
                    formatMoney={formatMoney}
                    formatIsoDate={formatIsoDate}
                    formatDateTime={formatDateTimeEcuador}
                />
            )}

            {isProductProcurementModalOpen && (
                <ProductProcurementDetailModal
                    open={isProductProcurementModalOpen}
                    loading={productProcurementDetailLoading}
                    detail={selectedProductProcurementDetail}
                    salesProduct={selectedProcurementSalesProduct}
                    currentPeriod={currentPeriod}
                    historicalPeriod={historicalPeriod}
                    formatMoney={formatMoney}
                    formatIsoDate={formatIsoDate}
                    onClose={closeProductProcurementModal}
                    onOpenPurchaseInvoice={handleOpenPurchaseInvoice}
                />
            )}

            {isSalesProductModalOpen && (
                <SalesProductDetailModal
                    open={isSalesProductModalOpen}
                    product={selectedSalesProduct}
                    currentPeriod={currentPeriod}
                    historicalPeriod={historicalPeriod}
                    formatMoney={formatMoney}
                    onClose={onCloseSalesProductModal}
                />
            )}

            {isOrderModalOpen && selectedOrder && (
                <OrderDetailModal
                    open={isOrderModalOpen}
                    order={selectedOrder}
                    orderContact={selectedOrderContact}
                    statusBadge={statusBadge}
                    canViewInvoice={canViewInvoice}
                    canManageStatus={canManageStatus}
                    canCancelOrder={canCancelOrder}
                    onClose={onCloseOrderModal}
                    onViewInvoice={onViewInvoice}
                    onUpdateStatus={onUpdateOrderStatus}
                    formatDateTime={formatDateTimeEcuador}
                    formatMoney={formatMoney}
                    getVatSubtotal={getVatSubtotal}
                    getVatAmount={getVatAmount}
                    getShipping={getShipping}
                    getItemNetPrice={getItemNetPrice}
                />
            )}
        </>
    )
}
