import { mapProductsToDto } from '@/lib/productMapper'
import { normalizeMeasurementLabel } from '@/lib/measurementLabel'
import {
    normalizeProductCategory,
    normalizeProductType,
    normalizeProductSpecies,
} from '@/lib/productTaxonomy'
import type { ProductFormState, PurchaseInvoiceFormState } from './types'

export const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024
export const PRODUCT_IMAGE_ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
const BASE_PRICE_FRACTION_DIGITS = 4

const COLOR_INFERENCE_RULES: Array<{ canonical: string; patterns: string[] }> = [
    { canonical: 'Verde fluorescente', patterns: ['verde fluorescente'] },
    { canonical: 'Verde Militar', patterns: ['verde militar'] },
    { canonical: 'Azul', patterns: [' azul ', '-az-', '-azul-', ' azul'] },
    { canonical: 'Rojo', patterns: [' rojo ', ' roja ', '-rj-', ' rojo', ' roja'] },
    { canonical: 'Rosa', patterns: [' rosa ', ' rosado ', ' rosada ', '-rs-', ' rosa', ' rosado', ' rosada'] },
    { canonical: 'Morado', patterns: [' morado ', ' morada ', '-mr-', ' morado', ' morada'] },
    { canonical: 'Turquesa', patterns: [' turquesa ', '-tq-', ' turquesa'] },
    { canonical: 'Naranja', patterns: [' naranja ', '-nj-', ' naranja'] },
    { canonical: 'Amarillo', patterns: [' amarillo ', ' amarilla ', '-am-', ' amarillo', ' amarilla'] },
    { canonical: 'Verde', patterns: [' verde ', '-vd-', ' verde'] },
    { canonical: 'Gris', patterns: [' gris ', '-gr-', ' gris'] },
    { canonical: 'Blanco', patterns: [' blanco ', ' blanca ', '-bl-', ' blanco', ' blanca'] },
    { canonical: 'Negro', patterns: [' negro ', ' negra ', '-ng-', '-nr-', ' negro', ' negra'] },
    { canonical: 'Cafe', patterns: [' cafe ', ' café ', '-cf-', ' cafe', ' café'] },
]

const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const requiresSeparatedVariantSuffix = (label: string) =>
    /^(XXS|XS|S|M|L|XL|XXL|STANDARD)$/i.test(label.trim())

const buildFlexibleUnitPattern = (unit: string) => {
    const normalized = unit.toUpperCase()

    switch (normalized) {
        case 'KG':
        case 'KGS':
        case 'K':
            return '(?:KGS?|KG|K)'
        case 'GR':
        case 'G':
            return '(?:GR|G)'
        case 'ML':
            return '(?:MLS?|ML)'
        case 'TABS':
        case 'TAB':
            return 'TABS?'
        case 'UN':
        case 'UNI':
            return '(?:UN|UNI)'
        default:
            return escapeRegExp(normalized)
    }
}

const buildFlexibleVariantSuffixPattern = (label: string) => {
    const normalized = label
        .trim()
        .toUpperCase()
        .replace(/,/g, '.')
        .replace(/\s*-\s*/g, '-')
        .replace(/(\d)\s+(KGS?|KG|K|GR|G|LB|L|ML|MG|OZ|TABS?|DS|UN|UNI|PACK|PZA|PZ)\b/g, '$1$2')
        .replace(/\s+/g, ' ')

    const parts = normalized
        .split(/(\d+(?:\.\d+)?(?:KGS?|KG|K|GR|G|LB|L|ML|MG|OZ|TABS?|DS|UN|UNI|PACK|PZA|PZ)\b)/)
        .filter(Boolean)

    return parts
        .map((part) => {
            const measureMatch = part.match(/^(\d+(?:\.\d+)?)(KGS?|KG|K|GR|G|LB|L|ML|MG|OZ|TABS?|DS|UN|UNI|PACK|PZA|PZ)$/)
            if (measureMatch) {
                return `${escapeRegExp(measureMatch[1])}\\s*${buildFlexibleUnitPattern(measureMatch[2])}`
            }

            return escapeRegExp(part)
                .replace(/\s+/g, '\\s*')
                .replace(/\\-/g, '\\s*-\\s*')
        })
        .join('')
}

