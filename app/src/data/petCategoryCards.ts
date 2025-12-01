export interface PetCategoryCard {
    id: string
    label: string
    image: string
}

const petCategoryCards: PetCategoryCard[] = [
    { id: 'todos', label: 'Todas', image: '/images/collection/1.jpg' },
    { id: 'descuentos', label: 'Ofertas', image: '/images/collection/2.jpg' },
    { id: 'juguetes', label: 'Juguetes', image: '/images/collection/3.jpg' },
    { id: 'comida para perros', label: 'Comida para perros', image: '/images/collection/4.jpg' },
    { id: 'comida para gatos', label: 'Comida para gatos', image: '/images/collection/5.jpg' },
    { id: 'camas', label: 'Camas', image: '/images/collection/6.jpg' },
    { id: 'accesorios', label: 'Accesorios', image: '/images/collection/7.jpg' },
    { id: 'comederos', label: 'Comederos', image: '/images/collection/1.jpg' },
    { id: 'cuidado', label: 'Cuidado', image: '/images/collection/2.jpg' },
]

const labelMap = petCategoryCards.reduce<Record<string, string>>((acc, category) => {
    acc[category.id.toLowerCase()] = category.label
    return acc
}, {})

const toTitleCase = (value?: string) => {
    if (!value) return ''

    return value
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

export const getCategoryLabel = (categoryId?: string) => {
    if (!categoryId) return ''

    const normalized = categoryId.toLowerCase()
    return labelMap[normalized] ?? toTitleCase(normalized)
}

export const visibleProductCategoryIds = petCategoryCards
    .map((category) => category.id.toLowerCase())
    .filter((categoryId) => categoryId !== 'todos' && categoryId !== 'descuentos')

export type CategoryFilter = {
    category?: string
    gender?: string
}

const categoryFilters: Record<string, CategoryFilter> = {
    'comida para perros': { category: 'comida para perros', gender: 'dog' },
    'comida para gatos': { category: 'comida para gatos', gender: 'cat' },
    camas: { category: 'camas' },
    accesorios: { category: 'accesorios' },
    comederos: { category: 'comederos' },
    cuidado: { category: 'cuidado' },
    juguetes: { category: 'juguetes' },
    descuentos: {},
    todos: {},
}

export const getCategoryFilter = (categoryId: string): CategoryFilter => {
    const normalized = categoryId.toLowerCase()
    return categoryFilters[normalized] ?? { category: normalized }
}

const categoryRoutes: Record<string, string> = {
    todos: '/shop/breadcrumb1',
    descuentos: '/shop/breadcrumb1?category=descuentos',
    juguetes: '/shop/breadcrumb1?category=juguetes',
    'comida para perros': '/shop/breadcrumb1?category=comida%20para%20perros&gender=dog',
    'comida para gatos': '/shop/breadcrumb1?category=comida%20para%20gatos&gender=cat',
    camas: '/shop/breadcrumb1?category=camas',
    accesorios: '/shop/breadcrumb1?category=accesorios',
    comederos: '/shop/breadcrumb1?category=comederos',
    cuidado: '/shop/breadcrumb1?category=cuidado',
}

export const getCategoryUrl = (categoryId: string, options?: { gender?: string }) => {
    const normalized = categoryId.toLowerCase()
    const baseUrl = categoryRoutes[normalized] ?? `/shop/breadcrumb1?category=${encodeURIComponent(normalized)}`
    if (options?.gender) {
        const separator = baseUrl.includes('?') ? '&' : '?'
        if (!baseUrl.includes('gender=')) {
            return `${baseUrl}${separator}gender=${encodeURIComponent(options.gender)}`
        }
    }
    return baseUrl
}

export default petCategoryCards
