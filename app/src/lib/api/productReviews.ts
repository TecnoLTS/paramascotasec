import { fetchJson, requestApi } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'

export type ProductReview = {
  id: string
  productId?: string
  orderId?: string
  orderItemId?: string
  userId?: string
  rating: number
  title?: string | null
  body: string
  authorName: string
  status?: string
  createdAt?: string | null
  updatedAt?: string | null
}

export type ProductReviewSummary = {
  count: number
  average: number
}

export type ProductReviewsPayload = {
  summary: ProductReviewSummary
  reviews: ProductReview[]
}

const emptyReviewsPayload: ProductReviewsPayload = {
  summary: { count: 0, average: 0 },
  reviews: [],
}

export const getProductReviews = async (id: string): Promise<ProductReviewsPayload> => {
  if (!id) return emptyReviewsPayload
  try {
    const data = await fetchJson<ProductReviewsPayload>(apiEndpoints.productReviews(id), { cache: 'no-store' })
    return {
      summary: {
        count: Number(data?.summary?.count ?? 0),
        average: Number(data?.summary?.average ?? 0),
      },
      reviews: Array.isArray(data?.reviews) ? data.reviews : [],
    }
  } catch {
    return emptyReviewsPayload
  }
}

export const submitProductReview = (id: string, payload: { rating: number; title?: string; body: string; authorName?: string }) =>
  requestApi<ProductReview>(apiEndpoints.productReviews(id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const listAdminProductReviews = (params?: { status?: string; productId?: string; limit?: number }) => {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.productId) query.set('productId', params.productId)
  if (params?.limit) query.set('limit', String(params.limit))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return requestApi<ProductReview[]>(`${apiEndpoints.adminReviews}${suffix}`)
}

export const updateAdminProductReviewStatus = (id: string, status: 'pending' | 'approved' | 'rejected') =>
  requestApi<ProductReview>(apiEndpoints.adminReview(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
