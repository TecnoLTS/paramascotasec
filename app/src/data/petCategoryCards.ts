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
    acc[category.id] = category.label
    return acc
}, {})

const toTitleCase = (value: string) =>
    value
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

export const getCategoryLabel = (categoryId: string) => labelMap[categoryId] ?? toTitleCase(categoryId)

export const visibleProductCategoryIds = petCategoryCards
    .map((category) => category.id)
    .filter((categoryId) => categoryId !== 'todos' && categoryId !== 'descuentos')

export default petCategoryCards
