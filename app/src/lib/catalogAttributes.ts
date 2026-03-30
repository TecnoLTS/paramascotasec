import type { ProductType } from '@/type/ProductType'
import { getProductVariants } from '@/lib/catalog'
import { normalizeMeasurementLabels } from '@/lib/measurementLabel'
import { normalizeProductSpecies } from '@/lib/productTaxonomy'

const normalizeLabel = (value?: string | null) => (value ?? '').replace(/\s+/g, ' ').trim()

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

export const getProductSizeValues = (product: ProductType) =>
  normalizeMeasurementLabels([
    ...(product.sizes ?? []),
    ...collectVariantValues(product, (variant) => [
      variant.variantLabel,
      variant.attributes?.size,
      variant.attributes?.variantLabel,
    ]),
  ])

export const getProductColorValues = (product: ProductType) =>
  uniqueLabels([
    ...collectVariantValues(product, (variant) => [
      variant.attributes?.color,
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
