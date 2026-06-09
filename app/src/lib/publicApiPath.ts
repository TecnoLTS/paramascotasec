const trimSlashes = (value: string) => value.trim().replace(/^\/+|\/+$/g, '')

const normalizeLogicalApiPath = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.replace(/\/{2,}/g, '/')
}

export const getPublicApiBasePath = () => {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_PATH?.trim()
  if (explicit) {
    const normalized = explicit.startsWith('/') ? explicit : `/${explicit}`
    return normalized.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/api'
  }

  const tenant = trimSlashes(process.env.NEXT_PUBLIC_TENANT_SLUG || 'paramascotasec')
  const apiSegment = trimSlashes(process.env.NEXT_PUBLIC_API_SERVICE_SEGMENT || 'api')
  return `/${tenant}/${apiSegment}`.replace(/\/{2,}/g, '/')
}

const apiSuffix = (logicalPath: string) => {
  const normalized = normalizeLogicalApiPath(logicalPath)
  if (/^https?:\/\//i.test(normalized)) return normalized
  return normalized.replace(/^\/api(?=\/|$)/, '') || ''
}

export const toPublicApiPath = (logicalPath: string) => {
  const normalized = normalizeLogicalApiPath(logicalPath)
  if (/^https?:\/\//i.test(normalized)) return normalized
  const suffix = apiSuffix(normalized)
  return `${getPublicApiBasePath()}${suffix}`.replace(/\/{2,}/g, '/')
}

export const toPublicApiUrl = (logicalPath: string) => {
  const normalized = normalizeLogicalApiPath(logicalPath)
  if (/^https?:\/\//i.test(normalized)) return normalized

  const suffix = apiSuffix(normalized)
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
  if (configured) {
    const base = configured.replace(/\/$/, '')
    return `${base}${suffix}`.replace(/([^:]\/)\/+/g, '$1')
  }

  return toPublicApiPath(normalized)
}
