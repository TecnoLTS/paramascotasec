import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import productData from '@/data/Product.json'

const seedIfEmpty = async () => {
  const count = await prisma.product.count()
  if (count > 0) return

  // Cargar datos iniciales desde Product.json solo si la tabla está vacía
  await Promise.all(
    productData.map((product) =>
      prisma.product.upsert({
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
    )
  )
}

export async function GET() {
  await seedIfEmpty()

  const products = await prisma.product.findMany({
    include: { images: true, variations: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const payload = await req.json()

  const product = await prisma.product.create({
    data: payload,
  })

  return NextResponse.json(product, { status: 201 })
}
