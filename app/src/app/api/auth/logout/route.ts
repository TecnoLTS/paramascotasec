import { NextRequest } from 'next/server'
import { resolveRequestProto, resolveTenantHost } from '@/lib/requestHost'
import { attachInternalProxyToken } from '@/lib/internalProxy'

export const dynamic = 'force-dynamic'

const getBackendBase = () => (process.env.BACKEND_URL_INTERNAL || 'http://paramascotasec-backend-web/api').replace(/\/$/, '')

const buildExpiredCookie = (name: string, options?: { domain?: string; httpOnly?: boolean }) => {
  const parts = [
    `${name}=`,
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'SameSite=Lax',
    'Secure',
  ]
  if (options?.httpOnly) parts.push('HttpOnly')
  if (options?.domain) parts.push(`Domain=${options.domain}`)
  return parts.join('; ')
}

const appendLogoutCookies = (headers: Headers) => {
  const authCookie = (process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || process.env.AUTH_COOKIE_NAME || 'pm_auth').trim() || 'pm_auth'
  const csrfCookie = (process.env.NEXT_PUBLIC_AUTH_CSRF_COOKIE_NAME || process.env.AUTH_CSRF_COOKIE_NAME || 'pm_csrf').trim() || 'pm_csrf'

  // Host-only cookies.
  headers.append('Set-Cookie', buildExpiredCookie(authCookie, { httpOnly: true }))
  headers.append('Set-Cookie', buildExpiredCookie(csrfCookie))

  // Also clear explicit domain cookies (covers older deployments / www variants).
  headers.append('Set-Cookie', buildExpiredCookie(authCookie, { domain: 'paramascotasec.com', httpOnly: true }))
  headers.append('Set-Cookie', buildExpiredCookie(csrfCookie, { domain: 'paramascotasec.com' }))
  headers.append('Set-Cookie', buildExpiredCookie(authCookie, { domain: '.paramascotasec.com', httpOnly: true }))
  headers.append('Set-Cookie', buildExpiredCookie(csrfCookie, { domain: '.paramascotasec.com' }))

  headers.append('Set-Cookie', buildExpiredCookie(authCookie, { domain: 'www.paramascotasec.com', httpOnly: true }))
  headers.append('Set-Cookie', buildExpiredCookie(csrfCookie, { domain: 'www.paramascotasec.com' }))
}

export const POST = async (req: NextRequest) => {
  const base = getBackendBase()
  const targetUrl = `${base}/auth/logout${req.nextUrl.search}`

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
    method: 'POST',
    headers,
    body: await req.text(),
    cache: 'no-store',
  }

  let backendRes: Response | null = null
  try {
    backendRes = await fetch(targetUrl, init)
  } catch {
    backendRes = null
  }

  const resHeaders = new Headers(backendRes?.headers)
  resHeaders.delete('content-encoding')
  resHeaders.delete('content-length')
  resHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  resHeaders.set('Pragma', 'no-cache')
  resHeaders.set('Expires', '0')
  // Hard logout: clear client-side storage and cookies for this origin.
  resHeaders.set('Clear-Site-Data', '"cookies", "storage"')
  appendLogoutCookies(resHeaders)

  const body = backendRes ? await backendRes.arrayBuffer() : new TextEncoder().encode(JSON.stringify({ ok: true }))
  const status = backendRes?.status ?? 200

  return new Response(body, { status, headers: resHeaders })
}
