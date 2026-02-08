export interface PetCategoryCard {
    id: string
    label: string
    image: string
}

const petCategoryCards: PetCategoryCard[] = [
    { id: 'todos', label: 'Todas', image: '/images/collection/categoria_todas.jpg' },
    { id: 'descuentos', label: 'Ofertas', image: '/images/collection/categoria_ofertas.jpg' },
    { id: 'perros', label: 'Perros', image: '/images/collection/categoria_perros.jpg' },
    { id: 'gatos', label: 'Gatos', image: '/images/collection/categoria_gatos.jpg' },
    { id: 'juguetes', label: 'Juguetes', image: '/images/collection/categoria_juguetes.jpg' },
    { id: 'camas', label: 'Camas', image: '/images/collection/categoria_camas.jpg' }
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
    .filter((categoryId) =>
        categoryId !== 'todos' &&
        categoryId !== 'descuentos' &&
        categoryId !== 'comida para perros' &&
        categoryId !== 'comida para gatos'
    )

export type CategoryFilter = {
    category?: string
    gender?: string
}

const categoryFilters: Record<string, CategoryFilter> = {
    'comida para perros': { gender: 'dog' },
    'comida para gatos': { gender: 'cat' },
    perros: { gender: 'dog' },
    gatos: { gender: 'cat' },
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
    perros: '/shop/breadcrumb1?category=perros&gender=dog',
    gatos: '/shop/breadcrumb1?category=gatos&gender=cat',
    juguetes: '/shop/breadcrumb1?category=juguetes',
    'comida para perros': '/shop/breadcrumb1?category=perros&gender=dog',
    'comida para gatos': '/shop/breadcrumb1?category=gatos&gender=cat',
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
