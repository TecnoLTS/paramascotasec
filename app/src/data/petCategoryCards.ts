import { normalizeProductCategory, normalizeProductType } from '@/lib/productTaxonomy'
import type { ProductType } from '@/type/ProductType'

export interface PetCategoryCard {
  id: string
  label: string
  image: string
}

export type PetCategoryFilter = {
  category?: string
  categories?: string[]
  gender?: string
  genders?: string[]
  productType?: string
  productTypes?: string[]
}

export type ResolvedPetCategoryFilter = {
  categories: string[]
  genders: string[]
  productTypes: string[]
}

export type PetCategoryImageSpec = {
  src: string
  fileName: string
  aspect: string
  recommendedResolution: string
  minimumResolution: string
}

type PetCategoryDefinition = {
  id: string
  label: string
  route: string
  filter?: PetCategoryFilter
  showInFooter?: boolean
  showInShopBrowse?: boolean
}

type PetCategoryDefinitionMap = Record<string, PetCategoryDefinition>
type PetCategoryImageMap = Record<string, PetCategoryImageSpec>

export const PET_HOME_TOP_IMAGE_GUIDE = {
  directory: '/public/images/collection/home-top',
  aspect: '4:5',
  recommendedResolution: '1200x1500',
  minimumResolution: '960x1200',
  usage: 'Carrusel superior de Categorías del home',
} as const

export const PET_HOME_FEATURED_IMAGE_GUIDE = {
  directory: '/public/images/collection/home-featured',
  aspect: '1:1 master flexible',
  recommendedResolution: '2000x2000',
  minimumResolution: '1600x1600',
  usage: 'Bloque grande inferior del home. Esta imagen se recorta a square, 4:5 o 16:10 según el layout.',
} as const

// Cambia solo el valor del archivo que reemplaces para forzar que clientes y
// el optimizador de Next descarguen la imagen nueva de inmediato.
const PET_IMAGE_VERSION_BY_FILE: Record<string, string> = {
  'catalogo-completo-para-mascotas-4x5.jpg': '20260321-1',
  'ofertas-para-mascotas-4x5.jpg': '20260321-1',
  'comida-para-mascotas-4x5.jpg': '20260321-2',
  'cuidados-para-mascotas-4x5.jpg': '20260321-2',
  'salud-para-mascotas-4x5.jpg': '20260321-2',
  'accesorios-para-mascotas-4x5.jpg': '20260321-2',
  'cuidado-para-mascotas-4x5.jpg': '20260321-1',
  'productos-para-gatos-4x5.jpg': '20260321-2',
  'productos-para-perros-4x5.jpg': '20260321-1',
  'ropa-para-mascotas-4x5.jpg': '20260321-1',
  'catalogo-completo-para-mascotas-square.jpg': '20260321-1',
  'ofertas-para-mascotas-square.jpg': '20260321-1',
  'comida-para-mascotas-square.jpg': '20260321-1',
  'cuidados-para-mascotas-square.jpg': '20260321-1',
  'salud-para-mascotas-square.jpg': '20260321-1',
  'accesorios-para-mascotas-square.jpg': '20260321-1',
  'cuidado-para-mascotas-square.jpg': '20260321-1',
  'productos-para-gatos-square.jpg': '20260321-1',
  'productos-para-perros-square.jpg': '20260321-1',
  'ropa-para-mascotas-square.jpg': '20260321-1',
}

const withVersion = (src: string, fileName: string) => {
  const version = PET_IMAGE_VERSION_BY_FILE[fileName]
  return version ? `${src}?v=${version}` : src
}

const topAsset = (fileName: string): PetCategoryImageSpec => ({
  src: withVersion(`/images/collection/home-top/${fileName}`, fileName),
  fileName,
  aspect: PET_HOME_TOP_IMAGE_GUIDE.aspect,
  recommendedResolution: PET_HOME_TOP_IMAGE_GUIDE.recommendedResolution,
  minimumResolution: PET_HOME_TOP_IMAGE_GUIDE.minimumResolution,
})

const featuredAsset = (fileName: string): PetCategoryImageSpec => ({
  src: withVersion(`/images/collection/home-featured/${fileName}`, fileName),
  fileName,
  aspect: PET_HOME_FEATURED_IMAGE_GUIDE.aspect,
  recommendedResolution: PET_HOME_FEATURED_IMAGE_GUIDE.recommendedResolution,
  minimumResolution: PET_HOME_FEATURED_IMAGE_GUIDE.minimumResolution,
})