const normalizeVariantComparisonValue = (value: unknown) =>
    normalizeMeasurementLabel(String(value || '')).trim().toLowerCase()

const slugifyVariantValue = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

const titleCaseWords = (value: string) =>
    value
        .split(/\s+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
        .join(' ')

const normalizeVariantSizeValue = (value: string) => {
    const normalized = normalizeMeasurementLabel(value).trim()
    if (!normalized) return ''
    if (/^(n\/?a|na)$/i.test(normalized)) return ''
    if (/^(xxs|xs|s|m|l|xl|xxl)$/i.test(normalized)) return normalized.toUpperCase()
    if (/^(small|medium|large)$/i.test(normalized)) return titleCaseWords(normalized)
    return normalized
}

const inferColorFromText = (...values: Array<unknown>) => {
    const haystack = ` ${values.map((value) => slugifyVariantValue(String(value || '')).replace(/-/g, ' ')).join(' ')} `.replace(/\s+/g, ' ')
    if (!haystack.trim()) return ''

    for (const rule of COLOR_INFERENCE_RULES) {
        if (rule.patterns.some((pattern) => haystack.includes(` ${slugifyVariantValue(pattern).replace(/-/g, ' ')} `))) {
            return rule.canonical
        }
    }

    return ''
}

const buildVariantGroupKey = ({
    supplier,
    type,
    species,
    baseName,
}: {
    supplier?: string;
    type?: string;
    species?: string;
    baseName?: string;
}) => {
    const parts = [
        supplier ? slugifyVariantValue(supplier) : '',
        type ? slugifyVariantValue(type) : '',
        species ? slugifyVariantValue(species) : '',
        baseName ? slugifyVariantValue(baseName) : '',
    ].filter(Boolean)

    return parts.join('-')
}

const getVariantCandidateValues = (type: string, source: Record<string, any>) => {
    const normalizedType = normalizeProductType(type, String(source.category || ''))
    const valuesByType: Record<string, string[]> = {
        Alimento: ['variantLabel', 'size', 'weight', 'presentation', 'packaging', 'dosage', 'volume'],
        ropa: ['variantLabel', 'size', 'color'],
        accesorios: ['variantLabel', 'size', 'presentation', 'color'],
        cuidado: ['variantLabel', 'presentation', 'dosage', 'volume', 'size'],
    }

    const keys = valuesByType[normalizedType] ?? ['variantLabel', 'size', 'presentation', 'weight']
    return keys
        .map((key) => String(source[key] || '').trim())
        .filter(Boolean)
}

const resolveCanonicalVariantLabelByType = (type: string, attributes: Record<string, any>) => {
    const normalizedType = normalizeProductType(type, String(attributes.category || ''))
    const size = normalizeVariantSizeValue(String(attributes.size || ''))
    const weight = normalizeMeasurementLabel(String(attributes.weight || '')).trim()
    const presentation = normalizeMeasurementLabel(String(attributes.presentation || '')).trim()
    const color = titleCaseWords(String(attributes.color || '').trim())
    const explicit = normalizeMeasurementLabel(String(attributes.variantLabel || '')).trim()

    if (normalizedType === 'ropa') {
        return size || color || explicit
    }

    if (normalizedType === 'accesorios') {
        return color || size || presentation || explicit
    }

    if (normalizedType === 'cuidado') {
        return presentation || size || explicit
    }

    if (normalizedType === 'Alimento') {
        return weight || size || presentation || explicit
    }

    return explicit || size || weight || presentation || color
}

export const getVariantDefinitionFieldLabel = (type: string) => {
    const normalizedType = normalizeProductType(type)
    if (normalizedType === 'ropa') return 'talla o color'
    if (normalizedType === 'cuidado') return 'presentación'
    if (normalizedType === 'Alimento') return 'tamaño o peso'
    if (normalizedType === 'accesorios') return 'tamaño o color'
    return 'variante'
}

export const getVariantDefinitionFieldKey = (type: string) => {
    const normalizedType = normalizeProductType(type)
    if (normalizedType === 'cuidado') return 'presentation'
    return 'size'
}

export const inferDuplicateVariantFieldKey = (
    type: string,
    attributes?: Record<string, any> | null,
    product?: Record<string, any> | null
) => {
    const normalizedType = normalizeProductType(type, String(product?.category || attributes?.category || ''))
    const attributeSource = attributes || {}
    const productSource = product || {}
    const resolvedVariantLabel = normalizeVariantComparisonValue(
        attributeSource.__sourceVariantLabel
        || attributeSource.variantLabel
        || productSource.variantLabel
        || productSource?.attributes?.variantLabel
    )

    if (normalizedType === 'cuidado') return 'presentation'

    if (normalizedType === 'Alimento') {
        const explicitField = String(attributeSource.__variantDefinitionField || '').trim()
        if (explicitField === 'size' || explicitField === 'weight') {
            return explicitField
        }

        const weightValue = normalizeVariantComparisonValue(attributeSource.weight || productSource?.attributes?.weight || productSource.weight)
        return resolvedVariantLabel && resolvedVariantLabel === weightValue ? 'weight' : 'size'
    }

    if (normalizedType === 'ropa') {
        const explicitField = String(attributeSource.__variantDefinitionField || '').trim()
        if (explicitField === 'color' || explicitField === 'size') {
            return explicitField
        }

        const colorValue = normalizeVariantComparisonValue(attributeSource.color || productSource?.attributes?.color || productSource.color)
        const sizeValue = normalizeVariantComparisonValue(attributeSource.size || productSource?.attributes?.size || productSource.size)

        if (resolvedVariantLabel) {
            if (colorValue && colorValue === resolvedVariantLabel) return 'color'
            if (sizeValue && sizeValue === resolvedVariantLabel) return 'size'
        }

        if (colorValue && !sizeValue) return 'color'
        return 'size'
    }

    if (normalizedType === 'accesorios') {
        const explicitField = String(attributeSource.__variantDefinitionField || '').trim()
        if (explicitField === 'color' || explicitField === 'size') {
            return explicitField
        }

        const colorValue = normalizeVariantComparisonValue(attributeSource.color || productSource?.attributes?.color || productSource.color)
        const sizeValue = normalizeVariantComparisonValue(attributeSource.size || productSource?.attributes?.size || productSource.size)

        if (resolvedVariantLabel) {
            if (colorValue && colorValue === resolvedVariantLabel) return 'color'
            if (sizeValue && sizeValue === resolvedVariantLabel) return 'size'
        }

        if (colorValue && !sizeValue) return 'color'
        return 'size'
    }

    return getVariantDefinitionFieldKey(normalizedType)
}

export const resolveProductVariantLabel = (
    type: string,
    attributes?: Record<string, any> | null,
    product?: Record<string, any> | null
) => {
    const attributeSource = attributes || {}
    const productSource = product || {}
    const explicitCanonical = resolveCanonicalVariantLabelByType(type, {
        ...(productSource?.attributes || {}),
        ...productSource,
        ...attributeSource,
    })
    if (explicitCanonical) {
        return normalizeMeasurementLabel(explicitCanonical)
    }
    const candidates = [
        ...getVariantCandidateValues(type, {
            ...productSource,
            ...(productSource.attributes || {}),
        }),
        ...getVariantCandidateValues(type, attributeSource),
    ]
    const resolved = candidates.find(Boolean) || ''
    return normalizeMeasurementLabel(resolved)
}

export const resolveProductVariantBaseName = (product: any) => {
    const explicitBaseName = String(product?.variantBaseName || product?.attributes?.variantBaseName || '').trim()
    if (explicitBaseName) return explicitBaseName

    const fullName = String(product?.name || '').trim()
    if (!fullName) return ''

    const type = normalizeProductType(String(product?.productType || ''), String(product?.category || ''))
    const variantLabel = resolveProductVariantLabel(type, product?.attributes, product)
    if (!variantLabel) return fullName

    const candidates = Array.from(new Set([
        variantLabel,
        ...getVariantCandidateValues(type, {
            ...(product || {}),
            ...(product?.attributes || {}),
        }),
    ].filter(Boolean)))

    let strippedName = fullName
    candidates.forEach((candidate) => {
        const separator = requiresSeparatedVariantSuffix(candidate) ? '(?:\\s+|-)' : '(?:\\s+|-)?'
        strippedName = strippedName
            .replace(new RegExp(`${separator}${buildFlexibleVariantSuffixPattern(candidate)}$`, 'i'), '')
            .trim()
    })

    return strippedName || fullName
}

export const enrichVariantAttributes = ({
    type,
    category,
    name,
    attributes,
}: {
    type: string;
    category?: string;
    name?: string;
    attributes?: Record<string, any> | null;
}) => {
    const normalizedType = normalizeProductType(type, String(category || ''))
    const nextAttributes: Record<string, string> = { ...(attributes || {}) }
    const rawName = String(name || '').trim()

    const explicitColor = titleCaseWords(String(nextAttributes.color || '').trim())
    const inferredColor = inferColorFromText(
        explicitColor,
        nextAttributes.variantLabel,
        nextAttributes.variantBaseName,
        nextAttributes.sku,
        rawName,
        nextAttributes.tag
    )
    if (!explicitColor && inferredColor) {
        nextAttributes.color = inferredColor
    } else if (explicitColor) {
        nextAttributes.color = explicitColor
    }

    if (nextAttributes.size) {
        nextAttributes.size = normalizeVariantSizeValue(String(nextAttributes.size))
    }
    if (nextAttributes.weight) {
        nextAttributes.weight = normalizeMeasurementLabel(String(nextAttributes.weight)).trim()
    }
    if (nextAttributes.presentation) {
        nextAttributes.presentation = normalizeMeasurementLabel(String(nextAttributes.presentation)).trim()
    }

    const resolvedVariantLabel = resolveCanonicalVariantLabelByType(normalizedType, nextAttributes)

    if (resolvedVariantLabel) {
        nextAttributes.variantLabel = resolvedVariantLabel
    }

    const synthesizedProduct = {
        name: rawName,
        category: normalizeProductCategory(String(category || ''), normalizedType),
        productType: normalizedType,
        attributes: nextAttributes,
        variantLabel: nextAttributes.variantLabel,
        variantBaseName: nextAttributes.variantBaseName,
    }

    const resolvedBaseName = String(nextAttributes.variantBaseName || '').trim()
        || resolveProductVariantBaseName(synthesizedProduct)

    if (resolvedBaseName) {
        nextAttributes.variantBaseName = resolvedBaseName
    }

    if (nextAttributes.variantBaseName) {
        const groupKey = buildVariantGroupKey({
            supplier: String(nextAttributes.supplier || '').trim(),
            type: normalizedType,
            species: String(nextAttributes.species || '').trim(),
            baseName: nextAttributes.variantBaseName,
        })
        if (groupKey) {
            nextAttributes.variantGroupKey = groupKey
        }
    }

    return nextAttributes
}

export const normalizeAdminProducts = (items: any[]) => {
    try {
        return mapProductsToDto(items as any).map((product: any) => ({
            ...product,
            published: isProductEligibleForPublication(product) ? product?.published !== false : false
        }))
    } catch {
        return items
    }
}

export const isProductEligibleForPublication = (product: {
    price?: string | number | null;
    quantity?: string | number | null;
}) => {
    const price = Number(product?.price ?? 0)
    const quantity = Number(product?.quantity ?? 0)
    return Number.isFinite(price) && price > 0 && Number.isFinite(quantity) && quantity > 0
}

export const getAdminProductEntityId = (product: {
    internalId?: string | number | null;
    id?: string | number | null;
    legacy_id?: string | number | null;
    legacyId?: string | number | null;
}) => {
    const resolved = product?.internalId ?? product?.id ?? product?.legacyId ?? product?.legacy_id ?? ''
    return String(resolved || '').trim()
}

const normalizeBooleanLikeValue = (value: unknown, defaultValue = false) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        if (['1', 'true', 'yes', 'y', 'on', 'si', 'sí'].includes(normalized)) return true
        if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false
    }
    return defaultValue
}

