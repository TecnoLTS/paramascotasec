'use client'

import React from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import type { AdminReportSection } from '../types'

type AccountUser = {
  id: string
  name: string
  email: string
  role?: 'customer' | 'admin'
}

type UseAuthBootstrapParams = {
  router: AppRouterInstance
  setAuthBootstrapping: React.Dispatch<React.SetStateAction<boolean>>
  setUser: React.Dispatch<React.SetStateAction<AccountUser | null>>
  setAdminReportSection: React.Dispatch<React.SetStateAction<AdminReportSection>>
  setActiveTab: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const useAuthBootstrap = ({
  router,
  setAuthBootstrapping,
  setUser,
  setAdminReportSection,
  setActiveTab,
}: UseAuthBootstrapParams) => {
  React.useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('user')

    if (!token) {
      setAuthBootstrapping(false)
      router.replace('/login')
      return
    }

    if (!userData) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setAuthBootstrapping(false)
      router.replace('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser?.id || !parsedUser?.name || !parsedUser?.email) {
        throw new Error('Usuario local inválido')
      }

      setUser(parsedUser)
      if (parsedUser.role === 'admin') {
        setAdminReportSection('general')
        setActiveTab('reports')
      } else {
        setActiveTab('dashboard')
      }
    } catch {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      router.replace('/login')
    } finally {
      setAuthBootstrapping(false)
    }
  }, [router, setActiveTab, setAdminReportSection, setAuthBootstrapping, setUser])
}
