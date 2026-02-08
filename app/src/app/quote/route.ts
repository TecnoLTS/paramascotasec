import { NextResponse } from 'next/server'

const resolveBackendUrl = () => {
  const base =
    process.env.BACKEND_URL_INTERNAL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://paramascotasec-backend-web/api'
  return `${base.replace(/\/$/, '')}/orders/quote`
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

  const url = resolveBackendUrl()
  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    return NextResponse.json(body || { error: 'Failed to get quote' }, { status: res.status })
  }

  const data = body && typeof body === 'object' && 'data' in body ? (body as any).data : body
  return NextResponse.json(data ?? {})
}
