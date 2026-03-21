const collapseWhitespace = (value?: string | null) =>
  (value ?? '').replace(/\s+/g, ' ').trim()

const normalizedToken = (value?: string | null) =>
  collapseWhitespace(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const PET_SPECIES_OPTIONS = [
  { value: 'Perro', label: 'Perro' },
  { value: 'Gato', label: 'Gato' },
  { value: 'Perro y gato', label: 'Perro y gato' },
] as const

export const APPAREL_GENDER_OPTIONS = [
  { value: 'Unisex', label: 'Unisex' },
  { value: 'Macho', label: 'Macho' },
  { value: 'Hembra', label: 'Hembra' },
] as const

export const PRODUCT_TYPE_OPTIONS = [
  { value: 'comida', label: 'Comida' },
  { value: 'ropa', label: 'Ropa' },
  { value: 'cuidado', label: 'Cuidados / medicinas' },
  { value: 'accesorios', label: 'Accesorios' },
] as const

export const PRODUCT_CATEGORY_OPTIONS = [
  { value: 'comida', label: 'Comida' },
  { value: 'ropa', label: 'Ropa' },
  { value: 'cuidados', label: 'Cuidados' },
  { value: 'accesorios', label: 'Accesorios' },
] as const

const CATEGORY_BY_TYPE: Record<string, string> = {
  comida: 'comida',
  ropa: 'ropa',
  cuidado: 'cuidados',
  accesorios: 'accesorios',
}

const SPECIES_TO_GENDER: Record<string, 'dog' | 'cat' | 'Unisex'> = {
  dog: 'dog',
  perro: 'dog',
  perros: 'dog',
  canino: 'dog',
  caninos: 'dog',
  cat: 'cat',
  gato: 'cat',
  gatos: 'cat',
  felino: 'cat',
  felinos: 'cat',
  'perro y gato': 'Unisex',
  'perros y gatos': 'Unisex',
  'gato y perro': 'Unisex',
  'gatos y perros': 'Unisex',
  ambos: 'Unisex',
  ambossexos: 'Unisex',
  unisex: 'Unisex',
  all: 'Unisex',
  both: 'Unisex',
}

const matchesAny = (token: string, fragments: string[]) =>
  fragments.some((fragment) => token.includes(fragment))

const resolveCanonicalProductType = (token: string) => {
  if (!token) return ''

  if (matchesAny(token, ['ropa', 'vestimenta', 'vestido', 'prenda', 'abrigo', 'camiseta', 'sueter', 'sudadera'])) {
    return 'ropa'
  }

  if (matchesAny(token, ['cuidado', 'cuidados', 'higiene', 'medicina', 'medicinas', 'salud', 'farmacia', 'antiparasit', 'pipeta', 'shampoo'])) {
    return 'cuidado'
  }

  if (matchesAny(token, ['comida', 'alimento', 'snack', 'golosina', 'croqueta', 'pienso', 'lata'])) {
    return 'comida'
  }

  if (matchesAny(token, ['accesorio', 'accesorios', 'juguete', 'juguetes', 'cama', 'camas', 'comedero', 'comederos', 'plato', 'platos', 'correa', 'correas', 'collar', 'collares', 'arnes', 'arneses', 'transportadora', 'transportadoras', 'bolsa', 'bolsas'])) {
    return 'accesorios'
  }

  return ''
}

const resolveCanonicalProductCategory = (token: string) => {
  if (!token) return ''

  if (matchesAny(token, ['ropa', 'vestimenta', 'vestido', 'prenda', 'abrigo', 'camiseta', 'sueter', 'sudadera'])) {
    return 'ropa'
  }

  if (matchesAny(token, ['cuidado', 'cuidados', 'higiene', 'medicina', 'medicinas', 'salud', 'farmacia', 'antiparasit', 'pipeta', 'shampoo'])) {
    return 'cuidados'
  }

  if (matchesAny(token, ['comida', 'alimento', 'snack', 'golosina', 'croqueta', 'pienso', 'lata'])) {
    return 'comida'
  }

  if (matchesAny(token, ['accesorio', 'accesorios', 'juguete', 'juguetes', 'cama', 'camas', 'comedero', 'comederos', 'plato', 'platos', 'correa', 'correas', 'collar', 'collares', 'arnes', 'arneses', 'transportadora', 'transportadoras', 'bolsa', 'bolsas'])) {
    return 'accesorios'
  }

  return ''
}

export const getDefaultCategoryForProductType = (productType?: string | null) => {
  const normalizedType = normalizeProductType(productType)
  return CATEGORY_BY_TYPE[normalizedType] ?? ''
}

export const getDefaultProductTypeForCategory = (category?: string | null) => {
  const normalizedCategory = resolveCanonicalProductCategory(normalizedToken(category))
  if (normalizedCategory === 'cuidados') return 'cuidado'
  if (normalizedCategory === 'comida') return 'comida'
  if (normalizedCategory === 'ropa') return 'ropa'
  if (normalizedCategory === 'accesorios') return 'accesorios'
  return ''
}

export const normalizeProductType = (value?: string | null, fallbackCategory?: string | null) => {
  const normalizedValue = resolveCanonicalProductType(normalizedToken(value))
  if (normalizedValue) return normalizedValue
  return getDefaultProductTypeForCategory(fallbackCategory)
}

export const normalizeProductCategory = (value?: string | null, fallbackProductType?: string | null) => {
  const normalizedType = normalizeProductType(fallbackProductType)
  if (normalizedType) {
    return getDefaultCategoryForProductType(normalizedType)
  }

  return resolveCanonicalProductCategory(normalizedToken(value))
}

export const normalizeProductSpecies = (value?: string | null, fallbackGender?: string | null) => {
  const raw = collapseWhitespace(value)
  const token = normalizedToken(raw)

  if (token in SPECIES_TO_GENDER) {
    const resolvedGender = SPECIES_TO_GENDER[token]
    if (resolvedGender === 'dog') return 'Perro'
    if (resolvedGender === 'cat') return 'Gato'
    return 'Perro y gato'
  }

  if (token.includes('perro') || token.includes('dog') || token.includes('canin')) {
    return 'Perro'
  }

  if (token.includes('gato') || token.includes('cat') || token.includes('felin')) {
    return 'Gato'
  }

  if (token.includes('amb') || token.includes('unisex') || token.includes('both')) {
    return 'Perro y gato'
  }

  if (raw) {
    return raw
  }

  const fallbackToken = normalizedToken(fallbackGender)
  if (fallbackToken === 'dog') return 'Perro'
  if (fallbackToken === 'cat') return 'Gato'
  if (fallbackToken === 'unisex') return 'Perro y gato'

  return ''
}

export const resolveAudienceGenderFromSpecies = (species?: string | null, fallbackGender?: string | null) => {
  const normalizedSpecies = normalizeProductSpecies(species, fallbackGender)
  const token = normalizedToken(normalizedSpecies)

  if (token === 'perro') return 'dog'
  if (token === 'gato') return 'cat'
  if (token === 'perro y gato') return 'Unisex'

  const fallbackToken = normalizedToken(fallbackGender)
  if (fallbackToken === 'dog') return 'dog'
  if (fallbackToken === 'cat') return 'cat'
  return 'Unisex'
}

export const getCategoryOptionsForProductType = (productType?: string | null) => {
  const normalizedType = normalizeProductType(productType)
  const defaultCategory = getDefaultCategoryForProductType(normalizedType)
  if (!defaultCategory) {
    return [...PRODUCT_CATEGORY_OPTIONS]
  }

  return PRODUCT_CATEGORY_OPTIONS.filter((option) => option.value === defaultCategory)
}

export const getCategorySuggestionsForProductType = (productType?: string | null) => {
  return getCategoryOptionsForProductType(productType).map((option) => option.value)
}
