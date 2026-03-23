import {
  PET_SPECIES_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
} from '@/lib/productTaxonomy'

export const PRODUCT_REFERENCE_KEYS = [
  'brands',
  'suppliers',
  'sizes',
  'materials',
  'colors',
  'usages',
  'presentations',
  'activeIngredients',
  'storageLocations',
  'tags',
  'flavors',
  'ageRanges',
] as const

export type ProductReferenceKey = (typeof PRODUCT_REFERENCE_KEYS)[number]

export type ProductReferenceData = Record<ProductReferenceKey, string[]>

export type ProductReferenceSection = {
  key: ProductReferenceKey
  title: string
  description: string
  placeholder: string
  menuIcon:
    | 'SealCheck'
    | 'Truck'
    | 'Ruler'
    | 'Stack'
    | 'Palette'
    | 'ArrowsClockwise'
    | 'Package'
    | 'Flask'
    | 'MapPin'
    | 'Tag'
    | 'BowlFood'
    | 'HourglassMedium'
}

export type ProductSystemReferenceGroup = {
  title: string
  description: string
  values: string[]
}

const collapseWhitespace = (value?: string | null) => (value ?? '').replace(/\s+/g, ' ').trim()

export const createEmptyProductReferenceData = (): ProductReferenceData => ({
  brands: [],
  suppliers: [],
  sizes: [],
  materials: [],
  colors: [],
  usages: [],
  presentations: [],
  activeIngredients: [],
  storageLocations: [],
  tags: [],
  flavors: [],
  ageRanges: [],
})

export const createProductReferenceKeyRecord = <T>(factory: (key: ProductReferenceKey) => T): Record<ProductReferenceKey, T> =>
  PRODUCT_REFERENCE_KEYS.reduce((acc, key) => {
    acc[key] = factory(key)
    return acc
  }, {} as Record<ProductReferenceKey, T>)

export const PRODUCT_REFERENCE_KEY_SET = new Set<ProductReferenceKey>(PRODUCT_REFERENCE_KEYS)

export const normalizeReferenceList = (input: unknown): string[] => {
  if (!Array.isArray(input)) return []

  const seen = new Set<string>()
  const normalized: string[] = []

  input.forEach((value) => {
    const item = collapseWhitespace(typeof value === 'string' ? value : String(value ?? ''))
    if (!item) return

    const dedupeKey = item.toLocaleLowerCase('es-EC')
    if (seen.has(dedupeKey)) return

    seen.add(dedupeKey)
    normalized.push(item)
  })

  return normalized
}

export const normalizeProductReferenceData = (input?: Partial<Record<ProductReferenceKey, unknown>> | null): ProductReferenceData => {
  const defaults = createEmptyProductReferenceData()
  const source = input || {}

  PRODUCT_REFERENCE_KEYS.forEach((key) => {
    defaults[key] = normalizeReferenceList(source[key])
  })

  return defaults
}

export const getReferenceOptionsWithCurrent = (options: string[], currentValue?: string | null) => {
  const normalizedOptions = normalizeReferenceList(options)
  const current = collapseWhitespace(currentValue)
  if (!current) return normalizedOptions

  return normalizeReferenceList([current, ...normalizedOptions])
}

export const PRODUCT_REFERENCE_SECTIONS: ProductReferenceSection[] = [
  {
    key: 'brands',
    title: 'Marcas',
    description: 'Marca comercial visible en catálogo y ficha del producto.',
    placeholder: 'Ej: Frontline',
    menuIcon: 'SealCheck',
  },
  {
    key: 'suppliers',
    title: 'Proveedores',
    description: 'Opciones para factura de compra y proveedor asociado al producto.',
    placeholder: 'Ej: Agripac',
    menuIcon: 'Truck',
  },
  {
    key: 'sizes',
    title: 'Tallas y tamaños',
    description: 'Reutiliza medidas y presentaciones frecuentes como S, M, 1 Kg o 500 ml.',
    placeholder: 'Ej: XL',
    menuIcon: 'Ruler',
  },
  {
    key: 'materials',
    title: 'Materiales',
    description: 'Material principal de accesorios y ropa.',
    placeholder: 'Ej: Nylon',
    menuIcon: 'Stack',
  },
  {
    key: 'colors',
    title: 'Colores',
    description: 'Colores frecuentes para ropa y accesorios.',
    placeholder: 'Ej: Azul',
    menuIcon: 'Palette',
  },
  {
    key: 'usages',
    title: 'Usos',
    description: 'Destino o uso del producto, especialmente en accesorios y salud.',
    placeholder: 'Ej: Paseo',
    menuIcon: 'ArrowsClockwise',
  },
  {
    key: 'presentations',
    title: 'Presentaciones',
    description: 'Formatos comerciales de productos de salud o medicina.',
    placeholder: 'Ej: Spray 120 ml',
    menuIcon: 'Package',
  },
  {
    key: 'activeIngredients',
    title: 'Ingredientes activos',
    description: 'Principios activos de medicamentos y productos de salud.',
    placeholder: 'Ej: Fipronil',
    menuIcon: 'Flask',
  },
  {
    key: 'storageLocations',
    title: 'Ubicaciones de almacenamiento',
    description: 'Ubicaciones de bodega o percha reutilizables.',
    placeholder: 'Ej: Percha A-3',
    menuIcon: 'MapPin',
  },
  {
    key: 'tags',
    title: 'Etiquetas',
    description: 'Etiquetas cortas usadas para panel, ficha o clasificación interna.',
    placeholder: 'Ej: Premium',
    menuIcon: 'Tag',
  },
  {
    key: 'flavors',
    title: 'Sabores',
    description: 'Sabores frecuentes para Alimento y snacks.',
    placeholder: 'Ej: Pollo',
    menuIcon: 'BowlFood',
  },
  {
    key: 'ageRanges',
    title: 'Edades',
    description: 'Rangos de edad comerciales como cachorro, adulto o senior.',
    placeholder: 'Ej: Adulto',
    menuIcon: 'HourglassMedium',
  },
]

export const PRODUCT_SYSTEM_REFERENCE_GROUPS: ProductSystemReferenceGroup[] = [
  {
    title: 'Categorias publicas',
    description: 'Se mantienen controladas por el sistema para evitar cruces entre Alimento, ropa, salud y accesorios.',
    values: PRODUCT_CATEGORY_OPTIONS.map((option) => option.label),
  },
  {
    title: 'Tipos de producto',
    description: 'Definen atributos y validaciones del editor.',
    values: PRODUCT_TYPE_OPTIONS.map((option) => option.label),
  },
  {
    title: 'Mascota o especie',
    description: 'Controla en que secciones publicas aparece el producto.',
    values: PET_SPECIES_OPTIONS.map((option) => option.label),
  },
]
