'use client'

import React from 'react'

import { requestApi } from '@/lib/apiClient'
import { ADMIN_PRODUCTS_ENDPOINT, RETRYABLE_PANEL_ERROR_PATTERN, withTransientRetry } from '../utils'
import {
  ADMIN_TABS_WITH_ORDERS,
  ADMIN_TABS_WITH_PRICING_SETTINGS,
  ADMIN_TABS_WITH_PRODUCTS,
  ADMIN_TABS_WITH_REFERENCE_DATA,
  ADMIN_TABS_WITH_SHIPPING_SETTINGS,
  ADMIN_TABS_WITH_STATS,
  ADMIN_TABS_WITH_USERS,
  ADMIN_TABS_WITH_VAT_SETTINGS,
} from '../adminDataScopes'
import type {
  AdminUserSummary,
  DashboardStats,
  Order,
  ShippingPickup,
  ShippingProvider,
} from '../types'

type AccountUser = {
  id: string
  name: string
  email: string
  role?: 'customer' | 'admin'
}

type UseAdminDataLoaderParams = {
  activeTab?: string
  salesRankingMonth: string
  user: AccountUser | null
  adminReloadNonce: number
  handleLogout: () => void
  setAdminDataLoading: React.Dispatch<React.SetStateAction<boolean>>
  setAdminDataError: React.Dispatch<React.SetStateAction<string | null>>
  setDashboardStats: React.Dispatch<React.SetStateAction<DashboardStats | null>>
  setAdminProductsList: React.Dispatch<React.SetStateAction<any[]>>
  setAdminUsersList: React.Dispatch<React.SetStateAction<AdminUserSummary[]>>
  setAdminOrdersList: React.Dispatch<React.SetStateAction<Order[]>>
  setShippingProviders: React.Dispatch<React.SetStateAction<ShippingProvider[]>>
  setShippingPickups: React.Dispatch<React.SetStateAction<ShippingPickup[]>>
  setPosLoading: React.Dispatch<React.SetStateAction<boolean>>
  loadVatRate: (options?: { silent?: boolean }) => Promise<void>
  loadShippingRates: (options?: { silent?: boolean }) => Promise<void>
  loadPricingSettings: () => Promise<void>
  loadProductReferenceData: (options?: { silent?: boolean }) => Promise<void>
  loadRecentPurchaseInvoices: (options?: { silent?: boolean }) => Promise<void>
  loadStoreStatus: () => Promise<void>
  loadProductPageSettings: () => Promise<void>
  loadPosSnapshot: () => Promise<void>
  normalizeAdminProducts: (products: any[]) => any[]
}

