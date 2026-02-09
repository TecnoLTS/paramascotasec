export type HeadersLike =
  | { get?: (name: string) => string | null | undefined }
  | Record<string, string | string[] | undefined | null>
  | null
  | undefined

const normalizeName = (name: string) => name.toLowerCase()

const readFromRecord = (headersLike: Record<string, any>, name: string) => {
  const lower = normalizeName(name)
  return (
    headersLike[lower] ??
    headersLike[name] ??
    headersLike[lower.replace(/-/g, '_')] ??
    headersLike[name.replace(/-/g, '_')] ??
    null
  )
}

export const getHeaderValue = (headersLike: HeadersLike, name: string) => {
  if (!headersLike) return null
  const getter = (headersLike as any).get
  if (typeof getter === 'function') {
    return getter.call(headersLike, name) ?? null
  }
  if (typeof headersLike === 'object') {
    return readFromRecord(headersLike as Record<string, any>, name)
  }
  return null
}

export const getHostFromHeaders = (headersLike: HeadersLike) =>
  getHeaderValue(headersLike, 'x-forwarded-host') || getHeaderValue(headersLike, 'host')

export const getProtoFromHeaders = (headersLike: HeadersLike) =>
  getHeaderValue(headersLike, 'x-forwarded-proto') || getHeaderValue(headersLike, 'x-forwarded-protocol')
