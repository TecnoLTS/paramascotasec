import type { ProductType } from '@/type/ProductType'
import { getProductVariantLabel } from '@/lib/catalog'
import {
  getVariantAxisValue,
  type ProductVariantAxis,
  type ProductVariantAxisKey,
} from '@/lib/catalogAttributes'

export type VariantSelection = Partial<Record<ProductVariantAxisKey | '__variant', string>>

export const normalizeVariantSelectionValue = (value?: string | null) => (value ?? '').trim().toLowerCase()

const variantMatchesAxis = (variant: ProductType, axis: ProductVariantAxisKey, value?: string | null) =>
  !value || normalizeVariantSelectionValue(getVariantAxisValue(variant, axis)) === normalizeVariantSelectionValue(value)

export const getVariantSelectionFromProduct = (
  variant: ProductType | null | undefined,
  axes: ProductVariantAxis[],
  useGenericVariant = false,
): VariantSelection => {
  if (!variant) return {}

  if (useGenericVariant) {
    return {
      __variant: getProductVariantLabel(variant) || variant.name || '',
    }
  }

  return axes.reduce<VariantSelection>((selection, axisInfo) => {
    const value = getVariantAxisValue(variant, axisInfo.axis)
    if (value) {
      selection[axisInfo.axis] = value
    }
    return selection
  }, {})
}

export const getAvailableVariantAxisOptions = (
  variants: ProductType[],
  axes: ProductVariantAxis[],
  selection: VariantSelection,
) =>
  axes.map((axisInfo) => {
    const candidateVariants = variants.filter((variant) =>
      axes.every((otherAxis) =>
        otherAxis.axis === axisInfo.axis || variantMatchesAxis(variant, otherAxis.axis, selection[otherAxis.axis])
      )
    )
    const candidateValues = new Set(
      candidateVariants
        .map((variant) => getVariantAxisValue(variant, axisInfo.axis))
        .filter(Boolean)
        .map(normalizeVariantSelectionValue)
    )
    const values = axisInfo.values.filter((value) => candidateValues.has(normalizeVariantSelectionValue(value)))

    return {
      ...axisInfo,
      values: values.length > 0 ? values : axisInfo.values,
    }
  })

export const reconcileVariantSelection = (
  selection: VariantSelection,
  availableAxes: ProductVariantAxis[],
) => {
  let changed = false
  const nextSelection: VariantSelection = { ...selection }

  availableAxes.forEach((axisInfo) => {
    if (axisInfo.values.length === 0) {
      return
    }

    const currentValue = selection[axisInfo.axis]
    const isCurrentAvailable = axisInfo.values.some(
      (value) => normalizeVariantSelectionValue(value) === normalizeVariantSelectionValue(currentValue)
    )
    if (!isCurrentAvailable) {
      nextSelection[axisInfo.axis] = axisInfo.values[0]
      changed = true
    }
  })

  return changed ? nextSelection : selection
}

export const resolveVariantFromSelection = (
  variants: ProductType[],
  defaultVariant: ProductType | null | undefined,
  axes: ProductVariantAxis[],
  selection: VariantSelection,
  useGenericVariant = false,
) => {
  if (variants.length === 0) return null
  if (useGenericVariant && selection.__variant) {
    return variants.find((variant) => {
      const label = getProductVariantLabel(variant) || variant.name
      return normalizeVariantSelectionValue(label) === normalizeVariantSelectionValue(selection.__variant)
    }) ?? defaultVariant ?? variants[0]
  }

  const selectedAxes = axes.filter((axisInfo) => selection[axisInfo.axis])
  if (selectedAxes.length === 0) {
    return defaultVariant ?? variants[0]
  }

  const exactMatches = variants.filter((variant) =>
    selectedAxes.every((axisInfo) => variantMatchesAxis(variant, axisInfo.axis, selection[axisInfo.axis]))
  )
  if (exactMatches.length > 0) {
    return exactMatches.find((variant) => variant.id === defaultVariant?.id) ?? exactMatches[0]
  }

  const rankedMatches = variants
    .map((variant) => ({
      variant,
      score: selectedAxes.reduce(
        (score, axisInfo) => score + (variantMatchesAxis(variant, axisInfo.axis, selection[axisInfo.axis]) ? 1 : 0),
        0
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)

  return rankedMatches[0]?.variant ?? defaultVariant ?? variants[0]
}
