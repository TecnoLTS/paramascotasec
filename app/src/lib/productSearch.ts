import { ProductType } from '@/type/ProductType'
import { getProductSku, getProductVariantBaseName, getProductVariantLabel, isProductOnSale } from '@/lib/catalog'

const SEARCH_ALIAS_MAP: Record<string, string[]> = {
  ad: ['adulto', 'adultos'],
  adulto: ['ad'],
  adultos: ['ad'],
  adult: ['ad'],
  ca: ['cachorro', 'cachorros'],
  cachorros: ['ca'],
  cachorro: ['ca'],
  puppy: ['ca'],
  perro: ['perros', 'dog', 'canino', 'caninos'],
  perros: ['perro', 'dog', 'canino', 'caninos'],
  dog: ['perro', 'perros', 'canino', 'caninos'],
  canino: ['perro', 'perros', 'dog', 'caninos'],
  caninos: ['perro', 'perros', 'dog', 'canino'],
  gato: ['gatos', 'cat', 'felino', 'felinos'],
  gatos: ['gato', 'cat', 'felino', 'felinos'],
  cat: ['gato', 'gatos', 'felino', 'felinos'],
  felino: ['gato', 'gatos', 'cat', 'felinos'],
  felinos: ['gato', 'gatos', 'cat', 'felino'],
  oferta: ['ofertas', 'descuento', 'descuentos', 'promo', 'promocion', 'sale'],
  ofertas: ['oferta', 'descuento', 'descuentos', 'promo', 'promocion', 'sale'],
  descuento: ['oferta', 'ofertas', 'descuentos', 'promo', 'promocion', 'sale'],
  descuentos: ['oferta', 'ofertas', 'descuento', 'promo', 'promocion', 'sale'],
  promo: ['oferta', 'ofertas', 'descuento', 'descuentos', 'promocion', 'sale'],
  promocion: ['oferta', 'ofertas', 'descuento', 'descuentos', 'promo', 'sale'],
  sale: ['oferta', 'ofertas', 'descuento', 'descuentos', 'promo', 'promocion'],
  nuevo: ['nueva', 'novedad', 'novedades', 'new'],
  nueva: ['nuevo', 'novedad', 'novedades', 'new'],
  novedad: ['nuevo', 'nueva', 'novedades', 'new'],
  novedades: ['nuevo', 'nueva', 'novedad', 'new'],
  new: ['nuevo', 'nueva', 'novedad', 'novedades'],
}

const UNIT_TOKENS = new Set([
  'gr',
  'g',
  'kg',
  'k',
  'ml',
  'l',
  'lb',
  'ds',
  'tab',
  'uni',
  'unidosis',
])

const GENERIC_DESCRIPTION_PREFIXES = [
  'producto cargado desde portafolio agripac',
]

const GENDER_SEARCH_TERMS: Record<string, string[]> = {
  dog: ['dog', 'perro', 'perros', 'canino', 'caninos'],
  cat: ['cat', 'gato', 'gatos', 'felino', 'felinos'],
}

const SALE_SEARCH_TERMS = ['oferta', 'ofertas', 'descuento', 'descuentos', 'promo', 'promocion']
const NEW_SEARCH_TERMS = ['nuevo', 'nueva', 'novedad', 'novedades']

const STRICT_ALIAS_MATCHES: Record<string, string[]> = {
  ad: ['ad', 'adulto', 'adultos', 'adult'],
  ca: ['ca', 'cachorro', 'cachorros', 'puppy'],
}

export const sanitizeProductSearchQuery = (value: string) =>
  value.replace(/\s+/g, ' ').trim()

