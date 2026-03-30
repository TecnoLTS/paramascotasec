import { fetchJson } from '@/lib/apiClient'
import { apiEndpoints } from './endpoints'

export type ContactMessagePayload = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export type ContactMessageResponse = {
  id: string
  delivered: boolean
}

export const sendContactMessage = (body: ContactMessagePayload) =>
  fetchJson<ContactMessageResponse>(apiEndpoints.contact, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
