import { NextResponse } from 'next/server'
import { resolveRequestProto, resolveTenantHost } from '@/lib/requestHost'

const resolveBackendUrl = () => {
  const base = process.env.BACKEND_URL_INTERNAL || 'http://paramascotasec-backend-web/api'
  return `${base.replace(/\/$/, '')}/products`
}

export async function GET(req: Request) {
  const token = process.env.BACKEND_SERVICE_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Service token missing' }, { status: 500 })
  }

  const host = resolveTenantHost(req.headers.get('x-forwarded-host') || req.headers.get('host'))
  const proto = resolveRequestProto(req.headers.get('x-forwarded-proto'), req.url)
  const outboundHeaders = new Headers({
    Authorization: `Bearer ${token}`,
  })
  if (host) {
    outboundHeaders.set('host', host)
    outboundHeaders.set('x-forwarded-host', host)
  }
  outboundHeaders.set('x-forwarded-proto', proto)

  const url = resolveBackendUrl()
  const res = await fetch(url, {
    cache: 'no-store',
    headers: outboundHeaders,
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    return NextResponse.json(body || { error: 'Failed to load suggestions' }, { status: res.status })
  }

  const data = body && typeof body === 'object' && 'data' in body ? (body as any).data : body
  return NextResponse.json(data ?? [])
}
