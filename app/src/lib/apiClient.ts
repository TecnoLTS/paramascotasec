const buildBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  if (backendUrl) return backendUrl.replace(/\/$/, '').replace(/\/api$/, '')

  const explicitBase = process.env.NEXT_PUBLIC_BASE_URL
  if (explicitBase) return explicitBase.replace(/\/$/, '')

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, '')}`

  return `http://localhost:${process.env.PORT ?? 3000}`
}

const getTenantHost = () => {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL
  if (!base) return null
  try {
    return new URL(base).host
  } catch {
    return null
  }
}

const getTenantProto = () => {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL
  if (!base) return null
  try {
    return new URL(base).protocol.replace(':', '')
  } catch {
    return null
  }
}

const getServerForwardedHost = async () => {
  if (typeof window !== 'undefined') return null
  try {
    const mod = await import('next/headers')
    const headerList = await mod.headers()
    const utils = await import('@/lib/headerUtils')
    return utils.getHostFromHeaders(headerList)
  } catch {
    return null
  }
}

const getServerForwardedProto = async () => {
  if (typeof window !== 'undefined') return null
  try {
    const mod = await import('next/headers')
    const headerList = await mod.headers()
    const utils = await import('@/lib/headerUtils')
    return utils.getProtoFromHeaders(headerList)
  } catch {
    return null
  }
}

const resolveUrl = (path: string) => {
  if (path.startsWith('http')) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // Si estamos en el servidor (SSR), usamos la URL interna de Docker
  if (typeof window === 'undefined') {
    const internalUrl = process.env.BACKEND_URL_INTERNAL || 'http://paramascotasec-backend-web/api'
    return `${internalUrl.replace(/\/$/, '')}${normalizedPath.replace('/api', '')}`
  }

  // En el navegador usamos el mismo origen y dejamos que Next.js proxee internamente
  return normalizedPath
}

const authFreePaths = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify',
])

const isPublicEcomPath = (pathname: string, method?: string) => {
  if (pathname === '/api/products' || pathname.startsWith('/api/products/')) return true
  if (pathname === '/api/settings/shipping') return true
  if (pathname === '/api/health') return true
  if (pathname === '/api/orders/quote') return true
  return false
}

const getPathname = (pathOrUrl: string) => {
  try {
    if (pathOrUrl.startsWith('http')) return new URL(pathOrUrl).pathname
    return new URL(pathOrUrl, 'http://local').pathname
  } catch {
    return pathOrUrl
  }
}

const normalizeHeaders = (init?: RequestInit) => {
  const headers = new Headers(init?.headers || {})
  return headers
}

const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('authToken')
  } catch {
    return null
  }
}

const clearStoredToken = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  } catch {}
}

const withAuth = async (path: string, init?: RequestInit): Promise<RequestInit> => {
  const headers = normalizeHeaders(init)
  if (headers.has('Authorization')) {
    return { ...init, headers }
  }

  const pathname = getPathname(path)
  if (typeof window === 'undefined') {
    const forwardedHost = await getServerForwardedHost()
    const forwardedProto = await getServerForwardedProto()
    if (authFreePaths.has(pathname)) {
      const tenantHost = forwardedHost || getTenantHost()
      const tenantProto = forwardedProto || getTenantProto()
      if (tenantHost) {
        headers.set('x-forwarded-host', tenantHost)
        headers.set('host', tenantHost)
      }
      if (tenantProto) {
        headers.set('x-forwarded-proto', tenantProto)
      }
      return { ...init, headers }
    }
    const serviceToken = process.env.BACKEND_SERVICE_TOKEN
    const tenantHost = forwardedHost || getTenantHost()
    const tenantProto = forwardedProto || getTenantProto()
    if (tenantHost) {
      headers.set('x-forwarded-host', tenantHost)
      headers.set('host', tenantHost)
    }
    if (tenantProto) {
      headers.set('x-forwarded-proto', tenantProto)
    }
    if (isPublicEcomPath(pathname, init?.method)) {
      if (serviceToken) {
        headers.set('Authorization', `Bearer ${serviceToken}`)
      }
      return { ...init, headers }
    }
    if (serviceToken) {
      headers.set('Authorization', `Bearer ${serviceToken}`)
    }
    return { ...init, headers }
  }

  if (authFreePaths.has(pathname)) {
    return { ...init, headers }
  }
  if (isPublicEcomPath(pathname, init?.method)) {
    return { ...init, headers }
  }

  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return { ...init, headers }
}

const shouldRedirectToLogin = (status: number, body: unknown) => {
  if (status !== 401) return false
  if (!body || typeof body !== 'object') return true
  const code = (body as any)?.error?.code
  if (!code) return true
  return ['AUTH_REQUIRED', 'AUTH_TOKEN_INVALID', 'AUTH_TOKEN_REVOKED'].includes(code)
}

