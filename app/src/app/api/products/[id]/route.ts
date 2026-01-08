import { NextResponse } from 'next/server'

import { deleteProduct, getProduct, updateProduct } from '@/lib/repositories/productRepository'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al consultar producto', error)
    return NextResponse.json({ error: 'No se pudo obtener el producto' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const payload = await req.json()
    const updated = await updateProduct(id, payload)

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error al actualizar producto', error)
    return NextResponse.json({ error: error?.message ?? 'No se pudo actualizar el producto' }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const deleted = await deleteProduct(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al eliminar producto', error)
    return NextResponse.json({ error: 'No se pudo eliminar el producto' }, { status: 500 })
  }
}
