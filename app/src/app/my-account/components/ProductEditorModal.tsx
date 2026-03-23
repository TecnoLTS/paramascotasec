'use client'

import React from 'react'
import Image from '@/components/Common/AppImage'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import { requestApi } from '@/lib/apiClient'
import type { PricingCalc, PricingMargins } from '@/lib/api/settings'
import {
    getReferenceOptionsWithCurrent,
    PRODUCT_REFERENCE_SECTIONS,
    type ProductReferenceData,
    type ProductReferenceKey,
} from '@/lib/productReferenceData'
import {
    APPAREL_GENDER_OPTIONS,
    PET_SPECIES_OPTIONS,
    PRODUCT_CATEGORY_OPTIONS,
    PRODUCT_TYPE_OPTIONS,
    getDefaultCategoryForProductType,
    normalizeProductCategory,
    normalizeProductType,
    normalizeProductSpecies,
    parseSerializedProductCategories,
    resolveAudienceGenderFromSpecies,
    serializeProductCategories,
} from '@/lib/productTaxonomy'
import {
    createEmptyProductSizeGuideRow,
    parseProductSizeGuideRows,
    serializeProductSizeGuideRows,
    type ProductSizeGuideRow,
} from '@/lib/productSizeGuide'
import {
    createEmptyPurchaseInvoice,
    createImageEntry,
    getAttributesForTypeChange,
    isProductEligibleForPublication,
    MAX_PRODUCT_IMAGE_BYTES,
    normalizeAdminProducts,
    normalizeAttributes,
    PRODUCT_IMAGE_ACCEPTED_TYPES,
} from '../productFormUtils'
import { ADMIN_PRODUCTS_ENDPOINT, withTransientRetry } from '../utils'
import type { ProductEditorMode, ProductFormState } from '../types'

type ProductEditorModalProps = {
    open: boolean;
    editingProduct: any | null;
    editorMode: ProductEditorMode;
    initialForm: ProductFormState;
    vatMultiplier: number;
    normalizedMargins: PricingMargins;
    normalizedCalc: PricingCalc;
    referenceData: ProductReferenceData;
    activeTab?: string;
    onClose: () => void;
    onProductsUpdated: (products: any[]) => void;
    onRefreshPurchaseInvoices: () => Promise<void>;
    onOpenReferenceCatalog: (key: ProductReferenceKey) => void;
    onSessionExpired?: () => void;
    showNotification: (text: string, type?: 'success' | 'error') => void;
}

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

const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : ''
            if (!result) {
                reject(new Error('No se pudo leer la imagen.'))
                return
            }
            resolve(result)
        }
        reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
        reader.readAsDataURL(file)
    })

const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = document.createElement('img')
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('No se pudo leer la imagen.'))
        img.src = dataUrl
    })

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
        readFileAsDataUrl(file)
            .then((dataUrl) => loadImageFromDataUrl(dataUrl))
            .then((img) => {
                resolve({ width: img.naturalWidth, height: img.naturalHeight })
            })
            .catch((error) => reject(error))
    })

const resizeImage = (file: File, targetWidth: number, targetHeight: number): Promise<File> =>
    new Promise((resolve, reject) => {
        readFileAsDataUrl(file)
            .then((dataUrl) => loadImageFromDataUrl(dataUrl))
            .then((img) => {
                const canvas = document.createElement('canvas')
                canvas.width = targetWidth
                canvas.height = targetHeight
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('No se pudo procesar la imagen.'))
                    return
                }
                // Ajusta la imagen sin deformarla: canvas fijo, fondo blanco y centrado proporcional.
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, targetWidth, targetHeight)

                const scale = Math.min(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight)
                const drawWidth = img.naturalWidth * scale
                const drawHeight = img.naturalHeight * scale
                const offsetX = (targetWidth - drawWidth) / 2
                const offsetY = (targetHeight - drawHeight) / 2

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('No se pudo recortar la imagen.'))
                        return
                    }
                    const ext = file.name.split('.').pop() || 'jpg'
                    resolve(new File([blob], `recorte-${Date.now()}.${ext}`, { type: blob.type }))
                }, file.type || 'image/jpeg', 0.92)
            })
            .catch((error) => reject(error))
    })

const uploadImage = async (file: File, kind: 'thumb' | 'gallery') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('kind', kind)

    const url =
        typeof window !== 'undefined'
            ? `${window.location.origin}/uploads-api/images`
            : '/uploads-api/images'

    const res = await requestApi<{ url: string; width?: number; height?: number; kind: string }>(url, {
        method: 'POST',
        body: formData
    })
    return res.body
}

const getSuggestedBasePriceForCostPreview = (
    cost: number,
    vatMultiplier: number,
    margins: PricingMargins,
    calc: PricingCalc
) => {
    if (!Number.isFinite(cost) || cost <= 0) return 0
    const shippingBuffer = Math.max(0, Number(calc.shippingBuffer || 0))
    const effectiveCost = cost + shippingBuffer
    const margin = Math.max(0, Number(margins.targetMargin || margins.baseMargin || 0))
    const divisor = 1 - (margin / 100)
    let suggestedBase = divisor > 0 ? (effectiveCost / divisor) : effectiveCost
    const rounding = Math.max(0, Number(calc.rounding || 0))
    if (rounding > 0) {
        suggestedBase = Math.ceil(suggestedBase / rounding) * rounding
    }
    const minBase = effectiveCost * (1 + Math.max(0, Number(margins.minMargin || 0)) / 100)
    suggestedBase = Math.max(suggestedBase, minBase)
    const previewPvp = suggestedBase * Math.max(1, vatMultiplier)
    return previewPvp > 0 ? suggestedBase : 0
}

