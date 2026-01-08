import { NextResponse } from 'next/server'

import { createProduct, listProducts } from '@/lib/repositories/productRepository'

export async function GET() {
  try {
    const products = await listProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error al consultar productos', error)
    return NextResponse.json({ error: 'No se pudieron obtener productos desde la base de datos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const product = await createProduct(payload)
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear producto', error)
    return NextResponse.json({ error: error?.message ?? 'No se pudo crear el producto' }, { status: 400 })
  }
}