export const isTaxExemptProduct = (product?: any) => {
    const rawValue =
        product?.tax?.exempt
        ?? product?.taxExempt
        ?? product?.attributes?.taxExempt
        ?? product?.attributes?.tax_exempt

    return normalizeBooleanLikeValue(rawValue, false)
}

export const getEmptyAttributes = (type: string): Record<string, string> => {
    if (type === 'Alimento') {
        return {
            catalogCategories: '',
            size: '',
            weight: '',
            flavor: '',
            age: '',
            species: '',
            ingredients: '',
            expirationDate: '',
            expirationAlertDays: '30',
            lotCode: '',
            storageLocation: '',
            supplier: '',
            sku: '',
            tag: ''
        }
    }

    if (type === 'ropa') {
        return {
            catalogCategories: '',
            size: '',
            material: '',
            color: '',
            gender: '',
            species: '',
            lotCode: '',
            storageLocation: '',
            supplier: '',
            sku: '',
            tag: ''
        }
    }

    if (type === 'accesorios') {
        return {
            catalogCategories: '',
            material: '',
            size: '',
            color: '',
            usage: '',
            species: '',
            lotCode: '',
            storageLocation: '',
            supplier: '',
            sku: '',
            tag: ''
        }
    }

    if (type === 'cuidado') {
        return {
            catalogCategories: '',
            presentation: '',
            activeIngredient: '',
            usage: '',
            species: '',
            expirationDate: '',
            expirationAlertDays: '30',
            lotCode: '',
            storageLocation: '',
            supplier: '',
            sku: '',
            tag: ''
        }
    }

    return {}
}

