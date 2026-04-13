import type { ProductType } from '@/type/ProductType'
import { getProductVariants } from '@/lib/catalog'
import { normalizeMeasurementLabels } from '@/lib/measurementLabel'
import { normalizeProductSpecies } from '@/lib/productTaxonomy'

const normalizeLabel = (value?: string | null) => (value ?? '').replace(/\s+/g, ' ').trim()
const SIZE_PATTERN = /^(?:XXS|XS|S|M|L|XL|XXL|STANDARD|\d+(?:[.,]\d+)?\s?(?:KGS?|KG|K|GR|G|LB|L|ML|MG|OZ|TAB|TABS|DS|UN|UNI|PACK|PZA|PZ)|X?\d+)$/i
const looksLikeSizeValue = (value?: string | null) => SIZE_PATTERN.test(normalizeLabel(value))

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
