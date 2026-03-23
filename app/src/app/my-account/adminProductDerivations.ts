import { getAdminProductEntityId, isProductEligibleForPublication } from './productFormUtils'
import { getProductExpirationMeta } from './statusDisplay'

export const INVENTORY_LOW_STOCK_THRESHOLD = 5

export type LocalSaleCatalogItem = {
  internalId: string
  legacyId: string
  name: string
  category: string
  sku: string
  stock: number
  price: number
  cost: number
  image: string
  isExpired: boolean
  expirationDate: string
  expirationStatus: string
  searchText: string
}

export type InventoryManagementRow = {
  internalId: string
  legacyId: string
  name: string
  category: string
  productType: string
  isPerishable: boolean
  sku: string
  stock: number
  stockStatus: 'available' | 'low' | 'out' | 'expiring' | 'expired'
  unitPrice: number
  unitCost: number
  inventoryCost: number
  inventoryMarket: number
  expirationMeta: ReturnType<typeof getProductExpirationMeta>
  lotCode: string
  storageLocation: string
  supplier: string
  lastPurchaseInvoiceId: string
  lastPurchaseInvoiceNumber: string
  lastPurchaseIssuedAt: string
  lastPurchaseReceivedAt: string
  lastPurchaseQuantity: number
  lastPurchaseUnitCost: number
  purchaseEntriesCount: number
  purchasedUnits: number
  remainingPurchasedUnits: number
  source: any
  searchText: string
}

export type ProductPublicationSummary = {
  all: number
  published: number
  hidden: number
  publishable: number
  blocked: number
  withStock: number
  noStock: number
  withPrice: number
  noPrice: number
}

export const buildLocalSaleCatalog = (
  adminProductsList: any[],
  deferredLocalSaleSearch: string,
  parseMoney: (value: any) => number,
): LocalSaleCatalogItem[] => {
  const query = deferredLocalSaleSearch.trim().toLowerCase()

  return (adminProductsList || [])
    .map((product: any) => {
      const internalId = getAdminProductEntityId(product)
      const legacyId = String(product.id || internalId).trim()
      const stock = Math.max(0, Number(product.quantity ?? 0))
      const sku = String(product.attributes?.sku || '').trim()
      const expirationMeta = getProductExpirationMeta(product)
      const image = (Array.isArray(product.thumbImage) && product.thumbImage[0])
        || (Array.isArray(product.images) && product.images[0])
        || '/images/product/1000x1000.png'

      return {
        internalId,
        legacyId,
        name: String(product.name || 'Producto sin nombre'),
        category: String(product.category || 'Sin categoría'),
        sku,
        stock,
        price: parseMoney(product.price),
        cost: parseMoney(product.business?.cost ?? product.cost),
        image: String(image),
        isExpired: expirationMeta.isExpired,
        expirationDate: expirationMeta.expirationDate,
        expirationStatus: expirationMeta.expirationStatus,
        searchText: `${String(product.name || '')} ${String(product.category || '')} ${sku} ${legacyId}`.toLowerCase(),
      }
    })
    .filter((product) => {
      if (!product.internalId) return false
      if (!query) return true
      return product.searchText.includes(query)
    })
    .sort((a, b) => {
      if (b.stock !== a.stock) return b.stock - a.stock
      return a.name.localeCompare(b.name, 'es')
    })
}