export const getAttributesForTypeChange = (nextType: string, currentAttributes?: Record<string, string>) => {
    const base = getEmptyAttributes(nextType)
    const current = currentAttributes || {}

    Array.from(new Set([
        ...Object.keys(base),
        'sku',
        'tag',
        'species',
        'lotCode',
        'storageLocation',
        'supplier',
        'taxExempt',
        'variantLabel',
        'variantBaseName',
        'variantGroupKey',
    ])).forEach((key) => {
        const value = String(current[key] || '').trim()
        if (value) {
            base[key] = value
        }
    })

    if (nextType === 'Alimento' || nextType === 'cuidado') {
        ;['expirationDate', 'expirationAlertDays'].forEach((key) => {
            const value = String(current[key] || '').trim()
            if (value) {
                base[key] = value
            }
        })
    }

    if (nextType === 'ropa') {
        ;['sizeGuideRows', 'sizeGuideNotes'].forEach((key) => {
            const value = String(current[key] || '').trim()
            if (value) {
                base[key] = value
            }
        })
    }

    return base
}

export const normalizeAttributes = (type: string, attrs: any) => {
    const base = getEmptyAttributes(type)
    const merged = { ...base, ...(attrs || {}) }
    const cleaned: Record<string, string> = {}

    Object.keys(merged).forEach((key) => {
        if (key.startsWith('__')) return
        const value = (merged as any)[key]
        if (key === 'catalogCategories') {
            if (Array.isArray(value) && value.length > 0) {
                cleaned[key] = JSON.stringify(value)
            } else if (typeof value === 'string' && value.trim() !== '') {
                cleaned[key] = value.trim()
            }
            return
        }

        if (value !== undefined && value !== null && String(value).trim() !== '') {
            cleaned[key] = String(value).trim()
        }
    })

    return cleaned
}

