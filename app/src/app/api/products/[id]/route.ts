import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { mapProductToDto } from '@/lib/productMapper'

type Params = {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: params.id }, { legacyId: params.id }],
    },
    include: { images: true, variations: true },
  })

  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(mapProductToDto(product))
}

export async function PUT(req: Request, { params }: Params) {
  const payload = await req.json()

  const target = await prisma.product.findFirst({
    where: { OR: [{ id: params.id }, { legacyId: params.id }] },
  })

  if (!target) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.product.update({
    where: { id: target.id },
    data: payload,
    include: { images: true, variations: true },
  })

  return NextResponse.json(mapProductToDto(updated))
}

export async function DELETE(_req: Request, { params }: Params) {
  const target = await prisma.product.findFirst({
    where: { OR: [{ id: params.id }, { legacyId: params.id }] },
  })

  if (!target) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.product.delete({ where: { id: target.id } })
  return NextResponse.json({ ok: true })
}
