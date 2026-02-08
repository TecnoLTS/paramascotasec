import { NextResponse } from 'next/server'

const resolveBackendUrl = () => {
  const base =
    process.env.BACKEND_URL_INTERNAL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://paramascotasec-backend-web/api'
  return `${base.replace(/\/$/, '')}/products`
}

export async function GET() {
  const token = process.env.BACKEND_SERVICE_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Service token missing' }, { status: 500 })
  }

  const url = resolveBackendUrl()
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    return NextResponse.json(body || { error: 'Failed to load suggestions' }, { status: res.status })
  }

  const data = body && typeof body === 'object' && 'data' in body ? (body as any).data : body
  return NextResponse.json(data ?? [])
}
