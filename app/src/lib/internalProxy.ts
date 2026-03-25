export const getInternalProxyToken = () =>
  (process.env.INTERNAL_PROXY_TOKEN || process.env.BACKEND_INTERNAL_PROXY_TOKEN || '').trim()

export const attachInternalProxyToken = (headers: Headers) => {
  const token = getInternalProxyToken()
  if (token) {
    headers.set('x-internal-proxy-token', token)
  } else {
    headers.delete('x-internal-proxy-token')
  }
}
