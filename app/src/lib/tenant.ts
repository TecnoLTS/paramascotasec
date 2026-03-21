import {
  defaultSiteId,
  siteConfig,
  type CategoryCard,
  type CategoryFilter,
  type CategoryLink,
  type MenuLink,
  type MenuSection,
  type SiteConfig,
  type SiteId,
} from '@/config/siteConfig'

// Compatibilidad: el proyecto ya es de un solo sitio, pero varios componentes
// siguen importando desde tenant.ts. Mantengo esta capa minima para no romperlos.
export type TenantId = SiteId
export type TenantConfig = SiteConfig

export {
  type CategoryCard,
  type CategoryFilter,
  type CategoryLink,
  type MenuLink,
  type MenuSection,
}

export const defaultTenantId: TenantId = defaultSiteId

const normalizeHost = (host?: string | null) => {
  if (!host) return ''
  return host.toLowerCase().replace(/^https?:\/\//, '').split('/')[0].replace(/:\d+$/, '').replace(/^www\./, '')
}

export const getTenantIdFromHost = (host?: string | null): TenantId => {
  const normalized = normalizeHost(host)
  if (normalized === 'paramascotasec.com') return 'paramascotasec'
  return defaultTenantId
}

export const getTenantConfig = (_tenantId?: TenantId) => siteConfig

export const getTenantConfigFromHost = (host?: string | null) =>
  getTenantConfig(getTenantIdFromHost(host))