export default function ProductEditorModal({
    open,
    editingProduct,
    editorMode,
    initialForm,
    vatMultiplier,
    normalizedMargins,
    normalizedCalc,
    referenceData,
    activeTab,
    onClose,
    onProductsUpdated,
    onRefreshPurchaseInvoices,
    onOpenReferenceCatalog,
    onSessionExpired,
    showNotification,
}: ProductEditorModalProps) {
    const [form, setForm] = React.useState<ProductFormState>(initialForm)
    const [imageUploading, setImageUploading] = React.useState<Record<string, boolean>>({})
    const [saving, setSaving] = React.useState(false)
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
    const formRef = React.useRef<HTMLFormElement | null>(null)
    const deferredForm = React.useDeferredValue(form)
    const deferredEditingProduct = React.useDeferredValue(editingProduct)
    const isDuplicateVariantMode = editorMode === 'duplicate-variant'

    React.useEffect(() => {
        if (!open) return
        setForm(initialForm)
        setImageUploading({})
        setSaving(false)
        setFormErrors({})
    }, [open, initialForm, editingProduct])

    const duplicateVariantBaseName = React.useMemo(() => {
        const attributeBaseName = String(form.attributes?.variantBaseName || '').trim()
        if (attributeBaseName) return attributeBaseName
        const editingAttributeBaseName = String(editingProduct?.attributes?.variantBaseName || editingProduct?.variantBaseName || '').trim()
        if (editingAttributeBaseName) return editingAttributeBaseName
        const currentName = String(form.name || '').trim()
        return currentName.replace(/\s+\S+$/, '').trim()
    }, [editingProduct, form.attributes?.variantBaseName, form.name])
    const duplicateVariantLabel = React.useMemo(() => {
        const size = String(form.attributes?.size || '').trim()
        if (size) return size
        const weight = String(form.attributes?.weight || '').trim()
        if (weight) return weight
        return String(form.attributes?.variantLabel || '').trim()
    }, [form.attributes?.size, form.attributes?.variantLabel, form.attributes?.weight])
    const selectedAdditionalCategories = React.useMemo(
        () => parseSerializedProductCategories(form.attributes?.catalogCategories),
        [form.attributes?.catalogCategories]
    )
    const sizeGuideRows = React.useMemo(() => parseProductSizeGuideRows(form.attributes?.sizeGuideRows), [form.attributes?.sizeGuideRows])
    const brandOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.brands, form.brand), [form.brand, referenceData.brands])
    const supplierOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.suppliers, form.purchaseInvoice?.supplierName || form.attributes?.supplier), [form.attributes?.supplier, form.purchaseInvoice?.supplierName, referenceData.suppliers])
    const sizeOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.sizes, form.attributes?.size), [form.attributes?.size, referenceData.sizes])
    const materialOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.materials, form.attributes?.material), [form.attributes?.material, referenceData.materials])
    const colorOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.colors, form.attributes?.color), [form.attributes?.color, referenceData.colors])
    const usageOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.usages, form.attributes?.usage), [form.attributes?.usage, referenceData.usages])
    const presentationOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.presentations, form.attributes?.presentation), [form.attributes?.presentation, referenceData.presentations])
    const activeIngredientOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.activeIngredients, form.attributes?.activeIngredient), [form.attributes?.activeIngredient, referenceData.activeIngredients])
    const storageLocationOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.storageLocations, form.attributes?.storageLocation), [form.attributes?.storageLocation, referenceData.storageLocations])
    const tagOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.tags, form.attributes?.tag), [form.attributes?.tag, referenceData.tags])
    const flavorOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.flavors, form.attributes?.flavor), [form.attributes?.flavor, referenceData.flavors])
    const ageRangeOptions = React.useMemo(() => getReferenceOptionsWithCurrent(referenceData.ageRanges, form.attributes?.age), [form.attributes?.age, referenceData.ageRanges])
    const primaryCategory = React.useMemo(
        () => normalizeProductCategory(form.category, form.productType),
        [form.category, form.productType]
    )
    const primaryCategoryLabel = React.useMemo(
        () => PRODUCT_CATEGORY_OPTIONS.find((option) => option.value === primaryCategory)?.label || '',
        [primaryCategory]
    )
    const referenceSectionTitleByKey = React.useMemo(
        () => PRODUCT_REFERENCE_SECTIONS.reduce<Record<ProductReferenceKey, string>>((acc, section) => {
            acc[section.key] = section.title
            return acc
        }, {} as Record<ProductReferenceKey, string>),
        []
    )

    const closeModal = React.useCallback(() => {
        if (saving || Object.values(imageUploading).some(Boolean)) return
        onClose()
    }, [imageUploading, onClose, saving])

    const renderReferenceCatalogHint = React.useCallback((
        key: ProductReferenceKey,
        options: string[],
        emptyText: string,
        customText?: string
    ) => (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary">
            <span>{customText || (options.length > 0 ? 'Si falta una opción, agrégala desde Catálogos operativos.' : emptyText)}</span>
            <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => onOpenReferenceCatalog(key)}
                disabled={saving}
            >
                Abrir catálogos
            </button>
        </div>
    ), [onOpenReferenceCatalog, saving])

    const renderReferenceCatalogHints = React.useCallback((
        items: Array<{ key: ProductReferenceKey; options: string[] }>,
        emptyText?: string
    ) => {
        const uniqueItems = items.filter((item, index, array) => array.findIndex((candidate) => candidate.key === item.key) === index)
        if (uniqueItems.length === 0) return null

        const hasMissingOptions = uniqueItems.some((item) => item.options.length === 0)

        return (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary">
                <span>
                    {hasMissingOptions
                        ? (emptyText || 'Si falta una opción, regístrala desde Catálogos operativos:')
                        : 'Gestiona estas opciones desde Catálogos operativos:'}
                </span>
                {uniqueItems.map((item) => (
                    <button
                        key={`catalog-shortcut-${item.key}`}
                        type="button"
                        className="font-semibold text-primary hover:underline"
                        onClick={() => onOpenReferenceCatalog(item.key)}
                        disabled={saving}
                    >
                        {referenceSectionTitleByKey[item.key] || item.key}
                    </button>
                ))}
            </div>
        )
    }, [onOpenReferenceCatalog, referenceSectionTitleByKey, saving])

    React.useEffect(() => {
        if (!open) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !saving) {
                closeModal()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [closeModal, open, saving])

    React.useEffect(() => {
        if (!isDuplicateVariantMode || !open) return
        const nextName = [duplicateVariantBaseName, duplicateVariantLabel].filter(Boolean).join(' ').trim()

        setForm((prev) => {
            const previousAttributes = prev.attributes || {}
            const nextAttributes = {
                ...previousAttributes,
                variantBaseName: duplicateVariantBaseName,
                variantLabel: duplicateVariantLabel,
            }
            const sameName = String(prev.name || '').trim() === nextName
            const sameBase = String(previousAttributes.variantBaseName || '').trim() === duplicateVariantBaseName
            const sameLabel = String(previousAttributes.variantLabel || '').trim() === duplicateVariantLabel

            if (sameName && sameBase && sameLabel) {
                return prev
            }

            return {
                ...prev,
                name: nextName,
                attributes: nextAttributes,
            }
        })
    }, [duplicateVariantBaseName, duplicateVariantLabel, isDuplicateVariantMode, open])

    const clearErrors = React.useCallback((...fields: string[]) => {
        setFormErrors((prev) => {
            if (fields.length === 0) return {}
            const next = { ...prev }
            fields.forEach((field) => delete next[field])
            return next
        })
    }, [])

    const setAttribute = React.useCallback((key: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            attributes: {
                ...(prev.attributes || {}),
                [key]: value
            }
        }))
        if (['sku', 'tag', 'species', 'expirationDate', 'expirationAlertDays'].includes(key)) {
            clearErrors(key)
        }
    }, [clearErrors])

    const setSpeciesAttribute = React.useCallback((value: string) => {
        setAttribute('species', normalizeProductSpecies(value))
    }, [setAttribute])

    const setPurchaseInvoiceSupplier = React.useCallback((value: string) => {
        setForm((prev) => ({
            ...prev,
            purchaseInvoice: {
                ...prev.purchaseInvoice,
                supplierName: value,
            },
            attributes: {
                ...(prev.attributes || {}),
                supplier: value || String(prev.attributes?.supplier || '').trim(),
            },
        }))
        clearErrors('purchaseInvoiceSupplierName')
    }, [clearErrors])

    const handleProductTypeChange = React.useCallback((value: string) => {
        setForm((prev) => {
            const normalizedType = normalizeProductType(value, prev.category)
            const nextAttributes = getAttributesForTypeChange(normalizedType, prev.attributes)
            const defaultCategory = getDefaultCategoryForProductType(normalizedType)
            const previousPrimaryCategory = normalizeProductCategory(prev.category, prev.productType)
            const preservedAdditionalCategories = parseSerializedProductCategories(prev.attributes?.catalogCategories)
                .filter((category) => category !== defaultCategory)

            if (previousPrimaryCategory && previousPrimaryCategory !== defaultCategory && !preservedAdditionalCategories.includes(previousPrimaryCategory)) {
                preservedAdditionalCategories.unshift(previousPrimaryCategory)
            }

            nextAttributes.catalogCategories = serializeProductCategories(preservedAdditionalCategories)

            if (normalizedType !== 'ropa') {
                delete nextAttributes.sizeGuideRows
                delete nextAttributes.sizeGuideNotes
            }

            return {
                ...prev,
                productType: normalizedType,
                category: defaultCategory,
                attributes: nextAttributes
            }
        })
        clearErrors('productType', 'sku', 'tag', 'species', 'expirationDate', 'expirationAlertDays')
    }, [clearErrors])

    const setPreferredSupplier = React.useCallback((value: string) => {
        setForm((prev) => ({
            ...prev,
            attributes: {
                ...(prev.attributes || {}),
                supplier: value,
            },
            purchaseInvoice: !prev.purchaseInvoice?.supplierName && value
                ? {
                    ...prev.purchaseInvoice,
                    supplierName: value,
                }
                : prev.purchaseInvoice,
        }))
    }, [])

    const toggleAdditionalCategory = React.useCallback((value: string) => {
        const normalizedValue = normalizeProductCategory(value)
        if (!normalizedValue || normalizedValue === normalizeProductCategory(form.category)) return

        const currentValues = parseSerializedProductCategories(form.attributes?.catalogCategories)
        const nextValues = currentValues.includes(normalizedValue)
            ? currentValues.filter((item) => item !== normalizedValue)
            : [...currentValues, normalizedValue]

        setAttribute('catalogCategories', serializeProductCategories(nextValues))
    }, [form.attributes?.catalogCategories, form.category, setAttribute])

    const persistSizeGuideRows = React.useCallback((rows: ProductSizeGuideRow[]) => {
        const serializedRows = serializeProductSizeGuideRows(rows)
        setAttribute('sizeGuideRows', serializedRows === '[]' ? '' : serializedRows)
    }, [setAttribute])

    const addSizeGuideRow = React.useCallback(() => {
        persistSizeGuideRows([...sizeGuideRows, createEmptyProductSizeGuideRow()])
    }, [persistSizeGuideRows, sizeGuideRows])

    const updateSizeGuideRow = React.useCallback((index: number, key: keyof ProductSizeGuideRow, value: string) => {
        const nextRows = sizeGuideRows.slice()
        nextRows[index] = {
            ...(nextRows[index] || createEmptyProductSizeGuideRow()),
            [key]: value
        }
        persistSizeGuideRows(nextRows)
    }, [persistSizeGuideRows, sizeGuideRows])

    const removeSizeGuideRow = React.useCallback((index: number) => {
        const nextRows = sizeGuideRows.slice()
        nextRows.splice(index, 1)
        persistSizeGuideRows(nextRows)
    }, [persistSizeGuideRows, sizeGuideRows])

    const getInputClass = React.useCallback((field: string, baseClass: string) => {
        const borderClass = formErrors[field] ? 'border-red focus:border-red' : 'border-line focus:border-black'
        return `${baseClass} ${borderClass}`
    }, [formErrors])

    const addImageEntry = React.useCallback((kind: 'thumb' | 'gallery') => {
        const key = kind === 'thumb' ? 'thumbImages' : 'galleryImages'
        setForm((prev: any) => ({
            ...prev,
            [key]: [...(prev[key] || []), createImageEntry()]
        }))
    }, [])

    const setImageEntry = React.useCallback((kind: 'thumb' | 'gallery', index: number, entry: { url: string; width: string; height: string }) => {
        const key = kind === 'thumb' ? 'thumbImages' : 'galleryImages'
        setForm((prev: any) => {
            const next = [...(prev[key] || [])]
            next[index] = entry
            return { ...prev, [key]: next }
        })
    }, [])

    const removeImageEntry = React.useCallback((kind: 'thumb' | 'gallery', index: number) => {
        const key = kind === 'thumb' ? 'thumbImages' : 'galleryImages'
        setForm((prev: any) => {
            const next = [...(prev[key] || [])]
            next.splice(index, 1)
            if (next.length === 0) next.push(createImageEntry())
            return { ...prev, [key]: next }
        })
    }, [])

    const handleImageFileChange = React.useCallback(async (kind: 'thumb' | 'gallery', index: number, file?: File | null) => {
        if (!file) return
        const key = `${kind}-${index}`
        setImageUploading((prev) => ({ ...prev, [key]: true }))
        try {
            if (!PRODUCT_IMAGE_ACCEPTED_TYPES.has(file.type)) {
                throw new Error('Formato no permitido. Usa JPG, PNG o WEBP.')
            }
            if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
                throw new Error('La imagen excede 8MB. Reduce el tamaño e intenta nuevamente.')
            }
            const { width, height } = await getImageDimensions(file)
            const required = requiredImageSizes[kind]
            let fileToUpload = file
            if (width !== required.width || height !== required.height) {
                showNotification(`Ajustamos la imagen automáticamente a ${required.width}x${required.height}px.`)
                fileToUpload = await resizeImage(file, required.width, required.height)
            }
            const uploaded = await withTransientRetry(() => uploadImage(fileToUpload, kind))
            setImageEntry(kind, index, {
                url: uploaded.url,
                width: String((uploaded as any).width || required.width),
                height: String((uploaded as any).height || required.height)
            })
            clearErrors(kind === 'thumb' ? 'thumbImages' : 'galleryImages')
            showNotification('Imagen subida correctamente.')
        } catch (error) {
            const message = String((error as any)?.message || '').trim()
            showNotification(message || 'No se pudo subir la imagen.', 'error')
        } finally {
            setImageUploading((prev) => ({ ...prev, [key]: false }))
        }
    }, [clearErrors, setImageEntry, showNotification])

    const handleBasePriceChange = React.useCallback((value: string) => {
        const baseValue = Number(value || 0)
        const pvpValue = vatMultiplier > 0 ? (baseValue * vatMultiplier) : baseValue
        setForm((prev) => ({
            ...prev,
            price: value,
            pvp: Number.isFinite(pvpValue) ? pvpValue.toFixed(2) : ''
        }))
    }, [vatMultiplier])

    const handlePvpPriceChange = React.useCallback((value: string) => {
        const pvpValue = Number(value || 0)
        const baseValue = vatMultiplier > 0 ? (pvpValue / vatMultiplier) : pvpValue
        setForm((prev) => ({
            ...prev,
            pvp: value,
            price: Number.isFinite(baseValue) ? baseValue.toFixed(2) : ''
        }))
    }, [vatMultiplier])

    const productBasePrice = Number(deferredForm.price || 0)
    const productCost = Number(deferredForm.cost || 0)
    const productPvpPrice = Number(deferredForm.pvp || 0) || (productBasePrice * vatMultiplier)
    const productPvpPriceLabel = productPvpPrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const productGrossProfit = Math.max(productBasePrice - productCost, 0)
    const productGrossMargin = productBasePrice > 0 ? (productGrossProfit / productBasePrice) * 100 : 0
    const productMarkup = productCost > 0 ? (productGrossProfit / productCost) * 100 : 0
    const productProfitLabel = productGrossProfit.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const productGrossMarginLabel = productGrossMargin.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const productMarkupLabel = productMarkup.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const persistedProductPvpPrice = Number(deferredEditingProduct?.price ?? 0)
    const persistedProductBasePrice = vatMultiplier > 0 ? (persistedProductPvpPrice / vatMultiplier) : persistedProductPvpPrice
    const persistedProductCost = Number(deferredEditingProduct?.business?.cost ?? deferredEditingProduct?.cost ?? 0)
    const persistedProductQuantity = Number(deferredEditingProduct?.quantity ?? 0)
    const requestedProductQuantity = Number(deferredForm.quantity || 0)
    const stockEntryDelta = deferredEditingProduct
        ? Math.max(0, requestedProductQuantity - persistedProductQuantity)
        : Math.max(0, requestedProductQuantity)
    const requiresPurchaseInvoice = stockEntryDelta > 0
    const purchaseInvoiceTitle = deferredEditingProduct
        ? `Factura para ingreso de ${stockEntryDelta} unidad${stockEntryDelta === 1 ? '' : 'es'}`
        : `Factura para stock inicial de ${stockEntryDelta} unidad${stockEntryDelta === 1 ? '' : 'es'}`
    const hasProductCostPreview = Number.isFinite(productCost) && productCost > 0
    const suggestedBasePricePreview = hasProductCostPreview
        ? getSuggestedBasePriceForCostPreview(productCost, vatMultiplier, normalizedMargins, normalizedCalc)
        : 0
    const suggestedPvpPricePreview = suggestedBasePricePreview * vatMultiplier
    const costChangedForAutoPricing = Boolean(deferredEditingProduct)
        && Number.isFinite(productCost)
        && Math.abs(productCost - persistedProductCost) > 0.00001
    const automaticAppliedBasePrice = costChangedForAutoPricing
        ? Math.max(suggestedBasePricePreview, persistedProductBasePrice, Number.isFinite(productBasePrice) ? productBasePrice : 0)
        : (Number.isFinite(productBasePrice) ? productBasePrice : 0)
    const automaticAppliedPvpPrice = automaticAppliedBasePrice * vatMultiplier
    const automaticPriceWillIncrease = costChangedForAutoPricing
        && automaticAppliedBasePrice > (Number.isFinite(productBasePrice) ? productBasePrice : 0) + 0.00001
    const suggestedBasePriceLabel = suggestedBasePricePreview.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const suggestedPvpPriceLabel = suggestedPvpPricePreview.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const automaticAppliedBasePriceLabel = automaticAppliedBasePrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const automaticAppliedPvpPriceLabel = automaticAppliedPvpPrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const isUploadingProductImages = Object.values(imageUploading).some(Boolean)
    const productFormErrorEntries = Object.entries(formErrors)
    const publicationEligible = isProductEligibleForPublication({
        price: form.price,
        quantity: form.quantity,
    })

    React.useEffect(() => {
        if (!publicationEligible && form.published) {
            setForm((prev) => ({ ...prev, published: false }))
        }
    }, [form.published, publicationEligible])

    const handleSave = React.useCallback(async (event: React.FormEvent) => {
        event.preventDefault()
        if (saving) return
        try {
            if (Object.values(imageUploading).some(Boolean)) {
                showNotification('Espera a que terminen de subir las imágenes.', 'error')
                return
            }
            const token = localStorage.getItem('authToken')
            if (!token) {
                showNotification('Sesión no válida. Inicia sesión nuevamente.', 'error')
                onSessionExpired?.()
                return
            }

            const nextErrors: Record<string, string> = {}
            const name = String(form.name || '').trim()
            const brand = String(form.brand || '').trim()
            const productType = normalizeProductType(form.productType, form.category)
            const category = normalizeProductCategory(form.category, productType)
            const description = String(form.description || '').trim()
            const basePrice = Number(form.price)
            const currentCost = Number(form.cost)
            const quantity = Number(form.quantity)
            const previousQuantity = Number(editingProduct?.quantity ?? 0)
            const stockIncrease = editingProduct ? Math.max(0, quantity - previousQuantity) : Math.max(0, quantity)

            if (name.length < 3) nextErrors.name = 'El nombre debe tener al menos 3 caracteres.'
            if (!brand) nextErrors.brand = 'La marca es obligatoria.'
            if (!productType) nextErrors.productType = 'Selecciona el tipo de producto.'
            if (!Number.isFinite(basePrice) || basePrice < 0) nextErrors.price = 'El precio base debe ser un número válido mayor o igual a 0.'
            if (!Number.isFinite(currentCost) || currentCost < 0) nextErrors.cost = 'El costo debe ser un número válido mayor o igual a 0.'
            if (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity)) nextErrors.quantity = 'El stock debe ser un número entero mayor o igual a 0.'
            if (description.length < 10) nextErrors.description = 'La descripción debe tener al menos 10 caracteres.'

            const normalizedAttributes = normalizeAttributes(productType, form.attributes)
            const normalizedSpecies = normalizeProductSpecies(normalizedAttributes.species, editingProduct?.gender ?? '')
            if (normalizedSpecies) {
                normalizedAttributes.species = normalizedSpecies
            }
            if (productType !== 'ropa') {
                delete normalizedAttributes.sizeGuideRows
                delete normalizedAttributes.sizeGuideNotes
            }
            if (productType) {
                if (!normalizedAttributes.sku) nextErrors.sku = 'El SKU es obligatorio.'
                if (!normalizedAttributes.species) nextErrors.species = 'La especie/mascota es obligatoria.'
            }

            const expirationDateRaw = String(normalizedAttributes.expirationDate || '').trim()
            const alertDaysRaw = String(normalizedAttributes.expirationAlertDays || '').trim()
            const isPerishableProduct = productType === 'Alimento'
            const isCareProduct = productType === 'cuidado'
            const requiresExpirationDate = isPerishableProduct && quantity > 0
            if (isPerishableProduct || isCareProduct) {
                if (requiresExpirationDate && !expirationDateRaw) {
                    nextErrors.expirationDate = 'La fecha de vencimiento es obligatoria para Alimento.'
                }
                if (expirationDateRaw) {
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(expirationDateRaw)) {
                        nextErrors.expirationDate = 'Fecha de vencimiento inválida. Usa formato YYYY-MM-DD.'
                    } else {
                        normalizedAttributes.expirationDate = expirationDateRaw
                    }
                    if (alertDaysRaw === '') {
                        normalizedAttributes.expirationAlertDays = '30'
                    } else if (!/^\d+$/.test(alertDaysRaw)) {
                        nextErrors.expirationAlertDays = 'Los días de alerta de vencimiento deben ser un número entero.'
                    } else {
                        normalizedAttributes.expirationAlertDays = String(Math.min(3650, Math.max(0, Number(alertDaysRaw))))
                    }
                } else if (requiresExpirationDate && alertDaysRaw !== '') {
                    nextErrors.expirationDate = 'Si defines días de alerta, también debes definir fecha de vencimiento.'
                } else {
                    delete normalizedAttributes.expirationDate
                    delete normalizedAttributes.expiryDate
                    delete normalizedAttributes.expirationAlertDays
                    delete normalizedAttributes.expiryAlertDays
                }
            } else {
                delete normalizedAttributes.expirationDate
                delete normalizedAttributes.expiryDate
                delete normalizedAttributes.expirationAlertDays
                delete normalizedAttributes.expiryAlertDays
            }

            const purchaseInvoice = {
                invoiceNumber: String(form.purchaseInvoice?.invoiceNumber || '').trim(),
                supplierName: String(form.purchaseInvoice?.supplierName || '').trim(),
                supplierDocument: String(form.purchaseInvoice?.supplierDocument || '').trim(),
                issuedAt: String(form.purchaseInvoice?.issuedAt || '').trim(),
                notes: String(form.purchaseInvoice?.notes || '').trim()
            }
            if (stockIncrease > 0) {
                if (!purchaseInvoice.invoiceNumber) nextErrors.purchaseInvoiceNumber = 'El número de factura de compra es obligatorio para ingresar stock.'
                if (!purchaseInvoice.supplierName) nextErrors.purchaseInvoiceSupplierName = 'El proveedor es obligatorio para ingresar stock.'
                if (!purchaseInvoice.issuedAt || !/^\d{4}-\d{2}-\d{2}$/.test(purchaseInvoice.issuedAt)) {
                    nextErrors.purchaseInvoiceIssuedAt = 'La fecha de la factura de compra es obligatoria y debe usar formato YYYY-MM-DD.'
                }
                if (!normalizedAttributes.supplier && purchaseInvoice.supplierName) {
                    normalizedAttributes.supplier = purchaseInvoice.supplierName
                }
            }

            const thumbEntries = applyDefaultSizes((form.thumbImages || []).filter((img: any) => img.url && img.url.trim()), 'thumb')
            const galleryEntries = applyDefaultSizes((form.galleryImages || []).filter((img: any) => img.url && img.url.trim()), 'gallery')
            if (thumbEntries.length === 0) nextErrors.thumbImages = 'Agrega al menos una miniatura para el listado.'
            if (galleryEntries.length === 0) nextErrors.galleryImages = 'Agrega al menos una imagen grande para la ficha del producto.'

            const validateSizes = (entries: any[], label: string) => {
                for (const entry of entries) {
                    if (!entry.width || !entry.height) return `Completa el ancho y alto de ${label}.`
                    if (Number(entry.width) <= 0 || Number(entry.height) <= 0) return `El tamaño de ${label} debe ser mayor a 0.`
                }
                return ''
            }
            const thumbSizeError = validateSizes(thumbEntries, 'las miniaturas')
            const gallerySizeError = validateSizes(galleryEntries, 'las imágenes grandes')
            if (thumbSizeError) nextErrors.thumbImages = thumbSizeError
            if (gallerySizeError) nextErrors.galleryImages = gallerySizeError

            if (Object.keys(nextErrors).length > 0) {
                setFormErrors(nextErrors)
                showNotification(Object.values(nextErrors)[0], 'error')
                return
            }

            setFormErrors({})
            setSaving(true)

            const data = {
                name,
                price: basePrice,
                cost: currentCost,
                quantity,
                category,
                productType,
                gender: resolveAudienceGenderFromSpecies(normalizedSpecies, editingProduct?.gender ?? ''),
                published: publicationEligible ? !!form.published : false,
                attributes: normalizedAttributes,
                brand,
                description,
                purchaseInvoice: stockIncrease > 0 ? purchaseInvoice : undefined,
                images: galleryEntries.map((img: any) => ({
                    url: img.url.trim(),
                    width: Number(img.width),
                    height: Number(img.height),
                    kind: 'gallery'
                })),
                thumbImages: thumbEntries.map((img: any) => ({
                    url: img.url.trim(),
                    width: Number(img.width),
                    height: Number(img.height),
                    kind: 'thumb'
                }))
            }

            if (editingProduct) {
                await withTransientRetry(() => requestApi(`/api/products/${form.id}`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }))
                showNotification('Producto actualizado correctamente')
            } else {
                await withTransientRetry(() => requestApi('/api/products', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }))
                showNotification('Producto creado correctamente')
            }

            const res = await withTransientRetry(() => requestApi<any[]>(ADMIN_PRODUCTS_ENDPOINT, { headers: { Authorization: `Bearer ${token}` } }))
            onProductsUpdated(normalizeAdminProducts(res.body))
            if (activeTab === 'inventory') {
                await onRefreshPurchaseInvoices()
            }
            onClose()
        } catch (error) {
            const message = String((error as any)?.message || '').trim()
            if (message.includes('401')) {
                onSessionExpired?.()
            }
            showNotification(message || 'Error al guardar producto', 'error')
        } finally {
            setSaving(false)
        }
    }, [activeTab, editingProduct, form, imageUploading, onClose, onProductsUpdated, onRefreshPurchaseInvoices, onSessionExpired, saving, showNotification])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 p-2 sm:p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[92vh] flex flex-col shadow-2xl" onClick={(event: React.MouseEvent) => event.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10">
                    <h3 className="heading4">
                        {isDuplicateVariantMode ? 'Duplicar Variante' : (editingProduct ? 'Editar Producto' : 'Nuevo Producto')}
                    </h3>
                    <button onClick={closeModal} className="text-secondary hover:text-black" disabled={saving}>
                        <Icon.X size={24} />
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    <form id="product-form" ref={formRef} onSubmit={handleSave} className="space-y-6">
                        {productFormErrorEntries.length > 0 && (
                            <div className="p-4 rounded-xl border border-red/30 bg-red/5">
                                <div className="text-sm font-bold text-red mb-2">Revisa los siguientes campos:</div>
                                <div className="space-y-1">
                                    {productFormErrorEntries.slice(0, 6).map(([field, message]) => (
                                        <p key={field} className="text-xs text-red">{message}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isDuplicateVariantMode && (
                            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                                <div className="text-sm font-bold text-blue-900 mb-1">Modo variante</div>
                                <p className="text-xs text-blue-900/80">
                                    Esta copia mantiene bloqueados los datos que definen la familia del producto. Aquí solo puedes cambiar
                                    la presentación, SKU, precio, costo, stock y datos de inventario para no romper la variante.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-secondary text-sm font-bold uppercase mb-2 block">Nombre del Producto</label>
                                <input type="text" className={getInputClass('name', 'border rounded-lg px-4 py-3 w-full outline-none transition-all')} value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); clearErrors('name') }} required placeholder="Ej: Camiseta Deportiva" disabled={saving || isDuplicateVariantMode} />
                                {formErrors.name && <p className="text-xs text-red mt-1">{formErrors.name}</p>}
                                {isDuplicateVariantMode && <p className="text-secondary text-xs mt-2">El nombre se genera automáticamente con la familia y la presentación para no romper la variante.</p>}
                            </div>
                            <div>
                                <label className="text-secondary text-sm font-bold uppercase mb-2 block">Marca</label>
                                <select
                                    className={getInputClass('brand', 'border rounded-lg px-4 py-3 w-full outline-none transition-all bg-white')}
                                    value={form.brand || ''}
                                    onChange={e => { setForm({ ...form, brand: e.target.value }); clearErrors('brand') }}
                                    required
                                    disabled={saving || isDuplicateVariantMode}
                                >
                                    <option value="">{brandOptions.length > 0 ? 'Selecciona marca' : 'No hay marcas registradas'}</option>
                                    {brandOptions.map((option) => (
                                        <option key={`brand-option-${option}`} value={option}>{option}</option>
                                    ))}
                                </select>
                                {formErrors.brand && <p className="text-xs text-red mt-1">{formErrors.brand}</p>}
                                {renderReferenceCatalogHint('brands', brandOptions, 'No hay marcas registradas todavía.')}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-secondary text-sm font-bold uppercase mb-2 block">Precio base (sin IVA)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                                    <input type="number" step="0.01" min="0" className={getInputClass('price', 'border rounded-lg pl-8 pr-4 py-3 w-full outline-none transition-all')} value={form.price} onChange={e => { handleBasePriceChange(e.target.value); clearErrors('price') }} required disabled={saving} />
                                </div>
                                {formErrors.price && <p className="text-xs text-red mt-1">{formErrors.price}</p>}
                                <label className="text-secondary text-xs font-bold uppercase mt-3 mb-2 block">Precio PVP (con IVA)</label>
                                <input type="number" step="0.01" min="0" className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all" value={form.pvp} onChange={e => handlePvpPriceChange(e.target.value)} disabled={saving} />
                                <p className="text-secondary text-xs mt-1">PVP estimado actual: ${productPvpPriceLabel}</p>
                                {hasProductCostPreview && (
                                    <div className="mt-3 rounded-xl border border-line bg-surface px-4 py-3 space-y-2">
                                        <div className="text-[10px] uppercase font-bold text-secondary">Vista previa por costo</div>
                                        <p className="text-xs text-secondary">Sugerido por costo: <span className="font-semibold text-black">${suggestedBasePriceLabel}</span> base / <span className="font-semibold text-black">${suggestedPvpPriceLabel}</span> PVP</p>
                                        {costChangedForAutoPricing && (
                                            <p className={`text-xs ${automaticPriceWillIncrease ? 'text-orange-600' : 'text-green-700'}`}>Precio aplicado al guardar: <span className="font-semibold">${automaticAppliedBasePriceLabel}</span> base / <span className="font-semibold">${automaticAppliedPvpPriceLabel}</span> PVP</p>
                                        )}
                                        {costChangedForAutoPricing && automaticPriceWillIncrease && <p className="text-[11px] text-orange-700">El backend subirá el precio al guardar para no quedar por debajo del piso calculado por costo.</p>}
                                        {costChangedForAutoPricing && !automaticPriceWillIncrease && <p className="text-[11px] text-green-700">Tu precio actual ya está por encima del piso automático. El backend no lo bajará.</p>}
                                        {!editingProduct && <p className="text-[11px] text-secondary">En productos nuevos esto se muestra como referencia; si quieres usarlo, copia ese precio antes de guardar.</p>}
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface rounded-xl border border-line">
                                    <div><div className="text-[10px] uppercase font-bold text-secondary">Utilidad bruta</div><div className="text-lg font-bold text-success">${productProfitLabel}</div><div className="text-xs text-secondary">Base sin IVA</div></div>
                                    <div><div className="text-[10px] uppercase font-bold text-secondary">Margen bruto</div><div className="text-lg font-bold">{productGrossMarginLabel}%</div><div className="text-xs text-secondary">Utilidad / precio base</div></div>
                                    <div><div className="text-[10px] uppercase font-bold text-secondary">Markup</div><div className="text-lg font-bold">{productMarkupLabel}%</div><div className="text-xs text-secondary">Utilidad / costo</div></div>
                                    <div><div className="text-[10px] uppercase font-bold text-secondary">Utilidad real</div><div className="text-lg font-bold text-success">${productProfitLabel}</div><div className="text-xs text-secondary">El IVA no es utilidad</div></div>
                                </div>
                            </div>
                            <div>
                                <label className="text-secondary text-sm font-bold uppercase mb-2 block">Costo del Producto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                                    <input type="number" step="0.01" min="0" className={getInputClass('cost', 'border rounded-lg pl-8 pr-4 py-3 w-full outline-none transition-all')} value={form.cost} placeholder={editingProduct ? 'Costo unitario' : 'Ej: 9.90'} onChange={e => { setForm({ ...form, cost: e.target.value }); clearErrors('cost') }} required disabled={saving} />
                                </div>
                                {formErrors.cost && <p className="text-xs text-red mt-1">{formErrors.cost}</p>}
                                <p className="text-secondary text-xs mt-2">{editingProduct ? 'Costo real de compra (base para margen).' : 'Referencia editable. Ejemplo sugerido: 9.90.'}</p>
                            </div>
                            <div>
                                <label className="text-secondary text-sm font-bold uppercase mb-2 block">Stock Disponible</label>
                                <input type="number" step="1" min="0" className={getInputClass('quantity', 'border rounded-lg px-4 py-3 w-full outline-none transition-all')} value={form.quantity} placeholder={editingProduct ? 'Stock disponible' : 'Ej: 12'} onChange={e => { setForm({ ...form, quantity: e.target.value }); clearErrors('quantity') }} required disabled={saving} />
                                {formErrors.quantity && <p className="text-xs text-red mt-1">{formErrors.quantity}</p>}
                                <p className="text-secondary text-xs mt-2">{editingProduct ? 'Existencia actual del producto.' : 'Referencia editable. Cambia este ejemplo antes de guardar si necesitas otro stock inicial.'}</p>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl border border-line bg-surface">
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                    <div className="text-xs uppercase font-bold text-secondary">Factura de compra</div>
                                <div className="text-sm font-semibold">{requiresPurchaseInvoice ? purchaseInvoiceTitle : 'Sin ingreso de stock nuevo'}</div>
                                </div>
                                <span className={`text-xs font-semibold ${requiresPurchaseInvoice ? 'text-orange-700' : 'text-secondary'}`}>{requiresPurchaseInvoice ? 'Obligatoria para registrar el movimiento de inventario.' : 'Solo se exige cuando el stock aumenta.'}</span>
                            </div>
                            {requiresPurchaseInvoice ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-secondary text-xs uppercase font-bold mb-2 block">Número de factura</label><input className={getInputClass('purchaseInvoiceNumber', 'border rounded-lg px-4 py-3 w-full outline-none transition-all')} value={form.purchaseInvoice.invoiceNumber} onChange={e => { setForm({ ...form, purchaseInvoice: { ...form.purchaseInvoice, invoiceNumber: e.target.value } }); clearErrors('purchaseInvoiceNumber') }} disabled={saving} />{formErrors.purchaseInvoiceNumber && <p className="text-xs text-red mt-1">{formErrors.purchaseInvoiceNumber}</p>}</div>
                                    <div>
                                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">Proveedor</label>
                                        <select
                                            className={getInputClass('purchaseInvoiceSupplierName', 'border rounded-lg px-4 py-3 w-full outline-none transition-all bg-white')}
                                            value={form.purchaseInvoice.supplierName || ''}
                                            onChange={e => setPurchaseInvoiceSupplier(e.target.value)}
                                            disabled={saving}
                                        >
                                            <option value="">{supplierOptions.length > 0 ? 'Selecciona proveedor' : 'No hay proveedores registrados'}</option>
                                            {supplierOptions.map((option) => (
                                                <option key={`purchase-supplier-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        {formErrors.purchaseInvoiceSupplierName && <p className="text-xs text-red mt-1">{formErrors.purchaseInvoiceSupplierName}</p>}
                                        {renderReferenceCatalogHint('suppliers', supplierOptions, 'No hay proveedores registrados todavía.')}
                                    </div>
                                    <div><label className="text-secondary text-xs uppercase font-bold mb-2 block">RUC o documento</label><input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" value={form.purchaseInvoice.supplierDocument} onChange={e => setForm({ ...form, purchaseInvoice: { ...form.purchaseInvoice, supplierDocument: e.target.value } })} disabled={saving} /></div>
                                    <div><label className="text-secondary text-xs uppercase font-bold mb-2 block">Fecha de factura</label><input type="date" className={getInputClass('purchaseInvoiceIssuedAt', 'border rounded-lg px-4 py-3 w-full outline-none transition-all')} value={form.purchaseInvoice.issuedAt} onChange={e => { setForm({ ...form, purchaseInvoice: { ...form.purchaseInvoice, issuedAt: e.target.value } }); clearErrors('purchaseInvoiceIssuedAt') }} disabled={saving} />{formErrors.purchaseInvoiceIssuedAt && <p className="text-xs text-red mt-1">{formErrors.purchaseInvoiceIssuedAt}</p>}</div>
                                    <div className="md:col-span-2"><label className="text-secondary text-xs uppercase font-bold mb-2 block">Notas de compra</label><textarea className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all min-h-[96px]" value={form.purchaseInvoice.notes} onChange={e => setForm({ ...form, purchaseInvoice: { ...form.purchaseInvoice, notes: e.target.value } })} disabled={saving} /></div>
                                </div>
                            ) : (
                                <p className="text-sm text-secondary">Puedes editar precio, costo o contenido del producto sin capturar factura, siempre que no aumentes el stock disponible.</p>
                            )}
                        </div>

                        {!isDuplicateVariantMode && (
                            <div className="rounded-xl border border-line bg-surface p-5 space-y-5">
                                <div className="text-sm font-semibold">Clasificación y visibilidad</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-secondary text-sm font-bold uppercase mb-2 block">Tipo de producto</label>
                                        <select required className={getInputClass('productType', 'border rounded-lg px-4 py-3 w-full outline-none transition-all bg-white')} value={form.productType} onChange={(e) => handleProductTypeChange(e.target.value)} disabled={saving}>
                                            <option value="">Selecciona tipo</option>
                                            {PRODUCT_TYPE_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        {formErrors.productType && <p className="text-xs text-red mt-1">{formErrors.productType}</p>}
                                        <p className="text-secondary text-xs mt-2">El tipo define los campos específicos y la categoría principal visible en tienda.</p>
                                    </div>
                                    <div>
                                        <label className="text-secondary text-sm font-bold uppercase mb-2 block">Categoría principal visible</label>
                                        <div className="border border-line rounded-lg px-4 py-3 w-full bg-white min-h-[52px] flex items-center">
                                            {primaryCategoryLabel || <span className="text-secondary">Se asigna automáticamente al elegir el tipo</span>}
                                        </div>
                                        <p className="text-secondary text-xs mt-2">Se deriva del tipo para evitar inconsistencias entre catálogo, filtros y ficha pública.</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="text-secondary text-xs uppercase font-bold mb-2">También mostrar en</div>
                                        <div className="flex flex-wrap gap-2">
                                            {PRODUCT_CATEGORY_OPTIONS
                                                .filter((option) => option.value !== primaryCategory)
                                                .map((option) => {
                                                    const isSelected = selectedAdditionalCategories.includes(option.value)
                                                    return (
                                                        <button
                                                            key={`additional-category-${option.value}`}
                                                            type="button"
                                                            className={`px-3 py-2 rounded-full border text-sm font-semibold transition-all ${
                                                                isSelected
                                                                    ? 'bg-black text-white border-black'
                                                                    : 'bg-white border-line hover:border-black'
                                                            }`}
                                                            onClick={() => toggleAdditionalCategory(option.value)}
                                                            disabled={saving || !form.productType}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    )
                                                })}
                                        </div>
                                        <p className="text-secondary text-xs mt-2">Úsalo solo cuando el producto deba aparecer en más de una categoría, por ejemplo Alimento y Salud.</p>
                                    </div>
                                    <div>
                                        <label className="text-secondary text-sm font-bold uppercase mb-2 block">Publicado en tienda web</label>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white focus:border-black disabled:bg-surface disabled:text-secondary" value={form.published ? 'yes' : 'no'} onChange={e => setForm({ ...form, published: e.target.value === 'yes' })} disabled={saving || !publicationEligible}>
                                            <option value="yes">Sí, mostrar en el sitio</option><option value="no">No, ocultar del sitio</option>
                                        </select>
                                        <p className="text-secondary text-xs mt-2">
                                            {publicationEligible
                                                ? 'Si está en no, el producto seguirá en el panel pero no aparecerá en la web pública.'
                                                : 'Solo se puede publicar cuando el producto tiene precio y existencia mayor a 0.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isDuplicateVariantMode && (
                        <div className="p-5 rounded-xl border border-line bg-surface">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-xs uppercase font-bold text-secondary">Imágenes del producto</div>
                                <span className="text-xs text-secondary">Usa miniaturas para listado y fotos grandes para la ficha.</span>
                            </div>
                            {(formErrors.thumbImages || formErrors.galleryImages) && (
                                <div className="mb-4 space-y-1">
                                    {formErrors.thumbImages && <p className="text-xs text-red">{formErrors.thumbImages}</p>}
                                    {formErrors.galleryImages && <p className="text-xs text-red">{formErrors.galleryImages}</p>}
                                </div>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <div className="text-sm font-semibold mb-3">Miniaturas (listado)</div>
                                    <div className="space-y-3">
                                        {(form.thumbImages || []).map((img: any, idx: number) => {
                                            const key = `thumb-${idx}`
                                            return (
                                                <div key={key} className="p-3 rounded-xl border border-line bg-white">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                        <div className="w-16 h-16 rounded-lg bg-surface border border-line overflow-hidden flex items-center justify-center">
                                                            {img.url ? <Image src={img.url} alt={`Miniatura ${idx + 1}`} width={64} height={64} unoptimized className="w-full h-full object-cover" /> : <span className="text-[10px] text-secondary">Sin imagen</span>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <input type="file" accept="image/jpeg,image/png,image/webp" className="border border-line rounded-lg px-3 py-2 w-full text-sm" onChange={(e) => handleImageFileChange('thumb', idx, e.target.files?.[0])} disabled={saving} />
                                                            <div className="text-xs text-secondary mt-1">
                                                                {img.width && img.height ? `${img.width}x${img.height}px` : `${requiredImageSizes.thumb.width}x${requiredImageSizes.thumb.height}px`}
                                                                {imageUploading[key] && <span className="ml-2 text-primary font-semibold">Subiendo...</span>}
                                                            </div>
                                                        </div>
                                                        <button type="button" className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50" onClick={() => removeImageEntry('thumb', idx)} disabled={saving}>Quitar</button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <button type="button" className="mt-3 text-sm text-primary font-semibold disabled:opacity-50" onClick={() => addImageEntry('thumb')} disabled={saving}>+ Agregar miniatura</button>
                                    <div className="text-xs text-secondary mt-2">Miniatura para listados y tarjetas. Proporcion fija recomendada: 4:5 en 640x800. El sistema la centra sin deformarla y esa relacion se mantiene bien en movil y escritorio.</div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold mb-3">Imágenes grandes (ficha)</div>
                                    <div className="space-y-3">
                                        {(form.galleryImages || []).map((img: any, idx: number) => {
                                            const key = `gallery-${idx}`
                                            return (
                                                <div key={key} className="p-3 rounded-xl border border-line bg-white">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                        <div className="w-16 h-16 rounded-lg bg-surface border border-line overflow-hidden flex items-center justify-center">
                                                            {img.url ? <Image src={img.url} alt={`Imagen ficha ${idx + 1}`} width={64} height={64} unoptimized className="w-full h-full object-cover" /> : <span className="text-[10px] text-secondary">Sin imagen</span>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <input type="file" accept="image/jpeg,image/png,image/webp" className="border border-line rounded-lg px-3 py-2 w-full text-sm" onChange={(e) => handleImageFileChange('gallery', idx, e.target.files?.[0])} disabled={saving} />
                                                            <div className="text-xs text-secondary mt-1">
                                                                {img.width && img.height ? `${img.width}x${img.height}px` : `${requiredImageSizes.gallery.width}x${requiredImageSizes.gallery.height}px`}
                                                                {imageUploading[key] && <span className="ml-2 text-primary font-semibold">Subiendo...</span>}
                                                            </div>
                                                        </div>
                                                        <button type="button" className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50" onClick={() => removeImageEntry('gallery', idx)} disabled={saving}>Quitar</button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <button type="button" className="mt-3 text-sm text-primary font-semibold disabled:opacity-50" onClick={() => addImageEntry('gallery')} disabled={saving}>+ Agregar imagen grande</button>
                                    <div className="text-xs text-secondary mt-2">Imagen principal para la ficha del producto. Proporcion fija recomendada: 4:5 en 1200x1500. Mantiene detalle alto sin cargar de mas las renderizaciones.</div>
                                </div>
                            </div>
                        </div>
                        )}

                        {form.productType === 'Alimento' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.size || ''} onChange={e => setAttribute('size', e.target.value)} disabled={saving}>
                                        <option value="">{sizeOptions.length > 0 ? 'Tamaño' : 'No hay tallas o tamaños registrados'}</option>
                                        {sizeOptions.map((option) => (
                                            <option key={`food-size-option-${option}`} value={option}>{option}</option>
                                        ))}
                                    </select>
                                <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Peso. Ej: 2 kg" value={form.attributes?.weight || ''} onChange={e => setAttribute('weight', e.target.value)} />
                                {!isDuplicateVariantMode && (
                                    <>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.flavor || ''} onChange={e => setAttribute('flavor', e.target.value)} disabled={saving}>
                                            <option value="">{flavorOptions.length > 0 ? 'Sabor' : 'No hay sabores registrados'}</option>
                                            {flavorOptions.map((option) => (
                                                <option key={`food-flavor-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.age || ''} onChange={e => setAttribute('age', e.target.value)} disabled={saving}>
                                            <option value="">{ageRangeOptions.length > 0 ? 'Edad' : 'No hay rangos de edad registrados'}</option>
                                            {ageRangeOptions.map((option) => (
                                                <option key={`food-age-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <div>
                                            <select className={getInputClass('species', 'border rounded-lg px-4 py-3 w-full outline-none transition-all bg-white')} value={form.attributes?.species || ''} onChange={e => setSpeciesAttribute(e.target.value)} disabled={saving}>
                                                <option value="">Mascota</option>
                                                {PET_SPECIES_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select>
                                            {formErrors.species && <p className="text-xs text-red mt-1">{formErrors.species}</p>}
                                        </div>
                                        <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Ingredientes" value={form.attributes?.ingredients || ''} onChange={e => setAttribute('ingredients', e.target.value)} />
                                    </>
                                )}
                                <div className="md:col-span-2">
                                    {renderReferenceCatalogHints([
                                        { key: 'sizes', options: sizeOptions },
                                        { key: 'flavors', options: flavorOptions },
                                        { key: 'ageRanges', options: ageRangeOptions },
                                    ])}
                                </div>
                            </div>
                        )}
                        {form.productType === 'ropa' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.size || ''} onChange={e => setAttribute('size', e.target.value)} disabled={saving}>
                                    <option value="">{sizeOptions.length > 0 ? 'Talla' : 'No hay tallas registradas'}</option>
                                    {sizeOptions.map((option) => (
                                        <option key={`apparel-size-option-${option}`} value={option}>{option}</option>
                                    ))}
                                </select>
                                {!isDuplicateVariantMode && (
                                    <>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.material || ''} onChange={e => setAttribute('material', e.target.value)} disabled={saving}>
                                            <option value="">{materialOptions.length > 0 ? 'Material' : 'No hay materiales registrados'}</option>
                                            {materialOptions.map((option) => (
                                                <option key={`apparel-material-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.color || ''} onChange={e => setAttribute('color', e.target.value)} disabled={saving}>
                                            <option value="">{colorOptions.length > 0 ? 'Color' : 'No hay colores registrados'}</option>
                                            {colorOptions.map((option) => (
                                                <option key={`apparel-color-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.gender || ''} onChange={e => setAttribute('gender', e.target.value)} disabled={saving}>
                                            <option value="">Género de la prenda</option>
                                            {APPAREL_GENDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                        <div>
                                            <select className={getInputClass('species', 'border rounded-lg px-4 py-3 w-full outline-none transition-all bg-white')} value={form.attributes?.species || ''} onChange={e => setSpeciesAttribute(e.target.value)} disabled={saving}>
                                                <option value="">Mascota</option>
                                                {PET_SPECIES_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select>
                                            {formErrors.species && <p className="text-xs text-red mt-1">{formErrors.species}</p>}
                                            <p className="text-secondary text-xs mt-2">Este campo controla en qué secciones públicas aparece la prenda: Perros, Gatos o ambas.</p>
                                        </div>
                                    </>
                                )}
                                <div className="md:col-span-2">
                                    {renderReferenceCatalogHints([
                                        { key: 'sizes', options: sizeOptions },
                                        { key: 'materials', options: materialOptions },
                                        { key: 'colors', options: colorOptions },
                                    ])}
                                </div>
                            </div>
                        )}
                        {form.productType === 'accesorios' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.size || ''} onChange={e => setAttribute('size', e.target.value)} disabled={saving}>
                                    <option value="">{sizeOptions.length > 0 ? 'Tamaño' : 'No hay tallas o tamaños registrados'}</option>
                                    {sizeOptions.map((option) => (
                                        <option key={`accessory-size-option-${option}`} value={option}>{option}</option>
                                    ))}
                                </select>
                                {!isDuplicateVariantMode && (
                                    <>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.material || ''} onChange={e => setAttribute('material', e.target.value)} disabled={saving}>
                                            <option value="">{materialOptions.length > 0 ? 'Material' : 'No hay materiales registrados'}</option>
                                            {materialOptions.map((option) => (
                                                <option key={`accessory-material-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.usage || ''} onChange={e => setAttribute('usage', e.target.value)} disabled={saving}>
                                            <option value="">{usageOptions.length > 0 ? 'Uso' : 'No hay usos registrados'}</option>
                                            {usageOptions.map((option) => (
                                                <option key={`accessory-usage-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <div>
                                            <select className={getInputClass('species', 'border rounded-lg px-4 py-3 w-full outline-none transition-all bg-white')} value={form.attributes?.species || ''} onChange={e => setSpeciesAttribute(e.target.value)} disabled={saving}>
                                                <option value="">Mascota</option>
                                                {PET_SPECIES_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select>
                                            {formErrors.species && <p className="text-xs text-red mt-1">{formErrors.species}</p>}
                                        </div>
                                    </>
                                )}
                                <div className="md:col-span-2">
                                    {renderReferenceCatalogHints([
                                        { key: 'sizes', options: sizeOptions },
                                        { key: 'materials', options: materialOptions },
                                        { key: 'usages', options: usageOptions },
                                    ])}
                                </div>
                            </div>
                        )}
                        {form.productType === 'cuidado' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.presentation || ''} onChange={e => setAttribute('presentation', e.target.value)} disabled={saving}>
                                    <option value="">{presentationOptions.length > 0 ? 'Presentación' : 'No hay presentaciones registradas'}</option>
                                    {presentationOptions.map((option) => (
                                        <option key={`care-presentation-option-${option}`} value={option}>{option}</option>
                                    ))}
                                </select>
                                {!isDuplicateVariantMode && (
                                    <>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.activeIngredient || ''} onChange={e => setAttribute('activeIngredient', e.target.value)} disabled={saving}>
                                            <option value="">{activeIngredientOptions.length > 0 ? 'Ingrediente activo o principio' : 'No hay ingredientes activos registrados'}</option>
                                            {activeIngredientOptions.map((option) => (
                                                <option key={`care-active-ingredient-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.usage || ''} onChange={e => setAttribute('usage', e.target.value)} disabled={saving}>
                                            <option value="">{usageOptions.length > 0 ? 'Uso' : 'No hay usos registrados'}</option>
                                            {usageOptions.map((option) => (
                                                <option key={`care-usage-option-${option}`} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <div>
                                            <select className={getInputClass('species', 'border rounded-lg px-4 py-3 w-full outline-none transition-all bg-white')} value={form.attributes?.species || ''} onChange={e => setSpeciesAttribute(e.target.value)} disabled={saving}>
                                                <option value="">Mascota</option>
                                                {PET_SPECIES_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select>
                                            {formErrors.species && <p className="text-xs text-red mt-1">{formErrors.species}</p>}
                                            <p className="text-secondary text-xs mt-2">Úsalo para que el medicamento o cuidado aparezca en la especie correcta.</p>
                                        </div>
                                    </>
                                )}
                                <div className="md:col-span-2">
                                    {renderReferenceCatalogHints([
                                        { key: 'presentations', options: presentationOptions },
                                        { key: 'activeIngredients', options: activeIngredientOptions },
                                        { key: 'usages', options: usageOptions },
                                    ])}
                                </div>
                            </div>
                        )}

                        {form.productType === 'ropa' && !isDuplicateVariantMode && (
                            <div className="rounded-xl border border-line bg-surface p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-semibold">Guía de tallas</div>
                                        <p className="text-secondary text-xs mt-1">Se muestra en la ficha del producto y en la vista rápida. Usa medidas reales de la mascota.</p>
                                    </div>
                                    <button type="button" className="text-sm text-primary font-semibold disabled:opacity-50" onClick={addSizeGuideRow} disabled={saving}>+ Agregar talla</button>
                                </div>

                                {sizeGuideRows.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-line bg-white px-4 py-5 text-sm text-secondary">
                                        Aún no agregas tallas. Usa “Agregar talla” para cargar cuello, pecho, largo y peso recomendado.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {sizeGuideRows.map((row, index) => (
                                            <div key={`size-guide-row-${index}`} className="rounded-xl border border-line bg-white p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                                    <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Talla" value={row.size} onChange={e => updateSizeGuideRow(index, 'size', e.target.value)} disabled={saving} />
                                                    <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Cuello. Ej: 24-28 cm" value={row.neck} onChange={e => updateSizeGuideRow(index, 'neck', e.target.value)} disabled={saving} />
                                                    <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Pecho. Ej: 38-44 cm" value={row.chest} onChange={e => updateSizeGuideRow(index, 'chest', e.target.value)} disabled={saving} />
                                                    <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Largo. Ej: 30-34 cm" value={row.length} onChange={e => updateSizeGuideRow(index, 'length', e.target.value)} disabled={saving} />
                                                    <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Peso. Ej: 5-7 kg" value={row.weight} onChange={e => updateSizeGuideRow(index, 'weight', e.target.value)} disabled={saving} />
                                                </div>
                                                <div className="mt-3 flex justify-end">
                                                    <button type="button" className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50" onClick={() => removeSizeGuideRow(index)} disabled={saving}>Quitar talla</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Nota adicional</label>
                                    <textarea className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all min-h-[88px]" placeholder="Ej: Si tu mascota está entre dos tallas, elige la mayor." value={form.attributes?.sizeGuideNotes || ''} onChange={e => setAttribute('sizeGuideNotes', e.target.value)} disabled={saving} />
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl border border-line bg-surface p-5 space-y-4">
                            <div className="text-sm font-semibold">Datos operativos</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-secondary text-xs uppercase font-bold mb-2 block">SKU</label>
                                <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Ej: CAM-DEP-XL-AZUL" value={form.attributes?.sku || ''} onChange={e => setAttribute('sku', e.target.value)} disabled={saving} />
                                {formErrors.sku && <p className="text-xs text-red mt-1">{formErrors.sku}</p>}
                            </div>
                            {!isDuplicateVariantMode && (
                                <div>
                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Etiqueta comercial</label>
                                    <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.tag || ''} onChange={e => setAttribute('tag', e.target.value)} disabled={saving}>
                                        <option value="">{tagOptions.length > 0 ? 'Sin etiqueta' : 'No hay etiquetas registradas'}</option>
                                        {tagOptions.map((option) => (
                                            <option key={`tag-option-${option}`} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <p className="text-secondary text-xs mt-2">Opcional. Úsala para destacar Premium, Nuevo u otra señal comercial.</p>
                                </div>
                            )}
                            {(form.productType === 'Alimento' || form.productType === 'cuidado') && (
                                <>
                                    <div>
                                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">Fecha de vencimiento</label>
                                        <input type="date" className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" value={form.attributes?.expirationDate || ''} onChange={e => setAttribute('expirationDate', e.target.value)} disabled={saving} />
                                        {formErrors.expirationDate && <p className="text-xs text-red mt-1">{formErrors.expirationDate}</p>}
                                    </div>
                                    <div>
                                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">Alerta de vencimiento (días)</label>
                                        <input type="number" className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" value={form.attributes?.expirationAlertDays || '30'} onChange={e => setAttribute('expirationAlertDays', e.target.value)} disabled={saving} />
                                        {formErrors.expirationAlertDays && <p className="text-xs text-red mt-1">{formErrors.expirationAlertDays}</p>}
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="text-secondary text-xs uppercase font-bold mb-2 block">Lote</label>
                                <input className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all" placeholder="Ej: L-2026-03-001" value={form.attributes?.lotCode || ''} onChange={e => setAttribute('lotCode', e.target.value)} disabled={saving} />
                            </div>
                            <div>
                                <label className="text-secondary text-xs uppercase font-bold mb-2 block">Ubicación de almacenamiento</label>
                                <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.storageLocation || ''} onChange={e => setAttribute('storageLocation', e.target.value)} disabled={saving}>
                                    <option value="">{storageLocationOptions.length > 0 ? 'Selecciona ubicación' : 'No hay ubicaciones registradas'}</option>
                                    {storageLocationOptions.map((option) => (
                                        <option key={`storage-location-option-${option}`} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-secondary text-xs uppercase font-bold mb-2 block">Proveedor habitual</label>
                                <select className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all bg-white" value={form.attributes?.supplier || ''} onChange={e => setPreferredSupplier(e.target.value)} disabled={saving}>
                                    <option value="">{supplierOptions.length > 0 ? 'Selecciona proveedor' : 'No hay proveedores registrados'}</option>
                                    {supplierOptions.map((option) => (
                                        <option key={`supplier-option-${option}`} value={option}>{option}</option>
                                    ))}
                                </select>
                                <p className="text-secondary text-xs mt-2">Opcional. Sirve como proveedor por defecto para próximas compras e ingresos de stock.</p>
                            </div>
                            <div className="md:col-span-2">
                                {renderReferenceCatalogHints([
                                    { key: 'tags', options: tagOptions },
                                    { key: 'storageLocations', options: storageLocationOptions },
                                    { key: 'suppliers', options: supplierOptions },
                                ], 'Registra primero las opciones operativas que falten en Catálogos operativos:')}
                            </div>
                        </div>
                        </div>

                        {!isDuplicateVariantMode && (
                            <div>
                                <label className="text-secondary text-sm font-bold uppercase mb-2 block">Descripción del producto</label>
                                <textarea className={getInputClass('description', 'border rounded-lg px-4 py-3 w-full outline-none transition-all min-h-[140px]')} value={form.description} onChange={e => { setForm({ ...form, description: e.target.value }); clearErrors('description') }} disabled={saving} placeholder="Describe beneficios, uso, material, ingredientes o cualquier dato clave que deba verse en la ficha pública." />
                                {formErrors.description && <p className="text-xs text-red mt-1">{formErrors.description}</p>}
                                <p className="text-secondary text-xs mt-2">Se muestra en la ficha del producto. Usa al menos una explicación clara de compra.</p>
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-4 sm:p-6 border-t border-line flex flex-col sm:flex-row gap-3 justify-end bg-white rounded-b-2xl">
                    <button type="button" className="px-6 sm:px-8 py-3 rounded-full border border-line hover:bg-surface transition-all font-bold disabled:opacity-60" onClick={closeModal} disabled={saving}>Cancelar</button>
                    <button type="button" className="button-main px-6 sm:px-8 py-3 rounded-full bg-black text-white hover:bg-primary transition-all font-bold disabled:opacity-60 disabled:cursor-not-allowed" disabled={saving || isUploadingProductImages} onClick={() => { if (formRef.current?.requestSubmit) { formRef.current.requestSubmit(); return } if (formRef.current) { formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) } }}>
                        {saving ? 'Guardando...' : (isUploadingProductImages ? 'Esperando imágenes...' : 'Guardar cambios')}
                    </button>
                </div>
            </div>
        </div>
    )
}