export const getTodayDateInputValue = () => new Date().toISOString().slice(0, 10)

export const createEmptyPurchaseInvoice = (supplierName = '', purchaseTaxRate = ''): PurchaseInvoiceFormState => ({
    invoiceNumber: '',
    supplierName: supplierName.trim(),
    supplierDocument: '',
    purchaseTaxRate: purchaseTaxRate.trim(),
    issuedAt: getTodayDateInputValue(),
    notes: ''
})

const createPurchaseInvoiceFromSourceProduct = (product: any, purchaseTaxRate = ''): PurchaseInvoiceFormState => {
    const lastPurchaseInvoice = product?.lastPurchaseInvoice || product?.inventory?.lastPurchaseInvoice || null
    const invoiceNumber = String(lastPurchaseInvoice?.invoiceNumber || '').trim()
    const supplierName = String(
        lastPurchaseInvoice?.supplierName
        || product?.attributes?.supplier
        || product?.supplier
        || ''
    ).trim()
    const supplierDocument = String(lastPurchaseInvoice?.supplierDocument || '').trim()
    const issuedAt = String(lastPurchaseInvoice?.issuedAt || '').trim()

    return {
        ...createEmptyPurchaseInvoice(supplierName, purchaseTaxRate),
        invoiceNumber,
        supplierName,
        supplierDocument,
        issuedAt: issuedAt || getTodayDateInputValue(),
    }
}

