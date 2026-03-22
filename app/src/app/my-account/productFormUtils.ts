import { mapProductsToDto } from '@/lib/productMapper'
import {
    normalizeProductCategory,
    normalizeProductType,
    normalizeProductSpecies,
} from '@/lib/productTaxonomy'
import type { ProductFormState, PurchaseInvoiceFormState } from './types'

export const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024
export const PRODUCT_IMAGE_ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])

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

export const getEmptyAttributes = (type: string): Record<string, string> => {
    if (type === 'comida') {
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
        'variantLabel',
        'variantBaseName',
        'variantGroupKey',
    ])).forEach((key) => {
        const value = String(current[key] || '').trim()
        if (value) {
            base[key] = value
        }
    })

    if (nextType === 'comida' || nextType === 'cuidado') {
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
    const basePrice = vatMultiplier > 0 ? pvpPrice / vatMultiplier : pvpPrice
    const productType = normalizeProductType(String(product?.productType || ''), String(product?.category || ''))
    const attributes = normalizeAttributes(productType, product?.attributes)
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
    duplicatedAttributes.sku = ''
    duplicatedAttributes.lotCode = ''
    duplicatedAttributes.expirationDate = ''
    duplicatedAttributes.variantLabel = ''

    return {
        ...duplicatedForm,
        id: '',
        quantity: '',
        published: false,
        attributes: duplicatedAttributes,
        purchaseInvoice: createEmptyPurchaseInvoice(String(duplicatedForm.attributes?.supplier || '').trim()),
    }
}