const toTitleCase = (value?: string) => {
  if (!value) return ''

  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const DEFAULT_HOME_TOP_IMAGE = '/images/collection/home-top/catalogo-completo-para-mascotas-4x5.jpg'
const DEFAULT_HOME_FEATURED_IMAGE = '/images/collection/home-featured/catalogo-completo-para-mascotas-square.jpg'

// 1. Catalogo base: aqui editas label, ruta y filtro.
// 2. Collection (arriba): usa solo PET_HOME_TOP_IMAGES y PET_HOME_TOP_ORDER.
// 3. Collection2 (abajo): usa solo PET_HOME_FEATURED_IMAGES y PET_HOME_FEATURED_ORDER.
//
// Estan separadas a proposito porque son dos secciones distintas del home con
// resoluciones, recortes y necesidades visuales diferentes.
const PET_CATEGORY_DEFINITIONS: PetCategoryDefinitionMap = {
  todos: {
    id: 'todos',
    label: 'Todas',
    route: '/shop/breadcrumb1',
    filter: {},
    showInFooter: true,
    showInShopBrowse: true,
  },
  ropa: {
    id: 'ropa',
    label: 'Ropa',
    route: '/shop/breadcrumb1?category=ropa',
    filter: {
      categories: ['ropa'],
      productTypes: ['ropa'],
    },
    showInFooter: true,
    showInShopBrowse: true,
  },
  comida: {
    id: 'comida',
    label: 'Comida',
    route: '/shop/breadcrumb1?category=comida',
    filter: {
      categories: ['comida', 'comida para perros', 'comida para gatos'],
      productTypes: ['comida'],
    },
    showInFooter: true,
    showInShopBrowse: true,
  },
  cuidados: {
    id: 'salud',
    label: 'Salud',
    route: '/shop/breadcrumb1?category=salud',
    filter: {
      categories: ['salud', 'cuidado', 'higiene', 'medicina', 'medicinas', 'farmacia'],
    },
  },
  accesorios: {
    id: 'accesorios',
    label: 'Accesorios',
    route: '/shop/breadcrumb1?category=accesorios',
    filter: {
      categories: [
        'accesorios',
        'juguetes',
        'camas',
        'comederos',
        'transportadoras',
        'correas',
        'collares',
        'arneses',
        'bolsas',
        'platos',
      ],
      productTypes: ['accesorios'],
    },
    showInFooter: true,
    showInShopBrowse: true,
  },
  descuentos: {
    id: 'descuentos',
    label: 'Ofertas',
    route: '/shop/breadcrumb1?category=descuentos',
    filter: {},
  },
  cuidado: {
    id: 'salud',
    label: 'Salud',
    route: '/shop/breadcrumb1?category=salud',
    filter: {
      categories: ['salud', 'cuidado', 'higiene', 'medicina', 'medicinas', 'farmacia'],
    },
  },
  salud: {
    id: 'salud',
    label: 'Salud',
    route: '/shop/breadcrumb1?category=salud',
    filter: {
      categories: ['salud', 'cuidado', 'higiene', 'medicina', 'medicinas', 'farmacia'],
    },
    showInFooter: true,
    showInShopBrowse: true,
  },
  gatos: {
    id: 'gatos',
    label: 'Gatos',
    route: '/shop/breadcrumb1?gender=cat',
    filter: { genders: ['cat'] },
  },
  perros: {
    id: 'perros',
    label: 'Perros',
    route: '/shop/breadcrumb1?gender=dog',
    filter: { genders: ['dog'] },
  },
  'comida para perros': {
    id: 'comida para perros',
    label: 'Comida para perros',
    route: '/shop/breadcrumb1?category=comida&gender=dog',
    filter: {
      categories: ['comida', 'comida para perros', 'comida para gatos'],
      productTypes: ['comida'],
      genders: ['dog'],
    },
  },
  'comida para gatos': {
    id: 'comida para gatos',
    label: 'Comida para gatos',
    route: '/shop/breadcrumb1?category=comida&gender=cat',
    filter: {
      categories: ['comida', 'comida para perros', 'comida para gatos'],
      productTypes: ['comida'],
      genders: ['cat'],
    },
  },
}

// Seccion superior del home: Collection.tsx
export const PET_HOME_TOP_ORDER = ['todos', 'ropa', 'comida', 'salud', 'accesorios'] as const

export const PET_HOME_TOP_IMAGES: PetCategoryImageMap = {
  todos: topAsset('catalogo-completo-para-mascotas-4x5.jpg'),
  descuentos: topAsset('ofertas-para-mascotas-4x5.jpg'),
  ropa: topAsset('ropa-para-mascotas-4x5.jpg'),
  comida: topAsset('comida-para-mascotas-4x5.jpg'),
  salud: topAsset('salud-para-mascotas-4x5.jpg'),
  cuidados: topAsset('salud-para-mascotas-4x5.jpg'),
  accesorios: topAsset('accesorios-para-mascotas-4x5.jpg'),
  cuidado: topAsset('salud-para-mascotas-4x5.jpg'),
  gatos: topAsset('productos-para-gatos-4x5.jpg'),
  perros: topAsset('productos-para-perros-4x5.jpg'),
  'comida para perros': topAsset('comida-para-mascotas-4x5.jpg'),
  'comida para gatos': topAsset('comida-para-mascotas-4x5.jpg'),
}

// Seccion inferior del home: Collection2.tsx
export const PET_HOME_FEATURED_ORDER = ['comida', 'salud', 'accesorios'] as const

export const PET_HOME_FEATURED_IMAGES: PetCategoryImageMap = {
  todos: featuredAsset('catalogo-completo-para-mascotas-square.jpg'),
  descuentos: featuredAsset('ofertas-para-mascotas-square.jpg'),
  ropa: featuredAsset('ropa-para-mascotas-square.jpg'),
  comida: featuredAsset('comida-para-mascotas-square.jpg'),
  salud: featuredAsset('salud-para-mascotas-square.jpg'),
  cuidados: featuredAsset('salud-para-mascotas-square.jpg'),
  accesorios: featuredAsset('accesorios-para-mascotas-square.jpg'),
  cuidado: featuredAsset('salud-para-mascotas-square.jpg'),
  gatos: featuredAsset('productos-para-gatos-square.jpg'),
  perros: featuredAsset('productos-para-perros-square.jpg'),
  'comida para perros': featuredAsset('comida-para-mascotas-square.jpg'),
  'comida para gatos': featuredAsset('comida-para-mascotas-square.jpg'),
}

const getCategoryDefinition = (categoryId?: string) => {
  if (!categoryId) return undefined
  return PET_CATEGORY_DEFINITIONS[categoryId.toLowerCase()]
}

const buildCard = (categoryId: string, image: string): PetCategoryCard => {
  const category = getCategoryDefinition(categoryId)

  return {
    id: category?.id ?? categoryId,
    label: category?.label ?? toTitleCase(categoryId),
    image,
  }
}

export const PET_HOME_CATEGORY_CARDS: PetCategoryCard[] = PET_HOME_TOP_ORDER.map((categoryId) =>
  buildCard(categoryId, PET_HOME_TOP_IMAGES[categoryId]?.src ?? DEFAULT_HOME_TOP_IMAGE)
)

export const PET_HOME_FEATURED_CATEGORY_CARDS: PetCategoryCard[] = PET_HOME_FEATURED_ORDER.map((categoryId) =>
  buildCard(categoryId, PET_HOME_FEATURED_IMAGES[categoryId]?.src ?? DEFAULT_HOME_FEATURED_IMAGE)
)

export const PET_FOOTER_CATEGORY_IDS = Object.values(PET_CATEGORY_DEFINITIONS)
  .filter((category) => category.showInFooter)
  .map((category) => category.id)

export const PET_SHOP_BROWSE_CATEGORY_IDS = Object.values(PET_CATEGORY_DEFINITIONS)
  .filter((category) => category.showInShopBrowse)
  .map((category) => category.id)

export const PET_CATEGORY_FILTERS = Object.values(PET_CATEGORY_DEFINITIONS).reduce<Record<string, PetCategoryFilter>>(
  (acc, category) => {
    acc[category.id.toLowerCase()] = category.filter ?? {}
    return acc
  },
  {}
)

export const PET_CATEGORY_ROUTES = Object.values(PET_CATEGORY_DEFINITIONS).reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.id.toLowerCase()] = category.route
    return acc
  },
  {}
)

