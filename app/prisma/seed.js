/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')
const productData = require('../src/data/Product.json')

const prisma = new PrismaClient()

async function main() {
  for (const product of productData) {
    await prisma.product.upsert({
      where: { legacyId: product.id },
      update: {},
      create: {
        legacyId: product.id,
        category: product.category,
        name: product.name,
        gender: product.gender,
        new: product.new,
        sale: product.sale,
        price: product.price,
        originPrice: product.originPrice,
        brand: product.brand,
        sold: product.sold,
        quantity: product.quantity,
        description: product.description,
        action: product.action,
        slug: product.slug,
        images: { create: product.images.map((url) => ({ url })) },
        variations: {
          create: product.variation.map((v) => ({
            color: v.color,
            colorCode: v.colorCode,
            colorImage: v.colorImage,
            image: v.image,
          })),
        },
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
