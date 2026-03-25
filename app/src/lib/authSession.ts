export type AuthSessionUser = {
  id: string
  email: string
  name: string
  role?: 'customer' | 'admin'
}

const AUTH_STORAGE_KEY = 'pm_session_state'
const LEGACY_AUTH_STORAGE_KEY = 'authToken'
const USER_STORAGE_KEY = 'user'
const COOKIE_SESSION_MARKER = 'cookie-session'

export const getSessionMarker = () => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

export const hasCookieSessionMarker = () => getSessionMarker() === COOKIE_SESSION_MARKER

export const setCookieSessionMarker = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, COOKIE_SESSION_MARKER)
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
  } catch {}
}

export const getStoredSessionUser = (): AuthSessionUser | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.id || !parsed?.email || !parsed?.name) return null
    return parsed
  } catch {
    return null
  }
}

export const setStoredSessionUser = (user: AuthSessionUser | null) => {
  if (typeof window === 'undefined') return
  try {
    if (!user) {
      localStorage.removeItem(USER_STORAGE_KEY)
      return
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } catch {}
}

export const clearStoredSession = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch {}
}
