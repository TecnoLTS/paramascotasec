export const apiEndpoints = {
  products: '/api/products',
  product: (id: string) => `/api/products/${id}`,
  health: '/api/health',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  orders: '/api/orders',
  ejemplo: '/api/ejemplo',
  ejemplo2: '/api/ejemplo2',
} as const

export type ApiEndpointKey = keyof typeof apiEndpoints
