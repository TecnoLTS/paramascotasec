import { requestApi } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'

export type AdminDiscountType = 'percent' | 'fixed'

export type AdminDiscountCode = {
  id: string
  code: string
  name?: string | null
  description?: string | null
  type: AdminDiscountType
  value: number
  min_subtotal: number
  max_discount?: number | null
  max_uses?: number | null
  used_count: number
  starts_at?: string | null
  ends_at?: string | null
  is_active: boolean
  metadata?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
}

export type AdminDiscountAuditRow = {
  id: string
  action: string
  code?: string | null
  reason?: string | null
  order_id?: string | null
  amount?: number | null
  created_at?: string | null
  user_id?: string | null
  payload?: Record<string, unknown> | null
}

export type AdminDiscountPayload = {
  code: string
  type: AdminDiscountType
  value: number
  name?: string | null
  description?: string | null
  min_subtotal?: number
  max_discount?: number | null
  max_uses?: number | null
  starts_at?: string | null
  ends_at?: string | null
  is_active?: boolean
  metadata?: Record<string, unknown> | null
}

export const listDiscounts = () =>
  requestApi<AdminDiscountCode[]>(apiEndpoints.discounts.list)

export const createDiscount = (payload: AdminDiscountPayload) =>
  requestApi<AdminDiscountCode>(apiEndpoints.discounts.list, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const updateDiscount = (id: string, payload: Partial<AdminDiscountPayload>) =>
  requestApi<AdminDiscountCode>(apiEndpoints.discounts.detail(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const updateDiscountStatus = (id: string, isActive: boolean) =>
  requestApi<AdminDiscountCode>(apiEndpoints.discounts.status(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: isActive }),
  })

export const listDiscountAudit = (limit = 20) =>
  requestApi<AdminDiscountAuditRow[]>(`${apiEndpoints.discounts.audit}?limit=${limit}`)
