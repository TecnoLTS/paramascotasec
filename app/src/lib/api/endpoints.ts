export const apiEndpoints = {
  products: '/api/products',
  product: (id: string) => `/api/products/${id}`,
  health: '/api/health',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    requestOtp: '/api/auth/request-otp',
    verifyOtp: '/api/auth/verify-otp',
  },
  orders: '/api/orders',
  settings: {
    productPage: '/api/admin/settings/product-page',
    pricingMargins: '/api/admin/settings/pricing-margins',
    pricingCalc: '/api/admin/settings/pricing-calc',
    pricingRules: '/api/admin/settings/pricing-rules',
    storeStatus: '/api/admin/settings/store-status',
    publicStoreStatus: '/api/settings/store-status',
  },
  reports: {
    recentOrders: '/api/reports/recent-orders',
  },
  ejemplo: '/api/ejemplo',
  ejemplo2: '/api/ejemplo2',
} as const

export type ApiEndpointKey = keyof typeof apiEndpoints
