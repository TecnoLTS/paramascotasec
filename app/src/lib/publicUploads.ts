const configuredHosts = () => {
  const primary = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'paramascotasec.com'
  const aliases = process.env.NEXT_PUBLIC_SITE_ALIASES || `www.${primary}`
  return new Set(
    [primary, ...aliases.split(',')]
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean)
  )
}

export const isPublicUploadUrl = (src: string) => {
  if (src.startsWith('/uploads/')) return true
  try {
    const url = new URL(src)
    return url.protocol === 'https:' && configuredHosts().has(url.hostname.toLowerCase()) && url.pathname.startsWith('/uploads/')
  } catch {
    return false
  }
}
