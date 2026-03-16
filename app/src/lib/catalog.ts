import { CategoryCard, TenantId, getTenantConfig } from '@/lib/tenant'
import { ProductType, ProductVariantOption } from '@/type/ProductType'

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

export const getProductVariantLabel = (product: ProductType) => {
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
  const sizeMatch = normalizedName.match(/(?:^|\s)(\d+(?:[.,]\d+)?\s?(?:KG|KGS|GR|G|LB|L|ML|MG|OZ|TAB|TABS|DS|UN|UNI|PACK|PZA|PZ))$/i)
  if (sizeMatch) {
    return sizeMatch[1].replace(/\s+/g, '').toUpperCase()
  }

  const countMatch = normalizedName.match(/(?:^|\s)(X\d+)$/i)
  if (countMatch) {
    return countMatch[1].toUpperCase()
  }

  return ''
}

export const getProductVariantPresentation = (product: ProductType) =>
  getAttributeValue(product, ['presentation', 'packaging'])

export const getProductVariantBaseName = (product: ProductType) => {
  const explicit = (product.variantBaseName ?? '').trim()
  if (explicit) return explicit

  const attributeBase = getAttributeValue(product, ['variantBaseName'])
  if (attributeBase) return attributeBase

  const variantLabel = getProductVariantLabel(product)
  const normalizedName = (product.name ?? '').trim()
  if (!variantLabel) return normalizedName

  const escapedLabel = escapeRegExp(variantLabel).replace(/\s+/g, '\\s*')
  const strippedName = normalizedName.replace(new RegExp(`(?:\\s+|-)?${escapedLabel}$`, 'i'), '').trim()
  return strippedName || normalizedName
}

export const getProductVariantGroupKey = (product: ProductType) => {
  const explicit = (product.variantGroupKey ?? '').trim() || getAttributeValue(product, ['variantGroupKey'])
  if (explicit) return explicit

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

  const amountMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(KG|KGS|GR|G|LB|L|ML|MG|OZ|TAB|TABS|DS|UN|UNI|PACK|PZA|PZ)/)
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
    const uniqueSizes = Array.from(new Set([...(product.sizes ?? []), ...(variantLabel ? [variantLabel] : [])].filter(Boolean)))

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
    const sizes = Array.from(new Set(sortedVariants.map((variant) => getProductVariantLabel(variant)).filter(Boolean)))
    const priceValues = sortedVariants.map((variant) => Number(variant.price ?? 0)).filter((value) => value > 0)
    const originValues = sortedVariants.map((variant) => Number(variant.originPrice ?? 0)).filter((value) => value > 0)
    const totalQuantity = sortedVariants.reduce((sum, variant) => sum + Number(variant.quantity ?? 0), 0)
    const totalSold = sortedVariants.reduce((sum, variant) => sum + Number(variant.sold ?? 0), 0)
    const reviewCount = sortedVariants.reduce((max, variant) => Math.max(max, getProductReviewCount(variant)), 0)
    const hasMultipleVariants = sortedVariants.length > 1

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

export const getCatalogCategoryIds = (products: ProductType[], tenantId?: TenantId) =>
  sortCatalogCategoryIds(
    Array.from(new Set(products.map((product) => normalizeText(product.category)).filter(Boolean))),
    tenantId
  )

export const buildCatalogCategoryCards = (products: ProductType[], tenantId?: TenantId): CategoryCard[] => {
  const cards: CategoryCard[] = []

  cards.push({
    id: 'todos',
    label: resolveCategoryLabel('todos', tenantId),
    image: resolveCategoryImage('todos', tenantId),
  })

  if (products.some((product) => product.sale)) {
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

export const getCatalogBrands = (products: ProductType[]) =>
  Array.from(
    new Set(
      products
        .map((product) => (product.brand ?? '').trim())
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right))
