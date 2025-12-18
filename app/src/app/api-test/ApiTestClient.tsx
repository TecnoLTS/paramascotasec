'use client'

import React, { useState } from 'react'
import { requestApi } from '@/lib/apiClient'

const endpoints = [
  { label: 'Productos', path: '/api/products' },
  { label: 'Ejemplo', path: '/api/ejemplo' },
  { label: 'Ejemplo 2', path: '/api/ejemplo2' },
  { label: 'Health Check', path: '/api/health' },
]

export default function ApiTestPage() {
  const [selectedPath, setSelectedPath] = useState(endpoints[0].path)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<{ status: number; ok: boolean; body: unknown } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const { body, status, ok } = await requestApi<unknown>(selectedPath)
      setResponse({ ok, status, body })
    } catch (err: any) {
      setError(err?.message ?? 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10 space-y-6">
      <h1 className="heading4">API Tester</h1>
      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="border border-line rounded-lg px-3 py-2"
          value={selectedPath}
          onChange={(e) => setSelectedPath(e.target.value)}
        >
          {endpoints.map((endpoint) => (
            <option key={endpoint.path} value={endpoint.path}>
              {endpoint.label} ({endpoint.path})
            </option>
          ))}
        </select>
        <button
          className="button-main bg-black text-white px-4 py-2 rounded-lg disabled:opacity-60"
          onClick={handleFetch}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Probar endpoint'}
        </button>
      </div>

      {error && (
        <div className="text-red-600">Error: {error}</div>
      )}

      {response && (
        <div className="space-y-2">
          <div className="caption1 text-secondary">
            Estado: {response.status} ({response.ok ? 'OK' : 'Error'})
          </div>
          <pre className="bg-surface border border-line rounded-lg p-3 text-sm overflow-auto">
            {JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
