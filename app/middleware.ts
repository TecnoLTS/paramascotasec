import { NextRequest, NextResponse } from 'next/server'

const PANEL_IP_MODE = (process.env.PANEL_IP_MODE || 'off').trim().toLowerCase()
const PANEL_IP_ALLOWLIST = (process.env.PANEL_IP_ALLOWLIST || '').trim()
const CSP_REPORT_URI = '/api/security/csp-report'
const PRIVATE_IPV4_RULES = ['127.0.0.1/32', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']

const normalizeIpMode = (value: string) => {
  if (['private', 'private-lan', 'lan'].includes(value)) return 'private'
  if (value === 'custom') return 'custom'
  return 'off'
}

const getClientIp = (req: NextRequest) => {
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  return ''
}

const ipv4ToLong = (ip: string) => {
  const parts = ip.split('.')
  if (parts.length !== 4) return null

  let result = 0
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null
    const value = Number(part)
    if (!Number.isInteger(value) || value < 0 || value > 255) return null
    result = (result << 8) + value
  }

  return result >>> 0
}

const ipInRule = (ip: string, rule: string) => {
  if (!rule.includes('/')) {
    return ip === rule
  }

  const [subnet, prefixRaw] = rule.split('/', 2)
  const ipLong = ipv4ToLong(ip)
  const subnetLong = ipv4ToLong(subnet)
  const prefix = Number(prefixRaw)
  if (ipLong === null || subnetLong === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return false
  }

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return (ipLong & mask) === (subnetLong & mask)
}

const getPanelIpRules = () => {
  const customRules = PANEL_IP_ALLOWLIST.split(',')
    .map((rule) => rule.trim())
    .filter(Boolean)

  const mode = normalizeIpMode(PANEL_IP_MODE)
  if (mode === 'private') {
    return Array.from(new Set([...PRIVATE_IPV4_RULES, ...customRules]))
  }
  if (mode === 'custom') {
    return customRules
  }
  return []
}

const isPanelIpAllowed = (ip: string) => {
  const rules = getPanelIpRules()
  if (rules.length === 0) return true
  if (!ip) return false
  return rules.some((rule) => ipInRule(ip, rule))
}

const shouldApplyPanelAllowlist = (pathname: string) => pathname === '/my-account' || pathname.startsWith('/my-account/')

const buildCsp = (nonce: string) =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    `report-uri ${CSP_REPORT_URI}`,
  ].join('; ')

const buildStrictReportOnlyCsp = (nonce: string) =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' https:",
    "img-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    `report-uri ${CSP_REPORT_URI}`,
  ].join('; ')

export function middleware(req: NextRequest) {
  const nonce = btoa(crypto.randomUUID()).replace(/=+$/g, '')
  const csp = buildCsp(nonce)
  const cspReportOnly = buildStrictReportOnlyCsp(nonce)

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  if (shouldApplyPanelAllowlist(req.nextUrl.pathname) && normalizeIpMode(PANEL_IP_MODE) !== 'off') {
    const clientIp = getClientIp(req)
    if (!isPanelIpAllowed(clientIp)) {
      const blockedResponse = new NextResponse('Acceso al panel restringido desde esta IP.', {
        status: 403,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
        },
      })
      blockedResponse.headers.set('Content-Security-Policy', csp)
      blockedResponse.headers.set('Content-Security-Policy-Report-Only', cspReportOnly)
      blockedResponse.headers.set('x-nonce', nonce)
      return blockedResponse
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('Content-Security-Policy-Report-Only', cspReportOnly)
  response.headers.set('x-nonce', nonce)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}
