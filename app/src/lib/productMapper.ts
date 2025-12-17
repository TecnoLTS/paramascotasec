import { ProductType } from '@/type/ProductType'
import { Image, Product, Variation } from '@prisma/client'

type ProductWithRelations = Product & { images: Image[]; variations: Variation[] }

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
    type: (product as any).type ?? '',
    name: product.name,
    gender: product.gender ?? '',
    new: product.new,
    sale: product.sale,
    rate: Number((product as any).rate ?? 0),
    price: Number(product.price),
    originPrice: Number(product.originPrice),
    brand: product.brand ?? '',
    sold: product.sold,
    quantity: product.quantity,
    quantityPurchase: Number((product as any).quantityPurchase ?? 1),
    sizes: Array.isArray((product as any).sizes) ? (product as any).sizes : [],
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
