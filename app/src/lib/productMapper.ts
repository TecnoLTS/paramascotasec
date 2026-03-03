import { ProductType } from '@/type/ProductType'

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

  // campos dinámicos
  rate?: number | null
  quantityPurchase?: number | null
  sizes?: string[] | null
  type?: string | null
  attributes?: Record<string, string> | null

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

export const mapProductToDto = (product: ProductWithRelations): ProductType => {
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

  return {
    id: product.legacyId ?? product.id,
    internalId: product.id,
    category: product.category,
    productType: product.productType ?? '',
    type: product.type ?? '',
    name: product.name,
    gender: product.gender ?? '',
    new: product.new,
    sale: product.sale,
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
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    attributes: product.attributes ?? {},
    variation: variations,
    thumbImage: resolvedThumbs,
    images: resolvedGallery,
    description: product.description,
    action: product.action ?? '',
    slug: product.slug,
  }
}

export const mapProductsToDto = (products: ProductWithRelations[]): ProductType[] =>
  products.map(mapProductToDto)
