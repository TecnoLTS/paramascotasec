import { defaultSiteId, siteConfig, type SiteConfig, type SiteId } from '@/config/siteConfig'

export type { SiteConfig, SiteId }

export { defaultSiteId }

export const getSiteId = (): SiteId => defaultSiteId

export const getSiteConfig = (): SiteConfig => siteConfig
