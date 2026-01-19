import { fetchJson } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'

export interface LoginResponse {
    token: string
    user: {
        id: string
        email: string
        name: string
        role?: 'customer' | 'admin'
    }
}

export const login = (body: any) =>
    fetchJson<LoginResponse>(apiEndpoints.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })

export const register = (body: any) =>
    fetchJson<any>(apiEndpoints.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