export const buildInventoryManagementRows = (
  adminProductsList: any[],
  parseMoney: (value: any) => number,
): InventoryManagementRow[] => {
  const statusOrder: Record<InventoryManagementRow['stockStatus'], number> = {
    expired: 0,
    expiring: 1,
    out: 2,
    low: 3,
    available: 4,
  }

  return (adminProductsList || [])
    .map((product: any) => {
      const internalId = getAdminProductEntityId(product)
      const legacyId = String(product.id || internalId).trim()
      const expirationMeta = getProductExpirationMeta(product)
      const stock = Math.max(0, Number(product.quantity ?? 0))
      const sku = String(product.attributes?.sku || '').trim()
      const lotCode = String(product.inventory?.lot?.code || product.attributes?.lotCode || '').trim()
      const storageLocation = String(product.inventory?.lot?.location || product.attributes?.storageLocation || '').trim()
      const manualSupplier = String(product.inventory?.lot?.supplier || product.attributes?.supplier || '').trim()
      const lastPurchaseInvoice = product.lastPurchaseInvoice || product.inventory?.lastPurchaseInvoice || null
      const lastPurchaseInvoiceId = String(lastPurchaseInvoice?.id || '').trim()
      const lastPurchaseInvoiceNumber = String(lastPurchaseInvoice?.invoiceNumber || '').trim()
      const lastPurchaseSupplier = String(lastPurchaseInvoice?.supplierName || '').trim()
      const lastPurchaseIssuedAt = String(lastPurchaseInvoice?.issuedAt || '').trim()
      const lastPurchaseReceivedAt = String(lastPurchaseInvoice?.receivedAt || '').trim()
      const lastPurchaseQuantity = Math.max(0, Number(lastPurchaseInvoice?.quantity ?? 0))
      const lastPurchaseUnitCost = parseMoney(lastPurchaseInvoice?.unitCost)
      const purchaseEntriesCount = Math.max(0, Number(product.inventory?.purchaseHistory?.entriesCount ?? 0))
      const purchasedUnits = Math.max(0, Number(product.inventory?.purchaseHistory?.purchasedUnits ?? 0))
      const remainingPurchasedUnits = Math.max(0, Number(product.inventory?.purchaseHistory?.remainingUnits ?? 0))
      const supplier = lastPurchaseSupplier || manualSupplier
      const unitPrice = parseMoney(product.price)
      const unitCost = parseMoney(product.business?.cost ?? product.cost)
      const inventoryCost = Math.max(stock * unitCost, 0)
      const inventoryMarket = Math.max(stock * unitPrice, 0)
      const isPerishable = expirationMeta.isFood
      const stockStatus: InventoryManagementRow['stockStatus'] = stock <= 0
        ? 'out'
        : (isPerishable && expirationMeta.isExpired)
          ? 'expired'
          : (isPerishable && expirationMeta.expirationStatus === 'expiring')
            ? 'expiring'
            : stock <= INVENTORY_LOW_STOCK_THRESHOLD
              ? 'low'
              : 'available'

      return {
        internalId,
        legacyId,
        name: String(product.name || 'Producto sin nombre'),
        category: String(product.category || 'Sin categoría'),
        productType: String(product.productType || '').trim().toLowerCase(),
        isPerishable,
        sku,
        stock,
        stockStatus,
        unitPrice,
        unitCost,
        inventoryCost,
        inventoryMarket,
        expirationMeta,
        lotCode,
        storageLocation,
        supplier,
        lastPurchaseInvoiceId,
        lastPurchaseInvoiceNumber,
        lastPurchaseIssuedAt,
        lastPurchaseReceivedAt,
        lastPurchaseQuantity,
        lastPurchaseUnitCost,
        purchaseEntriesCount,
        purchasedUnits,
        remainingPurchasedUnits,
        source: product,
        searchText: `${String(product.name || '')} ${String(product.category || '')} ${sku} ${lotCode} ${storageLocation} ${supplier} ${lastPurchaseInvoiceNumber} ${legacyId}`.toLowerCase(),
      }
    })
    .filter((item) => Boolean(item.internalId))
    .sort((a, b) => {
      const byStatus = (statusOrder[a.stockStatus] ?? 99) - (statusOrder[b.stockStatus] ?? 99)
      if (byStatus !== 0) return byStatus
      if (b.inventoryCost !== a.inventoryCost) return b.inventoryCost - a.inventoryCost
      return a.name.localeCompare(b.name, 'es')
    })
}

export const buildProductPublicationSummary = (adminProductsList: any[]): ProductPublicationSummary => {
  return (adminProductsList || []).reduce((acc, product: any) => {
    acc.all += 1
    if (product?.published === false) {
      acc.hidden += 1
    } else {
      acc.published += 1
    }
    if (isProductEligibleForPublication(product)) {
      acc.publishable += 1
    } else {
      acc.blocked += 1
    }
    if (Number(product?.quantity ?? 0) > 0) {
      acc.withStock += 1
    } else {
      acc.noStock += 1
    }
    if (Number(product?.price ?? 0) > 0) {
      acc.withPrice += 1
    } else {
      acc.noPrice += 1
    }
    return acc
  }, {
    all: 0,
    published: 0,
    hidden: 0,
    publishable: 0,
    blocked: 0,
    withStock: 0,
    noStock: 0,
    withPrice: 0,
    noPrice: 0,
  })
}
