import { NextResponse } from 'next/server'
import { resolveRequestProto, resolveTenantHost } from '@/lib/requestHost'
import { attachInternalProxyToken } from '@/lib/internalProxy'
import { mapProductsToDto } from '@/lib/productMapper'
import { groupCatalogProducts } from '@/lib/catalog'
import { buildProductSearchIndex, filterProductsBySearch, sanitizeProductSearchQuery } from '@/lib/productSearch'

const resolveBackendUrl = () => {
  const base = process.env.BACKEND_URL_INTERNAL || 'http://paramascotasec-backend-web/api'
  return `${base.replace(/\/$/, '')}/products`
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = sanitizeProductSearchQuery(searchParams.get('query') ?? '')
    const rawLimit = Number(searchParams.get('limit') ?? 0)
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 0

    const host = resolveTenantHost(req.headers.get('x-forwarded-host') || req.headers.get('host'))
    const proto = resolveRequestProto(req.headers.get('x-forwarded-proto'), req.url)
    const outboundHeaders = new Headers()
    if (host) {
      outboundHeaders.set('host', host)
      outboundHeaders.set('x-forwarded-host', host)
    }
    outboundHeaders.set('x-forwarded-proto', proto)
    attachInternalProxyToken(outboundHeaders)

    const res = await fetch(resolveBackendUrl(), {
      cache: 'no-store',
      headers: outboundHeaders,
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      return NextResponse.json(body || { error: 'Failed to load suggestions' }, { status: res.status })
    }

    const payload = body && typeof body === 'object' && 'data' in body ? (body as any).data : body
    const products = groupCatalogProducts(mapProductsToDto(Array.isArray(payload) ? payload : []))

    if (!query) {
      return NextResponse.json(limit > 0 ? products.slice(0, limit) : products)
    }

    const productSearchIndex = buildProductSearchIndex(products)
    const filteredProducts = filterProductsBySearch(products, query, productSearchIndex)

    return NextResponse.json(limit > 0 ? filteredProducts.slice(0, limit) : filteredProducts)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to load suggestions' },
      { status: 500 }
    )
  }
}
