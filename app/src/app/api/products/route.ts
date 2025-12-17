import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { mapProductsToDto, mapProductToDto } from '@/lib/productMapper'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { images: true, variations: true },
      orderBy: { createdAt: 'desc' },
    })

    const normalized = mapProductsToDto(products)
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error al consultar productos', error)
    return NextResponse.json({ error: 'No se pudieron obtener productos desde la base de datos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const payload = await req.json()

  const product = await prisma.product.create({
    data: payload,
    include: { images: true, variations: true },
  })

  return NextResponse.json(mapProductToDto(product), { status: 201 })
}
