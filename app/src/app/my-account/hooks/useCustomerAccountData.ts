'use client'

import React from 'react'

import { requestApi } from '@/lib/apiClient'
import type { Order } from '../types'

type AccountUser = {
  id: string
  name: string
  email: string
  role?: 'customer' | 'admin'
}

type ProfileState = {
  firstName: string
  lastName: string
  phone: string
  gender: string
  birth: string
  documentType: string
  documentNumber: string
  businessName: string
}

type SavedAddressFields = {
  firstName: string
  lastName: string
  company: string
  country: string
  street: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
}

type SavedAddressEntry = {
  id: number
  title: string
  billing: SavedAddressFields
  shipping: SavedAddressFields
  isSame: boolean
}

type UseCustomerAccountDataParams = {
  user: AccountUser | null
  setUserOrders: React.Dispatch<React.SetStateAction<Order[]>>
  setUserOrdersLoading: React.Dispatch<React.SetStateAction<boolean>>
  setProfile: React.Dispatch<React.SetStateAction<ProfileState>>
  setProfileLoading: React.Dispatch<React.SetStateAction<boolean>>
  setSavedAddresses: React.Dispatch<React.SetStateAction<SavedAddressEntry[]>>
  setCurrentAddrIndex: React.Dispatch<React.SetStateAction<number>>
  setAddressLoading: React.Dispatch<React.SetStateAction<boolean>>
  showNotification: (text: string, type?: 'success' | 'error') => void
  handleLogout: () => void
}

export const useCustomerAccountData = ({
  user,
  setUserOrders,
  setUserOrdersLoading,
  setProfile,
  setProfileLoading,
  setSavedAddresses,
  setCurrentAddrIndex,
  setAddressLoading,
  showNotification,
  handleLogout,
}: UseCustomerAccountDataParams) => {
  React.useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token || !user || user.role === 'admin') return

    setUserOrdersLoading(true)
    requestApi<Order[]>('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUserOrders(res.body))
      .catch((err) => {
        console.error(err)
        if (err?.message && (err.message.includes('Error 401') || err.message.includes('No autorizado'))) {
          handleLogout()
          return
        }
        showNotification('No se pudieron cargar tus pedidos.', 'error')
        setUserOrders([])
      })
      .finally(() => setUserOrdersLoading(false))
  }, [handleLogout, setUserOrders, setUserOrdersLoading, showNotification, user])

  React.useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token || !user || user.role === 'admin') return

    setProfileLoading(true)
    requestApi<{ name?: string; profile?: ProfileState }>('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const apiProfile: Partial<ProfileState> = res.body.profile || {}
        const fallbackName = res.body.name || user.name || ''
        const [firstName, ...rest] = fallbackName.split(' ')
        setProfile({
          firstName: apiProfile.firstName || firstName || '',
          lastName: apiProfile.lastName || rest.join(' ') || '',
          phone: apiProfile.phone || '',
          gender: apiProfile.gender || '',
          birth: apiProfile.birth || '',
          documentType: apiProfile.documentType || '',
          documentNumber: apiProfile.documentNumber || '',
          businessName: apiProfile.businessName || '',
        })
      })
      .catch((err) => {
        console.error(err)
        showNotification('No se pudieron cargar los datos de perfil.', 'error')
      })
      .finally(() => setProfileLoading(false))
  }, [setProfile, setProfileLoading, showNotification, user])

  React.useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token || !user || user.role === 'admin') return

    setAddressLoading(true)
    requestApi<{ addresses: SavedAddressEntry[] }>('/api/user/addresses', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (Array.isArray(res.body.addresses) && res.body.addresses.length > 0) {
          setSavedAddresses(res.body.addresses)
          setCurrentAddrIndex(0)
        }
      })
      .catch((err) => {
        console.error(err)
        showNotification('No se pudieron cargar las direcciones guardadas.', 'error')
      })
      .finally(() => setAddressLoading(false))
  }, [setAddressLoading, setCurrentAddrIndex, setSavedAddresses, showNotification, user])
}