export const useAdminDataLoader = ({
  activeTab,
  salesRankingMonth,
  user,
  adminReloadNonce,
  handleLogout,
  setAdminDataLoading,
  setAdminDataError,
  setDashboardStats,
  setAdminProductsList,
  setAdminUsersList,
  setAdminOrdersList,
  setShippingProviders,
  setShippingPickups,
  setPosLoading,
  loadVatRate,
  loadShippingRates,
  loadPricingSettings,
  loadProductReferenceData,
  loadRecentPurchaseInvoices,
  loadStoreStatus,
  loadProductPageSettings,
  loadPosSnapshot,
  normalizeAdminProducts,
}: UseAdminDataLoaderParams) => {
  const handlersRef = React.useRef({
    handleLogout,
    setAdminDataLoading,
    setAdminDataError,
    setDashboardStats,
    setAdminProductsList,
    setAdminUsersList,
    setAdminOrdersList,
    setShippingProviders,
    setShippingPickups,
    setPosLoading,
    loadVatRate,
    loadShippingRates,
    loadPricingSettings,
    loadProductReferenceData,
    loadRecentPurchaseInvoices,
    loadStoreStatus,
    loadProductPageSettings,
    loadPosSnapshot,
    normalizeAdminProducts,
  })

  React.useEffect(() => {
    handlersRef.current = {
      handleLogout,
      setAdminDataLoading,
      setAdminDataError,
      setDashboardStats,
      setAdminProductsList,
      setAdminUsersList,
      setAdminOrdersList,
      setShippingProviders,
      setShippingPickups,
      setPosLoading,
      loadVatRate,
      loadShippingRates,
      loadPricingSettings,
      loadProductReferenceData,
      loadRecentPurchaseInvoices,
      loadStoreStatus,
      loadProductPageSettings,
      loadPosSnapshot,
      normalizeAdminProducts,
    }
  }, [
    handleLogout,
    setAdminDataLoading,
    setAdminDataError,
    setDashboardStats,
    setAdminProductsList,
    setAdminUsersList,
    setAdminOrdersList,
    setShippingProviders,
    setShippingPickups,
    setPosLoading,
    loadVatRate,
    loadShippingRates,
    loadPricingSettings,
    loadProductReferenceData,
    loadRecentPurchaseInvoices,
    loadStoreStatus,
    loadProductPageSettings,
    loadPosSnapshot,
    normalizeAdminProducts,
  ])

  React.useEffect(() => {
    const current = handlersRef.current

    if (!user || user.role !== 'admin' || !activeTab) {
      current.setAdminDataLoading(false)
      current.setAdminDataError(null)
      return
    }

    let cancelled = false
    const headers = {}

    const handleError = (error: any) => {
      console.error(error)
      const message = String(error?.message || '')
      if (message.includes('Error 401') || message.includes('Unauthenticated')) {
        current.handleLogout()
        return
      }

      if (!cancelled) {
        if (RETRYABLE_PANEL_ERROR_PATTERN.test(message)) {
          current.setAdminDataError('Hubo inestabilidad temporal del servidor. Reintenta en unos segundos.')
        } else {
          current.setAdminDataError('No se pudieron actualizar algunos datos del panel.')
        }
      }
    }

    const loadAdminData = async () => {
      if (!cancelled) {
        current.setAdminDataLoading(true)
        current.setAdminDataError(null)
      }

      const tasks: Array<Promise<any>> = []

      if (ADMIN_TABS_WITH_STATS.has(activeTab)) {
        const monthQuery = /^\d{4}-(0[1-9]|1[0-2])$/.test(salesRankingMonth)
          ? `?month=${encodeURIComponent(salesRankingMonth)}`
          : ''
        tasks.push(
          withTransientRetry(() => requestApi<DashboardStats>(`/api/admin/dashboard/stats${monthQuery}`, { headers })).then((res) => {
            if (!cancelled) current.setDashboardStats(res.body)
          }),
        )
      }

      if (ADMIN_TABS_WITH_VAT_SETTINGS.has(activeTab)) {
        tasks.push(current.loadVatRate({ silent: true }))
      }

      if (ADMIN_TABS_WITH_SHIPPING_SETTINGS.has(activeTab)) {
        tasks.push(current.loadShippingRates({ silent: true }))
      }

      if (ADMIN_TABS_WITH_PRODUCTS.has(activeTab)) {
        tasks.push(
          withTransientRetry(() => requestApi<any[]>(ADMIN_PRODUCTS_ENDPOINT, { headers })).then((res) => {
            if (!cancelled) current.setAdminProductsList(current.normalizeAdminProducts(res.body))
          }),
        )
      }

      if (ADMIN_TABS_WITH_REFERENCE_DATA.has(activeTab)) {
        tasks.push(current.loadProductReferenceData({ silent: true }))
      }

      if (activeTab === 'inventory') {
        tasks.push(current.loadRecentPurchaseInvoices({ silent: true }))
      }

      if (ADMIN_TABS_WITH_USERS.has(activeTab)) {
        tasks.push(
          withTransientRetry(() => requestApi<AdminUserSummary[]>('/api/users', { headers })).then((res) => {
            if (!cancelled) {
              current.setAdminUsersList(Array.isArray(res.body) ? res.body : [])
            }
          }),
        )
      }

      if (ADMIN_TABS_WITH_ORDERS.has(activeTab)) {
        tasks.push(
          withTransientRetry(() => requestApi<Order[]>('/api/orders', { headers })).then((res) => {
            if (!cancelled) current.setAdminOrdersList(res.body)
          }),
        )
      }

      if (ADMIN_TABS_WITH_PRICING_SETTINGS.has(activeTab)) {
        tasks.push(current.loadPricingSettings())
      }

      if (activeTab === 'product-page') {
        tasks.push(current.loadProductPageSettings())
      }

      if (activeTab === 'store-status') {
        tasks.push(current.loadStoreStatus())
      }

      if (activeTab === 'local-sales') {
        if (!cancelled) current.setPosLoading(true)
        tasks.push(
          current.loadPosSnapshot().finally(() => {
            if (!cancelled) current.setPosLoading(false)
          }),
        )
      }

      if (activeTab === 'shipments') {
        tasks.push(
          withTransientRetry(() => requestApi<{ providers?: ShippingProvider[]; pickups?: ShippingPickup[] }>('/api/shipments', { headers })).then((res) => {
            if (!cancelled) {
              current.setShippingProviders(Array.isArray(res.body.providers) ? res.body.providers : [])
              current.setShippingPickups(Array.isArray(res.body.pickups) ? res.body.pickups : [])
            }
          }),
        )
      }

      const results = await Promise.allSettled(tasks)
      results.forEach((result) => {
        if (result.status === 'rejected') {
          handleError(result.reason)
        }
      })

      if (!cancelled) {
        current.setAdminDataLoading(false)
      }
    }

    loadAdminData()

    return () => {
      cancelled = true
    }
  }, [activeTab, salesRankingMonth, user, adminReloadNonce])
}
