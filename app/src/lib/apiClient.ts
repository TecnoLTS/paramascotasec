const buildBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  if (backendUrl) return backendUrl.replace(/\/$/, '').replace(/\/api$/, '')

  const explicitBase = process.env.NEXT_PUBLIC_BASE_URL
  if (explicitBase) return explicitBase.replace(/\/$/, '')

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, '')}`

  return `http://localhost:${process.env.PORT ?? 3000}`
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

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveUrl(path)
  const res = await fetch(url, { cache: 'no-store', ...init })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    let message = `Error ${res.status} al consultar ${url}`
    if (typeof body === 'string' && body.length > 0) {
      message = body
    } else if (typeof body === 'object' && body !== null) {
      message = (body as any).error || (body as any).message || message
    }
    throw new Error(message)
  }

  return body as T
}

export async function requestApi<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T }> {
  const url = resolveUrl(path)
  const res = await fetch(url, { cache: 'no-store', ...init })
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message = typeof body === 'string' && body.length > 0
      ? body
      : `Error ${res.status} al consultar ${url}`
    throw new Error(message)
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
