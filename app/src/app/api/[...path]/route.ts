import { NextRequest } from 'next/server'
import { resolveRequestProto, resolveTenantHost } from '@/lib/requestHost'
import { attachInternalProxyToken } from '@/lib/internalProxy'

const getBackendBase = () => {
  return (process.env.BACKEND_URL_INTERNAL || 'http://paramascotasec-backend-web/api').replace(/\/$/, '')
}

const buildTargetUrl = (req: NextRequest) => {
  const base = getBackendBase()
  const path = req.nextUrl.pathname.replace(/^\/api/, '')
  return `${base}${path}${req.nextUrl.search}`
}

const forward = async (req: NextRequest) => {
  const targetUrl = buildTargetUrl(req)
  const headers = new Headers(req.headers)
  headers.delete('content-length')
  headers.delete('x-internal-proxy-token')
  const tenantHost = resolveTenantHost(req.headers.get('x-forwarded-host') || req.headers.get('host'))
  const forwardedProto = resolveRequestProto(req.headers.get('x-forwarded-proto'), req.url)
  if (tenantHost) {
    headers.set('host', tenantHost)
    headers.set('x-forwarded-host', tenantHost)
  }
  headers.set('x-forwarded-proto', forwardedProto)
  attachInternalProxyToken(headers)

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
    cache: 'no-store',
  }

  const res = await fetch(targetUrl, init)
  const resHeaders = new Headers(res.headers)
  resHeaders.delete('content-encoding')
  resHeaders.delete('content-length')

  return new Response(await res.arrayBuffer(), {
    status: res.status,
    headers: resHeaders,
  })
}

export const GET = forward
export const POST = forward
export const PUT = forward
export const PATCH = forward
export const DELETE = forward
export const OPTIONS = forward