export const createImageEntry = () => ({ url: '', width: '', height: '' })

const requiredImageSizes = {
    thumb: { width: 640, height: 800 },
    gallery: { width: 1200, height: 1500 }
}

const applyDefaultSizes = (
    entries: Array<{ url: string; width?: string | number; height?: string | number }>,
    kind: 'thumb' | 'gallery'
) => {
    const required = requiredImageSizes[kind]
    return entries.map((entry) => ({
        ...entry,
        width: entry.width && Number(entry.width) > 0 ? String(entry.width) : String(required.width),
        height: entry.height && Number(entry.height) > 0 ? String(entry.height) : String(required.height)
    }))
}

export const createEmptyProductForm = (): ProductFormState => ({
    id: '',
    name: '',
    price: '',
    pvp: '',
    cost: '',
    taxExempt: false,
    quantity: '',
    category: '',
    brand: 'Generico',
    description: '',
    productType: '',
    published: false,
    attributes: {},
    purchaseInvoice: createEmptyPurchaseInvoice(),
    thumbImages: [createImageEntry()],
    galleryImages: [createImageEntry()]
})

export const createProductFormFromProduct = (product: any, vatMultiplier: number): ProductFormState => {
    const pvpPrice = Number(product?.price ?? 0)
    const productType = normalizeProductType(String(product?.productType || ''), String(product?.category || ''))
    const attributes = enrichVariantAttributes({
        type: productType,
        category: String(product?.category || ''),
        name: String(product?.name || ''),
        attributes: normalizeAttributes(productType, product?.attributes),
    })
    const taxExempt = isTaxExemptProduct({ ...product, attributes })
    const effectiveVatMultiplier = taxExempt ? 1 : Math.max(1, vatMultiplier)
    const basePrice = effectiveVatMultiplier > 0 ? pvpPrice / effectiveVatMultiplier : pvpPrice
    const imageMeta = Array.isArray(product?.imageMeta) ? product.imageMeta : []
    const thumbMeta = imageMeta.filter((img: any) => (img.kind || 'gallery') === 'thumb')
    const galleryMeta = imageMeta.filter((img: any) => (img.kind || 'gallery') === 'gallery')

    const thumbImages = thumbMeta.length > 0
        ? thumbMeta.map((img: any) => ({
            url: img.url || '',
            width: img.width ? String(img.width) : '',
            height: img.height ? String(img.height) : ''
        }))
        : (Array.isArray(product?.thumbImage) ? product.thumbImage : []).map((url: string) => ({
            url,
            width: '',
            height: ''
        }))

    const galleryImages = galleryMeta.length > 0
        ? galleryMeta.map((img: any) => ({
            url: img.url || '',
            width: img.width ? String(img.width) : '',
            height: img.height ? String(img.height) : ''
        }))
        : (Array.isArray(product?.images) ? product.images : []).map((url: string) => ({
            url,
            width: '',
            height: ''
        }))

    const filledThumbs = applyDefaultSizes(thumbImages, 'thumb')
    const filledGallery = applyDefaultSizes(galleryImages, 'gallery')
    const defaultSupplierName = String(attributes?.supplier || '').trim()
    if (!attributes.species) {
        const resolvedSpecies = normalizeProductSpecies(product?.gender ?? '')
        if (resolvedSpecies) {
            attributes.species = resolvedSpecies
        }
    }

    return {
        id: getAdminProductEntityId(product),
        name: String(product?.name || ''),
        price: Number.isFinite(basePrice) ? basePrice.toFixed(BASE_PRICE_FRACTION_DIGITS) : String(product?.price || ''),
        pvp: Number.isFinite(pvpPrice) ? pvpPrice.toFixed(2) : String(product?.price || ''),
        cost: String(product?.business?.cost ?? product?.cost ?? 0),
        taxExempt,
        quantity: String(product?.quantity ?? ''),
        category: normalizeProductCategory(product?.category || '', productType),
        brand: String(product?.brand || 'Generico'),
        description: String(product?.description || ''),
        productType,
        published: isProductEligibleForPublication(product) ? product?.published !== false : false,
        attributes,
        purchaseInvoice: createEmptyPurchaseInvoice(defaultSupplierName, String(attributes?.purchaseTaxRate || '').trim()),
        thumbImages: filledThumbs.length > 0 ? filledThumbs : [createImageEntry()],
        galleryImages: filledGallery.length > 0 ? filledGallery : [createImageEntry()]
    }
}

