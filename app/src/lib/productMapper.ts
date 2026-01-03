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
  description: string
  action?: string | null
  slug: string

  // campos dinámicos
  rate?: number | null
  quantityPurchase?: number | null
  sizes?: string[] | null
  type?: string | null

  // relaciones
  images?: { url: string }[]
  variations?: Variation[]
}

const mapVariation = (variation: Variation) => ({
  color: variation.color,
  colorCode: variation.colorCode ?? '',
  colorImage: variation.colorImage ?? '',
  image: variation.image ?? '',
})

export const mapProductToDto = (product: ProductWithRelations): ProductType => {
  const images = product.images?.map((img) => img.url) ?? []
  const variations = product.variations?.map(mapVariation) ?? []

  return {
    id: product.legacyId ?? product.id,
    category: product.category,
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
    quantityPurchase: Number(product.quantityPurchase ?? 1),
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    variation: variations,
    thumbImage: images,
    images,
    description: product.description,
    action: product.action ?? '',
    slug: product.slug,
  }
}

export const mapProductsToDto = (products: ProductWithRelations[]): ProductType[] =>
  products.map(mapProductToDto)
