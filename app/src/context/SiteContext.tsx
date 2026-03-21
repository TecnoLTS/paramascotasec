'use client'

import React, { createContext, useContext } from 'react'
import { getSiteConfig, type SiteConfig } from '@/lib/site'

const SiteContext = createContext<SiteConfig>(getSiteConfig())

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SiteContext.Provider value={getSiteConfig()}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