export const getCategoryCards = (_tenantId?: string) => PET_HOME_CATEGORY_CARDS

export const getHomeSecondaryCategoryCards = (_tenantId?: string) => PET_HOME_FEATURED_CATEGORY_CARDS

export const getCategoryLabel = (categoryId?: string, _tenantId?: string) => {
  if (!categoryId) return ''

  const category = getCategoryDefinition(categoryId)
  return category?.label ?? toTitleCase(categoryId.toLowerCase())
}

export const getCategoryImage = (categoryId?: string, _tenantId?: string) => {
  if (!categoryId) return DEFAULT_HOME_TOP_IMAGE

  const normalized = categoryId.toLowerCase()
  return PET_HOME_TOP_IMAGES[normalized]?.src ?? PET_HOME_FEATURED_IMAGES[normalized]?.src ?? DEFAULT_HOME_TOP_IMAGE
}

export const getHomeTopCategoryImageSpec = (categoryId: string) =>
  PET_HOME_TOP_IMAGES[categoryId.toLowerCase()] ?? null

export const getHomeFeaturedCategoryImageSpec = (categoryId: string) =>
  PET_HOME_FEATURED_IMAGES[categoryId.toLowerCase()] ?? null

const uniqueNormalizedValues = (
  values: Array<string | null | undefined>,
  normalizer: (value?: string | null) => string
) =>
  Array.from(
    new Set(
      values
        .map((value) => normalizer(value))
        .filter(Boolean)
    )
  )

