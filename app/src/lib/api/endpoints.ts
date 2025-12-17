export const apiEndpoints = {
  products: '/api/products',
  product: (id: string) => `/api/products/${id}`,
  health: '/api/health',
  ejemplo: '/api/ejemplo',
  ejemplo2: '/api/ejemplo2',
} as const

export type ApiEndpointKey = keyof typeof apiEndpoints
