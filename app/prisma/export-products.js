/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    include: {
      images: true,
      variations: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const normalized = products.map((p) => ({
    id: p.legacyId ?? p.id,
    category: p.category,
    type: p.type ?? '',
    name: p.name,
    gender: p.gender ?? '',
    new: p.new,
    sale: p.sale,
    rate: p.rate ?? 0,
    price: Number(p.price),
    originPrice: Number(p.originPrice),
    brand: p.brand ?? '',
    sold: p.sold,
    quantity: p.quantity,
    quantityPurchase: p.quantityPurchase ?? 1,
    sizes: p.sizes ?? [],
    variation: p.variations.map((v) => ({
      color: v.color,
      colorCode: v.colorCode ?? '',
      colorImage: v.colorImage ?? '',
      image: v.image ?? '',
    })),
    thumbImage: p.images.map((img) => img.url),
    images: p.images.map((img) => img.url),
    description: p.description,
    action: p.action ?? '',
    slug: p.slug,
  }))

  const target = path.join(__dirname, '../src/data/Product.json')
  fs.writeFileSync(target, JSON.stringify(normalized, null, 2), 'utf8')
  console.log(`Exported ${normalized.length} products to ${target}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
