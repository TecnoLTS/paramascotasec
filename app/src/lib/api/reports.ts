import { fetchJson } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'

export type RecentOrdersReport = {
  orders: any[]
  limit: number
}

export const fetchRecentOrdersReport = (limit = 5) =>
  fetchJson<RecentOrdersReport>(`${apiEndpoints.reports.recentOrders}?limit=${limit}`)
