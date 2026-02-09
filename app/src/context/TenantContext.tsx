'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { TenantConfig, TenantId, getTenantConfig, defaultTenantId } from '@/lib/tenant'

const TenantContext = createContext<TenantConfig>(getTenantConfig(defaultTenantId))

export const TenantProvider: React.FC<{ tenantId: TenantId; children: React.ReactNode }> = ({
  tenantId,
  children,
}) => {
  const value = useMemo(() => getTenantConfig(tenantId), [tenantId])
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export const useTenant = () => useContext(TenantContext)

