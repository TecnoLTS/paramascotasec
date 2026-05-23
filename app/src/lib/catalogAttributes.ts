import type { ProductType } from '@/type/ProductType'
import { getProductVariants } from '@/lib/catalog'
import { normalizeMeasurementLabels } from '@/lib/measurementLabel'
import { normalizeProductSpecies, normalizeProductType } from '@/lib/productTaxonomy'

const normalizeLabel = (value?: string | null) => (value ?? '').replace(/\s+/g, ' ').trim()
const normalizeIdentity = (value?: string | null) =>
  normalizeLabel(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const SIZE_PATTERN = /^(?:XXS|XS|S|M|L|XL|XXL|STANDARD|\d+(?:[.,]\d+)?\s?(?:KGS?|KG|K|GR|G|LB|L|ML|MG|OZ|TAB|TABS|DS|UN|UNI|PACK|PZA|PZ)|X?\d+)$/i
const looksLikeSizeValue = (value?: string | null) => SIZE_PATTERN.test(normalizeLabel(value))

export type ProductVariantAxisKey =
  | 'color'
  | 'size'
  | 'presentation'
  | 'weight'
  | 'volume'
  | 'packaging'
  | 'dosage'
  | 'range'
  | 'material'
  | 'flavor'
  | 'target'
  | 'age'

export type ProductVariantAxis = {
  axis: ProductVariantAxisKey
  label: string
  values: string[]
}

export const PRODUCT_VARIANT_AXIS_ORDER: ProductVariantAxisKey[] = [
  'color',
  'size',
  'presentation',
  'weight',
  'volume',
  'packaging',
  'dosage',
  'range',
  'flavor',
  'target',
  'age',
  'material',
]

const uniqueLabels = (values: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      values
        .map((value) => normalizeLabel(value))
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right, 'es'))

const collectVariantValues = (
  product: ProductType,
  extractor: (variant: ProductType) => Array<string | null | undefined>
) => getProductVariants(product).flatMap((variant) => extractor(variant))

export const getVariantSizeValue = (variant: ProductType) => {
  if (normalizeProductType(variant.productType ?? '', variant.category) === 'cuidado') {
    return ''
  }

  const explicitSize = normalizeLabel(variant.attributes?.size)
  if (explicitSize) {
    return normalizeMeasurementLabels([explicitSize])[0] ?? explicitSize
  }

  const variantLabel = normalizeLabel(variant.variantLabel || variant.attributes?.variantLabel)
  return looksLikeSizeValue(variantLabel)
    ? (normalizeMeasurementLabels([variantLabel])[0] ?? variantLabel)
    : ''
}

export const getVariantColorValue = (variant: ProductType) => {
  const explicitColor = normalizeLabel(variant.attributes?.color)
  if (explicitColor) return explicitColor

  const variationColor = uniqueLabels((variant.variation ?? []).map((item) => item.color))[0] ?? ''
  if (variationColor) return variationColor

  const explicitSize = normalizeLabel(variant.attributes?.size)
  const variantLabel = normalizeLabel(variant.variantLabel || variant.attributes?.variantLabel)
  if (!explicitSize && variantLabel && !looksLikeSizeValue(variantLabel)) {
    return variantLabel
  }

  return ''
}

export const getVariantAxisValue = (variant: ProductType, axis: ProductVariantAxisKey) => {
  if (axis === 'color') return getVariantColorValue(variant)
  if (axis === 'size') return getVariantSizeValue(variant)

  const attributes = variant.attributes ?? {}
  const value = (() => {
    switch (axis) {
      case 'presentation':
        return attributes.presentation || attributes.packaging
      case 'weight':
        return attributes.weight
      case 'volume':
        return attributes.volume
      case 'packaging':
        return attributes.packaging
      case 'dosage':
        return attributes.dosage
      case 'range':
        return attributes.range
      case 'material':
        return attributes.material
      case 'flavor':
        return attributes.flavor || attributes.sabor
      case 'target':
        return attributes.target
      case 'age':
        return attributes.age || attributes.edad
      default:
        return ''
    }
  })()

  const normalized = normalizeLabel(typeof value === 'string' ? value : String(value ?? ''))
  if (!normalized) return ''

  return ['weight', 'volume', 'dosage', 'range'].includes(axis)
    ? (normalizeMeasurementLabels([normalized])[0] ?? normalized)
    : normalized
}

const getUniqueVariantAxisValues = (product: ProductType, axis: ProductVariantAxisKey) =>
  axis === 'color'
    ? uniqueLabels(collectVariantValues(product, (variant) => [getVariantAxisValue(variant, axis)]))
    : normalizeMeasurementLabels(
        collectVariantValues(product, (variant) => [getVariantAxisValue(variant, axis)])
      )

const getCommonPresentationLabel = (product: ProductType) => {
  const presentations = uniqueLabels(
    collectVariantValues(product, (variant) => [
      variant.attributes?.presentation || variant.attributes?.packaging,
    ])
  )
  return presentations.length === 1 ? presentations[0] : ''
}

export const getVariantAxisLabel = (product: ProductType, axis: ProductVariantAxisKey) => {
  const productType = normalizeProductType(product.productType ?? '', product.category)
  if (axis === 'color') return 'Color'
  if (axis === 'size') return ['ropa', 'accesorios'].includes(productType) ? 'Talla' : 'Tamaño'
  if (axis === 'presentation') return 'Formato'
  if (axis === 'weight') return getCommonPresentationLabel(product) || 'Peso'
  if (axis === 'volume') return getCommonPresentationLabel(product) || 'Contenido'
  if (axis === 'packaging') return 'Empaque'
  if (axis === 'dosage') return 'Dosis'
  if (axis === 'range') return 'Rango recomendado'
  if (axis === 'material') return 'Material'
  if (axis === 'flavor') return 'Sabor'
  if (axis === 'target') return 'Etapa'
  if (axis === 'age') return 'Edad'
  return 'Opción'
}

export const getProductVariantAxes = (product: ProductType): ProductVariantAxis[] => {
  const variants = getProductVariants(product)
  if (variants.length <= 1) return []

  return PRODUCT_VARIANT_AXIS_ORDER
    .map((axis) => ({
      axis,
      label: getVariantAxisLabel(product, axis),
      values: getUniqueVariantAxisValues(product, axis),
    }))
    .filter((item) => {
      const distinctIdentities = new Set(item.values.map(normalizeIdentity).filter(Boolean))
      return distinctIdentities.size > 1
    })
}

export const getProductSizeValues = (product: ProductType) =>
  normalizeMeasurementLabels(
    collectVariantValues(product, (variant) => [getVariantSizeValue(variant)])
  )

export const getProductColorValues = (product: ProductType) =>
  uniqueLabels([
    ...collectVariantValues(product, (variant) => [
      getVariantColorValue(variant),
      ...(variant.variation ?? []).map((item) => item.color),
    ]),
    ...(product.variation ?? []).map((item) => item.color),
  ])

export const getProductMaterialValues = (product: ProductType) =>
  uniqueLabels(
    collectVariantValues(product, (variant) => [
      variant.attributes?.material,
    ])
  )

export const getProductSpeciesValues = (product: ProductType) =>
  uniqueLabels(
    collectVariantValues(product, (variant) => [
      normalizeProductSpecies(variant.attributes?.species, variant.gender),
    ])
  )

export const matchesCatalogAttribute = (
  values: Array<string | null | undefined>,
  selectedValue?: string | null
) => {
  if (!selectedValue) return true
  return uniqueLabels(values).includes(normalizeLabel(selectedValue))
}