export const createDuplicateVariantFormFromProduct = (product: any, vatMultiplier: number): ProductFormState => {
    const duplicatedForm = createProductFormFromProduct(product, vatMultiplier)
    const duplicatedAttributes = { ...(duplicatedForm.attributes || {}) }
    const productType = normalizeProductType(String(product?.productType || ''), String(product?.category || ''))
    const sourceVariantLabel = resolveProductVariantLabel(productType, product?.attributes, product)
    const sourceVariantFieldKey = inferDuplicateVariantFieldKey(productType, product?.attributes, product)
    const purchaseTaxRate = String(duplicatedForm.attributes?.purchaseTaxRate || '').trim()

    duplicatedAttributes.sku = ''
    duplicatedAttributes.lotCode = ''
    duplicatedAttributes.expirationDate = ''
    duplicatedAttributes.variantLabel = ''
    duplicatedAttributes.variantBaseName = resolveProductVariantBaseName(product)
    duplicatedAttributes.__sourceVariantLabel = sourceVariantLabel
    duplicatedAttributes.__variantDefinitionField = sourceVariantFieldKey
    delete duplicatedAttributes.variantGroupKey

    return {
        ...duplicatedForm,
        id: '',
        quantity: '',
        published: false,
        attributes: duplicatedAttributes,
        purchaseInvoice: createPurchaseInvoiceFromSourceProduct(product, purchaseTaxRate),
    }
}
