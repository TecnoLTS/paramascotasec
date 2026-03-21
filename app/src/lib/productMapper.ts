import { ProductType } from '@/type/ProductType'
import { normalizeMeasurementLabel, normalizeMeasurementLabels } from '@/lib/measurementLabel'
import { resolveAudienceGenderFromSpecies } from '@/lib/productTaxonomy'

// Tipamos lo mínimo necesario
type Variation = {
  color: string
  colorCode?: string | null
  colorImage?: string | null
  image?: string | null
}

// OJO: estos tipos deben ser compatibles con lo que devuelve Prisma.
// price y originPrice pueden venir como Decimal, así que los hacemos flexibles (any).
type ProductWithRelations = {
  id: string
  legacyId?: string | null
  category: string
  productType?: string | null
  name: string
  gender?: string | null
  new: boolean
  sale: boolean
  published?: boolean | null

  // Prisma usa Decimal para precios → aquí lo dejamos amplio
  price: any
  originPrice: any

  brand?: string | null
  sold: number
  quantity: number
  cost?: any
  description: string
  action?: string | null
  slug: string
  createdAt?: string | null
  updatedAt?: string | null

  // campos dinámicos
  rate?: number | null
  quantityPurchase?: number | null
  sizes?: string[] | null
  type?: string | null
  attributes?: Record<string, string> | null
  inventory?: {
    onHand?: number | string | null
    reserved?: number | string | null
    available?: number | string | null
    soldHistorical?: number | string | null
    reorderPoint?: number | string | null
    criticalPoint?: number | string | null
    overstockThreshold?: number | string | null
    stockMax?: number | string | null
    status?: string | null
    coverage?: {
      days?: number | string | null
      avgMonthlySales?: number | string | null
      windowMonths?: number | string | null
      confidence?: string | null
    } | null
    valuation?: {
      costTotal?: number | string | null
      saleTotalNet?: number | string | null
      saleTotalGross?: number | string | null
    } | null
    lot?: {
      code?: string | null
      location?: string | null
      supplier?: string | null
    } | null
    expiration?: {
      date?: string | null
      alertDays?: number | string | null
      daysToExpire?: number | string | null
      status?: 'none' | 'ok' | 'expiring' | 'expired' | string | null
    } | null
    purchaseHistory?: {
      entriesCount?: number | string | null
      purchasedUnits?: number | string | null
      remainingUnits?: number | string | null
      lastPurchaseAt?: string | null
    } | null
    lastPurchaseInvoice?: PurchaseInvoiceSummary | null
  } | null
  expirationDate?: string | null
  expirationAlertDays?: number | string | null
  daysToExpire?: number | string | null
  expirationStatus?: 'none' | 'ok' | 'expiring' | 'expired' | null
  lastPurchaseInvoice?: PurchaseInvoiceSummary | null

  // relaciones
  images?: ({ url: string } | string)[]
  thumbImage?: ({ url: string } | string)[]
  imageMeta?: { url?: string; kind?: string }[]
  variations?: Variation[]
  business?: {
    cost?: number
    margin?: number
    profit?: number
    suggestions?: {
      min_price?: number
      recommended_price?: number
      max_price?: number
      min_price_pvp?: number
      recommended_price_pvp?: number
      max_price_pvp?: number
    }
  } | null
}

type PurchaseInvoiceSummary = {
  id?: string | null
  invoiceNumber?: string | null
  supplierName?: string | null
  supplierDocument?: string | null
  issuedAt?: string | null
  receivedAt?: string | null
  quantity?: number | string | null
  unitCost?: number | string | null
  lineTotal?: number | string | null
}

const normalizeImageUrl = (url: string) => {
  if (!url) return url
  if (url.startsWith('/')) return url
  try {
    const parsed = new URL(url)
    if (parsed.hostname.startsWith('api.')) {
      return url
    }
    const path = parsed.pathname
    if (path.startsWith('/uploads/') || path.startsWith('/images/')) {
      return path
    }
    return url
  } catch {
    return url
  }
}

