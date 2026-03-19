import { CategoryCard, TenantId, getTenantConfig } from '@/lib/tenant'
import { ProductType, ProductVariantOption } from '@/type/ProductType'
import { normalizeMeasurementLabel, normalizeMeasurementLabels } from '@/lib/measurementLabel'

const normalizeText = (value?: string | null) =>
  (value ?? '').trim().toLowerCase()

const toTitleCase = (value?: string | null) =>
  (value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getAttributeValue = (product: ProductType, keys: string[]) => {
  const attributes = product.attributes ?? {}
  for (const key of keys) {
    const value = attributes[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return ''
}

export const getProductReviewCount = (product: ProductType) => {
  const attributeCount = Number(getAttributeValue(product, ['reviewCount', 'reviewsCount']))
  if (Number.isFinite(attributeCount) && attributeCount > 0) {
    return attributeCount
  }
  const explicit = Number(product.reviewCount ?? 0)
  return Number.isFinite(explicit) && explicit > 0 ? explicit : 0
}

export const hasRealReviews = (product: ProductType) =>
  Number(product.rate ?? 0) > 0 && getProductReviewCount(product) > 0

export const getProductSku = (product: ProductType) =>
  getAttributeValue(product, ['sku', 'SKU', 'code', 'codigo'])

const extractProductVariantLabel = (product: ProductType) => {
  const explicit = (product.variantLabel ?? '').trim()
  if (explicit) return explicit

  const attributeLabel = getAttributeValue(product, [
    'variantLabel',
    'size',
    'weight',
    'presentation',
    'packaging',
    'dosage',
    'volume',
  ])
  if (attributeLabel) return attributeLabel

  const normalizedName = (product.name ?? '').trim()
  const sizeMatch = normalizedName.match(/(?:^|\s)(\d+(?:[.,]\d+)?\s?(?:KGS?|KG|K|GR|G|LB|L|ML|MG|OZ|TAB|TABS|DS|UN|UNI|PACK|PZA|PZ))$/i)
  if (sizeMatch) {
    return sizeMatch[1].replace(/\s+/g, '')
  }

  const countMatch = normalizedName.match(/(?:^|\s)(X\d+)$/i)
  if (countMatch) {
    return countMatch[1].toUpperCase()
  }

  return ''
}

export const getProductVariantLabel = (product: ProductType) =>
  normalizeMeasurementLabel(extractProductVariantLabel(product))

export const getProductVariantPresentation = (product: ProductType) =>
  normalizeMeasurementLabel(getAttributeValue(product, ['presentation', 'packaging']))

const hasExplicitVariantGrouping = (product: ProductType) => {
  const explicitGroupKey = (product.variantGroupKey ?? '').trim() || getAttributeValue(product, ['variantGroupKey'])
  const explicitBaseName = (product.variantBaseName ?? '').trim() || getAttributeValue(product, ['variantBaseName'])
  return Boolean(explicitGroupKey || explicitBaseName)
}

export const getProductVariantBaseName = (product: ProductType) => {
  const explicit = (product.variantBaseName ?? '').trim()
  if (explicit) return explicit

  const attributeBase = getAttributeValue(product, ['variantBaseName'])
  if (attributeBase) return attributeBase

  const rawVariantLabel = extractProductVariantLabel(product)
  const variantLabel = normalizeMeasurementLabel(rawVariantLabel)
  const normalizedName = (product.name ?? '').trim()
  if (!rawVariantLabel && !variantLabel) return normalizedName

  const candidateLabels = Array.from(new Set([rawVariantLabel, variantLabel].filter(Boolean)))
  let strippedName = normalizedName

  candidateLabels.forEach((label) => {
    const escapedLabel = escapeRegExp(label).replace(/\s+/g, '\\s*')
    strippedName = strippedName.replace(new RegExp(`(?:\\s+|-)?${escapedLabel}$`, 'i'), '').trim()
  })

  return strippedName || normalizedName
}

export const getProductVariantGroupKey = (product: ProductType) => {
  const explicit = (product.variantGroupKey ?? '').trim() || getAttributeValue(product, ['variantGroupKey'])
  if (explicit) return explicit

  if (!hasExplicitVariantGrouping(product)) {
    return `single:${product.id}`
  }

  const variantLabel = getProductVariantLabel(product)
  if (!variantLabel) {
    return `single:${product.id}`
  }

  const baseName = getProductVariantBaseName(product)
  const groupParts = [
    product.brand,
    product.category,
    product.gender,
    baseName,
    getAttributeValue(product, ['target']),
    getAttributeValue(product, ['flavor']),
    getAttributeValue(product, ['line']),
    getAttributeValue(product, ['species']),
  ].filter((value) => typeof value === 'string' && value.trim().length > 0)

  return slugify(groupParts.join('|')) || `group:${product.id}`
}

const parseVariantSortValue = (label: string) => {
  const normalized = label.trim().toUpperCase().replace(',', '.')
  const countMatch = normalized.match(/^X?(\d+)$/)
  if (countMatch) {
    return Number(countMatch[1])
  }

  const amountMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(KGS?|KG|K|GR|G|LB|L|ML|MG|OZ|TAB|TABS|DS|UN|UNI|PACK|PZA|PZ)/)
  if (!amountMatch) {
    return Number.MAX_SAFE_INTEGER
  }

  const amount = Number(amountMatch[1])
  const unit = amountMatch[2]
  if (!Number.isFinite(amount)) {
    return Number.MAX_SAFE_INTEGER
  }

  switch (unit) {
    case 'KG':
    case 'KGS':
    case 'K':
      return amount * 1000
    case 'LB':
      return amount * 453.592
    case 'L':
      return amount * 1000
    case 'GR':
    case 'G':
    case 'ML':
    case 'MG':
    case 'TAB':
    case 'TABS':
    case 'DS':
    case 'UN':
    case 'UNI':
    case 'PACK':
    case 'PZA':
    case 'PZ':
      return amount
    case 'OZ':
      return amount * 28.3495
    default:
      return amount
  }
}

const compareVariants = (left: ProductType, right: ProductType) => {
  const leftLabel = getProductVariantLabel(left)
  const rightLabel = getProductVariantLabel(right)
  const leftValue = parseVariantSortValue(leftLabel)
  const rightValue = parseVariantSortValue(rightLabel)

  if (leftValue !== rightValue) {
    return leftValue - rightValue
  }

  if ((right.quantity ?? 0) !== (left.quantity ?? 0)) {
    return (right.quantity ?? 0) - (left.quantity ?? 0)
  }

  return leftLabel.localeCompare(rightLabel)
}

const toTimestamp = (value?: string | null) => {
  const parsed = Date.parse(value ?? '')
  return Number.isFinite(parsed) ? parsed : 0
}

const pickRepresentativeVariant = (variants: ProductType[]) => {
  const inStock = variants.filter((variant) => Number(variant.quantity ?? 0) > 0)
  const pool = inStock.length > 0 ? inStock : variants
  return pool.slice().sort(compareVariants)[0] ?? variants[0]
}

const toVariantOption = (product: ProductType): ProductVariantOption => ({
  id: product.id,
  internalId: product.internalId,
  slug: product.slug,
  name: product.name,
  label: getProductVariantLabel(product) || product.name,
  presentation: getProductVariantPresentation(product),
  price: Number(product.price ?? 0),
  originPrice: Number(product.originPrice ?? 0),
  quantity: Number(product.quantity ?? 0),
  sold: Number(product.sold ?? 0),
  product,
})

export const getProductVariants = (product: ProductType): ProductType[] => {
  if (Array.isArray(product.variantOptions) && product.variantOptions.length > 0) {
    return product.variantOptions.map((option) => option.product).slice().sort(compareVariants)
  }
  return [product]
}

export const getProductCurrentPrice = (product: ProductType) =>
  Number(product.priceMin ?? product.price ?? 0)

export const getProductOriginalPrice = (product: ProductType) =>
  Number(product.originPriceMax ?? product.originPrice ?? 0)

export const isProductOnSale = (product: ProductType) => {
  const currentPrice = getProductCurrentPrice(product)
  const originalPrice = getProductOriginalPrice(product)

  return Boolean(product.sale) || (originalPrice > 0 && originalPrice > currentPrice)
}

export const getProductDiscountPercent = (product: ProductType) => {
  const currentPrice = getProductCurrentPrice(product)
  const originalPrice = getProductOriginalPrice(product)

  if (originalPrice <= 0 || originalPrice <= currentPrice) {
    return 0
  }

  return Math.floor(100 - ((currentPrice / originalPrice) * 100))
}

export const resolveSelectedVariant = (product: ProductType, idOrSlug?: string | null) => {
  const variants = getProductVariants(product)
  if (idOrSlug) {
    const selected = variants.find((variant) =>
      variant.id === idOrSlug ||
      variant.internalId === idOrSlug ||
      variant.slug === idOrSlug
    )
    if (selected) return selected
  }
  return pickRepresentativeVariant(variants)
}

export const groupCatalogProducts = (products: ProductType[]): ProductType[] => {
  const normalizedProducts = products.map((product) => {
    const variantLabel = getProductVariantLabel(product)
    const variantBaseName = getProductVariantBaseName(product)
    const variantGroupKey = getProductVariantGroupKey(product)
    const reviewCount = getProductReviewCount(product)
    const uniqueSizes = normalizeMeasurementLabels([...(product.sizes ?? []), ...(variantLabel ? [variantLabel] : [])])

    return {
      ...product,
      reviewCount,
      sizes: uniqueSizes,
      variantLabel,
      variantBaseName,
      variantGroupKey,
      variantAxis: variantLabel ? 'size' : (product.variantAxis ?? ''),
      variantPresentation: getProductVariantPresentation(product),
    }
  })

  const groupedMap = new Map<string, ProductType[]>()
  normalizedProducts.forEach((product) => {
    const groupKey = getProductVariantGroupKey(product)
    const existing = groupedMap.get(groupKey) ?? []
    existing.push(product)
    groupedMap.set(groupKey, existing)
  })

  return Array.from(groupedMap.values()).map((variants) => {
    const sortedVariants = variants.slice().sort(compareVariants)
    const representative = pickRepresentativeVariant(sortedVariants)
    const sizes = normalizeMeasurementLabels(sortedVariants.map((variant) => getProductVariantLabel(variant)))
    const priceValues = sortedVariants.map((variant) => Number(variant.price ?? 0)).filter((value) => value > 0)
    const originValues = sortedVariants.map((variant) => Number(variant.originPrice ?? 0)).filter((value) => value > 0)
    const totalQuantity = sortedVariants.reduce((sum, variant) => sum + Number(variant.quantity ?? 0), 0)
    const totalSold = sortedVariants.reduce((sum, variant) => sum + Number(variant.sold ?? 0), 0)
    const reviewCount = sortedVariants.reduce((max, variant) => Math.max(max, getProductReviewCount(variant)), 0)
    const hasMultipleVariants = sortedVariants.length > 1
    const latestCreatedAt = sortedVariants.reduce<string | undefined>((latest, variant) => {
      return toTimestamp(variant.createdAt) > toTimestamp(latest) ? variant.createdAt : latest
    }, representative.createdAt)
    const latestUpdatedAt = sortedVariants.reduce<string | undefined>((latest, variant) => {
      return toTimestamp(variant.updatedAt) > toTimestamp(latest) ? variant.updatedAt : latest
    }, representative.updatedAt)

    return {
      ...representative,
      name: hasMultipleVariants ? getProductVariantBaseName(representative) : representative.name,
      quantity: totalQuantity,
      sold: totalSold,
      sizes: sizes.length > 0 ? sizes : representative.sizes,
      reviewCount,
      variantCount: sortedVariants.length,
      variantOptions: sortedVariants.map(toVariantOption),
      variantLabel: getProductVariantLabel(representative),
      variantBaseName: getProductVariantBaseName(representative),
      variantGroupKey: getProductVariantGroupKey(representative),
      priceMin: priceValues.length > 0 ? Math.min(...priceValues) : Number(representative.price ?? 0),
      priceMax: priceValues.length > 0 ? Math.max(...priceValues) : Number(representative.price ?? 0),
      originPriceMin: originValues.length > 0 ? Math.min(...originValues) : Number(representative.originPrice ?? 0),
      originPriceMax: originValues.length > 0 ? Math.max(...originValues) : Number(representative.originPrice ?? 0),
      price: priceValues.length > 0 ? Math.min(...priceValues) : Number(representative.price ?? 0),
      originPrice: originValues.length > 0 ? Math.max(...originValues) : Number(representative.originPrice ?? 0),
      createdAt: latestCreatedAt,
      updatedAt: latestUpdatedAt,
      new: sortedVariants.some((variant) => variant.new),
      sale: sortedVariants.some((variant) => variant.sale || Number(variant.originPrice ?? 0) > Number(variant.price ?? 0)),
    }
  })
}

export const findCatalogProduct = (products: ProductType[], idOrSlug: string) =>
  products.find((product) =>
    product.id === idOrSlug ||
    product.internalId === idOrSlug ||
    product.slug === idOrSlug ||
    getProductVariants(product).some((variant) =>
      variant.id === idOrSlug ||
      variant.internalId === idOrSlug ||
      variant.slug === idOrSlug
    )
  )

const resolveCategoryImage = (categoryId: string, tenantId?: TenantId) => {
  const categories = getTenantConfig(tenantId).categories
  const byId = new Map(categories.map((category) => [normalizeText(category.id), category.image]))
  const normalized = normalizeText(categoryId)

  if (byId.has(normalized)) return byId.get(normalized) as string
  if (normalized.includes('perro') && byId.has('comida para perros')) return byId.get('comida para perros') as string
  if (normalized.includes('perro') && byId.has('perros')) return byId.get('perros') as string
  if (normalized.includes('gato') && byId.has('comida para gatos')) return byId.get('comida para gatos') as string
  if (normalized.includes('gato') && byId.has('gatos')) return byId.get('gatos') as string
  if (normalized.includes('cuidado') && byId.has('cuidado')) return byId.get('cuidado') as string
  if (normalized.includes('accesorio') && byId.has('accesorios')) return byId.get('accesorios') as string
  if (normalized.includes('comedero') && byId.has('comederos')) return byId.get('comederos') as string
  if (normalized.includes('cama') && byId.has('camas')) return byId.get('camas') as string
  return '/images/collection/categoria_todas.jpg'
}

const resolveCategoryLabel = (categoryId: string, tenantId?: TenantId) => {
  const categories = getTenantConfig(tenantId).categories
  const match = categories.find((category) => normalizeText(category.id) === normalizeText(categoryId))
  if (match) return match.label
  return toTitleCase(categoryId)
}

const sortCatalogCategoryIds = (categoryIds: string[], tenantId?: TenantId) => {
  const configuredOrder = getTenantConfig(tenantId).categories
    .map((category) => normalizeText(category.id))
    .filter((categoryId) => categoryId !== 'todos' && categoryId !== 'descuentos')

  const orderIndex = new Map(configuredOrder.map((categoryId, index) => [categoryId, index]))

  return categoryIds.slice().sort((left, right) => {
    const leftIndex = orderIndex.get(left)
    const rightIndex = orderIndex.get(right)

    if (leftIndex !== undefined && rightIndex !== undefined && leftIndex !== rightIndex) {
      return leftIndex - rightIndex
    }

    if (leftIndex !== undefined) return -1
    if (rightIndex !== undefined) return 1

    return left.localeCompare(right)
  })
}

export const getCatalogCategoryIds = (products: ProductType[], tenantId?: TenantId) => {
  const explicitCategories = products
    .map((product) => normalizeText(product.category))
    .filter(Boolean)

  const hasDogProducts = products.some((product) => normalizeText(product.gender) === 'dog')
  const hasCatProducts = products.some((product) => normalizeText(product.gender) === 'cat')

  const filteredCategories = explicitCategories.filter((categoryId) => {
    if (hasDogProducts && categoryId === 'comida para perros') return false
    if (hasCatProducts && categoryId === 'comida para gatos') return false
    return true
  })

  return sortCatalogCategoryIds(
    Array.from(new Set([
      ...filteredCategories,
      ...(hasDogProducts ? ['perros'] : []),
      ...(hasCatProducts ? ['gatos'] : []),
    ])),
    tenantId
  )
}

export const buildCatalogCategoryCards = (products: ProductType[], tenantId?: TenantId): CategoryCard[] => {
  const cards: CategoryCard[] = []

  cards.push({
    id: 'todos',
    label: resolveCategoryLabel('todos', tenantId),
    image: resolveCategoryImage('todos', tenantId),
  })

  if (products.some(isProductOnSale)) {
    cards.push({
      id: 'descuentos',
      label: resolveCategoryLabel('descuentos', tenantId),
      image: resolveCategoryImage('descuentos', tenantId),
    })
  }

  getCatalogCategoryIds(products, tenantId).forEach((categoryId) => {
    cards.push({
      id: categoryId,
      label: resolveCategoryLabel(categoryId, tenantId),
      image: resolveCategoryImage(categoryId, tenantId),
    })
  })

  return cards
}

export interface CatalogBrandStat {
  brand: string
  productCount: number
  inStockCount: number
  soldCount: number
}

const compareCatalogBrandStats = (left: CatalogBrandStat, right: CatalogBrandStat) => {
  if (right.soldCount !== left.soldCount) {
    return right.soldCount - left.soldCount
  }

  if (right.productCount !== left.productCount) {
    return right.productCount - left.productCount
  }

  if (right.inStockCount !== left.inStockCount) {
    return right.inStockCount - left.inStockCount
  }

  return left.brand.localeCompare(right.brand)
}

export const getCatalogBrandStats = (products: ProductType[]): CatalogBrandStat[] => {
  const statsByBrand = new Map<string, CatalogBrandStat>()

  products.forEach((product) => {
    const brand = (product.brand ?? '').trim()
    if (!brand) return

    const current = statsByBrand.get(brand) ?? {
      brand,
      productCount: 0,
      inStockCount: 0,
      soldCount: 0,
    }

    current.productCount += 1
    current.inStockCount += Number(product.quantity ?? 0) > 0 ? 1 : 0
    current.soldCount += Math.max(0, Number(product.sold ?? 0))

    statsByBrand.set(brand, current)
  })

  return Array.from(statsByBrand.values()).sort(compareCatalogBrandStats)
}

export const getCatalogBrands = (products: ProductType[]) =>
  getCatalogBrandStats(products).map((item) => item.brand)
