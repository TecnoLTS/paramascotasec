import { NextResponse } from 'next/server'

const resolveBackendUrl = () => {
  const base = process.env.BACKEND_URL_INTERNAL || 'http://paramascotasec-backend-web/api'
  return `${base.replace(/\/$/, '')}/orders/quote`
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

export async function POST(req: Request) {
  const token = process.env.BACKEND_SERVICE_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Service token missing' }, { status: 500 })
  }

  const payload = await req.json().catch(() => null)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const host = resolveTenantHost(req.headers.get('host'))
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const outboundHeaders = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })
  if (host) {
    outboundHeaders.set('host', host)
    outboundHeaders.set('x-forwarded-host', host)
  }
  outboundHeaders.set('x-forwarded-proto', proto)

  const url = resolveBackendUrl()
  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: outboundHeaders,
    body: JSON.stringify(payload),
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    return NextResponse.json(body || { error: 'Failed to get quote' }, { status: res.status })
  }

  const data = body && typeof body === 'object' && 'data' in body ? (body as any).data : body
  return NextResponse.json(data ?? {})
}