const mapVariation = (variation: Variation) => ({
  color: variation.color,
  colorCode: variation.colorCode ?? '',
  colorImage: variation.colorImage ? normalizeImageUrl(variation.colorImage) : '',
  image: variation.image ? normalizeImageUrl(variation.image) : '',
})

const mapPurchaseInvoiceSummary = (invoice?: PurchaseInvoiceSummary | null) => {
  if (!invoice) return null
  return {
    id: invoice.id ?? null,
    invoiceNumber: invoice.invoiceNumber ?? null,
    supplierName: invoice.supplierName ?? null,
    supplierDocument: invoice.supplierDocument ?? null,
    issuedAt: invoice.issuedAt ?? null,
    receivedAt: invoice.receivedAt ?? null,
    quantity: Number(invoice.quantity ?? 0),
    unitCost: Number(invoice.unitCost ?? 0),
    lineTotal: Number(invoice.lineTotal ?? 0),
  }
}

export const mapProductToDto = (product: ProductWithRelations): ProductType => {
  const attributes = product.attributes ?? {}
  const normalizedAttributes = { ...attributes }
  ;['variantLabel', 'size', 'weight', 'presentation', 'packaging', 'dosage', 'volume'].forEach((key) => {
    const value = normalizedAttributes[key]
    if (typeof value === 'string') {
      normalizedAttributes[key] = normalizeMeasurementLabel(value)
    }
  })
  const images =
    product.images?.map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean).map(normalizeImageUrl) ?? []
  const thumbImages =
    product.thumbImage?.map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean).map(normalizeImageUrl) ?? []
  const thumbFromMeta =
    product.imageMeta?.filter((item) => item?.kind === 'thumb' && item.url).map((item) => normalizeImageUrl(item.url as string)) ?? []
  const galleryFromMeta =
    product.imageMeta?.filter((item) => item?.kind === 'gallery' && item.url).map((item) => normalizeImageUrl(item.url as string)) ?? []
  const resolvedThumbs = thumbImages.length > 0 ? thumbImages : (thumbFromMeta.length > 0 ? thumbFromMeta : images)
  const resolvedGallery = images.length > 0 ? images : (galleryFromMeta.length > 0 ? galleryFromMeta : images)
  const variations = product.variations?.map(mapVariation) ?? []
  const lastPurchaseInvoice = mapPurchaseInvoiceSummary(product.lastPurchaseInvoice ?? product.inventory?.lastPurchaseInvoice)
  const variantLabel = [
    normalizedAttributes.variantLabel,
    normalizedAttributes.size,
    normalizedAttributes.weight,
    normalizedAttributes.presentation,
    normalizedAttributes.packaging,
    normalizedAttributes.dosage,
  ].find((value) => typeof value === 'string' && value.trim().length > 0)
  const resolvedSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? normalizeMeasurementLabels(product.sizes)
    : normalizeMeasurementLabels(variantLabel ? [String(variantLabel)] : [])
  const reviewCountRaw = normalizedAttributes.reviewCount ?? normalizedAttributes.reviewsCount ?? 0
  const resolvedGender = resolveAudienceGenderFromSpecies(
    typeof normalizedAttributes.species === 'string' ? normalizedAttributes.species : '',
    product.gender ?? ''
  )

  return {
    id: product.legacyId ?? product.id,
    internalId: product.id,
    category: product.category,
    productType: product.productType ?? '',
    type: product.type ?? '',
    name: product.name,
    gender: resolvedGender,
    new: product.new,
    sale: product.sale,
    published: product.published ?? false,
    rate: Number(product.rate ?? 0),

    // Aquí normalizamos a number, venga de Decimal, string o lo que sea
    price: Number(product.price),
    originPrice: Number(product.originPrice),

    brand: product.brand ?? '',
    sold: product.sold,
    quantity: product.quantity,
    cost: Number(product.cost ?? product.business?.cost ?? 0),
    business: product.business ?? undefined,
    quantityPurchase: Number(product.quantityPurchase ?? 1),
    sizes: resolvedSizes,
    attributes: normalizedAttributes,
    reviewCount: Number(reviewCountRaw ?? 0),
    variantLabel: typeof variantLabel === 'string' ? normalizeMeasurementLabel(variantLabel) : '',
    variantBaseName: typeof normalizedAttributes.variantBaseName === 'string' ? normalizedAttributes.variantBaseName : '',
    variantGroupKey: typeof normalizedAttributes.variantGroupKey === 'string' ? normalizedAttributes.variantGroupKey : '',
    variantAxis: typeof normalizedAttributes.variantAxis === 'string' ? normalizedAttributes.variantAxis : '',
    variantPresentation: typeof normalizedAttributes.presentation === 'string' ? normalizeMeasurementLabel(normalizedAttributes.presentation) : '',
    inventory: product.inventory ? {
      onHand: Number(product.inventory.onHand ?? product.quantity ?? 0),
      reserved: Number(product.inventory.reserved ?? 0),
      available: Number(product.inventory.available ?? product.quantity ?? 0),
      soldHistorical: Number(product.inventory.soldHistorical ?? product.sold ?? 0),
      reorderPoint: Number(product.inventory.reorderPoint ?? 0),
      criticalPoint: Number(product.inventory.criticalPoint ?? 0),
      overstockThreshold: Number(product.inventory.overstockThreshold ?? 0),
      stockMax: Number(product.inventory.stockMax ?? 0),
      status: product.inventory.status ?? undefined,
      coverage: product.inventory.coverage ? {
        days: product.inventory.coverage.days === null || product.inventory.coverage.days === undefined
          ? null
          : Number(product.inventory.coverage.days),
        avgMonthlySales: Number(product.inventory.coverage.avgMonthlySales ?? 0),
        windowMonths: Number(product.inventory.coverage.windowMonths ?? 0),
        confidence: product.inventory.coverage.confidence ?? undefined,
      } : undefined,
      valuation: product.inventory.valuation ? {
        costTotal: Number(product.inventory.valuation.costTotal ?? 0),
        saleTotalNet: Number(product.inventory.valuation.saleTotalNet ?? 0),
        saleTotalGross: Number(product.inventory.valuation.saleTotalGross ?? 0),
      } : undefined,
      lot: product.inventory.lot ? {
        code: product.inventory.lot.code ?? null,
        location: product.inventory.lot.location ?? null,
        supplier: product.inventory.lot.supplier ?? null,
      } : undefined,
      expiration: product.inventory.expiration ? {
        date: product.inventory.expiration.date ?? null,
        alertDays: Number(product.inventory.expiration.alertDays ?? 30),
        daysToExpire: product.inventory.expiration.daysToExpire === null || product.inventory.expiration.daysToExpire === undefined
          ? null
          : Number(product.inventory.expiration.daysToExpire),
        status: product.inventory.expiration.status ?? undefined,
      } : undefined,
      purchaseHistory: product.inventory.purchaseHistory ? {
        entriesCount: Number(product.inventory.purchaseHistory.entriesCount ?? 0),
        purchasedUnits: Number(product.inventory.purchaseHistory.purchasedUnits ?? 0),
        remainingUnits: Number(product.inventory.purchaseHistory.remainingUnits ?? 0),
        lastPurchaseAt: product.inventory.purchaseHistory.lastPurchaseAt ?? null,
      } : undefined,
      lastPurchaseInvoice,
    } : undefined,
    lastPurchaseInvoice,
    expirationDate: product.expirationDate ?? null,
    expirationAlertDays: Number(product.expirationAlertDays ?? 30),
    daysToExpire: product.daysToExpire === null || product.daysToExpire === undefined
      ? null
      : Number(product.daysToExpire),
    expirationStatus: (product.expirationStatus ?? 'none') as ProductType['expirationStatus'],
    variation: variations,
    thumbImage: resolvedThumbs,
    images: resolvedGallery,
    description: product.description,
    action: product.action ?? '',
    slug: product.slug,
    createdAt: product.createdAt ?? undefined,
    updatedAt: product.updatedAt ?? undefined,
  }
}

export const mapProductsToDto = (products: ProductWithRelations[]): ProductType[] =>
  products.map(mapProductToDto)
