import { ProductType } from '@/type/ProductType'

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const buildProductImageAlt = (product: Pick<ProductType, 'name' | 'brand' | 'category' | 'productType' | 'attributes' | 'variantLabel'>, kind = 'producto') => {
  const brand = clean(product.brand)
  const name = clean(product.name)
  const species = clean(product.attributes?.species)
  const category = clean(product.category || product.productType)
  const variant = clean(product.variantLabel || product.attributes?.variantLabel || product.attributes?.presentation || product.attributes?.size)
  const parts = [brand, name, variant, category, species].filter(Boolean)
  const label = Array.from(new Set(parts)).join(' ')
  return label ? `${label} en ParaMascotasEC` : `Imagen de ${kind} ParaMascotasEC`
}

export const getProductImageAlt = (product: ProductType, imageUrl?: string, fallbackKind = 'producto') => {
  const normalizedTarget = clean(imageUrl)
  const match = normalizedTarget
    ? product.imageMeta?.find((item) => clean(item.url) === normalizedTarget)
    : product.imageMeta?.find((item) => clean(item.altText))
  const altText = clean(match?.altText)
  return altText || buildProductImageAlt(product, fallbackKind)
}
