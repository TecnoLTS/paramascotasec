import { handleProductImageUpload } from '@/lib/server/productImageUpload'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  return handleProductImageUpload(req)
}
