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

const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getVariantCandidateValues = (type: string, source: Record<string, any>) => {
    const normalizedType = normalizeProductType(type, String(source.category || ''))
    const valuesByType: Record<string, string[]> = {
        Alimento: ['variantLabel', 'size', 'weight', 'presentation', 'packaging', 'dosage', 'volume'],
        ropa: ['variantLabel', 'size'],
        accesorios: ['variantLabel', 'size', 'presentation'],
        cuidado: ['variantLabel', 'presentation', 'dosage', 'volume', 'size'],
    }

    const keys = valuesByType[normalizedType] ?? ['variantLabel', 'size', 'presentation', 'weight']
    return keys
        .map((key) => String(source[key] || '').trim())
        .filter(Boolean)
}

export const getVariantDefinitionFieldLabel = (type: string) => {
    const normalizedType = normalizeProductType(type)
    if (normalizedType === 'ropa') return 'talla'
    if (normalizedType === 'cuidado') return 'presentación'
    if (normalizedType === 'Alimento') return 'tamaño o peso'
    if (normalizedType === 'accesorios') return 'tamaño'
    return 'variante'
}

export const getVariantDefinitionFieldKey = (type: string) => {
    const normalizedType = normalizeProductType(type)
    if (normalizedType === 'cuidado') return 'presentation'
    return 'size'
}

export const resolveProductVariantLabel = (
    type: string,
    attributes?: Record<string, any> | null,
    product?: Record<string, any> | null
) => {
    const attributeSource = attributes || {}
    const productSource = product || {}
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
        strippedName = strippedName
            .replace(new RegExp(`(?:\\s+|-)?${escapeRegExp(candidate).replace(/\s+/g, '\\s*')}$`, 'i'), '')
            .trim()
    })

    return strippedName || fullName
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

export const createEmptyPurchaseInvoice = (supplierName = ''): PurchaseInvoiceFormState => ({
    invoiceNumber: '',
    supplierName: supplierName.trim(),
    supplierDocument: '',
    issuedAt: getTodayDateInputValue(),
    notes: ''
})

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
    const attributes = normalizeAttributes(productType, product?.attributes)
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
        price: Number.isFinite(basePrice) ? basePrice.toFixed(2) : String(product?.price || ''),
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
        purchaseInvoice: createEmptyPurchaseInvoice(defaultSupplierName),
        thumbImages: filledThumbs.length > 0 ? filledThumbs : [createImageEntry()],
        galleryImages: filledGallery.length > 0 ? filledGallery : [createImageEntry()]
    }
}

export const createDuplicateVariantFormFromProduct = (product: any, vatMultiplier: number): ProductFormState => {
    const duplicatedForm = createProductFormFromProduct(product, vatMultiplier)
    const duplicatedAttributes = { ...(duplicatedForm.attributes || {}) }
    const productType = normalizeProductType(String(product?.productType || ''), String(product?.category || ''))
    const sourceVariantLabel = resolveProductVariantLabel(productType, product?.attributes, product)

    duplicatedAttributes.sku = ''
    duplicatedAttributes.lotCode = ''
    duplicatedAttributes.expirationDate = ''
    duplicatedAttributes.variantLabel = ''
    duplicatedAttributes.variantBaseName = resolveProductVariantBaseName(product)
    duplicatedAttributes.__sourceVariantLabel = sourceVariantLabel
    delete duplicatedAttributes.variantGroupKey

    if (productType === 'Alimento') {
        duplicatedAttributes.size = ''
        duplicatedAttributes.weight = ''
    }

    if (productType === 'ropa' || productType === 'accesorios') {
        duplicatedAttributes.size = ''
    }

    if (productType === 'cuidado') {
        duplicatedAttributes.presentation = ''
    }

    return {
        ...duplicatedForm,
        id: '',
        quantity: '',
        published: false,
        attributes: duplicatedAttributes,
        purchaseInvoice: createEmptyPurchaseInvoice(String(duplicatedForm.attributes?.supplier || '').trim()),
    }
}
