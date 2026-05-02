import { getSiteConfig } from '@/lib/site'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

const isIndexablePublicUrl = (value?: string | null) => {
  if (!value) return false

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    if (LOCAL_HOSTS.has(url.hostname)) return false
    return true
  } catch {
    return false
  }
}

export const getCanonicalSiteUrl = () => {
  const site = getSiteConfig()
  const publicDomainUrl = `https://${site.domain}`
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    site.baseUrl,
    publicDomainUrl,
  ]

  return (candidates.find(isIndexablePublicUrl) ?? publicDomainUrl).replace(/\/$/, '')
}

export const toCanonicalUrl = (path = '') => {
  const baseUrl = getCanonicalSiteUrl()
  if (!path) return baseUrl
  if (/^https?:\/\//i.test(path)) return path

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