const isPanelRoute = (pathname: string) => {
  return pathname.startsWith('/my-account')
}

const handleAuthFailure = (status: number, body: unknown) => {
  if (typeof window === 'undefined') return
  if (!shouldRedirectToLogin(status, body)) return
  try {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  } catch {}
  const current = window.location.pathname + window.location.search
  if (!isPanelRoute(window.location.pathname)) {
    return
  }
  if (!current.startsWith('/login')) {
    window.location.href = `/login?next=${encodeURIComponent(current)}`
  }
}

export type ApiError = {
  message: string
  code?: string
  details?: unknown
}

export type ApiEnvelope<T> = {
  ok: boolean
  data?: T
  error?: ApiError
  message?: string
  meta?: Record<string, unknown>
}

const isEnvelope = (value: unknown): value is ApiEnvelope<unknown> => {
  if (!value || typeof value !== 'object') return false
  return Object.prototype.hasOwnProperty.call(value, 'ok')
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveUrl(path)
  const authedInit = await withAuth(path, init)
  const res = await fetch(url, { cache: 'no-store', ...authedInit })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  let body: unknown
  if (isJson) {
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }
  } else {
    body = await res.text()
  }

  const envelope = isJson && isEnvelope(body) ? (body as ApiEnvelope<T>) : null

  if (!res.ok && res.status === 401 && isPublicEcomPath(getPathname(path), init?.method)) {
    const token = getStoredToken()
    if (token) {
      clearStoredToken()
      const retryInit = await withAuth(path, { ...init, headers: undefined })
      const retryRes = await fetch(url, { cache: 'no-store', ...retryInit })
      const retryContentType = retryRes.headers.get('content-type') || ''
      const retryIsJson = retryContentType.includes('application/json')
      const retryBody = retryIsJson ? await retryRes.json() : await retryRes.text()
      if (retryRes.ok) {
        const retryEnvelope = retryIsJson && isEnvelope(retryBody) ? (retryBody as ApiEnvelope<T>) : null
        if (retryEnvelope) {
          if (!retryEnvelope.ok) {
            throw new Error(retryEnvelope.error?.message || retryEnvelope.message || 'Error desconocido')
          }
          return retryEnvelope.data as T
        }
        return retryBody as T
      }
      handleAuthFailure(retryRes.status, retryBody)
      let message = `Error ${retryRes.status} al consultar ${url}`
      if (typeof retryBody === 'string' && retryBody.length > 0) {
        message = retryBody
      } else if (typeof retryBody === 'object' && retryBody !== null) {
        message = (retryBody as any).error || (retryBody as any).message || message
      }
      throw new Error(message)
    }
  }

  if (!res.ok) {
    handleAuthFailure(res.status, body)
    let message = `Error ${res.status} al consultar ${url}`
    if (envelope?.error?.message) {
      message = envelope.error.message
    } else if (typeof body === 'string' && body.length > 0) {
      message = body
    } else if (typeof body === 'object' && body !== null) {
      message = (body as any).error || (body as any).message || message
    }
    throw new Error(message)
  }

  if (envelope) {
    if (!envelope.ok) {
      throw new Error(envelope.error?.message || envelope.message || 'Error desconocido')
    }
    return envelope.data as T
  }

  return body as T
}

export async function requestApi<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T }> {
  const url = resolveUrl(path)
  const authedInit = await withAuth(path, init)
  const res = await fetch(url, { cache: 'no-store', ...authedInit })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  let body: unknown
  if (isJson) {
    try {
      body = await res.json()
    } catch {
      body = await res.text()
    }
  } else {
    body = await res.text()
  }

  const envelope = isJson && isEnvelope(body) ? (body as ApiEnvelope<T>) : null

  if (!res.ok) {
    handleAuthFailure(res.status, body)
    const message = envelope?.error?.message
      || (typeof body === 'string' && body.length > 0 ? body : `Error ${res.status} al consultar ${url}`)
    throw new Error(message)
  }

  if (envelope) {
    if (!envelope.ok) {
      throw new Error(envelope.error?.message || envelope.message || 'Error desconocido')
    }
    return { ok: true, status: res.status, body: envelope.data as T }
  }

  return { ok: true, status: res.status, body: body as T }
}
/*
// Ejemplo de wrapper estandarizado para reuso
type EjemploResponse = { ok: boolean; message: string; timestamp: string }
export const fetchEjemplo = () => fetchJson<EjemploResponse>('/api/ejemplo')

// Ejemplo de wrapper estandarizado para reuso
type EjemploResponse2 = { ok: boolean; message: string; timestamp: string }
export const fetchEjemplo2 = () => fetchJson<EjemploResponse2>('/api/ejemplo2')

import { fetchEjemplo } from '@/lib/apiClient'

const load = async () => {
  try {
    const data = await fetchEjemplo() // devuelve { ok, message, timestamp }
    // usar data...
  } catch (err) {
    // manejar error
  }
}
  */
