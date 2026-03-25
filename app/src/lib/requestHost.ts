const readConfiguredBase = () => process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL

const INTERNAL_HOST_PATTERNS = [
  /^next-test-app$/i,
  /^app-dev$/i,
  /^app$/i,
  /-app-dev$/i,
  /-app$/i,
  /-backend-web$/i,
  /^backend-web$/i,
]

const isInternalHost = (host: string) => {
  if (!host) return false
  return INTERNAL_HOST_PATTERNS.some((pattern) => pattern.test(host))
}

export const getConfiguredTenantHost = () => {
  const base = readConfiguredBase()
  if (!base) return null
  try {
    return new URL(base).hostname
  } catch {
    return null
  }
}

export const getConfiguredTenantProto = () => {
  const base = readConfiguredBase()
  if (!base) return null
  try {
    return new URL(base).protocol.replace(':', '')
  } catch {
    return null
  }
}

export const normalizeHost = (host?: string | null) => {
  if (!host) return ''
  const trimmed = host.toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
  if (!trimmed) return ''
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']')
    if (end !== -1) return trimmed.slice(1, end)
  }
  return trimmed.replace(/:\d+$/, '')
}

export const resolveTenantHost = (incomingHost?: string | null) => {
  const normalizedIncoming = normalizeHost(incomingHost)
  if (normalizedIncoming && !isInternalHost(normalizedIncoming)) {
    return normalizedIncoming
  }
  return getConfiguredTenantHost() || null
}

export const resolveRequestProto = (forwardedProto?: string | null, requestUrl?: string | null) => {
  const candidate = forwardedProto?.split(',')[0]?.trim()?.toLowerCase()
  if (candidate === 'http' || candidate === 'https') {
    return candidate
  }
  if (requestUrl) {
    try {
      const url = new URL(requestUrl)
      const protocol = url.protocol.replace(':', '').toLowerCase()
      if (protocol === 'http' || protocol === 'https') {
        return protocol
      }
    } catch {}
  }
  return getConfiguredTenantProto() || 'http'
}
