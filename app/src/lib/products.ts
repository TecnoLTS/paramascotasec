import { ProductType } from '@/type/ProductType'
import { fetchJson } from './apiClient'

export const fetchProducts = async (): Promise<ProductType[]> => {
  return fetchJson<ProductType[]>('/api/products')
}
