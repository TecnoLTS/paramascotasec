import { NextRequest } from 'next/server'

const getBackendBase = () => {
  return (process.env.BACKEND_URL_INTERNAL || 'http://paramascotasec-backend-web/api').replace(/\/$/, '')
}

const buildTargetUrl = (req: NextRequest) => {
  const base = getBackendBase()
  const path = req.nextUrl.pathname.replace(/^\/api/, '')
  return `${base}${path}${req.nextUrl.search}`
}

const normalizeHost = (host?: string | null) => {
  if (!host) return ''
  const trimmed = host.toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
  if (!trimmed) return ''
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']')
    if (end !== -1) return trimmed.slice(1, end)
  }
  return trimmed.replace(/:\d+$/, '')
}

const isLocalOrIpHost = (host: string) => {
  if (!host) return true
  if (host === 'localhost' || host.endsWith('.local')) return true
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true
  if (host.includes(':') && /^[0-9a-f:]+$/i.test(host)) return true
  return false
}

const getConfiguredTenantHost = () => {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL
  if (!base) return null
  try {
    return new URL(base).hostname
  } catch {
    return null
  }
}

const resolveTenantHost = (incomingHost?: string | null) => {
  const normalizedIncoming = normalizeHost(incomingHost)
  if (normalizedIncoming && !isLocalOrIpHost(normalizedIncoming)) return normalizedIncoming
  return getConfiguredTenantHost() || normalizedIncoming || null
}

const forward = async (req: NextRequest) => {
  const targetUrl = buildTargetUrl(req)
  const headers = new Headers(req.headers)
  headers.delete('content-length')
  const tenantHost = resolveTenantHost(req.headers.get('host'))
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https'
  if (tenantHost) {
    headers.set('host', tenantHost)
    headers.set('x-forwarded-host', tenantHost)
  }
  headers.set('x-forwarded-proto', forwardedProto)

  const pathname = req.nextUrl.pathname.replace(/^\/api/, '')
  const hasAuth = headers.has('authorization')
  const serviceToken = process.env.BACKEND_SERVICE_TOKEN
  if (!hasAuth && serviceToken) {
    if (req.method === 'GET') {
      if (
        pathname === '/products' ||
        pathname.startsWith('/products/') ||
        pathname === '/settings/shipping' ||
        pathname === '/settings/store-status' ||
        pathname === '/health'
      ) {
        headers.set('Authorization', `Bearer ${serviceToken}`)
      }
    }
    if (req.method === 'POST' && pathname === '/orders/quote') {
      headers.set('Authorization', `Bearer ${serviceToken}`)
    }
  }

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
