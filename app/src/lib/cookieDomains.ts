const trimHost = (value?: string | null) => {
  if (!value) return ''
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .replace(/:\d+$/, '')
}

const csvHosts = (value?: string | null) =>
  (value || '')
    .split(',')
    .map(trimHost)
    .filter(Boolean)

const hostFromUrl = (value?: string | null) => {
  if (!value) return ''
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return trimHost(value)
  }
}

export const getConfiguredCookieDomains = () => {
  const primary =
    trimHost(process.env.NEXT_PUBLIC_SITE_DOMAIN) ||
    trimHost(process.env.PRIMARY_SITE_DOMAIN) ||
    hostFromUrl(process.env.NEXT_PUBLIC_BASE_URL) ||
    'paramascotasec.com'

  const aliases = [
    ...csvHosts(process.env.NEXT_PUBLIC_SITE_ALIASES),
    ...csvHosts(process.env.PRIMARY_SITE_ALIASES),
  ]

  const domains = new Set<string>()
  for (const host of [primary, ...aliases]) {
    if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) continue
    domains.add(host)
    domains.add(`.${host.replace(/^\./, '')}`)
  }

  return Array.from(domains)
}
