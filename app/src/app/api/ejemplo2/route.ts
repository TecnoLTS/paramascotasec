import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: 'Hola desde /api/ejemplo2',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