const normalizeGender = (value?: string | null) =>
  (value ?? '').trim().toLowerCase()

const parseAdditionalCategoryValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeProductCategory(String(item || '')))
      .filter(Boolean)
  }

  if (typeof value !== 'string') {
    return []
  }

  const trimmed = value.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => normalizeProductCategory(String(item || '')))
        .filter(Boolean)
    }
  } catch {
    // allow legacy comma-separated strings
  }

  return trimmed
    .split(',')
    .map((item) => normalizeProductCategory(item))
    .filter(Boolean)
}

export const resolvePetCategoryFilter = (
  filter?: PetCategoryFilter,
  options?: { gender?: string | null }
): ResolvedPetCategoryFilter => ({
  categories: uniqueNormalizedValues(
    [filter?.category, ...(filter?.categories ?? [])],
    normalizeProductCategory
  ),
  productTypes: uniqueNormalizedValues(
    [filter?.productType, ...(filter?.productTypes ?? [])],
    normalizeProductType
  ),
  genders: uniqueNormalizedValues(
    [options?.gender, filter?.gender, ...(filter?.genders ?? [])],
    normalizeGender
  ),
})

export const matchesPetCategoryFilter = (
  product: ProductType,
  filter?: PetCategoryFilter,
  options?: { gender?: string | null }
) => {
  const resolvedFilter = resolvePetCategoryFilter(filter, options)
  const productType = normalizeProductType(product.productType, product.category)
  const productCategory = normalizeProductCategory(product.category, productType)
  const additionalCategories = uniqueNormalizedValues(
    parseAdditionalCategoryValues(product.attributes?.catalogCategories),
    normalizeProductCategory
  )
  const productCategories = uniqueNormalizedValues(
    [productCategory, ...additionalCategories],
    normalizeProductCategory
  )
  const productGender = normalizeGender(product.gender)

  const matchesTaxonomy =
    resolvedFilter.categories.length === 0 && resolvedFilter.productTypes.length === 0
      ? true
      : productCategories.some((category) => resolvedFilter.categories.includes(category))
        || resolvedFilter.productTypes.includes(productType)

  const matchesGender =
    resolvedFilter.genders.length === 0 ? true : resolvedFilter.genders.includes(productGender)

  return matchesTaxonomy && matchesGender
}

export const getVisibleProductCategoryIds = (_tenantId?: string) =>
  PET_HOME_CATEGORY_CARDS.map((category) => category.id.toLowerCase()).filter(
    (categoryId) => categoryId !== 'todos'
  )

export const getShopBrowseCategoryIds = (_tenantId?: string) => PET_SHOP_BROWSE_CATEGORY_IDS

export const getCategoryFilter = (categoryId: string, _tenantId?: string) => {
  const normalized = categoryId.toLowerCase()
  return PET_CATEGORY_FILTERS[normalized] ?? { category: normalized }
}

export const getCategoryUrl = (categoryId: string, options?: { gender?: string }, _tenantId?: string) => {
  const normalized = categoryId.toLowerCase()
  const baseUrl =
    PET_CATEGORY_ROUTES[normalized] ?? `/shop/breadcrumb1?category=${encodeURIComponent(normalized)}`

  if (options?.gender && !baseUrl.includes('gender=')) {
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}gender=${encodeURIComponent(options.gender)}`
  }

  return baseUrl
}

export default PET_HOME_CATEGORY_CARDS
