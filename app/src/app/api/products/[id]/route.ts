import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type Params = {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variations: true },
  })

  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(req: Request, { params }: Params) {
  const payload = await req.json()

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: payload,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
