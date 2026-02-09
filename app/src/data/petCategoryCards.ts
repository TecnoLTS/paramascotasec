import { TenantId, defaultTenantId, getTenantConfig } from '@/lib/tenant'

export interface PetCategoryCard {
    id: string
    label: string
    image: string
}

const toTitleCase = (value?: string) => {
    if (!value) return ''

    return value
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

const getTenant = (tenantId?: TenantId) => getTenantConfig(tenantId ?? defaultTenantId)

const buildLabelMap = (tenantId?: TenantId) => {
    const categories = getTenant(tenantId).categories
    return categories.reduce<Record<string, string>>((acc, category) => {
        acc[category.id.toLowerCase()] = category.label
        return acc
    }, {})
}

export const getCategoryCards = (tenantId?: TenantId): PetCategoryCard[] => getTenant(tenantId).categories

export const getCategoryLabel = (categoryId?: string, tenantId?: TenantId) => {
    if (!categoryId) return ''

    const normalized = categoryId.toLowerCase()
    const labelMap = buildLabelMap(tenantId)
    return labelMap[normalized] ?? toTitleCase(normalized)
}

export const getVisibleProductCategoryIds = (tenantId?: TenantId) =>
    getTenant(tenantId).categories
        .map((category) => category.id.toLowerCase())
        .filter((categoryId) => categoryId !== 'todos' && categoryId !== 'descuentos')

export type CategoryFilter = {
    category?: string
    gender?: string
}

export const getCategoryFilter = (categoryId: string, tenantId?: TenantId): CategoryFilter => {
    const normalized = categoryId.toLowerCase()
    const categoryFilters = getTenant(tenantId).categoryFilters
    return categoryFilters[normalized] ?? { category: normalized }
}

export const getCategoryUrl = (
    categoryId: string,
    options?: { gender?: string },
    tenantId?: TenantId
) => {
    const normalized = categoryId.toLowerCase()
    const categoryRoutes = getTenant(tenantId).categoryRoutes
    const baseUrl = categoryRoutes[normalized] ?? `/shop/breadcrumb1?category=${encodeURIComponent(normalized)}`
    if (options?.gender) {
        const separator = baseUrl.includes('?') ? '&' : '?'
        if (!baseUrl.includes('gender=')) {
            return `${baseUrl}${separator}gender=${encodeURIComponent(options.gender)}`
        }
    }
    return baseUrl
}

const defaultCategories = getCategoryCards(defaultTenantId)
export default defaultCategories