export const normalizeProductSearch = (value: string) =>
  sanitizeProductSearchQuery(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/[^a-z0-9.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const getRawSearchTokens = (value: string) =>
  normalizeProductSearch(value)
    .split(' ')
    .map((token) => token.replace(/^\.+|\.+$/g, ''))
    .filter(Boolean)

const mergeMeasurementTerms = (tokens: string[]) => {
  const merged: string[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index]
    const next = tokens[index + 1]

    if (/^\d+(?:\.\d+)?$/.test(current) && next && UNIT_TOKENS.has(next)) {
      merged.push(`${current}${next}`)
      index += 1
      continue
    }

    merged.push(current)
  }

  return merged
}

const expandSearchAliases = (tokens: string[]) => {
  const expanded = new Set<string>(tokens)

  tokens.forEach((token) => {
    const aliases = SEARCH_ALIAS_MAP[token]
    if (!aliases) {
      return
    }

    aliases.forEach((alias) => expanded.add(alias))
  })

  return Array.from(expanded)
}

export const getProductSearchTerms = (value: string) =>
  mergeMeasurementTerms(getRawSearchTokens(value))

export const getProductSearchTokens = (value: string) =>
  expandSearchAliases(mergeMeasurementTerms(getRawSearchTokens(value)))

const getSearchableDescription = (description?: string) => {
  const normalizedDescription = normalizeProductSearch(description ?? '')

  if (!normalizedDescription) {
    return ''
  }

  if (GENERIC_DESCRIPTION_PREFIXES.some((prefix) => normalizedDescription.startsWith(prefix))) {
    return ''
  }

  return description ?? ''
}

const getVariantSearchValues = (product: ProductType) =>
  (product.variantOptions ?? []).flatMap((option) => [
    option.name,
    option.label,
    option.presentation,
    getProductSku(option.product),
    option.product.variantLabel,
    option.product.variantBaseName,
    option.product.variantPresentation,
    ...(option.product.sizes ?? []),
    ...Object.values(option.product.attributes ?? {}),
  ])

const getSemanticSearchValues = (product: ProductType) => {
  const values: string[] = []
  const normalizedGender = normalizeProductSearch(product.gender ?? '')

  if (GENDER_SEARCH_TERMS[normalizedGender]) {
    values.push(...GENDER_SEARCH_TERMS[normalizedGender])
  }

  if (isProductOnSale(product)) {
    values.push(...SALE_SEARCH_TERMS)
  }

  if (product.new) {
    values.push(...NEW_SEARCH_TERMS)
  }

  return values
}

export const buildProductSearchText = (product: ProductType) =>
  getProductSearchTokens([
    product.name,
    product.brand,
    product.category,
    product.gender,
    getSearchableDescription(product.description),
    product.type,
    product.productType,
    getProductSku(product),
    getProductVariantLabel(product),
    getProductVariantBaseName(product),
    product.variantPresentation,
    ...getVariantSearchValues(product),
    ...getSemanticSearchValues(product),
    ...(product.sizes ?? []),
    ...Object.values(product.attributes ?? {}),
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' '))
    .join(' ')

export const buildProductSearchIndex = (products: ProductType[]) =>
  new Map(products.map((product) => [product.id, buildProductSearchText(product)]))

export const filterProductsBySearch = (
  products: ProductType[],
  query: string,
  productSearchIndex = buildProductSearchIndex(products)
) => {
  if (!sanitizeProductSearchQuery(query)) {
    return products
  }

  return products
    .map((product) => ({
      product,
      score: getProductSearchScore(productSearchIndex.get(product.id) ?? '', query),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((item) => item.product)
}

export const matchesProductSearch = (searchText: string, query: string) => {
  const terms = Array.from(new Set(getProductSearchTerms(query)))
  const tokens = getProductSearchTokens(searchText)

  if (!terms.length) {
    return true
  }

  const sortedTerms = [...terms].sort((left, right) => right.length - left.length)

  const matchTermToToken = (term: string, token: string) => {
    const strictMatches = STRICT_ALIAS_MATCHES[term]

    if (strictMatches) {
      if (token.startsWith(term)) {
        return true
      }

      return strictMatches.some((strictTerm) =>
        strictTerm.length <= 2
          ? token === strictTerm
          : token === strictTerm || token.startsWith(strictTerm)
      )
    }

    return token.startsWith(term)
  }

  const backtrack = (termIndex: number, usedTokenIndexes: Set<number>): boolean => {
    if (termIndex >= sortedTerms.length) {
      return true
    }

    const currentTerm = sortedTerms[termIndex]

    for (let index = 0; index < tokens.length; index += 1) {
      if (usedTokenIndexes.has(index)) {
        continue
      }

      if (!matchTermToToken(currentTerm, tokens[index])) {
        continue
      }

      usedTokenIndexes.add(index)

      if (backtrack(termIndex + 1, usedTokenIndexes)) {
        return true
      }

      usedTokenIndexes.delete(index)
    }

    return false
  }

  return backtrack(0, new Set<number>())
}

export const getProductSearchScore = (searchText: string, query: string) => {
  if (!matchesProductSearch(searchText, query)) {
    return 0
  }

  const normalizedQuery = normalizeProductSearch(query)
  const normalizedSearchText = normalizeProductSearch(searchText)
  const terms = Array.from(new Set(getProductSearchTerms(query)))
  const tokens = getProductSearchTokens(searchText)
  let score = 100

  if (normalizedQuery && normalizedSearchText.includes(normalizedQuery)) {
    score += 90
  }

  terms.forEach((term) => {
    if (tokens.some((token) => token === term)) {
      score += 45
      return
    }

    if (tokens.some((token) => token.startsWith(term))) {
      score += 25
      return
    }

    if (normalizedSearchText.includes(term)) {
      score += 10
    }
  })

  return score
}
