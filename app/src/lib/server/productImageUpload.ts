import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { resolveRequestProto, resolveTenantHost } from '@/lib/requestHost'
import { attachInternalProxyToken } from '@/lib/internalProxy'

const allowedKinds = new Set(['thumb', 'gallery'])
const allowedTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const maxUploadBytes = 8 * 1024 * 1024
const backendBase = (process.env.BACKEND_URL_INTERNAL || 'http://paramascotasec-backend-web/api').replace(/\/$/, '')

const hasJpegSignature = (buffer: Buffer) =>
  buffer.length >= 3
  && buffer[0] === 0xff
  && buffer[1] === 0xd8
  && buffer[2] === 0xff

const hasPngSignature = (buffer: Buffer) =>
  buffer.length >= 8
  && buffer[0] === 0x89
  && buffer[1] === 0x50
  && buffer[2] === 0x4e
  && buffer[3] === 0x47
  && buffer[4] === 0x0d
  && buffer[5] === 0x0a
  && buffer[6] === 0x1a
  && buffer[7] === 0x0a

const hasWebpSignature = (buffer: Buffer) =>
  buffer.length >= 12
  && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
  && buffer.subarray(8, 12).toString('ascii') === 'WEBP'

const matchesDeclaredImageType = (buffer: Buffer, mimeType: string) => {
  if (mimeType === 'image/jpeg') return hasJpegSignature(buffer)
  if (mimeType === 'image/png') return hasPngSignature(buffer)
  if (mimeType === 'image/webp') return hasWebpSignature(buffer)
  return false
}

const resolvePublicDir = async () => {
  const candidates = [
    process.env.UPLOADS_PUBLIC_DIR,
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '..', 'public'),
    path.join(process.cwd(), '..', '..', 'public'),
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate)
      if (stat.isDirectory()) return candidate
    } catch {}
  }

  const fallback = candidates[0] ?? path.join(process.cwd(), 'public')
  await fs.mkdir(fallback, { recursive: true })
  return fallback
}

const validateAdminRequest = async (req: Request) => {
  const authorization = req.headers.get('authorization')
  const cookieHeader = req.headers.get('cookie')
  if (!authorization && !cookieHeader) {
    return NextResponse.json(
      { ok: false, error: { message: 'No autorizado para subir imágenes.' } },
      { status: 401 }
    )
  }

  const headers = new Headers()
  if (authorization) {
    headers.set('authorization', authorization)
  }
  if (cookieHeader) {
    headers.set('cookie', cookieHeader)
  }
  const host = resolveTenantHost(req.headers.get('x-forwarded-host') || req.headers.get('host'))
  const proto = resolveRequestProto(req.headers.get('x-forwarded-proto'), req.url)
  if (host) {
    headers.set('host', host)
    headers.set('x-forwarded-host', host)
  }
  headers.set('x-forwarded-proto', proto)
  attachInternalProxyToken(headers)

  try {
    const res = await fetch(`${backendBase}/admin/dashboard/stats`, {
      cache: 'no-store',
      headers,
    })

    if (res.ok) {
      return null
    }

    return NextResponse.json(
      { ok: false, error: { message: 'No autorizado para subir imágenes.' } },
      { status: res.status === 401 ? 401 : 403 }
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: 'No se pudo validar la sesión de administrador.' } },
      { status: 502 }
    )
  }
}

export const handleProductImageUpload = async (req: Request) => {
  const authFailure = await validateAdminRequest(req)
  if (authFailure) {
    return authFailure
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const kind = formData.get('kind')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: { message: 'No se recibió ninguna imagen.' } }, { status: 400 })
    }

    const kindValue = typeof kind === 'string' && allowedKinds.has(kind) ? kind : 'gallery'
    const ext = allowedTypes[file.type]
    if (!ext) {
      return NextResponse.json({ ok: false, error: { message: 'Formato de imagen no permitido.' } }, { status: 400 })
    }

    if (file.size <= 0 || file.size > maxUploadBytes) {
      return NextResponse.json({ ok: false, error: { message: 'La imagen debe pesar entre 1 byte y 8MB.' } }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!matchesDeclaredImageType(buffer, file.type)) {
      return NextResponse.json({ ok: false, error: { message: 'El archivo no coincide con un formato de imagen permitido.' } }, { status: 400 })
    }

    const publicDir = await resolvePublicDir()
    const uploadDir = path.join(publicDir, 'uploads', 'products')
    await fs.mkdir(uploadDir, { recursive: true })
    const fileName = `img_${Date.now()}_${randomUUID()}.${ext}`
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({
      ok: true,
      data: {
        url: `/uploads/products/${fileName}`,
        kind: kindValue,
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: { message: 'No se pudo subir la imagen.' } }, { status: 500 })
  }
}
