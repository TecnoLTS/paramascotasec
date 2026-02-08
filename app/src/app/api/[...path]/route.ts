import { NextRequest } from 'next/server'

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
  headers.delete('host')
  headers.delete('content-length')

  const pathname = req.nextUrl.pathname.replace(/^\/api/, '')
  const hasAuth = headers.has('authorization')
  const serviceToken = process.env.BACKEND_SERVICE_TOKEN
  if (!hasAuth && serviceToken) {
    if (req.method === 'GET') {
      if (
        pathname === '/products' ||
        pathname.startsWith('/products/') ||
        pathname === '/settings/shipping' ||
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
