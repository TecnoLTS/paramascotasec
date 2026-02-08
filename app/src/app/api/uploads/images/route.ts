import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const allowedKinds = new Set(['thumb', 'gallery'])
const allowedTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
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

export async function POST(req: Request) {
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

    const buffer = Buffer.from(await file.arrayBuffer())
    const publicDir = await resolvePublicDir()
    const uploadDir = path.join(publicDir, 'uploads', 'products')
    await fs.mkdir(uploadDir, { recursive: true })
    const fileName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, buffer)

    const url = `/uploads/products/${fileName}`

    return NextResponse.json({
      ok: true,
      data: {
        url,
        kind: kindValue
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: { message: 'No se pudo subir la imagen.' } }, { status: 500 })
  }
}
