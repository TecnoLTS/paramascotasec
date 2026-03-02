'use client'
import React, { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { motion } from 'framer-motion'

import { useRouter } from 'next/navigation'
import { requestApi } from '@/lib/apiClient'
import { getPricingCalc, getPricingMargins, getPricingRules, getProductPageSettings, getStoreStatus, updatePricingCalc, updatePricingMargins, updatePricingRules, updateProductPageSettings, updateStoreStatus } from '@/lib/api/settings'
import type { PricingCalc, PricingMargins, PricingRules, ProductPageSettings, StoreStatusSettings } from '@/lib/api/settings'
import { mapProductsToDto } from '@/lib/productMapper'

interface DashboardStats {
    totalSales: {
        amount: number;
        progress: { percentage: number; current: number; previous: number };
    };
    newOrders: {
        count: number;
        progress: { percentage: number; current: number; previous: number };
    };
    newClients: {
        count: number;
        progress: { percentage: number; current: number; previous: number };
    };
    monthlyPerformance: Array<{ day: string, total: number }>;
    salesTrend30Days?: Array<{ day: string, total: number }>;
    topProducts?: Array<{ name: string, sold: number, revenue: number }>;
    salesByCategory?: Array<{ category: string, total: number }>;
    productAnalysis?: { averageMargin: number, lowMarginOpportunities: number, totalMonitored: number };
    tax?: { rate: number; multiplier: number };
    businessMetrics?: {
        averageOrderValue: number;
        salesSummary?: { gross?: number; net?: number; vat?: number; shipping?: number };
        profitStats: { revenue: number, cost: number, shipping_cost?: number, profit: number, margin: number, roi?: number };
        inventoryValue: { market_value: number, cost_value: number, total_items: number };
        ordersByStatus: Array<{ status: string, count: number }>;
        recentOrders: Array<{ id: string, user_name: string, total: number, status: string, created_at: string }>;
        salesDeepDive?: {
            daily: {
                current: Array<{ day: string, total: string }>;
                previous: Array<{ day: string, total: string }>;
            };
            categories: Array<{ category: string, current: string, previous: string, growth: number }>;
        };
        inventoryDeepDive?: {
            highValueItems: Array<{ name: string, quantity: number, cost: string, total_cost: string }>;
            riskItems: Array<{ name: string, quantity: number }>;
            health: { out_of_stock: number, low_stock: number, overstock: number };
        };
        aovDeepDive?: {
            distribution: Array<{ bucket: string, count: number, revenue: string }>;
        };
        traceability?: {
            orders: Array<{
                id: string;
                created_at: string;
                status: string;
                user_name?: string;
                gross: number;
                net: number;
                vat: number;
                shipping: number;
            }>;
            products: Array<{
                product_id: string;
                product_name: string;
                category: string;
                units_sold: number;
                net_revenue: number;
                order_refs: string[];
            }>;
            categories: Array<{
                category: string;
                net_revenue: number;
                order_refs: string[];
            }>;
        };
        productSalesRanking?: {
            period: { start: string; end: string };
            selectedMonth?: string;
            historicalPeriod?: { start: string | null; end: string | null };
            monthlyTotals: { units_sold: number; net_revenue: number };
            monthlyFinancial?: {
                orders_count: number;
                gross: number;
                net: number;
                vat: number;
                shipping: number;
                cost: number;
                profit: number;
                margin: number;
            };
            historicalTotals: { units_sold: number; net_revenue: number };
            historicalFinancial?: {
                orders_count: number;
                gross: number;
                net: number;
                vat: number;
                shipping: number;
                cost: number;
                profit: number;
                margin: number;
            };
            monthlyRanking: Array<{
                product_id: string;
                product_name: string;
                category: string;
                month_orders_count: number;
                month_units_sold: number;
                month_gross_revenue: number;
                month_net_revenue: number;
                month_vat_amount: number;
                month_shipping_amount: number;
                month_cost: number;
                month_profit: number;
                month_margin: number;
                historical_orders_count: number;
                historical_units_sold: number;
                historical_gross_revenue: number;
                historical_net_revenue: number;
                historical_vat_amount: number;
                historical_shipping_amount: number;
                historical_cost: number;
                historical_profit: number;
                historical_margin: number;
            }>;
            historicalRanking: Array<{
                product_id: string;
                product_name: string;
                category: string;
                month_orders_count: number;
                month_units_sold: number;
                month_gross_revenue: number;
                month_net_revenue: number;
                month_vat_amount: number;
                month_shipping_amount: number;
                month_cost: number;
                month_profit: number;
                month_margin: number;
                historical_orders_count: number;
                historical_units_sold: number;
                historical_gross_revenue: number;
                historical_net_revenue: number;
                historical_vat_amount: number;
                historical_shipping_amount: number;
                historical_cost: number;
                historical_profit: number;
                historical_margin: number;
            }>;
        };
    };
    strategicAlerts?: Array<{ type: 'critical' | 'warning' | 'info', message: string, action: string }>;
}

interface Order {
    id: string;
    user_name?: string;
    total: number;
    status: string;
    created_at: string;
    order_notes?: string | null;
    items?: Array<{
        order_id: string;
        product_id: string;
        product_name: string;
        product_image?: string | null;
        quantity: number;
        price: number;
    }>;
}

interface ShippingProvider {
    id: number;
    name: string;
    status: string;
}

interface ShippingPickup {
    id?: number | string;
    provider?: string;
    provider_name?: string;
    status?: string;
    scheduled_at?: string;
    date?: string;
    window?: string;
    reference?: string;
    order_id?: string | number;
    notes?: string;
}

type DeepDiveView = 'sales' | 'profit' | 'aov' | 'inventory' | 'product-breakdown'
type ProductDetailMetric = 'gross' | 'net' | 'vat' | 'shipping' | 'profit' | 'inventory'

type ProductFormState = {
    id: string;
    name: string;
    price: string;
    pvp: string;
    cost: string;
    quantity: string;
    category: string;
    brand: string;
    description: string;
    productType: string;
    attributes: Record<string, string>;
    thumbImages: Array<{ url: string; width: string; height: string }>;
    galleryImages: Array<{ url: string; width: string; height: string }>;
}

type AddressData = {
    firstName?: string;
    lastName?: string;
    company?: string;
    country?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
}

type SalesRankingRow = {
    product_id: string;
    product_name: string;
    category: string;
    orders_count: number;
    units_sold: number;
    gross_revenue: number;
    net_revenue: number;
    vat_amount: number;
    shipping_amount: number;
    cost: number;
    profit: number;
    margin: number;
    month_orders_count: number;
    month_units_sold: number;
    month_gross_revenue: number;
    month_net_revenue: number;
    month_vat_amount: number;
    month_shipping_amount: number;
    month_cost: number;
    month_profit: number;
    month_margin: number;
    historical_orders_count: number;
    historical_units_sold: number;
    historical_gross_revenue: number;
    historical_net_revenue: number;
    historical_vat_amount: number;
    historical_shipping_amount: number;
    historical_cost: number;
    historical_profit: number;
    historical_margin: number;
}

const DEFAULT_STORE_PAUSE_MESSAGE = 'Tienda temporalmente en mantenimiento. Intenta más tarde.'
const getCurrentMonthKey = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${now.getFullYear()}-${month}`
}
const formatMonthKeyLabel = (monthKey: string) => {
    const match = monthKey.match(/^(\d{4})-(0[1-9]|1[0-2])$/)
    if (!match) return monthKey
    const year = Number(match[1])
    const month = Number(match[2])
    return new Date(year, month - 1, 1).toLocaleDateString('es-EC', {
        month: 'long',
        year: 'numeric'
    })
}

const MyAccount = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<string | undefined>('dashboard')
    const [activeAddress, setActiveAddress] = useState<string | null>('billing')
    const [activeOrders, setActiveOrders] = useState<string | undefined>('all')
    const [openDetail, setOpenDetail] = useState<boolean | undefined>(false)
    const [user, setUser] = useState<{ id: string, name: string, email: string, role?: 'customer' | 'admin' } | null>(null)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    // Address management
    const emptyAddress = {
        firstName: '',
        lastName: '',
        company: '',
        country: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: ''
    }
    const [savedAddresses, setSavedAddresses] = useState<Array<{
        id: number,
        title: string,
        billing: typeof emptyAddress,
        shipping: typeof emptyAddress,
        isSame: boolean
    }>>([
        { id: Date.now(), title: 'Dirección Principal', billing: { ...emptyAddress }, shipping: { ...emptyAddress }, isSame: false }
    ])
    const [currentAddrIndex, setCurrentAddrIndex] = useState(0)
    const [addressSaving, setAddressSaving] = useState(false)
    const [addressLoading, setAddressLoading] = useState(false)
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        gender: '',
        birth: '',
        documentType: '',
        documentNumber: '',
        businessName: ''
    })
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // Admin Data State
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
    const [trendRange, setTrendRange] = useState<7 | 30>(7)
    const [salesRankingView, setSalesRankingView] = useState<'month' | 'historical'>('month')
    const [salesRankingMonth, setSalesRankingMonth] = useState<string>(getCurrentMonthKey())
    const [selectedDeepDive, setSelectedDeepDive] = useState<DeepDiveView | null>(null)
    const [selectedProductMetric, setSelectedProductMetric] = useState<ProductDetailMetric>('net')
    const [adminDataLoading, setAdminDataLoading] = useState(false)
    const [adminDataError, setAdminDataError] = useState<string | null>(null)
    const [adminOrdersList, setAdminOrdersList] = useState<Order[]>([])
    const [adminProductsList, setAdminProductsList] = useState<any[]>([])
    const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([])
    const [shippingPickups, setShippingPickups] = useState<ShippingPickup[]>([])
    const [vatRate, setVatRate] = useState<number>(0)
    const [vatLoading, setVatLoading] = useState(false)
    const [vatSaving, setVatSaving] = useState(false)
    const [shippingRates, setShippingRates] = useState<{ delivery: number; pickup: number; taxRate: number }>({ delivery: 0, pickup: 0, taxRate: 0 })
    const [shippingLoading, setShippingLoading] = useState(false)
    const [shippingSaving, setShippingSaving] = useState(false)
    const [marginSettings, setMarginSettings] = useState<PricingMargins>({ baseMargin: 30, minMargin: 15, targetMargin: 35, promoBuffer: 5 })
    const [calcSettings, setCalcSettings] = useState<PricingCalc>({ rounding: 0.05, strategy: 'cost_plus', includeVatInPvp: true, shippingBuffer: 0 })
    const [pricingRules, setPricingRules] = useState<PricingRules>({ bulkThreshold: 10, bulkDiscount: 5, clearanceThreshold: 25, clearanceDiscount: 15 })
    const [productPageSettings, setProductPageSettings] = useState<ProductPageSettings>({
        deliveryEstimate: '14 de enero - 18 de enero',
        viewerCount: 38,
        freeShippingThreshold: 75,
        supportHours: '8:30 AM a 10:00 PM',
        returnDays: 100
    })
    const [storeStatus, setStoreStatus] = useState<StoreStatusSettings>({
        salesEnabled: true,
        message: DEFAULT_STORE_PAUSE_MESSAGE,
        updatedAt: null,
        updatedBy: null
    })
    const [storeStatusLoading, setStoreStatusLoading] = useState(false)
    const [storeStatusSaving, setStoreStatusSaving] = useState(false)

    // Modal & Form State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any | null>(null)
    const [productForm, setProductForm] = useState<ProductFormState>({
        id: '',
        name: '',
        price: '',
        pvp: '',
        cost: '',
        quantity: '',
        category: 'General',
        brand: 'Generico',
        description: '',
        productType: '',
        attributes: {},
        thumbImages: [],
        galleryImages: []
    })
    const [imageUploading, setImageUploading] = useState<Record<string, boolean>>({})

    const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
    const productFormRef = useRef<HTMLFormElement | null>(null)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const [selectedSalesProduct, setSelectedSalesProduct] = useState<SalesRankingRow | null>(null)
    const [isSalesProductModalOpen, setIsSalesProductModalOpen] = useState(false)
    const [userOrders, setUserOrders] = useState<Order[]>([])
    const [userOrdersLoading, setUserOrdersLoading] = useState(false)

    const normalizeAdminProducts = (items: any[]) => {
        try {
            return mapProductsToDto(items as any)
        } catch {
            return items
        }
    }

    const getEmptyAttributes = (type: string): Record<string, string> => {
        if (type === 'comida') {
            return { size: '', weight: '', flavor: '', age: '', species: '', ingredients: '', sku: '', tag: '' }
        }
        if (type === 'ropa') {
            return { size: '', material: '', color: '', gender: '', species: '', sku: '', tag: '' }
        }
        if (type === 'accesorios') {
            return { material: '', size: '', usage: '', species: '', sku: '', tag: '' }
        }
        return {}
    }

    const normalizeAttributes = (type: string, attrs: any) => {
        const base = getEmptyAttributes(type)
        const merged = { ...base, ...(attrs || {}) }
        const cleaned: Record<string, string> = {}
        Object.keys(merged).forEach((key) => {
            const value = (merged as any)[key]
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                cleaned[key] = String(value).trim()
            }
        })
        return cleaned
    }

    const setProductAttribute = (key: string, value: string) => {
        setProductForm((prev: any) => ({
            ...prev,
            attributes: {
                ...(prev.attributes || {}),
                [key]: value
            }
        }))
    }
    const createImageEntry = () => ({ url: '', width: '', height: '' })
    const addImageEntry = (kind: 'thumb' | 'gallery') => {
        const key = kind === 'thumb' ? 'thumbImages' : 'galleryImages'
        setProductForm((prev: any) => ({
            ...prev,
            [key]: [...(prev[key] || []), createImageEntry()]
        }))
    }
    const updateImageEntry = (kind: 'thumb' | 'gallery', index: number, field: 'url' | 'width' | 'height', value: string) => {
        const key = kind === 'thumb' ? 'thumbImages' : 'galleryImages'
        setProductForm((prev: any) => {
            const next = [...(prev[key] || [])]
            next[index] = { ...next[index], [field]: value }
            return { ...prev, [key]: next }
        })
    }
    const removeImageEntry = (kind: 'thumb' | 'gallery', index: number) => {
        const key = kind === 'thumb' ? 'thumbImages' : 'galleryImages'
        setProductForm((prev: any) => {
            const next = [...(prev[key] || [])]
            next.splice(index, 1)
            return { ...prev, [key]: next }
        })
    }
    const requiredImageSizes = {
        thumb: { width: 400, height: 520 },
        gallery: { width: 1200, height: 1400 }
    }
    const applyDefaultSizes = (entries: Array<{ url: string; width?: string | number; height?: string | number }>, kind: 'thumb' | 'gallery') => {
        const required = requiredImageSizes[kind]
        return entries.map((entry) => ({
            ...entry,
            width: entry.width && Number(entry.width) > 0 ? String(entry.width) : String(required.width),
            height: entry.height && Number(entry.height) > 0 ? String(entry.height) : String(required.height)
        }))
    }
    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
        new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file)
            const img = document.createElement('img')
            img.onload = () => {
                const width = img.naturalWidth
                const height = img.naturalHeight
                URL.revokeObjectURL(url)
                resolve({ width, height })
            }
            img.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error('No se pudo leer la imagen.'))
            }
            img.src = url
        })
    const resizeImage = (file: File, targetWidth: number, targetHeight: number): Promise<File> =>
        new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file)
            const img = document.createElement('img')
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = targetWidth
                canvas.height = targetHeight
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    URL.revokeObjectURL(url)
                    reject(new Error('No se pudo procesar la imagen.'))
                    return
                }
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url)
                    if (!blob) {
                        reject(new Error('No se pudo recortar la imagen.'))
                        return
                    }
                    const ext = file.name.split('.').pop() || 'jpg'
                    const resizedFile = new File([blob], `recorte-${Date.now()}.${ext}`, { type: blob.type })
                    resolve(resizedFile)
                }, file.type || 'image/jpeg', 0.92)
            }
            img.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error('No se pudo procesar la imagen.'))
            }
            img.src = url
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
    const handleImageFileChange = async (kind: 'thumb' | 'gallery', index: number, file?: File | null) => {
        if (!file) return
        const key = `${kind}-${index}`
        setImageUploading((prev) => ({ ...prev, [key]: true }))
        try {
            const { width, height } = await getImageDimensions(file)
            const required = requiredImageSizes[kind]
            let fileToUpload = file
            if (width !== required.width || height !== required.height) {
                showNotification(`La imagen no cumple el tamaño (${required.width}x${required.height}px). Se recortará automáticamente.`, 'error')
                fileToUpload = await resizeImage(file, required.width, required.height)
            }
            const uploaded = await uploadImage(fileToUpload, kind)
            updateImageEntry(kind, index, 'url', uploaded.url)
            updateImageEntry(kind, index, 'width', String((uploaded as any).width || required.width))
            updateImageEntry(kind, index, 'height', String((uploaded as any).height || required.height))
            showNotification('Imagen subida correctamente.')
        } catch (error) {
            console.error(error)
            showNotification('No se pudo subir la imagen.', 'error')
        } finally {
            setImageUploading((prev) => ({ ...prev, [key]: false }))
        }
    }

    // Handlers
    const handleNewProduct = () => {
        setEditingProduct(null)
        setProductForm({
            id: '',
            name: '',
            price: '',
            pvp: '',
            cost: '',
            quantity: '',
            category: 'General',
            brand: 'Generico',
            description: '',
            productType: '',
            attributes: {},
            thumbImages: [createImageEntry()],
            galleryImages: [createImageEntry()]
        })
        setIsProductModalOpen(true)
    }

    const handleEditProduct = (product: any) => {
        const rate = Number(dashboardStats?.tax?.rate ?? vatRate ?? 0)
        const multiplier = 1 + rate / 100
        const pvpPrice = Number(product.price ?? 0)
        const basePrice = multiplier > 0 ? pvpPrice / multiplier : pvpPrice
        const productType = (product.productType || '').toLowerCase()
        const attributes = normalizeAttributes(productType, product.attributes)
        const imageMeta = Array.isArray(product.imageMeta) ? product.imageMeta : []
        const thumbMeta = imageMeta.filter((img: any) => (img.kind || 'gallery') === 'thumb')
        const galleryMeta = imageMeta.filter((img: any) => (img.kind || 'gallery') === 'gallery')
        const thumbImages = thumbMeta.length > 0
            ? thumbMeta.map((img: any) => ({
                url: img.url || '',
                width: img.width ? String(img.width) : '',
                height: img.height ? String(img.height) : ''
            }))
            : (Array.isArray(product.thumbImage) ? product.thumbImage : []).map((url: string) => ({ url, width: '', height: '' }))
        const galleryImages = galleryMeta.length > 0
            ? galleryMeta.map((img: any) => ({
                url: img.url || '',
                width: img.width ? String(img.width) : '',
                height: img.height ? String(img.height) : ''
            }))
            : (Array.isArray(product.images) ? product.images : []).map((url: string) => ({ url, width: '', height: '' }))
        const filledThumbs = applyDefaultSizes(thumbImages, 'thumb')
        const filledGallery = applyDefaultSizes(galleryImages, 'gallery')
        setEditingProduct(product)
        setProductForm({
            id: product.internalId || product.id,
            name: product.name,
            price: Number.isFinite(basePrice) ? basePrice.toFixed(2) : product.price,
            pvp: Number.isFinite(pvpPrice) ? pvpPrice.toFixed(2) : product.price,
            cost: product.business?.cost || product.cost || 0,
            quantity: product.quantity,
            category: product.category || 'General',
            brand: product.brand || 'Generico',
            description: product.description || '',
            productType: productType,
            attributes,
            thumbImages: filledThumbs.length > 0 ? filledThumbs : [createImageEntry()],
            galleryImages: filledGallery.length > 0 ? filledGallery : [createImageEntry()]
        })
        setIsProductModalOpen(true)
    }

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await requestApi(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Producto eliminado correctamente');
            // Refresh list
            const res = await requestApi<any[]>('/api/products', { headers: { Authorization: `Bearer ${token}` } });
            setAdminProductsList(normalizeAdminProducts(res.body));
        } catch (error) {
            console.error(error);
            showNotification('Error al eliminar producto', 'error');
        }
    }

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (Object.values(imageUploading).some(Boolean)) {
                showNotification('Espera a que terminen de subir las imágenes.', 'error')
                return
            }
            const token = localStorage.getItem('authToken');
            if (!productForm.productType) {
                showNotification('Selecciona el tipo de producto.', 'error')
                return
            }
            const normalizedAttributes = normalizeAttributes(productForm.productType, productForm.attributes)
            if (!normalizedAttributes.sku) {
                showNotification('El SKU es obligatorio.', 'error')
                return
            }
            if (!normalizedAttributes.tag) {
                showNotification('La etiqueta es obligatoria.', 'error')
                return
            }
            if (!normalizedAttributes.species) {
                showNotification('La especie/mascota es obligatoria.', 'error')
                return
            }
            if (!productForm.description || !productForm.description.trim()) {
                showNotification('La descripción es obligatoria.', 'error')
                return
            }
            const thumbEntries = applyDefaultSizes(
                (productForm.thumbImages || []).filter((img: any) => img.url && img.url.trim()),
                'thumb'
            )
            const galleryEntries = applyDefaultSizes(
                (productForm.galleryImages || []).filter((img: any) => img.url && img.url.trim()),
                'gallery'
            )
            if (thumbEntries.length === 0) {
                showNotification('Agrega al menos una miniatura para el listado.', 'error')
                return
            }
            if (galleryEntries.length === 0) {
                showNotification('Agrega al menos una imagen grande para la ficha del producto.', 'error')
                return
            }
            const validateSizes = (entries: any[], label: string) => {
                for (const entry of entries) {
                    if (!entry.width || !entry.height) {
                        showNotification(`Completa el ancho y alto de ${label}.`, 'error')
                        return false
                    }
                    if (Number(entry.width) <= 0 || Number(entry.height) <= 0) {
                        showNotification(`El tamaño de ${label} debe ser mayor a 0.`, 'error')
                        return false
                    }
                }
                return true
            }
            if (!validateSizes(thumbEntries, 'las miniaturas')) return
            if (!validateSizes(galleryEntries, 'las imágenes grandes')) return
            const data = {
                name: productForm.name,
                price: parseFloat(productForm.price),
                cost: parseFloat(productForm.cost),
                quantity: parseInt(productForm.quantity),
                category: productForm.category,
                productType: productForm.productType,
                attributes: normalizedAttributes,
                brand: productForm.brand,
                description: productForm.description,
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
            };

            if (editingProduct) {
                await requestApi(`/api/products/${productForm.id}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                showNotification('Producto actualizado correctamente');
            } else {
                await requestApi('/api/products', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                showNotification('Producto creado correctamente');
            }
            setIsProductModalOpen(false);
            // Refresh list
            const res = await requestApi<any[]>('/api/products', { headers: { Authorization: `Bearer ${token}` } });
            setAdminProductsList(normalizeAdminProducts(res.body));
        } catch (error) {
            console.error(error);
            showNotification('Error al guardar producto', 'error');
        }
    }

    const handleOptimizePrice = async (product: any) => {
        if (!product.business?.suggestions?.recommended_price) return;

        const newPrice = product.business.suggestions.recommended_price;
        if (!confirm(`¿Aplicar precio sugerido de $${newPrice}?`)) return;

        try {
            const token = localStorage.getItem('authToken');
            await requestApi(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ price: newPrice })
            });
            showNotification(`Precio optimizado a $${newPrice}`);
            // Refresh list
            const res = await requestApi<any[]>('/api/products', { headers: { Authorization: `Bearer ${token}` } });
            setAdminProductsList(normalizeAdminProducts(res.body));
        } catch (error) {
            console.error(error);
            showNotification('Error al optimizar precio', 'error');
        }
    }

    const handleViewOrder = async (orderId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await requestApi<any>(`/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedOrder(res.body);
            setIsOrderModalOpen(true);
        } catch (error) {
            console.error(error);
            showNotification('Error al cargar pedido', 'error');
        }
    }

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                showNotification('Debes iniciar sesión para actualizar el pedido.', 'error');
                return;
            }
            await requestApi(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            showNotification(`Pedido ${newStatus === 'delivered' ? 'entregado' : 'actualizado'} correctamente`);
            setIsOrderModalOpen(false);
            // Refresh orders
            if (user?.role === 'admin') {
                const res = await requestApi<Order[]>('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
                setAdminOrdersList(res.body);
            } else {
                const res = await requestApi<Order[]>('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } });
                setUserOrders(res.body);
            }
        } catch (error: any) {
            console.error(error);
            if (error?.message && (error.message.includes('Error 401') || error.message.includes('No autorizado'))) {
                handleLogout();
                return;
            }
            showNotification('Error al actualizar el pedido', 'error');
        }
    }

    const parseAddress = (value: any): AddressData | string | null => {
        if (!value) return null
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value)
                if (parsed && typeof parsed === 'object') {
                    return parsed as AddressData
                }
                return value
            } catch {
                return value
            }
        }
        if (value && typeof value === 'object') {
            return value as AddressData
        }
        return null
    }

    const formatAddress = (value: any) => {
        const addr = parseAddress(value)
        if (!addr || typeof addr === 'string') return addr || '-'
        const parts = [addr.street, addr.city, addr.state, addr.country, addr.zip].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : '-'
    }

    const formatAddressLines = (value: any) => {
        const addr = parseAddress(value)
        if (!addr) return []
        if (typeof addr === 'string') return [addr]
        const nameLine = [addr.firstName, addr.lastName].filter(Boolean).join(' ')
        const cityLine = [addr.city, addr.state, addr.zip].filter(Boolean).join(', ')
        const lines = [
            nameLine || null,
            addr.company || null,
            addr.street || null,
            cityLine || null,
            addr.country || null,
            addr.phone || null,
            addr.email || null
        ].filter(Boolean) as string[]
        return lines
    }

    const getDefaultBillingAddress = (): AddressData | null => {
        if (!savedAddresses || savedAddresses.length === 0) return null
        const primary = savedAddresses[0]
        return primary?.billing || null
    }

    const formatMoney = (value: any) => {
        const num = Number(value ?? 0)
        return `$${num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatDateEcuador = (
        value: string | number | Date,
        options: Intl.DateTimeFormatOptions = {}
    ) => {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil', ...options })
    }

    const formatDateTimeEcuador = (
        value: string | number | Date,
        options: Intl.DateTimeFormatOptions = {}
    ) => {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return '-'
        return date.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', ...options })
    }

    const getOrderItemsGrossSubtotal = (order: any) => {
        if (!order) return 0
        if (Array.isArray(order.items)) {
            return order.items.reduce((acc: number, item: any) => acc + Number(item.price ?? 0) * Number(item.quantity ?? 1), 0)
        }
        return Number(order.total ?? 0)
    }

    const getOrderItemsNetSubtotal = (order: any) => {
        const grossSubtotal = getOrderItemsGrossSubtotal(order)
        const rate = Number(order?.vat_rate ?? 0)
        const multiplier = 1 + rate / 100
        return multiplier > 0 ? (grossSubtotal / multiplier) : grossSubtotal
    }

    const getOrderShipping = (order: any) => {
        if (!order) return 0
        const stored = Number(order.shipping ?? 0)
        if (stored > 0) return stored
        const itemsSubtotal = getOrderItemsGrossSubtotal(order)
        const total = Number(order.total ?? itemsSubtotal)
        const shipping = total - itemsSubtotal
        return shipping > 0 ? shipping : 0
    }

    const getOrderVatSubtotal = (order: any) => {
        if (!order) return 0
        const subtotal = Number(order.vat_subtotal ?? 0)
        if (subtotal > 0) return subtotal
        const rate = Number(order.vat_rate ?? 0)
        const itemsSubtotal = getOrderItemsGrossSubtotal(order)
        const multiplier = 1 + rate / 100
        return multiplier > 0 ? (itemsSubtotal / multiplier) : itemsSubtotal
    }

    const getOrderVatAmount = (order: any) => {
        if (!order) return 0
        const amount = Number(order.vat_amount ?? 0)
        if (amount > 0) return amount
        const itemsSubtotal = getOrderItemsGrossSubtotal(order)
        const net = getOrderVatSubtotal(order)
        return itemsSubtotal - net
    }

    const getItemNetPrice = (item: any, order: any) => {
        const rate = Number(order?.vat_rate ?? 0)
        const price = Number(item?.price ?? 0)
        const multiplier = 1 + rate / 100
        return multiplier > 0 ? (price / multiplier) : price
    }

    const getOrderContact = (order: any) => {
        if (!order) return { name: '-', email: '-', phone: '-' }
        const shippingRaw = parseAddress(order.shipping_address)
        const billingRaw = parseAddress(order.billing_address)
        const shipping: AddressData = typeof shippingRaw === 'string' || !shippingRaw ? {} : shippingRaw
        const billing: AddressData = typeof billingRaw === 'string' || !billingRaw ? {} : billingRaw
        const nameFromAddress = [shipping.firstName || billing.firstName, shipping.lastName || billing.lastName].filter(Boolean).join(' ')
        const defaultBilling: AddressData = getDefaultBillingAddress() || {}
        return {
            name: order.customer_name || nameFromAddress || user?.name || '-',
            email: order.customer_email || shipping.email || billing.email || defaultBilling.email || user?.email || '-',
            phone: order.customer_phone || shipping.phone || billing.phone || defaultBilling.phone || '-'
        }
    }
    const handleGenerateInvoice = async () => {
        if (!selectedOrder) return
        try {
            const token = localStorage.getItem('authToken')
            const res = await fetch(`/api/orders/${selectedOrder.id}/invoice`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) {
                throw new Error('No se pudo abrir la factura.')
            }
            const html = await res.text()
            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.right = '0'
            iframe.style.bottom = '0'
            iframe.style.width = '0'
            iframe.style.height = '0'
            iframe.style.border = '0'
            iframe.style.visibility = 'hidden'
            document.body.appendChild(iframe)

            const doc = iframe.contentWindow?.document
            if (!doc) return
            doc.open()
            doc.write(html)
            doc.close()

            iframe.onload = () => {
                setTimeout(() => {
                    try {
                        iframe.contentWindow?.focus()
                        iframe.contentWindow?.print()
                    } catch (err) {
                        console.error(err)
                    } finally {
                        setTimeout(() => {
                            iframe.remove()
                        }, 1000)
                    }
                }, 300)
            }
        } catch (error) {
            console.error(error)
            showNotification('No se pudo abrir la factura.', 'error')
        }
    }
    const handleSaveAddresses = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setAddressSaving(true)
            const token = localStorage.getItem('authToken');
            const res = await requestApi<{ addresses: typeof savedAddresses }>('/api/user/addresses', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ addresses: savedAddresses })
            });
            if (Array.isArray(res.body.addresses)) {
                setSavedAddresses(res.body.addresses)
                setCurrentAddrIndex(0)
            }
            showNotification('Direcciones guardadas correctamente');
        } catch (error) {
            console.error(error);
            showNotification('Error al guardar direcciones', 'error');
        } finally {
            setAddressSaving(false)
        }
    }

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        const wantsPasswordChange = Boolean(
            passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword
        )

        if (wantsPasswordChange) {
            if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
                showNotification('Para cambiar la contraseña completa los 3 campos.', 'error')
                return
            }
            if (passwordForm.newPassword.length < 12) {
                showNotification('La nueva contraseña debe tener al menos 12 caracteres.', 'error')
                return
            }
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                showNotification('La confirmación de contraseña no coincide.', 'error')
                return
            }
            if (passwordForm.currentPassword === passwordForm.newPassword) {
                showNotification('La nueva contraseña debe ser diferente a la actual.', 'error')
                return
            }
        }

        let profileUpdated = false
        try {
            setProfileSaving(true)
            const token = localStorage.getItem('authToken');
            if (!token) {
                handleLogout()
                return
            }
            const name = `${profile.firstName} ${profile.lastName}`.trim()
            const res = await requestApi<{ name?: string; profile?: typeof profile }>('/api/user/profile', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, profile })
            });
            profileUpdated = true

            if (res.body.profile) {
                setProfile({
                    firstName: res.body.profile.firstName || '',
                    lastName: res.body.profile.lastName || '',
                    phone: res.body.profile.phone || '',
                    gender: res.body.profile.gender || '',
                    birth: res.body.profile.birth || '',
                    documentType: res.body.profile.documentType || '',
                    documentNumber: res.body.profile.documentNumber || '',
                    businessName: res.body.profile.businessName || ''
                })
            }

            if (res.body.name && user) {
                const updatedUser = { ...user, name: res.body.name }
                setUser(updatedUser)
                localStorage.setItem('user', JSON.stringify(updatedUser))
            }

            if (wantsPasswordChange) {
                await requestApi('/api/user/password', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword
                    })
                })
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
                showNotification('Perfil y contraseña actualizados. Debes iniciar sesión nuevamente.')
                handleLogout()
                return
            }

            showNotification('Información personal guardada correctamente.')
        } catch (error) {
            console.error(error);
            if (profileUpdated && wantsPasswordChange) {
                showNotification('El perfil se guardó, pero no se pudo actualizar la contraseña.', 'error')
                return
            }
            showNotification('Error al guardar información personal', 'error')
        } finally {
            setProfileSaving(false)
        }
    }

    const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type })
        setTimeout(() => setMessage(null), 5000)
    }

    const loadVatRate = async () => {
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role !== 'admin') return
        setVatLoading(true)
        try {
            const res = await requestApi<{ rate: number }>('/api/admin/settings/tax', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setVatRate(Number(res.body.rate ?? 0))
        } catch (error) {
            console.error(error)
            if (error instanceof Error && error.message.includes('401')) {
                handleLogout()
                return
            }
            showNotification('No se pudo cargar el IVA.', 'error')
        } finally {
            setVatLoading(false)
        }
    }

    const loadShippingRates = async () => {
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role !== 'admin') return
        setShippingLoading(true)
        try {
            const res = await requestApi<{ delivery: number; pickup: number; tax_rate: number }>('/api/admin/settings/shipping', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setShippingRates({
                delivery: Number(res.body.delivery ?? 0),
                pickup: Number(res.body.pickup ?? 0),
                taxRate: Number(res.body.tax_rate ?? 0)
            })
        } catch (error) {
            console.error(error)
            if (error instanceof Error && error.message.includes('401')) {
                handleLogout()
                return
            }
            showNotification('No se pudieron cargar los costos de envío.', 'error')
        } finally {
            setShippingLoading(false)
        }
    }

    const loadPricingSettings = async () => {
        if (!user || user.role !== 'admin') return
        try {
            const [margins, calcs, rules] = await Promise.all([
                getPricingMargins(),
                getPricingCalc(),
                getPricingRules()
            ])
            setMarginSettings(normalizeMarginSettings(margins))
            setCalcSettings(normalizeCalcSettings(calcs))
            setPricingRules(normalizePricingRules(rules))
        } catch (error) {
            console.error(error)
            setMarginSettings(normalizeMarginSettings({ baseMargin: 30, minMargin: 15, targetMargin: 35, promoBuffer: 5 }))
            setCalcSettings(normalizeCalcSettings({ rounding: 0.05, strategy: 'cost_plus', includeVatInPvp: true, shippingBuffer: 0 }))
            setPricingRules(normalizePricingRules({ bulkThreshold: 10, bulkDiscount: 5, clearanceThreshold: 25, clearanceDiscount: 15 }))
        }
    }

    const normalizeStoreStatus = (input?: Partial<StoreStatusSettings> | null): StoreStatusSettings => {
        const salesEnabled = input?.salesEnabled !== false
        const rawMessage = String(input?.message ?? '').trim()
        return {
            salesEnabled,
            message: rawMessage || DEFAULT_STORE_PAUSE_MESSAGE,
            updatedAt: input?.updatedAt || null,
            updatedBy: input?.updatedBy || null
        }
    }

    const loadStoreStatus = async () => {
        if (!user || user.role !== 'admin') return
        setStoreStatusLoading(true)
        try {
            const status = await getStoreStatus()
            setStoreStatus(normalizeStoreStatus(status))
        } catch (error) {
            console.error(error)
            setStoreStatus(normalizeStoreStatus(null))
            showNotification('No se pudo cargar el estado de ventas.', 'error')
        } finally {
            setStoreStatusLoading(false)
        }
    }

    const handleSaveStoreStatus = async (nextSalesEnabled?: boolean) => {
        if (!user || user.role !== 'admin') return
        const payload = normalizeStoreStatus({
            ...storeStatus,
            salesEnabled: typeof nextSalesEnabled === 'boolean' ? nextSalesEnabled : storeStatus.salesEnabled
        })
        setStoreStatusSaving(true)
        try {
            const res = await updateStoreStatus({
                salesEnabled: payload.salesEnabled,
                message: payload.message
            })
            const normalized = normalizeStoreStatus(res.body)
            setStoreStatus(normalized)
            showNotification(
                normalized.salesEnabled
                    ? 'Ventas en línea activadas.'
                    : 'Ventas en línea apagadas. La tienda quedó en mantenimiento.'
            )
        } catch (error) {
            console.error(error)
            showNotification('No se pudo actualizar el estado de ventas.', 'error')
        } finally {
            setStoreStatusSaving(false)
        }
    }

    const handleSaveVat = async () => {
        const token = localStorage.getItem('authToken')
        if (!token) return
        setVatSaving(true)
        try {
            const res = await requestApi<{ rate: number }>('/api/admin/settings/tax', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rate: vatRate })
            })
            setVatRate(Number(res.body.rate ?? 0))
            showNotification('IVA actualizado correctamente.')
        } catch (error) {
            console.error(error)
            showNotification('No se pudo guardar el IVA.', 'error')
        } finally {
            setVatSaving(false)
        }
    }

    const handleSaveShipping = async () => {
        const token = localStorage.getItem('authToken')
        if (!token) return
        setShippingSaving(true)
        try {
            const res = await requestApi<{ delivery: number; pickup: number; tax_rate: number }>('/api/admin/settings/shipping', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    delivery: shippingRates.delivery,
                    pickup: shippingRates.pickup,
                    tax_rate: shippingRates.taxRate
                })
            })
            setShippingRates({
                delivery: Number(res.body.delivery ?? 0),
                pickup: Number(res.body.pickup ?? 0),
                taxRate: Number(res.body.tax_rate ?? 0)
            })
            showNotification('Costos de envío actualizados.')
        } catch (error) {
            console.error(error)
            showNotification('No se pudieron guardar los costos de envío.', 'error')
        } finally {
            setShippingSaving(false)
        }
    }

    const normalizeStatus = (status?: string) => (status || '').toLowerCase()
    const parseMoney = (value: any) => {
        if (typeof value === 'string') {
            const normalized = value.replace(/\./g, '').replace(',', '.')
            const parsed = Number(normalized)
            return Number.isFinite(parsed) ? parsed : 0
        }
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : 0
    }

    const toNumber = (value: any, fallback = 0, min = 0, max?: number) => {
        const parsed = Number(value)
        if (!Number.isFinite(parsed)) return fallback
        const clamped = Math.max(min, parsed)
        if (typeof max === 'number') return Math.min(clamped, max)
        return clamped
    }

    const normalizeMarginSettings = (input: typeof marginSettings) => {
        let minMargin = toNumber(input.minMargin, 15)
        let baseMargin = toNumber(input.baseMargin, 30)
        let targetMargin = toNumber(input.targetMargin, 35)
        const promoBuffer = toNumber(input.promoBuffer, 5)
        if (baseMargin < minMargin) baseMargin = minMargin
        if (targetMargin < baseMargin) targetMargin = baseMargin
        return { baseMargin, minMargin, targetMargin, promoBuffer }
    }

    const normalizeCalcSettings = (input: typeof calcSettings) => {
        const allowed = new Set<PricingCalc['strategy']>(['cost_plus', 'target_margin', 'competitive'])
        const strategy: PricingCalc['strategy'] = allowed.has(input.strategy) ? input.strategy : 'cost_plus'
        return {
            rounding: toNumber(input.rounding, 0.05),
            strategy,
            includeVatInPvp: Boolean(input.includeVatInPvp),
            shippingBuffer: toNumber(input.shippingBuffer, 0)
        }
    }

    const normalizePricingRules = (input: typeof pricingRules) => ({
        bulkThreshold: Math.round(toNumber(input.bulkThreshold, 10, 1)),
        bulkDiscount: toNumber(input.bulkDiscount, 5, 0, 90),
        clearanceThreshold: Math.round(toNumber(input.clearanceThreshold, 25, 1)),
        clearanceDiscount: toNumber(input.clearanceDiscount, 15, 0, 90)
    })

    const getStatusBadge = (status?: string) => {
        const normalized = normalizeStatus(status)
        if (['processing', 'in_process', 'in-process'].includes(normalized)) {
            return { label: 'En proceso', className: 'bg-blue-100 text-blue-600' }
        }
        if (['completed', 'delivered'].includes(normalized)) {
            return { label: 'Completado', className: 'bg-success/10 text-success' }
        }
        if (['canceled', 'cancelled'].includes(normalized)) {
            return { label: 'Cancelado', className: 'bg-red/10 text-red' }
        }
        if (['shipped', 'shipping', 'delivery', 'delivering'].includes(normalized)) {
            return { label: 'Enviado', className: 'bg-purple/10 text-purple' }
        }
        if (['pickup', 'ready_for_pickup', 'ready'].includes(normalized)) {
            return { label: 'Esperando Recojo', className: 'bg-amber-400/15 text-amber-600' }
        }
        return { label: 'Pendiente', className: 'bg-yellow/10 text-yellow' }
    }

    const handleStrategicAlertAction = (alert: { type: 'critical' | 'warning' | 'info'; message: string; action: string }) => {
        const text = `${alert.action} ${alert.message}`.toLowerCase()

        if (text.includes('invent') || text.includes('stock') || text.includes('riesgo')) {
            setActiveTab('reports')
            setSelectedDeepDive('inventory')
            return
        }

        if (text.includes('ticket') || text.includes('promedio')) {
            setActiveTab('reports')
            setSelectedDeepDive('aov')
            return
        }

        if (text.includes('margen') || text.includes('utilidad') || text.includes('rentab')) {
            setActiveTab('reports')
            setSelectedDeepDive('profit')
            return
        }

        if (text.includes('pedido') || text.includes('env') || text.includes('log')) {
            setActiveOrders('delivery')
            setActiveTab('admin-orders')
            return
        }

        if (text.includes('precio') || text.includes('promoc') || text.includes('campa')) {
            setActiveTab('prices')
            return
        }

        setActiveTab('reports')
        setSelectedDeepDive('sales')
    }

    // Fetch Admin Data
    React.useEffect(() => {
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role !== 'admin' || !activeTab) {
            setAdminDataLoading(false)
            setAdminDataError(null)
            return
        }

        let cancelled = false

        const headers = { Authorization: `Bearer ${token}` }

        const handleError = (err: any) => {
            console.error(err)
            const message = String(err?.message || '')
            if (message.includes('Error 401') || message.includes('Unauthenticated')) {
                handleLogout()
                return
            }
            if (!cancelled) {
                setAdminDataError('No se pudieron actualizar algunos datos del panel.')
            }
        }

        const tabsWithStats = new Set([
            'reports',
            'sales-ranking',
            'prices',
            'taxes',
            'margins',
            'calculations',
            'pricing-rules',
            'product-page',
            'balances'
        ])
        const tabsWithProducts = new Set(['products', 'prices'])
        const tabsWithOrders = new Set(['admin-orders', 'shipments', 'balances'])
        const tabsWithPricingSettings = new Set(['prices', 'margins', 'calculations', 'pricing-rules'])

        const loadAdminData = async () => {
            if (!cancelled) {
                setAdminDataLoading(true)
                setAdminDataError(null)
            }

            const tasks: Array<Promise<any>> = []

            if (tabsWithStats.has(activeTab)) {
                const monthQuery = /^\d{4}-(0[1-9]|1[0-2])$/.test(salesRankingMonth)
                    ? `?month=${encodeURIComponent(salesRankingMonth)}`
                    : ''
                tasks.push(
                    requestApi<DashboardStats>(`/api/admin/dashboard/stats${monthQuery}`, { headers }).then((res) => {
                        if (!cancelled) setDashboardStats(res.body)
                    })
                )
                tasks.push(loadVatRate())
                tasks.push(loadShippingRates())
            }

            if (tabsWithProducts.has(activeTab)) {
                tasks.push(
                    requestApi<any[]>('/api/products', { headers }).then((res) => {
                        if (!cancelled) setAdminProductsList(normalizeAdminProducts(res.body))
                    })
                )
            }

            if (tabsWithOrders.has(activeTab)) {
                tasks.push(
                    requestApi<Order[]>('/api/orders', { headers }).then((res) => {
                        if (!cancelled) setAdminOrdersList(res.body)
                    })
                )
            }

            if (tabsWithPricingSettings.has(activeTab)) {
                tasks.push(loadPricingSettings())
            }

            if (activeTab === 'product-page') {
                tasks.push(
                    getProductPageSettings().then((settings) => {
                        if (!cancelled) setProductPageSettings(settings)
                    })
                )
            }

            if (activeTab === 'store-status') {
                tasks.push(loadStoreStatus())
            }

            if (activeTab === 'shipments') {
                tasks.push(
                    requestApi<{ providers?: ShippingProvider[]; pickups?: ShippingPickup[] }>('/api/shipments', { headers }).then((res) => {
                        if (!cancelled) {
                            setShippingProviders(Array.isArray(res.body.providers) ? res.body.providers : [])
                            setShippingPickups(Array.isArray(res.body.pickups) ? res.body.pickups : [])
                        }
                    })
                )
                tasks.push(loadShippingRates())
            }

            const results = await Promise.allSettled(tasks)
            results.forEach((result) => {
                if (result.status === 'rejected') {
                    handleError(result.reason)
                }
            })

            if (!cancelled) {
                setAdminDataLoading(false)
            }
        }

        loadAdminData()

        return () => {
            cancelled = true
        }
    }, [activeTab, salesRankingMonth, user])

    React.useEffect(() => {
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role === 'admin') return

        setUserOrdersLoading(true)
        requestApi<Order[]>('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setUserOrders(res.body))
            .catch((err) => {
                console.error(err)
                if (err?.message && (err.message.includes('Error 401') || err.message.includes('No autorizado'))) {
                    handleLogout()
                    return
                }
                showNotification('No se pudieron cargar tus pedidos.', 'error')
                setUserOrders([])
            })
            .finally(() => setUserOrdersLoading(false))
    }, [user])

    React.useEffect(() => {
        const token = localStorage.getItem('authToken')
        const userData = localStorage.getItem('user')
        if (!token) {
            router.push('/login')
        } else if (userData) {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            if (parsedUser.role === 'admin') {
                setActiveTab('reports')
            } else {
                setActiveTab('dashboard')
            }
        }
    }, [router])

    React.useEffect(() => {
        if (!user || user.role !== 'admin') return
        loadPricingSettings()
        loadStoreStatus()
        getProductPageSettings()
            .then((settings) => setProductPageSettings(settings))
            .catch((err) => {
                console.error(err)
                setProductPageSettings({
                    deliveryEstimate: '14 de enero - 18 de enero',
                    viewerCount: 38,
                    freeShippingThreshold: 75,
                    supportHours: '8:30 AM a 10:00 PM',
                    returnDays: 100
                })
            })
    }, [user])

    React.useEffect(() => {
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role === 'admin') return

        setProfileLoading(true)
        requestApi<{ name?: string; profile?: typeof profile }>('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const apiProfile: Partial<typeof profile> = res.body.profile || {}
                const fallbackName = res.body.name || user.name || ''
                const [firstName, ...rest] = fallbackName.split(' ')
                setProfile({
                    firstName: apiProfile.firstName || firstName || '',
                    lastName: apiProfile.lastName || rest.join(' ') || '',
                    phone: apiProfile.phone || '',
                    gender: apiProfile.gender || '',
                    birth: apiProfile.birth || '',
                    documentType: apiProfile.documentType || '',
                    documentNumber: apiProfile.documentNumber || '',
                    businessName: apiProfile.businessName || ''
                })
            })
            .catch(err => {
                console.error(err)
                showNotification('No se pudieron cargar los datos de perfil.', 'error')
            })
            .finally(() => setProfileLoading(false))
    }, [user])

    React.useEffect(() => {
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role === 'admin') return

        setAddressLoading(true)
        requestApi<{ addresses: typeof savedAddresses }>('/api/user/addresses', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (Array.isArray(res.body.addresses) && res.body.addresses.length > 0) {
                    setSavedAddresses(res.body.addresses)
                    setCurrentAddrIndex(0)
                }
            })
            .catch(err => {
                console.error(err)
                showNotification('No se pudieron cargar las direcciones guardadas.', 'error')
            })
            .finally(() => setAddressLoading(false))
    }, [user])

    const handleLogout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        router.push('/login')
    }

    const handleActiveAddress = (order: string) => {
        setActiveAddress((prevOrder: string | null) => prevOrder === order ? null : order)
    }

    const handleActiveOrders = (order: string) => {
        setActiveOrders(order)
    }

    const currentAddress = savedAddresses[currentAddrIndex]
    const currentDateLabel = formatDateEcuador(new Date(), {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const vatDisplayRate = Number(dashboardStats?.tax?.rate ?? vatRate ?? 0)
    const vatDisplayMultiplier = Number(dashboardStats?.tax?.multiplier ?? (1 + vatDisplayRate / 100))
    const vatRateLabel = vatDisplayRate.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const vatMultiplierLabel = vatDisplayMultiplier.toLocaleString('es-EC', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
    const vatExampleTotal = (100 * vatDisplayMultiplier).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const vatRateValue = Number(dashboardStats?.tax?.rate ?? vatRate ?? 0)
    const vatMultiplier = 1 + vatRateValue / 100
    const productBasePrice = Number(productForm.price || 0)
    const productCost = Number(productForm.cost || 0)
    const productPvpPrice = Number(productForm.pvp || 0) || (productBasePrice * vatMultiplier)
    const productPvpPriceLabel = productPvpPrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const productGrossProfit = Math.max(productBasePrice - productCost, 0)
    const productGrossMargin = productBasePrice > 0 ? (productGrossProfit / productBasePrice) * 100 : 0
    const productMarkup = productCost > 0 ? (productGrossProfit / productCost) * 100 : 0
    const productProfitLabel = productGrossProfit.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const productGrossMarginLabel = productGrossMargin.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const productMarkupLabel = productMarkup.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const salesProgressPercentage = Number(dashboardStats?.totalSales?.progress?.percentage ?? 0)
    const salesTrendIsPositive = salesProgressPercentage >= 0
    const productSalesRanking = dashboardStats?.businessMetrics?.productSalesRanking
    const selectedRankingMonth = productSalesRanking?.selectedMonth || salesRankingMonth
    const selectedRankingMonthLabel = formatMonthKeyLabel(selectedRankingMonth)
    const salesRankingRows = React.useMemo<SalesRankingRow[]>(() => {
        if (!productSalesRanking) return []
        const source = salesRankingView === 'month'
            ? productSalesRanking.monthlyRanking
            : productSalesRanking.historicalRanking
        return source.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            category: item.category,
            orders_count: salesRankingView === 'month' ? Number(item.month_orders_count ?? 0) : Number(item.historical_orders_count ?? 0),
            units_sold: salesRankingView === 'month' ? Number(item.month_units_sold ?? 0) : Number(item.historical_units_sold ?? 0),
            gross_revenue: salesRankingView === 'month' ? Number(item.month_gross_revenue ?? 0) : Number(item.historical_gross_revenue ?? 0),
            net_revenue: salesRankingView === 'month' ? Number(item.month_net_revenue ?? 0) : Number(item.historical_net_revenue ?? 0),
            vat_amount: salesRankingView === 'month' ? Number(item.month_vat_amount ?? 0) : Number(item.historical_vat_amount ?? 0),
            shipping_amount: salesRankingView === 'month' ? Number(item.month_shipping_amount ?? 0) : Number(item.historical_shipping_amount ?? 0),
            cost: salesRankingView === 'month' ? Number(item.month_cost ?? 0) : Number(item.historical_cost ?? 0),
            profit: salesRankingView === 'month' ? Number(item.month_profit ?? 0) : Number(item.historical_profit ?? 0),
            margin: salesRankingView === 'month' ? Number(item.month_margin ?? 0) : Number(item.historical_margin ?? 0),
            month_orders_count: Number(item.month_orders_count ?? 0),
            month_units_sold: Number(item.month_units_sold ?? 0),
            month_gross_revenue: Number(item.month_gross_revenue ?? 0),
            month_net_revenue: Number(item.month_net_revenue ?? 0),
            month_vat_amount: Number(item.month_vat_amount ?? 0),
            month_shipping_amount: Number(item.month_shipping_amount ?? 0),
            month_cost: Number(item.month_cost ?? 0),
            month_profit: Number(item.month_profit ?? 0),
            month_margin: Number(item.month_margin ?? 0),
            historical_orders_count: Number(item.historical_orders_count ?? 0),
            historical_units_sold: Number(item.historical_units_sold ?? 0),
            historical_gross_revenue: Number(item.historical_gross_revenue ?? 0),
            historical_net_revenue: Number(item.historical_net_revenue ?? 0),
            historical_vat_amount: Number(item.historical_vat_amount ?? 0),
            historical_shipping_amount: Number(item.historical_shipping_amount ?? 0),
            historical_cost: Number(item.historical_cost ?? 0),
            historical_profit: Number(item.historical_profit ?? 0),
            historical_margin: Number(item.historical_margin ?? 0)
        }))
    }, [productSalesRanking, salesRankingView])
    const monthlySalesRankingTotals = productSalesRanking?.monthlyTotals
    const historicalSalesRankingTotals = productSalesRanking?.historicalTotals
    const salesRankingTotals = salesRankingView === 'month' ? monthlySalesRankingTotals : historicalSalesRankingTotals
    const monthlySalesFinancial = productSalesRanking?.monthlyFinancial
    const historicalSalesFinancial = productSalesRanking?.historicalFinancial
    const salesRankingFinancial = salesRankingView === 'month' ? monthlySalesFinancial : historicalSalesFinancial
    const openSalesProductDetail = (item: SalesRankingRow) => {
        setSelectedSalesProduct(item)
        setIsSalesProductModalOpen(true)
    }

    const openProductBreakdown = (metric: ProductDetailMetric) => {
        setSelectedProductMetric(metric)
        setSelectedDeepDive('product-breakdown')
    }

    const productBreakdownMeta = React.useMemo(() => {
        switch (selectedProductMetric) {
            case 'gross':
                return {
                    title: 'Venta Total por Producto',
                    subtitle: 'Incluye IVA y prorrateo de envío según participación en ventas netas.',
                    total: Number(dashboardStats?.businessMetrics?.salesSummary?.gross ?? 0)
                }
            case 'vat':
                return {
                    title: 'IVA Cobrado por Producto',
                    subtitle: 'Estimación por producto usando la tasa de IVA aplicada al catálogo.',
                    total: Number(dashboardStats?.businessMetrics?.salesSummary?.vat ?? 0)
                }
            case 'shipping':
                return {
                    title: 'Envío Cobrado por Producto',
                    subtitle: 'Distribución proporcional al peso de cada producto en ventas netas.',
                    total: Number(dashboardStats?.businessMetrics?.salesSummary?.shipping ?? 0)
                }
            case 'profit':
                return {
                    title: 'Utilidad Bruta por Producto',
                    subtitle: 'Utilidad estimada = venta neta del producto - costo acumulado vendido.',
                    total: Number(dashboardStats?.businessMetrics?.profitStats?.profit ?? 0)
                }
            case 'inventory':
                return {
                    title: 'Valor de Inventario por Producto',
                    subtitle: 'Costo inmovilizado actual por SKU (stock x costo unitario).',
                    total: Number(dashboardStats?.businessMetrics?.inventoryValue?.cost_value ?? 0)
                }
            case 'net':
            default:
                return {
                    title: 'Venta Neta por Producto',
                    subtitle: 'Sin IVA ni envío. Basado en pedidos no cancelados.',
                    total: Number(dashboardStats?.businessMetrics?.salesSummary?.net ?? 0)
                }
        }
    }, [dashboardStats, selectedProductMetric])

    const salesProductBreakdown = React.useMemo(() => {
        const products = dashboardStats?.businessMetrics?.traceability?.products || []
        const vatRateForBreakdown = Number(dashboardStats?.tax?.rate ?? vatRate ?? 0)
        const vatMultiplierForBreakdown = 1 + (vatRateForBreakdown / 100)
        const totalNet = products.reduce((acc, item) => acc + Number(item.net_revenue ?? 0), 0)
        const totalShipping = Number(dashboardStats?.businessMetrics?.salesSummary?.shipping ?? 0)

        const costByProductId = new Map<string, number>(
            (adminProductsList || []).map((product: any) => {
                const productId = String(product.id ?? '')
                const cost = parseMoney(product.business?.cost ?? product.cost)
                return [productId, cost]
            })
        )

        return products
            .map((item) => {
                const net = Number(item.net_revenue ?? 0)
                const gross = vatMultiplierForBreakdown > 0 ? net * vatMultiplierForBreakdown : net
                const vat = Math.max(gross - net, 0)
                const shipping = totalNet > 0 ? (totalShipping * net) / totalNet : 0
                const units = Number(item.units_sold ?? 0)
                const unitCost = costByProductId.get(String(item.product_id ?? '')) ?? 0
                const cost = Math.max(unitCost * units, 0)
                const profit = net - cost
                const metricValue = selectedProductMetric === 'gross'
                    ? gross
                    : selectedProductMetric === 'vat'
                        ? vat
                        : selectedProductMetric === 'shipping'
                            ? shipping
                            : selectedProductMetric === 'profit'
                                ? profit
                                : net

                return {
                    ...item,
                    units,
                    net,
                    gross,
                    vat,
                    shipping,
                    cost,
                    profit,
                    metricValue
                }
            })
            .sort((a, b) => b.metricValue - a.metricValue)
    }, [adminProductsList, dashboardStats, parseMoney, selectedProductMetric, vatRate])

    const inventoryProductBreakdown = React.useMemo(() => {
        return (adminProductsList || [])
            .map((product: any) => {
                const quantity = Number(product.quantity ?? 0)
                const unitCost = parseMoney(product.business?.cost ?? product.cost)
                const unitPrice = parseMoney(product.price)
                const inventoryCost = Math.max(quantity * unitCost, 0)
                const inventoryMarket = Math.max(quantity * unitPrice, 0)
                return {
                    id: String(product.id ?? ''),
                    name: String(product.name ?? 'Producto sin nombre'),
                    category: String(product.category ?? 'Sin categoría'),
                    quantity,
                    unitCost,
                    unitPrice,
                    inventoryCost,
                    inventoryMarket
                }
            })
            .sort((a, b) => b.inventoryCost - a.inventoryCost)
    }, [adminProductsList, parseMoney])

    const handleBasePriceChange = (value: string) => {
        const baseValue = Number(value || 0)
        const pvpValue = vatMultiplier > 0 ? (baseValue * vatMultiplier) : baseValue
        setProductForm((prev) => ({
            ...prev,
            price: value,
            pvp: Number.isFinite(pvpValue) ? pvpValue.toFixed(2) : ''
        }))
    }

    const handlePvpPriceChange = (value: string) => {
        const pvpValue = Number(value || 0)
        const baseValue = vatMultiplier > 0 ? (pvpValue / vatMultiplier) : pvpValue
        setProductForm((prev) => ({
            ...prev,
            pvp: value,
            price: Number.isFinite(baseValue) ? baseValue.toFixed(2) : ''
        }))
    }

    const updateAddressData = (type: 'billing' | 'shipping', field: string, value: string) => {
        const newAddresses = [...savedAddresses]
        const addr = newAddresses[currentAddrIndex]
        addr[type] = { ...addr[type], [field]: value }

        if (addr.isSame) {
            const otherType = type === 'billing' ? 'shipping' : 'billing'
            addr[otherType] = { ...addr[otherType], [field]: value }
        }

        setSavedAddresses(newAddresses)
    }

    const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const field = id.replace('billing', '').charAt(0).toLowerCase() + id.replace('billing', '').slice(1);
        updateAddressData('billing', field, value)
    }

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        const field = id.replace('shipping', '').charAt(0).toLowerCase() + id.replace('shipping', '').slice(1);
        updateAddressData('shipping', field, value)
    }

    const toggleSameAsBilling = () => {
        const newAddresses = [...savedAddresses]
        const addr = newAddresses[currentAddrIndex]
        addr.isSame = !addr.isSame
        if (addr.isSame) {
            addr.shipping = { ...addr.billing }
        }
        setSavedAddresses(newAddresses)
    }

    const addNewAddress = () => {
        if (savedAddresses.length < 3) {
            const newAddr = {
                id: Date.now(),
                title: `Dirección ${savedAddresses.length + 1}`,
                billing: { ...emptyAddress },
                shipping: { ...emptyAddress },
                isSame: false
            }
            setSavedAddresses([...savedAddresses, newAddr])
            setCurrentAddrIndex(savedAddresses.length)
            showNotification('Nueva ranura de dirección añadida.')
        } else {
            showNotification('Máximo 3 direcciones permitidas.', 'error')
        }
    }

    const removeAddress = (index: number) => {
        if (savedAddresses.length > 1) {
            const newAddresses = savedAddresses.filter((_, i) => i !== index)
            setSavedAddresses(newAddresses)
            setCurrentAddrIndex(0)
            showNotification('Dirección eliminada.')
        }
    }

    const renderDeepDive = () => {
        if (!selectedDeepDive || !dashboardStats?.businessMetrics) return null;

        const metrics = dashboardStats.businessMetrics;
        const salesDeepDive = metrics.salesDeepDive;
        const isProductBreakdown = selectedDeepDive === 'product-breakdown';
        const productMetricTotal = productBreakdownMeta.total;
        const productMetricRows = selectedProductMetric === 'inventory' ? inventoryProductBreakdown : salesProductBreakdown;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-8 border-b border-line flex justify-between items-center bg-surface">
                        <div>
                            <h3 className="heading4">
                                {selectedDeepDive === 'sales' ? 'Análisis Detallado de Ventas' :
                                    selectedDeepDive === 'profit' ? 'Detalle de Rentabilidad' :
                                        selectedDeepDive === 'aov' ? 'Análisis de Ticket Promedio' :
                                            selectedDeepDive === 'inventory' ? 'Salud de Inventario' : productBreakdownMeta.title}
                            </h3>
                            <p className="text-secondary text-sm">
                                {isProductBreakdown ? productBreakdownMeta.subtitle : 'Desglose comparativo y factores de crecimiento'}
                            </p>
                        </div>
                        <button onClick={() => setSelectedDeepDive(null)} className="p-2 hover:bg-line rounded-full transition-colors">
                            <Icon.X size={28} />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto">
                        {selectedDeepDive === 'sales' && (
                            <div className="space-y-10">
                                {/* Daily Comparison Chart */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h5 className="heading5 text-sm">Rendimiento Diario (Vs. Mes Anterior)</h5>
                                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tight">
                                            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-black rounded-full"></span> Mes Actual</div>
                                            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-black/20 rounded-full"></span> Mes Anterior</div>
                                        </div>
                                    </div>
                                    <div className="h-48 flex items-end gap-1.5 justify-between px-2 bg-surface rounded-2xl p-6 border border-line">
                                        {Array.from({ length: 31 }, (_, i) => {
                                            const dayNum = i + 1;
                                            const currentVal = Number(salesDeepDive?.daily.current.find(d => Number(d.day) === dayNum)?.total || 0);
                                            const previousVal = Number(salesDeepDive?.daily.previous.find(d => Number(d.day) === dayNum)?.total || 0);
                                            const max = Math.max(...(salesDeepDive?.daily.current.map(d => Number(d.total)) || [1]), ...(salesDeepDive?.daily.previous.map(d => Number(d.total)) || [1])) || 1;

                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                                                    <div className="w-full flex items-end gap-[1px] h-full max-h-[140px]">
                                                        <div className="flex-1 bg-black/10 rounded-t-sm" style={{ height: `${(previousVal / max) * 100}%` }}></div>
                                                        <div className="flex-1 bg-black rounded-t-sm transition-all group-hover:bg-primary" style={{ height: `${(currentVal / max) * 100}%` }}></div>
                                                    </div>
                                                    <span className="text-[8px] text-secondary font-bold">{dayNum}</span>

                                                    <div className="absolute bottom-full mb-2 bg-black text-white text-[10px] p-2 rounded hidden group-hover:block z-20 whitespace-nowrap shadow-xl">
                                                        <div className="font-bold border-b border-white/20 pb-1 mb-1 font-heading">Día {dayNum}</div>
                                                        <div>Hoy: ${currentVal.toLocaleString()}</div>
                                                        <div className="text-white/60">Mes Anterior: ${previousVal.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Drivers Table */}
                                <div>
                                    <h5 className="heading5 mb-6 text-sm">Motores de Crecimiento por Categoría</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="overflow-hidden border border-line rounded-2xl">
                                            <table className="w-full text-left">
                                                <thead className="bg-surface text-[10px] uppercase font-bold text-secondary border-b border-line">
                                                    <tr>
                                                        <th className="px-6 py-4">Categoría</th>
                                                        <th className="px-6 py-4 text-right">Este Mes</th>
                                                        <th className="px-6 py-4 text-right">Var. %</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-line">
                                                    {salesDeepDive?.categories.slice(0, 6).map((cat, i) => (
                                                        <tr key={i} className="hover:bg-surface/50 transition-colors">
                                                            <td className="px-6 py-4 font-bold capitalize text-sm">{cat.category}</td>
                                                            <td className="px-6 py-4 text-right font-medium text-sm">${Number(cat.current).toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${cat.growth >= 0 ? 'bg-success text-white' : 'bg-red text-white'}`}>
                                                                    {cat.growth >= 0 ? '+' : ''}{cat.growth}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex flex-col justify-center">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                                                    <Icon.Lightbulb size={20} weight="fill" />
                                                </div>
                                                <h6 className="heading6 text-sm">Resumen Ejecutivo</h6>
                                            </div>
                                            <p className="text-xs leading-relaxed text-secondary space-y-4">
                                                El incremento del <strong className="text-black">+{dashboardStats?.totalSales?.progress?.percentage}%</strong> en ventas este mes está impulsado principalmente por la categoría <strong className="text-black capitalize">{salesDeepDive?.categories[0]?.category}</strong>, que creció un <strong className="text-success">{salesDeepDive?.categories[0]?.growth}%</strong>.
                                                <br /><br />
                                                Este comportamiento valida el éxito de la última campaña de stock y sugiere una oportunidad para rotar inventario en categorías de menor crecimiento.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedDeepDive === 'profit' && (
                            <div className="space-y-10">
                                <h5 className="heading5 text-sm mb-6">Rentabilidad por Categoría Estelar</h5>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        {salesDeepDive?.categories.slice(0, 4).map((cat, i) => {
                                            const revenue = Number(cat.current);
                                            // Estimating margin based on overall margin for visual breakdown
                                            const profitPerc = dashboardStats.businessMetrics?.profitStats?.margin || 30;
                                            return (
                                                <div key={i} className="bg-surface p-6 rounded-2xl border border-line">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="capitalize font-bold text-sm">{cat.category}</span>
                                                        <span className="text-xs font-bold text-primary">Margen Estimado: {profitPerc}%</span>
                                                    </div>
                                                    <div className="w-full h-4 bg-line rounded-full overflow-hidden flex shadow-inner">
                                                        <div className="h-full bg-success" style={{ width: `${profitPerc}%` }}></div>
                                                        <div className="h-full bg-orange-400 opacity-50" style={{ width: `${100 - profitPerc}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between mt-2 text-[10px] font-bold text-secondary uppercase">
                                                        <span>UTILIDAD</span>
                                                        <span>COSTO ADQUISICIÓN</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="bg-black text-white p-10 rounded-[40px] shadow-2xl flex flex-col justify-between border border-white/10">
                                        <div>
                                            <h6 className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-8">Estado de Resultados</h6>
                                            <div className="space-y-8">
                                                <div>
                                                    <div className="text-xs text-white/50 mb-2">Ingresos Totales (sin IVA, sin envío)</div>
                                                    <div className="text-3xl font-bold">${Number(dashboardStats.businessMetrics?.profitStats?.revenue || 0).toLocaleString()}</div>
                                                </div>
                                                <div className="pb-8 border-b border-white/10">
                                                    <div className="text-xs text-white/50 mb-2">Costo Directo (COGS)</div>
                                                    <div className="text-3xl font-bold text-orange-400">-${Number(dashboardStats.businessMetrics?.profitStats?.cost || 0).toLocaleString()}</div>
                                                </div>
                                                <div className="pt-4 border-b border-white/10 pb-8">
                                                    <div className="text-xs text-white/50 mb-2">Envío cobrado (pasarela)</div>
                                                    <div className="text-3xl font-bold text-white/80">${Number(dashboardStats.businessMetrics?.profitStats?.shipping_cost || 0).toLocaleString()}</div>
                                                    <div className="text-[10px] text-white/40 mt-2">Se considera reembolsado por el cliente, no afecta la utilidad.</div>
                                                </div>
                                                <div className="pt-4">
                                                    <div className="text-xs text-white/50 mb-2">Utilidad Bruta (sin IVA)</div>
                                                    <div className="text-5xl font-bold text-success">${Number(dashboardStats.businessMetrics?.profitStats?.profit || 0).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-white/40 leading-relaxed italic">
                                            * Los valores mostrados consideran el costo base de producto sin incluir costos fijos de operación.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedDeepDive === 'aov' && (
                            <div className="space-y-10">
                                <h5 className="heading5 text-sm mb-6">Distribución de Valor por Pedido</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-surface p-8 rounded-3xl border border-line">
                                        <div className="space-y-8">
                                            {metrics.aovDeepDive?.distribution.map((item, i) => {
                                                const total = metrics.aovDeepDive?.distribution.reduce((acc, curr) => acc + Number(curr.count), 0) || 1;
                                                const perc = (item.count / total) * 100;
                                                return (
                                                    <div key={i}>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="font-bold text-sm">{item.bucket}</span>
                                                            <span className="text-xs text-secondary">{item.count} pedidos</span>
                                                        </div>
                                                        <div className="w-full h-3 bg-line rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500" style={{ width: `${perc}%` }}></div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl">
                                            <h6 className="heading6 text-sm mb-4 text-blue-900 flex items-center gap-2">
                                                <Icon.Target size={20} weight="fill" /> Estrategia de Upselling
                                            </h6>
                                            <p className="text-xs text-blue-800 leading-relaxed italic">
                                                &quot;El {Math.round((metrics.aovDeepDive?.distribution.find(d => d.bucket.includes('Bajo'))?.count || 0) / (metrics.aovDeepDive?.distribution.reduce((acc, curr) => acc + Number(curr.count), 0) || 1) * 100)}% de tus pedidos son menores a $50. Implementar un umbral de &apos;Envío Gratis&apos; en $60 podría incrementar el Ticket Promedio en un 15%.&quot;
                                            </p>
                                        </div>
                                        <div className="p-8 bg-white border border-line rounded-3xl shadow-sm">
                                            <h6 className="heading6 text-sm mb-4">Ingresos por Segmento</h6>
                                            <div className="space-y-4">
                                                {metrics.aovDeepDive?.distribution.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-xs">
                                                        <span className="text-secondary">{item.bucket}</span>
                                                        <span className="font-bold">${Number(item.revenue).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedDeepDive === 'inventory' && (
                            <div className="space-y-10">
                                <h5 className="heading5 text-sm mb-6">Salud y Riesgos de Inventario</h5>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="bg-white border border-line rounded-3xl overflow-hidden">
                                            <div className="p-6 bg-surface border-b border-line">
                                                <h6 className="font-bold text-xs uppercase tracking-wider">Mayor Inversión en Almacén (Top 5)</h6>
                                            </div>
                                            <table className="w-full text-left">
                                                <thead className="bg-surface/50 text-[10px] text-secondary font-bold uppercase">
                                                    <tr>
                                                        <th className="px-6 py-4">Producto</th>
                                                        <th className="px-6 py-4 text-center">Stock</th>
                                                        <th className="px-6 py-4 text-right">Valor Costo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-line">
                                                    {metrics.inventoryDeepDive?.highValueItems.map((item, i) => (
                                                        <tr key={i} className="hover:bg-surface/30">
                                                            <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                                                            <td className="px-6 py-4 text-center text-sm">{item.quantity}</td>
                                                            <td className="px-6 py-4 text-right text-sm font-bold text-primary">${Number(item.total_cost).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 bg-red/5 border border-red/10 rounded-2xl">
                                                <h6 className="text-[10px] font-bold text-red uppercase mb-4">Pedidos Pendientes de Stock (Riesgo)</h6>
                                                <div className="space-y-3">
                                                    {metrics.inventoryDeepDive?.riskItems.map((item, i) => (
                                                        <div key={i} className="flex justify-between items-center text-xs">
                                                            <span>{item.name}</span>
                                                            <span className="font-bold text-red">{item.quantity} un.</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-success/5 border border-success/10 rounded-2xl flex flex-col justify-center items-center text-center">
                                                <div className="text-3xl font-bold text-success mb-1">{metrics.inventoryDeepDive?.health.overstock}</div>
                                                <div className="text-[10px] font-bold text-secondary uppercase">Productos en Sobre-Stock</div>
                                                <p className="text-[9px] text-secondary mt-2">Sugerencia: Liquidar para liberar flujo de caja</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-black text-white p-8 rounded-[40px] shadow-xl">
                                            <h6 className="text-xs font-bold uppercase mb-6 text-white/50">Resumen de Almacén</h6>
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Sin Stock</span>
                                                    <span className="text-lg font-bold text-red">{metrics.inventoryDeepDive?.health.out_of_stock}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Bajo Stock</span>
                                                    <span className="text-lg font-bold text-yellow">{metrics.inventoryDeepDive?.health.low_stock}</span>
                                                </div>
                                                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                                    <span className="text-sm font-bold">Inversión Total</span>
                                                    <span className="text-xl font-bold text-success">${Number(dashboardStats.businessMetrics?.inventoryValue?.cost_value).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 bg-orange-50 border border-orange-100 rounded-[40px]">
                                            <h6 className="text-xs font-bold text-orange-900 mb-4 flex items-center gap-2">
                                                <Icon.WarningDiamond size={20} weight="fill" /> Alerta de Capital
                                            </h6>
                                            <p className="text-xs text-orange-800 leading-relaxed">
                                                Tienes <strong className="text-orange-950">${Number(metrics.inventoryDeepDive?.highValueItems[0]?.total_cost).toLocaleString()}</strong> inmovilizados en un solo producto. Se recomienda revisar la rotación para evitar obsolescencia.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedDeepDive === 'product-breakdown' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border border-line rounded-xl bg-surface">
                                        <div className="text-[10px] uppercase font-bold text-secondary mb-1">Métrica seleccionada</div>
                                        <div className="text-sm font-semibold">{productBreakdownMeta.title}</div>
                                    </div>
                                    <div className="p-4 border border-line rounded-xl bg-surface">
                                        <div className="text-[10px] uppercase font-bold text-secondary mb-1">Total</div>
                                        <div className="heading6">{formatMoney(productMetricTotal)}</div>
                                    </div>
                                    <div className="p-4 border border-line rounded-xl bg-surface">
                                        <div className="text-[10px] uppercase font-bold text-secondary mb-1">Productos</div>
                                        <div className="heading6">{productMetricRows.length}</div>
                                    </div>
                                </div>

                                {selectedProductMetric !== 'inventory' && (
                                    <div className="overflow-x-auto border border-line rounded-xl">
                                        <table className="w-full min-w-[980px] text-left">
                                            <thead className="bg-surface text-[10px] uppercase font-bold text-secondary border-b border-line">
                                                <tr>
                                                    <th className="px-4 py-3">Producto</th>
                                                    <th className="px-4 py-3">Categoría</th>
                                                    <th className="px-4 py-3 text-right">Unidades</th>
                                                    <th className="px-4 py-3 text-right">Neto</th>
                                                    <th className="px-4 py-3 text-right">IVA Est.</th>
                                                    <th className="px-4 py-3 text-right">Envío Est.</th>
                                                    <th className="px-4 py-3 text-right">Total Est.</th>
                                                    <th className="px-4 py-3 text-right">Costo</th>
                                                    <th className="px-4 py-3 text-right">Utilidad</th>
                                                    <th className="px-4 py-3 text-right">Pedidos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {salesProductBreakdown.map((item: any, idx: number) => {
                                                    const refs = Array.isArray(item.order_refs)
                                                        ? item.order_refs
                                                        : String(item.order_refs || '').split(',').map((value) => value.trim()).filter(Boolean)
                                                    return (
                                                        <tr key={`${item.product_id || item.product_name}-${idx}`} className="hover:bg-surface/50">
                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold text-sm">{item.product_name}</div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm capitalize">{item.category || 'Sin categoría'}</td>
                                                            <td className="px-4 py-3 text-sm text-right">{Number(item.units || 0)}</td>
                                                            <td className="px-4 py-3 text-sm text-right font-semibold">{formatMoney(item.net)}</td>
                                                            <td className="px-4 py-3 text-sm text-right">{formatMoney(item.vat)}</td>
                                                            <td className="px-4 py-3 text-sm text-right">{formatMoney(item.shipping)}</td>
                                                            <td className="px-4 py-3 text-sm text-right">{formatMoney(item.gross + item.shipping)}</td>
                                                            <td className="px-4 py-3 text-sm text-right">{formatMoney(item.cost)}</td>
                                                            <td className={`px-4 py-3 text-sm text-right font-semibold ${item.profit >= 0 ? 'text-success' : 'text-red'}`}>
                                                                {formatMoney(item.profit)}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-right">{refs.length}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {selectedProductMetric === 'inventory' && (
                                    <div className="overflow-x-auto border border-line rounded-xl">
                                        <table className="w-full min-w-[900px] text-left">
                                            <thead className="bg-surface text-[10px] uppercase font-bold text-secondary border-b border-line">
                                                <tr>
                                                    <th className="px-4 py-3">Producto</th>
                                                    <th className="px-4 py-3">Categoría</th>
                                                    <th className="px-4 py-3 text-right">Stock</th>
                                                    <th className="px-4 py-3 text-right">Costo Unitario</th>
                                                    <th className="px-4 py-3 text-right">Valor Inventario</th>
                                                    <th className="px-4 py-3 text-right">PVP Unitario</th>
                                                    <th className="px-4 py-3 text-right">Valor Mercado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {inventoryProductBreakdown.map((item) => (
                                                    <tr key={item.id} className="hover:bg-surface/50">
                                                        <td className="px-4 py-3 font-semibold text-sm">{item.name}</td>
                                                        <td className="px-4 py-3 text-sm capitalize">{item.category}</td>
                                                        <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm text-right">{formatMoney(item.unitCost)}</td>
                                                        <td className="px-4 py-3 text-sm text-right font-semibold">{formatMoney(item.inventoryCost)}</td>
                                                        <td className="px-4 py-3 text-sm text-right">{formatMoney(item.unitPrice)}</td>
                                                        <td className="px-4 py-3 text-sm text-right">{formatMoney(item.inventoryMarket)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const recentUserOrders = userOrders.slice(0, 5)
    const totalUserOrders = userOrders.length
    const canceledUserOrders = userOrders.filter(order => ['canceled', 'cancelled'].includes(normalizeStatus(order.status))).length
    const pickupUserOrders = userOrders.filter(order => ['pickup', 'ready_for_pickup', 'ready'].includes(normalizeStatus(order.status))).length

    const matchesActiveOrder = (order: Order) => {
        const status = normalizeStatus(order.status)
        const isAdminOrders = activeTab === 'admin-orders'
        if (!activeOrders || activeOrders === 'all') return true
        if (activeOrders === 'pending') {
            return isAdminOrders ? status === 'pending' : ['pending', 'processing'].includes(status)
        }
        if (activeOrders === 'processing') return ['processing', 'in_process', 'in-process'].includes(status)
        if (activeOrders === 'delivery') return ['shipped', 'shipping', 'delivery', 'delivered'].includes(status)
        if (activeOrders === 'completed') return ['completed', 'delivered'].includes(status)
        if (activeOrders === 'canceled') return ['canceled', 'cancelled'].includes(status)
        return true
    }
    const filteredUserOrders = userOrders.filter(matchesActiveOrder)
    const filteredAdminOrders = adminOrdersList.filter(matchesActiveOrder)
    const adminOrdersCounts = React.useMemo(() => {
        const counts = {
            all: adminOrdersList.length,
            pending: 0,
            processing: 0,
            delivery: 0,
            completed: 0,
            canceled: 0
        }
        adminOrdersList.forEach((order) => {
            const status = normalizeStatus(order.status)
            if (status === 'pending') counts.pending += 1
            if (['processing', 'in_process', 'in-process'].includes(status)) counts.processing += 1
            if (['shipped', 'shipping', 'delivery', 'delivered'].includes(status)) counts.delivery += 1
            if (['completed', 'delivered'].includes(status)) counts.completed += 1
            if (['canceled', 'cancelled'].includes(status)) counts.canceled += 1
        })
        return counts
    }, [adminOrdersList])
    const pickupReadyOrders = React.useMemo(() => {
        return adminOrdersList
            .filter((order) => ['pickup', 'ready_for_pickup', 'ready'].includes(normalizeStatus(order.status)))
            .slice(0, 8)
    }, [adminOrdersList])
    const selectedOrderContact = React.useMemo(
        () => getOrderContact(selectedOrder),
        [selectedOrder, savedAddresses, user]
    )

    if (!user) return null

    return (
        <>
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${message.type === 'success' ? 'bg-white border-success text-success' : 'bg-white border-red text-red'}`}
                    >
                        <div className="flex items-start gap-3">
                            {message.type === 'success' ? (
                                <Icon.CheckCircle size={24} weight="fill" />
                            ) : (
                                <Icon.Warning size={24} weight="fill" />
                            )}
                            <div className="flex-1">
                                <div className="text-base font-semibold">
                                    {message.type === 'success' ? 'Listo' : 'Atención'}
                                </div>
                                <div className="mt-1 text-sm text-[#111827]">{message.text}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMessage(null)}
                                className="text-[#6b7280] hover:text-[#111827]"
                            >
                                <Icon.X size={18} />
                            </button>
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setMessage(null)}
                                className="px-5 py-2 rounded-full border border-line text-sm font-semibold hover:bg-surface"
                            >
                                Entendido
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <div className="profile-block md:py-20 py-10">
                <div className="w-full max-w-[1920px] mx-auto px-6 md:px-10">
                    <div className="content-main flex gap-y-8 max-lg:flex-col w-full min-w-0">
                        <div className="left lg:w-1/4 xl:w-1/5 w-full xl:pr-10 lg:pr-6 min-w-0">
                            <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
                                <div className="heading flex flex-col items-center justify-center">
                                    <div className="avatar">
                                        <Image
                                            src={'/images/avatar/1.png'}
                                            width={300}
                                            height={300}
                                            alt='Foto de perfil'
                                            priority
                                            loading="eager"
                                            className='md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full'
                                        />
                                    </div>
                                    <div className="name heading6 mt-4 text-center">{user.name}</div>
                                    <div className="mail heading6 font-normal normal-case text-secondary text-center mt-1 break-all">{user.email}</div>
                                </div>
                                <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
                                    {user.role === 'admin' ? (
                                        <>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                                                <Icon.ChartBar size={20} />
                                                <strong className="heading6">Reportes</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'sales-ranking' ? 'active' : ''}`} onClick={() => setActiveTab('sales-ranking')}>
                                                <Icon.Trophy size={20} />
                                                <strong className="heading6">Ranking Ventas</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                                                <Icon.ShoppingBag size={20} />
                                                <strong className="heading6">Productos</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'prices' ? 'active' : ''}`} onClick={() => setActiveTab('prices')}>
                                                <Icon.CurrencyDollar size={20} />
                                                <strong className="heading6">Precios</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'store-status' ? 'active' : ''}`} onClick={() => setActiveTab('store-status')}>
                                                <Icon.Power size={20} />
                                                <strong className="heading6">Ventas</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'taxes' ? 'active' : ''}`} onClick={() => setActiveTab('taxes')}>
                                                <Icon.Percent size={20} />
                                                <strong className="heading6">Impuestos</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'margins' ? 'active' : ''}`} onClick={() => setActiveTab('margins')}>
                                                <Icon.TrendUp size={20} />
                                                <strong className="heading6">Márgenes</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'calculations' ? 'active' : ''}`} onClick={() => setActiveTab('calculations')}>
                                                <Icon.Calculator size={20} />
                                                <strong className="heading6">Cálculos</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'pricing-rules' ? 'active' : ''}`} onClick={() => setActiveTab('pricing-rules')}>
                                                <Icon.SlidersHorizontal size={20} />
                                                <strong className="heading6">Reglas de Precio</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'product-page' ? 'active' : ''}`} onClick={() => setActiveTab('product-page')}>
                                                <Icon.NotePencil size={20} />
                                                <strong className="heading6">Ficha de Producto</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'admin-orders' ? 'active' : ''}`} onClick={() => setActiveTab('admin-orders')}>
                                                <Icon.ListChecks size={20} />
                                                <strong className="heading6">Pedidos</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'shipments' ? 'active' : ''}`} onClick={() => setActiveTab('shipments')}>
                                                <Icon.Truck size={20} />
                                                <strong className="heading6">Envíos</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'balances' ? 'active' : ''}`} onClick={() => setActiveTab('balances')}>
                                                <Icon.Briefcase size={20} />
                                                <strong className="heading6">Balances</strong>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                                                <Icon.HouseLine size={20} />
                                                <strong className="heading6">Panel de Control</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                                                <Icon.Package size={20} />
                                                <strong className="heading6">Historial de Pedidos</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>
                                                <Icon.Tag size={20} />
                                                <strong className="heading6">Mis Direcciones</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'setting' ? 'active' : ''}`} onClick={() => setActiveTab('setting')}>
                                                <Icon.GearSix size={20} />
                                                <strong className="heading6">Configuración</strong>
                                            </Link>
                                        </>
                                    )}
                                    <button onClick={handleLogout} className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 text-left border-none bg-transparent">
                                        <Icon.SignOut size={20} />
                                        <strong className="heading6">Cerrar Sesión</strong>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="right lg:w-3/4 xl:w-4/5 w-full lg:pl-6 pl-0 min-w-0">
                            {user.role === 'admin' && (
                                <>
                                    {adminDataLoading && (
                                        <div className="mb-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-secondary">
                                            Actualizando datos del panel...
                                        </div>
                                    )}
                                    {adminDataError && (
                                        <div className="mb-4 rounded-lg border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
                                            {adminDataError}
                                        </div>
                                    )}
                                    <div className={`tab text-content w-full ${activeTab === 'reports' ? 'block' : 'hidden'}`}>
                                        <div className="flex items-center justify-between pb-6">
                                            <div className="heading5">Reportes de Negocio</div>
                                            <div className="text-sm font-bold text-secondary bg-surface px-4 py-2 rounded-lg border border-line">
                                                {currentDateLabel}
                                            </div>
                                        </div>

                                        <div className="mb-6 p-4 rounded-xl border border-line bg-surface">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div>
                                                    <div className="text-secondary text-xs uppercase font-bold mb-1">IVA configurado</div>
                                                    <div className="heading4">{vatRateLabel}%</div>
                                                    <p className="text-secondary text-xs mt-1">Los precios del catálogo incluyen IVA.</p>
                                                </div>
                                                <div className="text-sm text-secondary">
                                                    Multiplicador aplicado: <span className="font-bold text-black">{vatMultiplierLabel}x</span>
                                                    <span className="mx-2 text-line">•</span>
                                                    Ejemplo: $100 → <span className="font-bold text-black">${vatExampleTotal}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Strategic Alerts Section */}
                                        {dashboardStats?.strategicAlerts && dashboardStats.strategicAlerts.length > 0 && (
                                            <div className="grid grid-cols-1 gap-4 mb-8">
                                                {dashboardStats.strategicAlerts.map((alert, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={`flex items-center justify-between p-4 rounded-xl border-l-4 shadow-sm ${alert.type === 'critical' ? 'bg-red-50 border-red-500 text-red-800' :
                                                            alert.type === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                                                                'bg-blue-50 border-blue-500 text-blue-800'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {alert.type === 'critical' ? <Icon.WarningCircle size={24} weight="fill" /> :
                                                                alert.type === 'warning' ? <Icon.Warning size={24} weight="fill" /> :
                                                                    <Icon.Info size={24} weight="fill" />}
                                                            <span className="font-medium">{alert.message}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-current hover:bg-white/20 transition-colors"
                                                            onClick={() => handleStrategicAlertAction(alert)}
                                                        >
                                                            {alert.action}
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                                            {(() => {
                                                const summary = dashboardStats?.businessMetrics?.salesSummary
                                                const ranking = dashboardStats?.businessMetrics?.productSalesRanking
                                                const gross = Number(summary?.gross ?? 0)
                                                const net = Number(summary?.net ?? 0)
                                                const vat = Number(summary?.vat ?? 0)
                                                const shipping = Number(summary?.shipping ?? 0)
                                                const monthUnits = Number(ranking?.monthlyTotals?.units_sold ?? 0)
                                                const histUnits = Number(ranking?.historicalTotals?.units_sold ?? 0)
                                                return (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="p-4 bg-white rounded-xl border border-line shadow-sm text-left cursor-pointer hover:border-primary transition-all"
                                                            onClick={() => openProductBreakdown('gross')}
                                                        >
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Venta Total</div>
                                                            <div className="heading5">${gross.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Incluye IVA + Envío • Ver productos</div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="p-4 bg-white rounded-xl border border-line shadow-sm text-left cursor-pointer hover:border-primary transition-all"
                                                            onClick={() => openProductBreakdown('net')}
                                                        >
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Venta Neta</div>
                                                            <div className="heading5">${net.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Sin IVA ni envío • Ver productos</div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="p-4 bg-white rounded-xl border border-line shadow-sm text-left cursor-pointer hover:border-primary transition-all"
                                                            onClick={() => openProductBreakdown('vat')}
                                                        >
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">IVA Cobrado</div>
                                                            <div className="heading5">${vat.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Impuesto del cliente • Ver productos</div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="p-4 bg-white rounded-xl border border-line shadow-sm text-left cursor-pointer hover:border-primary transition-all"
                                                            onClick={() => openProductBreakdown('shipping')}
                                                        >
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Envío Cobrado</div>
                                                            <div className="heading5">${shipping.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Cobro al cliente • Ver productos</div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="p-4 bg-white rounded-xl border border-line shadow-sm text-left cursor-pointer hover:border-primary transition-all"
                                                            onClick={() => setActiveTab('sales-ranking')}
                                                        >
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Productos Vendidos (uds)</div>
                                                            <div className="heading5">{monthUnits.toLocaleString('es-EC')}</div>
                                                            <div className="text-secondary text-xs mt-1">
                                                                Mes actual • Hist: {histUnits.toLocaleString('es-EC')}
                                                            </div>
                                                        </button>
                                                    </>
                                                )
                                            })()}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                                            <div
                                                className="p-4 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => openProductBreakdown('net')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Ventas (Mes, netas)</div>
                                                    <Icon.CurrencyDollar className="text-success" size={20} />
                                                </div>
                                                <div className="heading5">${dashboardStats?.totalSales?.amount ? Number(dashboardStats.totalSales.amount).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
                                                <div className={`${salesTrendIsPositive ? 'text-success' : 'text-red'} text-xs mt-2 font-bold flex items-center gap-1`}>
                                                    {salesTrendIsPositive ? <Icon.TrendUp weight="bold" /> : <Icon.TrendDown weight="bold" />}
                                                    {salesTrendIsPositive ? '+' : ''}{salesProgressPercentage.toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                                    <span className="text-secondary font-normal ml-1 flex items-center gap-1 underline">ver detalle <Icon.ArrowRight size={10} /></span>
                                                </div>
                                            </div>

                                            <div
                                                className="p-4 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => setSelectedDeepDive('aov')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Ticket Promedio</div>
                                                    <Icon.Receipt className="text-blue-500" size={20} />
                                                </div>
                                                <div className="heading5">${dashboardStats?.businessMetrics?.averageOrderValue?.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</div>
                                                <div className="text-secondary text-xs mt-2 underline">Analizar distribución <Icon.ArrowRight size={10} className="inline ml-1" /></div>
                                            </div>

                                            <div
                                                className="p-4 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => openProductBreakdown('profit')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Utilidad Bruta (sin IVA y sin envío)</div>
                                                    <Icon.HandCoins className="text-orange-500" size={20} />
                                                </div>
                                                <div className="heading5 text-success">${dashboardStats?.businessMetrics?.profitStats?.profit?.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</div>
                                                <div className="text-success text-xs mt-2 font-bold">{dashboardStats?.businessMetrics?.profitStats?.margin ?? 0}% <span className="text-secondary font-normal underline">margen neto</span></div>
                                            </div>

                                            <div
                                                className="p-4 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => openProductBreakdown('inventory')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Valor Inventario</div>
                                                    <Icon.Archive className="text-purple-500" size={20} />
                                                </div>
                                                <div className="heading5">${dashboardStats?.businessMetrics?.inventoryValue?.cost_value?.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</div>
                                                <div className="text-secondary text-xs mt-2">{dashboardStats?.businessMetrics?.inventoryValue?.total_items ?? 0} items <span className="underline">ver riesgos <Icon.ArrowRight size={10} className="inline ml-1" /></span></div>
                                            </div>

                                            <div
                                                className="p-4 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => setActiveTab('products')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Productos Activos</div>
                                                    <Icon.ShoppingBag className="text-primary" size={20} />
                                                </div>
                                                <div className="heading5">{adminProductsList.length.toLocaleString('es-EC')}</div>
                                                <div className="text-secondary text-xs mt-2 underline">Ver catálogo <Icon.ArrowRight size={10} className="inline ml-1" /></div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <div className="bg-white p-6 rounded-2xl border border-line shadow-sm relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <div className="heading6">Tendencia de Ventas</div>
                                                        <p className="text-secondary text-xs mt-1">Comparativa de ingresos diarios</p>
                                                    </div>
                                                    <div className="flex bg-surface p-1 rounded-lg border border-line">
                                                        <button
                                                            onClick={() => setTrendRange(7)}
                                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${trendRange === 7 ? 'bg-black text-white shadow-md' : 'text-secondary hover:text-black'}`}
                                                        >
                                                            7 Días
                                                        </button>
                                                        <button
                                                            onClick={() => setTrendRange(30)}
                                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${trendRange === 30 ? 'bg-black text-white shadow-md' : 'text-secondary hover:text-black'}`}
                                                        >
                                                            30 Días
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="h-64 md:h-72 relative mt-2">
                                                    {dashboardStats ? (
                                                        trendRange === 7 ? (
                                                            <div className="flex items-end gap-3 h-full justify-between pt-6 px-2">
                                                                {(dashboardStats.monthlyPerformance || []).slice(-7).map((item, i) => {
                                                                    // Calculate max value dynamically or default to 1 to avoid division by zero
                                                                    // Use the max of the visible slice for better scaling
                                                                    const currentData = (dashboardStats.monthlyPerformance || []).slice(-7);
                                                                    const maxVal = Math.max(...currentData.map(p => Number(p.total))) || 100;
                                                                    const rawHeight = (Number(item.total) / maxVal) * 100;
                                                                    const height = Math.max(rawHeight, 4); // Min height for visibility

                                                                    return (
                                                                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-3 group relative cursor-pointer">
                                                                            {/* Tooltip positioned absolutely relative to the bar column */}
                                                                            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 font-bold shadow-xl pointer-events-none mb-1">
                                                                                Ventas: ${Number(item.total).toLocaleString()}
                                                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                                                                            </div>

                                                                            {/* The Bar */}
                                                                            <div className="w-full max-w-[60px] bg-secondary/5 rounded-t-xl relative flex items-end h-full overflow-visible group-hover:bg-secondary/10 transition-colors duration-300">
                                                                                <motion.div
                                                                                    initial={{ height: 0 }}
                                                                                    animate={{ height: `${height}%` }}
                                                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                                                    className={`w-full relative rounded-t-xl ${i === 6 ? 'bg-black' : 'bg-black/80 group-hover:bg-black'}`}
                                                                                >
                                                                                </motion.div>
                                                                            </div>

                                                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${i === 6 ? 'text-black' : 'text-secondary group-hover:text-black'}`}>{item.day}</span>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full pt-10 px-2 flex flex-col justify-between">
                                                                <svg className="w-full h-[200px] overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                                                                    <defs>
                                                                        <linearGradient id="gradientTrend" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
                                                                            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                                                                        </linearGradient>
                                                                        <clipPath id="chartClip">
                                                                            <rect x="0" y="0" width="1000" height="200" />
                                                                        </clipPath>
                                                                    </defs>

                                                                    {/* Background Grid - More subtle and cleaner */}
                                                                    <line x1="0" y1="50" x2="1000" y2="50" stroke="#E5E7EB" strokeDasharray="4 4" />
                                                                    <line x1="0" y1="100" x2="1000" y2="100" stroke="#E5E7EB" strokeDasharray="4 4" />
                                                                    <line x1="0" y1="150" x2="1000" y2="150" stroke="#E5E7EB" strokeDasharray="4 4" />
                                                                    <line x1="0" y1="200" x2="1000" y2="200" stroke="#E5E7EB" strokeWidth="1" />

                                                                    {(() => {
                                                                        const data = dashboardStats.salesTrend30Days || [];
                                                                        const maxVal = Math.max(...data.map(p => Number(p.total))) || 1;

                                                                        // Create smooth curve using cubic bezier
                                                                        const points = data.map((d, i) => {
                                                                            const x = (i / (data.length - 1)) * 1000;
                                                                            const y = 200 - (Number(d.total) / maxVal) * 180; // Leave 20px padding at top
                                                                            return { x, y, val: d.total, date: d.day };
                                                                        });

                                                                        // Generate smooth path command (Catmull-Rom to Bezier conversion or similar simple smoothing)
                                                                        // For simplicity and robustness in this specialized constraint, we'll use straight lines but with a slight curve effect logic or just high quality polyline
                                                                        // Actually, let's use a simple line for 30 days to avoid over-smoothing artifacts, but style it elegantly

                                                                        const pathData = points.reduce((acc, p, i) =>
                                                                            acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");

                                                                        const areaData = pathData + ` L 1000 200 L 0 200 Z`;

                                                                        return (
                                                                            <>
                                                                                <motion.path
                                                                                    initial={{ opacity: 0 }}
                                                                                    animate={{ opacity: 1 }}
                                                                                    transition={{ duration: 1 }}
                                                                                    d={areaData}
                                                                                    fill="url(#gradientTrend)"
                                                                                />
                                                                                <motion.path
                                                                                    initial={{ pathLength: 0 }}
                                                                                    animate={{ pathLength: 1 }}
                                                                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                                                                    d={pathData}
                                                                                    fill="none"
                                                                                    stroke="black"
                                                                                    strokeWidth="2.5"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                />
                                                                                {/* Interactive Points - Only show some points to avoid clutter */}
                                                                                {points.map((p, i) => (
                                                                                    <g key={i} className="group/point">
                                                                                        {/* larger invisible target for easier hovering */}
                                                                                        <rect x={p.x - 10} y="0" width="20" height="200" fill="transparent" className="cursor-pointer" />

                                                                                        <circle
                                                                                            cx={p.x}
                                                                                            cy={p.y}
                                                                                            r="3"
                                                                                            className="fill-white stroke-black stroke-[3px] opacity-0 group-hover/point:opacity-100 transition-all duration-200"
                                                                                        />

                                                                                        {/* Tooltip */}
                                                                                        <foreignObject x={Math.min(p.x - 40, 920)} y={Math.max(p.y - 60, 0)} width="80" height="50" className="opacity-0 group-hover/point:opacity-100 pointer-events-none transition-all duration-200 z-50 overflow-visible">
                                                                                            <div className="bg-black text-white text-[10px] py-2 px-3 rounded-lg text-center shadow-xl transform translate-y-1">
                                                                                                <div className="font-bold mb-0.5">{p.date}</div>
                                                                                                <div>${Number(p.val).toLocaleString()}</div>
                                                                                                {/* Little triangle arrow at bottom */}
                                                                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                                                                                            </div>
                                                                                        </foreignObject>
                                                                                    </g>
                                                                                ))}
                                                                            </>
                                                                        )
                                                                    })()}
                                                                </svg>

                                                                {/* X-Axis Labels - Better distributed */}
                                                                <div className="flex justify-between w-full mt-4 border-t border-line pt-4">
                                                                    {(() => {
                                                                        const data = dashboardStats.salesTrend30Days || [];
                                                                        // Show ~5 labels evenly distributed
                                                                        const step = Math.max(1, Math.floor(data.length / 5));
                                                                        const labels: Array<{ day: string; total: number }> = [];
                                                                        for (let i = 0; i < data.length; i += step) {
                                                                            if (labels.length < 5) labels.push(data[i]);
                                                                        }
                                                                        if (data.length > 0 && labels[labels.length - 1] !== data[data.length - 1]) {
                                                                            labels[4] = data[data.length - 1]; // Ensure last one is last day
                                                                        }

                                                                        return labels.map((item, idx) => (
                                                                            <span key={idx} className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                                                                {idx === labels.length - 1 ? 'HOY' : item?.day}
                                                                            </span>
                                                                        ));
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-secondary">Cargando datos...</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                <div className="bg-white p-8 rounded-2xl border border-line shadow-sm">
                                                    <div className="heading6 mb-6">Distribución de Estados</div>
                                                    <div className="space-y-6">
                                                        {dashboardStats?.businessMetrics?.ordersByStatus?.map((status, i) => {
                                                            const total = dashboardStats.businessMetrics?.ordersByStatus?.reduce((acc, curr) => acc + Number(curr.count), 0) || 1;
                                                            const perc = Math.round((Number(status.count) / total) * 100);
                                                            const normalizedStatus = normalizeStatus(status.status)
                                                            const barColorClass = ['completed', 'delivered'].includes(normalizedStatus)
                                                                ? 'bg-success'
                                                                : ['processing', 'in_process', 'in-process'].includes(normalizedStatus)
                                                                    ? 'bg-yellow'
                                                                    : ['pending'].includes(normalizedStatus)
                                                                        ? 'bg-amber-400'
                                                                        : ['canceled', 'cancelled'].includes(normalizedStatus)
                                                                            ? 'bg-red'
                                                                            : ['pickup', 'ready_for_pickup', 'ready'].includes(normalizedStatus)
                                                                                ? 'bg-amber-600'
                                                                                : 'bg-primary'
                                                            return (
                                                                <div key={i} className="cursor-pointer group hover:bg-surface -mx-2 p-2 rounded-lg transition-colors" onClick={() => setActiveTab('admin-orders')}>
                                                                    <div className="flex justify-between text-sm mb-2">
                                                                        <span className="capitalize font-bold text-secondary group-hover:text-black transition-colors">{getStatusBadge(status.status).label}</span>
                                                                        <span className="font-bold">{status.count} ({perc}%)</span>
                                                                    </div>
                                                                    <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                                                                        <div className={`h-full ${barColorClass}`} style={{ width: `${perc}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="bg-white p-8 rounded-2xl border border-line shadow-sm overflow-hidden">
                                                        <div className="heading6 mb-6">Actividad Reciente</div>
                                                        <div className="w-full">
                                                            <table className="w-full text-left text-sm table-fixed">
                                                                <thead>
                                                                    <tr className="border-b border-line">
                                                                        <th className="pb-3 text-secondary font-medium w-1/4">ID</th>
                                                                        <th className="pb-3 text-secondary font-medium w-1/3">Cliente</th>
                                                                        <th className="pb-3 text-secondary font-medium text-right">Total</th>
                                                                        <th className="pb-3 text-secondary font-medium text-right">Hora</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {dashboardStats?.businessMetrics?.recentOrders?.map((order, i) => (
                                                                        <tr key={i}
                                                                            className="border-b border-line last:border-0 hover:bg-surface transition-colors cursor-pointer group"
                                                                            onClick={() => handleViewOrder(order.id)}
                                                                        >
                                                                            <td className="py-4 font-bold text-xs truncate pr-2 group-hover:text-primary transition-colors">#{order.id.split('-').pop()}</td>
                                                                            <td className="py-4 text-xs truncate pr-2">{order.user_name || 'Anónimo'}</td>
                                                                            <td className="py-4 text-right font-bold text-xs">${Number(order.total).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                            <td className="py-4 text-right text-[10px] text-secondary whitespace-nowrap">
                                                                                {formatDateTimeEcuador(order.created_at, { hour: '2-digit', minute: '2-digit' })}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-8 rounded-2xl border border-line shadow-sm">
                                                        <div className="heading6 mb-6">Top 5 Productos</div>
                                                        <div className="space-y-4">
                                                            {dashboardStats?.topProducts?.map((prod, i) => (
                                                                <div key={i}
                                                                    className="flex items-center gap-4 p-3 bg-surface rounded-xl hover:shadow-md transition-all cursor-pointer hover:bg-white border border-transparent hover:border-line"
                                                                    onClick={() => {
                                                                        const found = adminProductsList.find(p => p.name === prod.name);
                                                                        if (found) handleEditProduct(found);
                                                                    }}
                                                                >
                                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">{i + 1}</div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-xs font-bold truncate group-hover:text-primary">{prod.name}</div>
                                                                        <div className="text-[10px] text-secondary">{prod.sold} unidades</div>
                                                                    </div>
                                                                    <div className="text-xs font-bold text-success whitespace-nowrap">${Number(prod.revenue).toLocaleString()}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="bg-surface rounded-xl border border-line p-6">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Icon.Tag size={20} className="text-primary" />
                                                        <div className="font-bold">Categorías Estrella</div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {dashboardStats?.salesByCategory?.slice(0, 4).map((cat, i) => {
                                                            const total = dashboardStats.salesByCategory?.reduce((acc, curr) => acc + Number(curr.total), 0) || 1;
                                                            const perc = Math.round((Number(cat.total) / total) * 100);
                                                            return (
                                                                <div key={i} className="cursor-pointer group hover:bg-white -mx-2 p-2 rounded-lg transition-colors" onClick={() => setActiveTab('products')}>
                                                                    <div className="flex justify-between text-[10px] mb-1">
                                                                        <span className="capitalize font-bold text-secondary group-hover:text-black">{cat.category}</span>
                                                                        <span className="font-bold">{perc}%</span>
                                                                    </div>
                                                                    <div className="w-full h-1 bg-line rounded-full overflow-hidden">
                                                                        <div className="h-full bg-primary" style={{ width: `${perc}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="bg-surface rounded-xl border border-line p-6">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Icon.Lightbulb size={24} className="text-yellow" />
                                                        <div className="font-bold">Análisis de Stock</div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div
                                                            className="p-3 bg-white rounded-lg border border-line cursor-pointer hover:border-black transition-colors shadow-sm group"
                                                            onClick={() => setSelectedDeepDive('inventory')}
                                                        >
                                                            <div className="text-[10px] text-secondary uppercase font-bold group-hover:text-black">Valor de Mercado</div>
                                                            <div className="text-lg font-bold">${Number(dashboardStats?.businessMetrics?.inventoryValue?.market_value ?? 0).toLocaleString()}</div>
                                                        </div>
                                                        <div
                                                            className="p-3 bg-white rounded-lg border border-line cursor-pointer hover:border-black transition-colors shadow-sm group"
                                                            onClick={() => setSelectedDeepDive('inventory')}
                                                        >
                                                            <div className="text-[10px] text-secondary uppercase font-bold group-hover:text-black">Inversión en Almacén</div>
                                                            <div className="text-lg font-bold">${Number(dashboardStats?.businessMetrics?.inventoryValue?.cost_value ?? 0).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-surface rounded-xl border border-line p-6">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Icon.TrendUp size={24} className="text-success" />
                                                        <div className="font-bold">KPIs Financieros</div>
                                                    </div>
                                                    <div className="space-y-4 cursor-pointer" onClick={() => setSelectedDeepDive('profit')}>
                                                        <div className="flex justify-between items-center py-2 border-b border-line hover:bg-white -mx-2 px-2 rounded-lg transition-colors">
                                                            <span className="text-xs text-secondary font-bold">Rentabilidad de Ventas</span>
                                                            <span className="font-bold text-success text-sm">{dashboardStats?.businessMetrics?.profitStats?.margin}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-2 border-b border-line hover:bg-white -mx-2 px-2 rounded-lg transition-colors">
                                                            <span className="text-xs text-secondary font-bold">Inversión Recuperada</span>
                                                            <span className="font-bold text-sm">74.2%</span>
                                                        </div>
                                                        <div className="text-[9px] text-secondary text-center mt-2 group-hover:text-black">Diferencia entre Precio de Venta y Costo de Adquisición</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'sales-ranking' ? 'block' : 'hidden'}`}>
                                        <div className="flex items-center justify-between pb-6">
                                            <div>
                                                <div className="heading5">Ranking de productos vendidos</div>
                                                <p className="text-secondary text-xs mt-1">
                                                    Ranking completo del producto más vendido al menos vendido.
                                                </p>
                                            </div>
                                            <div className="text-sm font-bold text-secondary bg-surface px-4 py-2 rounded-lg border border-line">
                                                {currentDateLabel}
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl border border-line shadow-sm mb-8">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                                                <div>
                                                    <div className="heading6">Resumen y orden de ventas</div>
                                                    <p className="text-secondary text-xs mt-1">
                                                        Vista activa: {salesRankingView === 'month' ? `mes (${selectedRankingMonthLabel})` : 'histórico total'}.
                                                    </p>
                                                    <p className="text-secondary text-xs mt-1">
                                                        Haz clic en el nombre del producto para ver su detalle (mes e histórico).
                                                    </p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                                                    <label className="flex flex-col gap-1 text-[10px] uppercase font-bold text-secondary">
                                                        Mes a consultar
                                                        <input
                                                            type="month"
                                                            value={salesRankingMonth}
                                                            onChange={(event) => {
                                                                const nextMonth = event.target.value
                                                                setSalesRankingMonth(nextMonth || getCurrentMonthKey())
                                                                setSalesRankingView('month')
                                                            }}
                                                            className="px-3 py-1.5 text-sm font-semibold rounded-md border border-line bg-white text-black focus:border-black outline-none"
                                                        />
                                                    </label>
                                                    <div className="flex bg-surface p-1 rounded-lg border border-line w-fit">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSalesRankingView('month')}
                                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${salesRankingView === 'month' ? 'bg-black text-white shadow-md' : 'text-secondary hover:text-black'}`}
                                                        >
                                                            Mes
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSalesRankingView('historical')}
                                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${salesRankingView === 'historical' ? 'bg-black text-white shadow-md' : 'text-secondary hover:text-black'}`}
                                                        >
                                                            Histórico total
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Periodo activo</div>
                                                    <div className="text-sm font-semibold">
                                                        {salesRankingView === 'month'
                                                            ? `${productSalesRanking?.period?.start || '-'} → ${productSalesRanking?.period?.end || '-'}`
                                                            : `${productSalesRanking?.historicalPeriod?.start || '-'} → ${productSalesRanking?.historicalPeriod?.end || '-'}`
                                                        }
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Pedidos</div>
                                                    <div className="text-lg font-bold">{Number(salesRankingFinancial?.orders_count ?? 0)}</div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Unidades</div>
                                                    <div className="text-lg font-bold">{Number(salesRankingTotals?.units_sold ?? 0)}</div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Venta bruta</div>
                                                    <div className="text-lg font-bold">{formatMoney(salesRankingFinancial?.gross ?? 0)}</div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Venta neta</div>
                                                    <div className="text-lg font-bold">{formatMoney(salesRankingFinancial?.net ?? salesRankingTotals?.net_revenue ?? 0)}</div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">IVA</div>
                                                    <div className="text-lg font-bold">{formatMoney(salesRankingFinancial?.vat ?? 0)}</div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Envío</div>
                                                    <div className="text-lg font-bold">{formatMoney(salesRankingFinancial?.shipping ?? 0)}</div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Costo</div>
                                                    <div className="text-lg font-bold">{formatMoney(salesRankingFinancial?.cost ?? 0)}</div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Utilidad</div>
                                                    <div className={`text-lg font-bold ${(Number(salesRankingFinancial?.profit ?? 0) >= 0) ? 'text-success' : 'text-red'}`}>
                                                        {formatMoney(salesRankingFinancial?.profit ?? 0)}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-lg border border-line bg-surface">
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Margen</div>
                                                    <div className="text-lg font-bold">{Number(salesRankingFinancial?.margin ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</div>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto border border-line rounded-xl">
                                                <table className="w-full min-w-[980px] text-left">
                                                    <thead className="bg-surface text-[10px] uppercase font-bold text-secondary border-b border-line">
                                                        <tr>
                                                            <th className="px-4 py-3 text-right">#</th>
                                                            <th className="px-4 py-3">Producto</th>
                                                            <th className="px-4 py-3">Categoría</th>
                                                            <th className="px-4 py-3 text-right">Pedidos ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                            <th className="px-4 py-3 text-right">Vendidos ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                            <th className="px-4 py-3 text-right">Venta bruta ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                            <th className="px-4 py-3 text-right">Venta neta ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                            <th className="px-4 py-3 text-right">IVA ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                            <th className="px-4 py-3 text-right">Envío ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                            <th className="px-4 py-3 text-right">Costo ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                            <th className="px-4 py-3 text-right">Utilidad ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                            <th className="px-4 py-3 text-right">Margen ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-line">
                                                        {salesRankingRows.map((item, index) => (
                                                            <tr key={`${item.product_id}-${index}`} className="hover:bg-surface/40">
                                                                <td className="px-4 py-3 text-right font-semibold text-sm">{index + 1}</td>
                                                                <td className="px-4 py-3 text-sm font-semibold">
                                                                    <button
                                                                        type="button"
                                                                        className="text-left hover:underline"
                                                                        onClick={() => openSalesProductDetail(item)}
                                                                    >
                                                                        {item.product_name}
                                                                    </button>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm capitalize">{item.category || 'Sin categoría'}</td>
                                                                <td className="px-4 py-3 text-sm text-right">{item.orders_count}</td>
                                                                <td className="px-4 py-3 text-sm text-right font-semibold">{item.units_sold}</td>
                                                                <td className="px-4 py-3 text-sm text-right">{formatMoney(item.gross_revenue)}</td>
                                                                <td className="px-4 py-3 text-sm text-right">{formatMoney(item.net_revenue)}</td>
                                                                <td className="px-4 py-3 text-sm text-right">{formatMoney(item.vat_amount)}</td>
                                                                <td className="px-4 py-3 text-sm text-right">{formatMoney(item.shipping_amount)}</td>
                                                                <td className="px-4 py-3 text-sm text-right">{formatMoney(item.cost)}</td>
                                                                <td className={`px-4 py-3 text-sm text-right font-semibold ${(Number(item.profit ?? 0) >= 0) ? 'text-success' : 'text-red'}`}>
                                                                    {formatMoney(item.profit)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right">
                                                                    {Number(item.margin ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {salesRankingRows.length === 0 && (
                                                            <tr>
                                                                <td colSpan={12} className="px-4 py-6 text-center text-secondary text-sm">
                                                                    No hay datos de ventas para construir el ranking.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'products' ? 'block' : 'hidden'}`}>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="heading5">Gestión de Productos</div>
                                            <button className="button-main py-2 px-6" onClick={handleNewProduct}>Nuevo Producto</button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-line">
                                                        <th className="pb-4 font-bold text-secondary">Imagen</th>
                                                        <th className="pb-4 font-bold text-secondary">Producto</th>
                                                        <th className="pb-4 font-bold text-secondary">Stock</th>
                                                        <th className="pb-4 font-bold text-secondary">Precio</th>
                                                        <th className="pb-4 font-bold text-secondary">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {adminProductsList.length > 0 ? adminProductsList.map((product) => (
                                                        <tr key={product.id} className="border-b border-line last:border-0 hover:bg-surface duration-300">
                                                            <td className="py-4">
                                                                <div className="w-12 h-12 bg-line rounded-lg overflow-hidden">
                                                                    <Image
                                                                        src={(product.thumbImage && product.thumbImage.length > 0 ? product.thumbImage[0] : (product.images && product.images.length > 0 ? product.images[0] : '/images/product/1000x1000.png'))}
                                                                        width={100}
                                                                        height={100}
                                                                        alt={product.name}
                                                                        unoptimized={((product.thumbImage && product.thumbImage.length > 0 ? product.thumbImage[0] : (product.images && product.images.length > 0 ? product.images[0] : '/images/product/1000x1000.png')) as string).startsWith('/uploads/') || ((product.thumbImage && product.thumbImage.length > 0 ? product.thumbImage[0] : (product.images && product.images.length > 0 ? product.images[0] : '/images/product/1000x1000.png')) as string).startsWith('/images/')}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="py-4 font-semibold">{product.name}</td>
                                                            <td className="py-4">{product.quantity ?? 0} unidades</td>
                                                            <td className="py-4 font-bold">${Number(product.price).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td className="py-4">
                                                                <div className="flex gap-2">
                                                                    <button className="p-2 hover:bg-line rounded-full transition-colors" onClick={() => handleEditProduct(product)}><Icon.PencilSimple size={18} /></button>
                                                                    <button
                                                                        className="p-2 hover:bg-line rounded-full transition-colors text-red"
                                                                        onClick={() => handleDeleteProduct(product.internalId || product.id)}
                                                                    >
                                                                        <Icon.Trash size={18} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan={5} className="py-8 text-center text-secondary">No se encontraron productos.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'taxes' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Impuestos y cargos</div>
                                        <p className="text-secondary mb-6">Configura IVA y ajustes de envío que impactan el precio final.</p>
                                        <div className="mb-8 p-6 rounded-xl border border-line bg-surface">
                                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                                <div className="flex-1 group">
                                                    <label
                                                        htmlFor="vatRate"
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Incrementa el precio final del cliente. El IVA no cuenta como utilidad."
                                                    >
                                                        IVA (%)
                                                    </label>
                                                    <input
                                                        id="vatRate"
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={vatRate}
                                                        onChange={(e) => setVatRate(Number(e.target.value))}
                                                        disabled={vatLoading || vatSaving}
                                                    />
                                                    <p className="text-secondary text-xs mt-2">Los precios del catálogo se muestran con IVA incluido.</p>
                                                    <p className="text-[11px] text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Subir el IVA aumenta el total pagado por el cliente, pero no cambia la utilidad del producto.
                                                    </p>
                                                </div>
                                                <button
                                                    className="button-main py-2 px-6"
                                                    onClick={handleSaveVat}
                                                    disabled={vatLoading || vatSaving}
                                                >
                                                    {vatSaving ? 'Guardando...' : 'Guardar IVA'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-8 p-6 rounded-xl border border-line bg-surface">
                                            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="group">
                                                        <label
                                                            htmlFor="shippingDelivery"
                                                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                            title="Se suma al total del pedido cuando el cliente elige envío a domicilio."
                                                        >
                                                            Envío a domicilio ($)
                                                        </label>
                                                        <input
                                                            id="shippingDelivery"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="border border-line px-4 py-2 rounded-lg w-full"
                                                            value={shippingRates.delivery}
                                                            onChange={(e) => setShippingRates({ ...shippingRates, delivery: Number(e.target.value) })}
                                                            disabled={shippingLoading || shippingSaving}
                                                        />
                                                        <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Aumentar este valor incrementa el costo final del pedido para envíos a domicilio.
                                                        </p>
                                                    </div>
                                                    <div className="group">
                                                        <label
                                                            htmlFor="shippingPickup"
                                                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                            title="Costo aplicado cuando el cliente recoge en tienda."
                                                        >
                                                            Retiro en tienda ($)
                                                        </label>
                                                        <input
                                                            id="shippingPickup"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="border border-line px-4 py-2 rounded-lg w-full"
                                                            value={shippingRates.pickup}
                                                            onChange={(e) => setShippingRates({ ...shippingRates, pickup: Number(e.target.value) })}
                                                            disabled={shippingLoading || shippingSaving}
                                                        />
                                                        <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Define el cargo por retiro en tienda; 0 significa retiro gratuito.
                                                        </p>
                                                    </div>
                                                    <div className="md:col-span-2 group">
                                                        <label
                                                            htmlFor="shippingTaxRate"
                                                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                            title="Porcentaje de IVA que se suma al costo de envío."
                                                        >
                                                            IVA aplicado al envío (%)
                                                        </label>
                                                        <input
                                                            id="shippingTaxRate"
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            className="border border-line px-4 py-2 rounded-lg w-full"
                                                            value={shippingRates.taxRate}
                                                            onChange={(e) => setShippingRates({ ...shippingRates, taxRate: Number(e.target.value) })}
                                                            disabled={shippingLoading || shippingSaving}
                                                        />
                                                        <p className="text-secondary text-xs mt-2">Se suma al envío para cubrir impuestos. Ej: 15% incrementa el costo final.</p>
                                                        <p className="text-[11px] text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            A mayor IVA de envío, mayor total del pedido cuando hay costos logísticos.
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="button-main py-2 px-6"
                                                    onClick={handleSaveShipping}
                                                    disabled={shippingLoading || shippingSaving}
                                                >
                                                    {shippingSaving ? 'Guardando...' : 'Guardar Envío'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'prices' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Gestión Inteligente de Precios</div>
                                        <p className="text-secondary mb-6">Optimiza tus márgenes con sugerencias basadas en costos.</p>
                                        <div className="mb-8 p-6 rounded-xl border border-line bg-surface">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 rounded-lg bg-white border border-line">
                                                    <div className="text-xs uppercase font-bold text-secondary">Margen base</div>
                                                    <div className="heading5">{marginSettings.baseMargin}%</div>
                                                    <button className="text-xs underline mt-2" onClick={() => setActiveTab('margins')}>Editar márgenes</button>
                                                </div>
                                                <div className="p-4 rounded-lg bg-white border border-line">
                                                    <div className="text-xs uppercase font-bold text-secondary">Redondeo</div>
                                                    <div className="heading5">${calcSettings.rounding.toFixed(2)}</div>
                                                    <button className="text-xs underline mt-2" onClick={() => setActiveTab('calculations')}>Editar cálculos</button>
                                                </div>
                                                <div className="p-4 rounded-lg bg-white border border-line">
                                                    <div className="text-xs uppercase font-bold text-secondary">Descuento por volumen</div>
                                                    <div className="heading5">{pricingRules.bulkDiscount}%</div>
                                                    <button className="text-xs underline mt-2" onClick={() => setActiveTab('pricing-rules')}>Editar reglas</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                            {(() => {
                                                const summary = dashboardStats?.businessMetrics?.salesSummary
                                                const profit = dashboardStats?.businessMetrics?.profitStats
                                                const gross = Number(summary?.gross ?? 0)
                                                const net = Number(summary?.net ?? 0)
                                                const vat = Number(summary?.vat ?? 0)
                                                const shipping = Number(summary?.shipping ?? 0)
                                                const cost = Number(profit?.cost ?? 0)
                                                const utilidad = Number(profit?.profit ?? 0)
                                                return (
                                                    <>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Venta Total</div>
                                                            <div className="heading5">${gross.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Incluye IVA + Envío</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Venta Neta</div>
                                                            <div className="heading5">${net.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Sin IVA ni envío</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">IVA Cobrado</div>
                                                            <div className="heading5">${vat.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Impuesto del cliente</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Envío Cobrado</div>
                                                            <div className="heading5">${shipping.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Cobro al cliente</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Costo (COGS)</div>
                                                            <div className="heading5 text-orange-500">-${cost.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Costo de producto</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Utilidad Bruta</div>
                                                            <div className="heading5 text-success">${utilidad.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Sin IVA</div>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>

                                        <div className="mb-6 rounded-xl border border-line bg-white p-5">
                                            <div className="text-xs uppercase font-bold text-secondary mb-3">Resumen de costos e impuestos</div>
                                            {(() => {
                                                const summary = dashboardStats?.businessMetrics?.salesSummary
                                                const profit = dashboardStats?.businessMetrics?.profitStats
                                                const gross = Number(summary?.gross ?? 0)
                                                const net = Number(summary?.net ?? 0)
                                                const vat = Number(summary?.vat ?? 0)
                                                const shipping = Number(summary?.shipping ?? 0)
                                                const cost = Number(profit?.cost ?? 0)
                                                const utilidad = Number(profit?.profit ?? 0)
                                                const format = (val: number) => val.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                return (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
                                                        <div>
                                                            <div className="text-[10px] uppercase font-bold text-secondary">Venta total</div>
                                                            <div className="font-semibold">${format(gross)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase font-bold text-secondary">Venta neta</div>
                                                            <div className="font-semibold">${format(net)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase font-bold text-secondary">IVA cobrado</div>
                                                            <div className="font-semibold">${format(vat)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase font-bold text-secondary">Envío cobrado</div>
                                                            <div className="font-semibold">${format(shipping)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase font-bold text-secondary">Costo (COGS)</div>
                                                            <div className="font-semibold text-orange-600">-${format(cost)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase font-bold text-secondary">Utilidad</div>
                                                            <div className="font-semibold text-success">${format(utilidad)}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                            <div className="text-[11px] text-secondary mt-3">Los montos se calculan sin IVA y el envío se muestra por separado.</div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            <div className="p-5 rounded-xl bg-surface border border-line">
                                                <div className="text-secondary text-xs uppercase font-bold mb-1">Margen Promedio</div>
                                                <div className="heading4 text-success">
                                                    {dashboardStats?.productAnalysis?.averageMargin ?? 0}%
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-xl bg-surface border border-line">
                                                <div className="text-secondary text-xs uppercase font-bold mb-1">Oportunidades de Precio</div>
                                                <div className="heading4 text-yellow">
                                                    {dashboardStats?.productAnalysis?.lowMarginOpportunities ?? 0} <span className="text-sm text-secondary font-normal">productos bajo margen</span>
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-xl bg-surface border border-line">
                                                <div className="text-secondary text-xs uppercase font-bold mb-1">Beneficio Potencial</div>
                                                <div className="heading4">
                                                    {Math.max((marginSettings.targetMargin - (dashboardStats?.productAnalysis?.averageMargin ?? 0)), 0).toFixed(1)}%
                                                </div>
                                                <div className="text-secondary text-xs mt-1">Brecha vs objetivo</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                            {(() => {
                                                const products = adminProductsList || []
                                                const netSales = Number(dashboardStats?.businessMetrics?.salesSummary?.net ?? 0) || 1
                                                const format = (val: number) => val.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                const risks = products.map((product: any) => {
                                                    const price = Number(product.price) || 0
                                                    const basePrice = vatDisplayMultiplier > 0 ? (price / vatDisplayMultiplier) : price
                                                    const cost = parseMoney(product.business?.cost)
                                                    const margin = basePrice > 0 ? ((basePrice - cost) / basePrice) * 100 : 0
                                                    return {
                                                        id: product.id,
                                                        name: product.name,
                                                        margin,
                                                        cost,
                                                        basePrice
                                                    }
                                                }).sort((a: any, b: any) => a.margin - b.margin).slice(0, 5)

                                                const topProducts = (dashboardStats?.topProducts || []).map((item: any) => ({
                                                    name: item.name,
                                                    sold: Number(item.sold ?? 0),
                                                    revenue: Number(item.revenue ?? 0),
                                                    share: (Number(item.revenue ?? 0) / netSales) * 100
                                                }))

                                                const categories = (dashboardStats?.salesByCategory || []).slice(0, 5).map((cat: any) => ({
                                                    name: cat.category || 'Sin categoría',
                                                    total: Number(cat.total ?? 0),
                                                    share: (Number(cat.total ?? 0) / netSales) * 100
                                                }))

                                                const missingCostItems = products.filter((p: any) => parseMoney(p.business?.cost) <= 0)
                                                const missingCost = missingCostItems.length

                                                return (
                                                    <>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-xs uppercase font-bold text-secondary mb-2">Márgenes más bajos</div>
                                                            {missingCost > 0 && (
                                                                <div className="text-[11px] text-orange-600 font-semibold mb-2">
                                                                    Costos sin registrar: {missingCost}
                                                                </div>
                                                            )}
                                                            <div className="space-y-2">
                                                                {risks.map((item: any) => (
                                                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                                                        <span className="truncate max-w-[70%]">{item.name}</span>
                                                                        <span className={`font-bold ${item.margin < 20 ? 'text-red' : item.margin < 35 ? 'text-yellow' : 'text-success'}`}>
                                                                            {item.margin.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                {risks.length === 0 && (
                                                                    <div className="text-sm text-secondary">No hay productos para evaluar.</div>
                                                                )}
                                                            </div>
                                                            {missingCostItems.length > 0 && (
                                                                <div className="mt-4 border-t border-line pt-3">
                                                                    <div className="text-[10px] uppercase font-bold text-secondary mb-2">Sin costo</div>
                                                                    <div className="space-y-1">
                                                                        {missingCostItems.slice(0, 4).map((item: any) => (
                                                                            <div key={item.id} className="text-xs text-secondary truncate">{item.name}</div>
                                                                        ))}
                                                                        {missingCostItems.length > 4 && (
                                                                            <div className="text-xs text-secondary">+{missingCostItems.length - 4} más</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="text-[11px] text-secondary mt-3">Ordenado por margen más bajo. Los costos faltantes se listan aparte.</div>
                                                        </div>

                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-xs uppercase font-bold text-secondary mb-3">Top contribuyentes</div>
                                                            <div className="space-y-2">
                                                                {topProducts.map((item: any) => (
                                                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                                                        <span className="truncate max-w-[60%]">{item.name}</span>
                                                                        <span className="text-secondary">{item.sold} uds</span>
                                                                        <span className="font-bold">{item.share.toFixed(1)}%</span>
                                                                    </div>
                                                                ))}
                                                                {topProducts.length === 0 && (
                                                                    <div className="text-sm text-secondary">Sin ventas recientes.</div>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-secondary mt-3">Participación sobre ventas netas.</div>
                                                        </div>

                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-xs uppercase font-bold text-secondary mb-3">Mix por categoría</div>
                                                            <div className="space-y-2">
                                                                {categories.map((cat: any) => (
                                                                    <div key={cat.name} className="flex items-center justify-between text-sm">
                                                                        <span className="truncate max-w-[70%]">{cat.name}</span>
                                                                        <span className="font-bold">{cat.share.toFixed(1)}%</span>
                                                                    </div>
                                                                ))}
                                                                {categories.length === 0 && (
                                                                    <div className="text-sm text-secondary">Sin categorías vendidas.</div>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-secondary mt-3">Distribución de ventas netas.</div>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>

                                        <div className="bg-surface p-6 rounded-xl border border-line">
                                            <div className="flex items-center gap-4 mb-6">
                                                <input className="border-line px-4 py-2 rounded-lg flex-1" placeholder="Buscar producto..." />
                                                <button className="button-main py-2 px-6">Buscar</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-line">
                                                            <th className="pb-4 font-bold text-secondary text-sm">PRODUCTO</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">COSTO</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">BASE (SIN IVA)</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">IVA</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">P.V.P</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">UTILIDAD</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">MARGEN</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {adminProductsList.length > 0 ? adminProductsList.map((product: any) => {
                                                            const price = Number(product.price) || 0
                                                            const basePrice = vatDisplayMultiplier > 0 ? (price / vatDisplayMultiplier) : price
                                                            const vatPart = Math.max(price - basePrice, 0)
                                                            const cost = parseMoney(product.business?.cost)
                                                            const utilidad = Math.max(basePrice - cost, 0)
                                                            const format = (val: number) => val.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                            return (
                                                                <tr key={product.id} className="border-b border-line last:border-0 hover:bg-surface duration-300">
                                                                    <td className="py-4">
                                                                        <div className="font-semibold text-sm">{product.name}</div>
                                                                    <div className="text-xs text-secondary">SKU: {product.sku || product.id}</div>
                                                                    </td>
                                                                    <td className="py-4 font-medium text-secondary text-sm">${format(cost)}</td>
                                                                    <td className="py-4 font-medium text-sm">${format(basePrice)}</td>
                                                                    <td className="py-4 font-medium text-sm text-secondary">${format(vatPart)}</td>
                                                                    <td className="py-4 font-bold text-sm">${format(price)}</td>
                                                                    <td className="py-4 font-bold text-sm text-success">${format(utilidad)}</td>
                                                                    <td className="py-4">
                                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${((product.business?.margin || 0) < 20) ? 'bg-red text-white' :
                                                                            ((product.business?.margin || 0) < 35) ? 'bg-yellow text-white' : 'bg-success text-white'
                                                                            }`}>
                                                                            {product.business?.margin || 0}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        }) : (
                                                            <tr><td colSpan={7} className="py-8 text-center text-secondary">Cargando análisis de precios...</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'store-status' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Ventas en línea</div>
                                        <p className="text-secondary mb-6">Activa o detén la tienda para mantenimiento o fallas operativas.</p>
                                        <div className="p-6 rounded-xl border border-line bg-surface">
                                            {storeStatusLoading ? (
                                                <div className="text-sm text-secondary">Cargando estado de ventas...</div>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className={`p-4 rounded-lg border ${storeStatus.salesEnabled ? 'bg-white border-success/30' : 'bg-red/5 border-red/30'}`}>
                                                            <div className="text-xs uppercase font-bold text-secondary">Estado actual</div>
                                                            <div className={`heading5 mt-1 ${storeStatus.salesEnabled ? 'text-success' : 'text-red'}`}>
                                                                {storeStatus.salesEnabled ? 'Ventas activas' : 'Ventas apagadas'}
                                                            </div>
                                                            <p className="text-xs text-secondary mt-2">
                                                                {storeStatus.salesEnabled
                                                                    ? 'Los clientes pueden cotizar y pagar pedidos.'
                                                                    : 'La tienda bloquea cotizaciones y compras nuevas.'}
                                                            </p>
                                                        </div>
                                                        <div className="p-4 rounded-lg bg-white border border-line">
                                                            <div className="text-xs uppercase font-bold text-secondary">Última actualización</div>
                                                            <div className="text-sm font-semibold mt-1">
                                                                {storeStatus.updatedAt ? formatDateTimeEcuador(storeStatus.updatedAt) : 'Sin registro'}
                                                            </div>
                                                            <p className="text-xs text-secondary mt-2">
                                                                Usuario: {storeStatus.updatedBy || 'Sin registro'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6">
                                                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">
                                                            Mensaje cuando las ventas estén apagadas
                                                        </label>
                                                        <textarea
                                                            className="border border-line rounded-lg px-4 py-3 w-full min-h-[120px]"
                                                            value={storeStatus.message}
                                                            onChange={(e) => setStoreStatus((prev) => ({ ...prev, message: e.target.value }))}
                                                            placeholder={DEFAULT_STORE_PAUSE_MESSAGE}
                                                            disabled={storeStatusSaving}
                                                        />
                                                        <p className="text-[11px] text-secondary mt-2">
                                                            Este texto se devuelve al cliente cuando intenta comprar con la tienda detenida.
                                                        </p>
                                                    </div>

                                                    <div className="mt-6 flex flex-wrap gap-3">
                                                        <button
                                                            className={`py-2 px-6 rounded-lg font-semibold ${storeStatus.salesEnabled ? 'bg-red text-white' : 'bg-success text-white'}`}
                                                            onClick={() => handleSaveStoreStatus(!storeStatus.salesEnabled)}
                                                            disabled={storeStatusSaving}
                                                        >
                                                            {storeStatusSaving
                                                                ? 'Guardando...'
                                                                : storeStatus.salesEnabled
                                                                    ? 'Apagar ventas ahora'
                                                                    : 'Reactivar ventas'}
                                                        </button>
                                                        <button
                                                            className="py-2 px-6 rounded-lg font-semibold border border-line bg-white hover:bg-surface"
                                                            onClick={() => handleSaveStoreStatus()}
                                                            disabled={storeStatusSaving}
                                                        >
                                                            Guardar mensaje
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'margins' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Márgenes y rentabilidad</div>
                                        <p className="text-secondary mb-6">Define objetivos de margen para tus precios recomendados.</p>
                                        <div className="p-6 rounded-xl border border-line bg-surface">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Margen usado como referencia para el precio sugerido. A mayor margen, sube el precio y la utilidad esperada."
                                                    >
                                                        Margen base (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={marginSettings.baseMargin}
                                                        onChange={(e) => setMarginSettings({ ...marginSettings, baseMargin: toNumber(e.target.value, marginSettings.baseMargin) })}
                                                    />
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Aumentar el margen base eleva el precio recomendado y la utilidad por venta.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Piso de rentabilidad. Si el margen configurado es menor, el sistema no sugerirá precios por debajo de este valor."
                                                    >
                                                        Margen mínimo (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={marginSettings.minMargin}
                                                        onChange={(e) => setMarginSettings({ ...marginSettings, minMargin: toNumber(e.target.value, marginSettings.minMargin) })}
                                                    />
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Define el margen más bajo permitido; protege la utilidad aunque el precio competitivo sea menor.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Meta principal de rentabilidad. El motor de precios intenta llegar a este margen."
                                                    >
                                                        Margen objetivo (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={marginSettings.targetMargin}
                                                        onChange={(e) => setMarginSettings({ ...marginSettings, targetMargin: toNumber(e.target.value, marginSettings.targetMargin) })}
                                                    />
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        A mayor margen objetivo, mayor precio sugerido para alcanzar la rentabilidad deseada.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Reserva adicional para aplicar descuentos sin romper la rentabilidad."
                                                    >
                                                        Buffer promociones (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={marginSettings.promoBuffer}
                                                        onChange={(e) => setMarginSettings({ ...marginSettings, promoBuffer: toNumber(e.target.value, marginSettings.promoBuffer) })}
                                                    />
                                                    <p className="text-secondary text-xs mt-2">Reserva margen extra para descuentos sin afectar rentabilidad.</p>
                                                    <p className="text-[11px] text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Un buffer más alto sube el precio base para absorber promociones sin perder margen.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    className="button-main py-2 px-6"
                                                    onClick={async () => {
                                                        const normalized = normalizeMarginSettings(marginSettings)
                                                        setMarginSettings(normalized)
                                                        try {
                                                            const res = await updatePricingMargins(normalized)
                                                            setMarginSettings(normalizeMarginSettings(res.body))
                                                            showNotification('Márgenes guardados correctamente.')
                                                        } catch (error) {
                                                            console.error(error)
                                                            showNotification('No se pudieron guardar los márgenes.', 'error')
                                                        }
                                                    }}
                                                >
                                                    Guardar Márgenes
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'calculations' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Cálculos y redondeos</div>
                                        <p className="text-secondary mb-6">Ajusta cómo se calculan los precios finales.</p>
                                        <div className="p-6 rounded-xl border border-line bg-surface">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Define cómo se calcula el precio final y el impacto directo del margen."
                                                    >
                                                        Estrategia de precio
                                                    </label>
                                                    <select
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={calcSettings.strategy}
                                                        onChange={(e) => {
                                                            const nextStrategy = e.target.value as PricingCalc['strategy']
                                                            setCalcSettings({ ...calcSettings, strategy: nextStrategy })
                                                        }}
                                                    >
                                                        <option
                                                            value="cost_plus"
                                                            title="Calcula precio sumando el margen al costo. Subir el margen aumenta el precio de forma directa."
                                                        >
                                                            Costo + margen
                                                        </option>
                                                        <option
                                                            value="target_margin"
                                                            title="Ajusta el precio para alcanzar el margen objetivo sobre el precio de venta. A mayor margen, mayor PVP."
                                                        >
                                                            Margen objetivo
                                                        </option>
                                                        <option
                                                            value="competitive"
                                                            title="Prioriza precio competitivo con el mercado; el margen puede reducirse para mantener ventas."
                                                        >
                                                            Competitivo
                                                        </option>
                                                    </select>
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Pasa el mouse sobre cada opción para ver cómo impacta el margen y el precio del producto.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Define el salto de redondeo del precio final. Ej: 0,05 redondea a múltiplos de 5 centavos."
                                                    >
                                                        Redondeo ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={calcSettings.rounding}
                                                        onChange={(e) => setCalcSettings({ ...calcSettings, rounding: toNumber(e.target.value, calcSettings.rounding) })}
                                                    />
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Un redondeo mayor simplifica precios, pero puede subir o bajar el PVP final.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Indica si el precio de venta mostrado al cliente incluye IVA."
                                                    >
                                                        Incluir IVA en PVP
                                                    </label>
                                                    <select
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={calcSettings.includeVatInPvp ? 'yes' : 'no'}
                                                        onChange={(e) => setCalcSettings({ ...calcSettings, includeVatInPvp: e.target.value === 'yes' })}
                                                    >
                                                        <option value="yes">Sí</option>
                                                        <option value="no">No</option>
                                                    </select>
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Si está en “Sí”, el PVP ya incluye IVA; si está en “No”, el IVA se suma aparte.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Porcentaje extra para cubrir variaciones de costos logísticos."
                                                    >
                                                        Buffer de envío (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={calcSettings.shippingBuffer}
                                                        onChange={(e) => setCalcSettings({ ...calcSettings, shippingBuffer: toNumber(e.target.value, calcSettings.shippingBuffer) })}
                                                    />
                                                    <p className="text-secondary text-xs mt-2">Cubre variaciones de costos logísticos.</p>
                                                    <p className="text-[11px] text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Un buffer más alto aumenta el precio para proteger el margen ante costos de envío variables.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    className="button-main py-2 px-6"
                                                    onClick={async () => {
                                                        const normalized = normalizeCalcSettings(calcSettings)
                                                        setCalcSettings(normalized)
                                                        try {
                                                            const res = await updatePricingCalc(normalized)
                                                            setCalcSettings(normalizeCalcSettings(res.body))
                                                            showNotification('Cálculos guardados correctamente.')
                                                        } catch (error) {
                                                            console.error(error)
                                                            showNotification('No se pudieron guardar los cálculos.', 'error')
                                                        }
                                                    }}
                                                >
                                                    Guardar Cálculos
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'pricing-rules' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Reglas de precios</div>
                                        <p className="text-secondary mb-6">Define descuentos automáticos y limpieza de inventario.</p>
                                        <div className="p-6 rounded-xl border border-line bg-surface">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Cantidad mínima para activar el descuento por volumen."
                                                    >
                                                        Volumen mínimo (unidades)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={pricingRules.bulkThreshold}
                                                        onChange={(e) => setPricingRules({ ...pricingRules, bulkThreshold: toNumber(e.target.value, pricingRules.bulkThreshold, 1) })}
                                                    />
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Al subir el umbral, el descuento se activa en compras más grandes.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Porcentaje que se descuenta cuando se cumple el volumen mínimo."
                                                    >
                                                        Descuento por volumen (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={pricingRules.bulkDiscount}
                                                        onChange={(e) => setPricingRules({ ...pricingRules, bulkDiscount: toNumber(e.target.value, pricingRules.bulkDiscount, 0, 90) })}
                                                    />
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Descuentos altos reducen el precio unitario y pueden bajar el margen.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Tiempo sin rotación tras el cual se activa liquidación."
                                                    >
                                                        Días para liquidación
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={pricingRules.clearanceThreshold}
                                                        onChange={(e) => setPricingRules({ ...pricingRules, clearanceThreshold: toNumber(e.target.value, pricingRules.clearanceThreshold, 1) })}
                                                    />
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Menos días activan antes la liquidación para mover inventario.
                                                    </p>
                                                </div>
                                                <div className="group">
                                                    <label
                                                        className="text-secondary text-xs uppercase font-bold mb-2 block"
                                                        title="Porcentaje de descuento aplicado en productos en liquidación."
                                                    >
                                                        Descuento liquidación (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        className="border border-line px-4 py-2 rounded-lg w-full"
                                                        value={pricingRules.clearanceDiscount}
                                                        onChange={(e) => setPricingRules({ ...pricingRules, clearanceDiscount: toNumber(e.target.value, pricingRules.clearanceDiscount, 0, 90) })}
                                                    />
                                                    <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Descuentos altos aceleran ventas pero reducen margen y utilidad.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    className="button-main py-2 px-6"
                                                    onClick={async () => {
                                                        const normalized = normalizePricingRules(pricingRules)
                                                        setPricingRules(normalized)
                                                        try {
                                                            const res = await updatePricingRules(normalized)
                                                            setPricingRules(normalizePricingRules(res.body))
                                                            showNotification('Reglas de precio guardadas correctamente.')
                                                        } catch (error) {
                                                            console.error(error)
                                                            showNotification('No se pudieron guardar las reglas.', 'error')
                                                        }
                                                    }}
                                                >
                                                    Guardar Reglas
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'product-page' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Ficha de producto (común)</div>
                                        <p className="text-secondary mb-6">Configura textos que se muestran en todas las fichas.</p>
                                        <div className="p-6 rounded-xl border border-line bg-surface">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Entrega estimada</label>
                                                    <input
                                                        className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productPageSettings.deliveryEstimate}
                                                        onChange={(e) => setProductPageSettings({ ...productPageSettings, deliveryEstimate: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Personas viendo</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productPageSettings.viewerCount}
                                                        onChange={(e) => setProductPageSettings({ ...productPageSettings, viewerCount: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Envío gratis desde ($)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productPageSettings.freeShippingThreshold}
                                                        onChange={(e) => setProductPageSettings({ ...productPageSettings, freeShippingThreshold: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Horario de soporte</label>
                                                    <input
                                                        className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productPageSettings.supportHours}
                                                        onChange={(e) => setProductPageSettings({ ...productPageSettings, supportHours: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Días de devolución</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productPageSettings.returnDays}
                                                        onChange={(e) => setProductPageSettings({ ...productPageSettings, returnDays: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    className="button-main py-2 px-6"
                                                    onClick={async () => {
                                                        try {
                                                            const res = await updateProductPageSettings(productPageSettings)
                                                            setProductPageSettings(res.body)
                                                            showNotification('Ficha de producto actualizada.')
                                                        } catch (error) {
                                                            console.error(error)
                                                            showNotification('No se pudo guardar la ficha.', 'error')
                                                        }
                                                    }}
                                                >
                                                    Guardar configuración
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'admin-orders' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-6">Todos los Pedidos</div>
                                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                                            {[
                                                { id: 'all', label: 'Todos', count: adminOrdersCounts.all },
                                                { id: 'pending', label: 'Nuevos', count: adminOrdersCounts.pending },
                                                { id: 'processing', label: 'En proceso', count: adminOrdersCounts.processing },
                                                { id: 'delivery', label: 'Enviados', count: adminOrdersCounts.delivery },
                                                { id: 'completed', label: 'Completados', count: adminOrdersCounts.completed },
                                                { id: 'canceled', label: 'Cancelados', count: adminOrdersCounts.canceled }
                                            ].map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${activeOrders === tab.id
                                                        ? 'bg-black text-white border-black'
                                                        : 'bg-white text-secondary border-line hover:bg-surface'
                                                        }`}
                                                    onClick={() => setActiveOrders(tab.id)}
                                                >
                                                    {tab.label} ({tab.count})
                                                </button>
                                            ))}
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-line">
                                                        <th className="pb-4 font-bold text-secondary text-sm">ID PEDIDO</th>
                                                        <th className="pb-4 font-bold text-secondary text-sm">CLIENTE</th>
                                                        <th className="pb-4 font-bold text-secondary text-sm">FECHA</th>
                                                        <th className="pb-4 font-bold text-secondary text-sm">TOTAL</th>
                                                        <th className="pb-4 font-bold text-secondary text-sm">ESTADO</th>
                                                        <th className="pb-4 font-bold text-secondary text-sm">ACCIONES</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredAdminOrders.length > 0 ? filteredAdminOrders.map((order) => {
                                                        const badge = getStatusBadge(order.status)
                                                        return (
                                                        <tr key={order.id} className="border-b border-line last:border-0 hover:bg-surface duration-300 text-sm">
                                                            <td className="py-4 font-bold">#{order.id}</td>
                                                            <td className="py-4">{order.user_name || 'Cliente'}</td>
                                                            <td className="py-4">{formatDateEcuador(order.created_at)}</td>
                                                            <td className="py-4 font-bold">${Number(order.total).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td className="py-4">
                                                                <span className={`tag px-3 py-1 rounded-full text-xs font-semibold bg-opacity-10 ${badge.className}`}>
                                                                    {badge.label}
                                                                </span>
                                                            </td>
                                                            <td className="py-4">
                                                                <button className="text-button-uppercase text-xs underline font-bold" onClick={() => {
                                                                    handleViewOrder(order.id)
                                                                }}>Ver Detalles</button>
                                                            </td>
                                                        </tr>
                                                    )}) : (
                                                        <tr><td colSpan={6} className="py-8 text-center text-secondary">No se encontraron pedidos.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'shipments' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Gestión de Envíos</div>
                                        <p className="text-secondary mb-6">Controla costos logísticos, proveedores activos y pedidos en recojo.</p>
                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                                            <div className="xl:col-span-2 p-6 bg-surface rounded-xl border border-line">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h6 className="heading6">Proveedores de Envío</h6>
                                                    <span className="text-xs text-secondary font-bold uppercase">{shippingProviders.length} activos</span>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    {shippingProviders.length > 0 ? shippingProviders.map((prov) => (
                                                        <div key={prov.id} className="flex items-center justify-between p-3 bg-white rounded border border-line">
                                                            <span className="font-semibold">{prov.name}</span>
                                                            <span className="text-success text-xs font-bold uppercase">{prov.status}</span>
                                                        </div>
                                                    )) : (
                                                        <div className="p-3 text-sm text-secondary">No hay proveedores configurados.</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-surface rounded-xl border border-line">
                                                <h6 className="heading6 mb-3">Operación logística</h6>
                                                <div className="space-y-2 text-sm mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-secondary">Domicilio</span>
                                                        <span className="font-semibold">{formatMoney(shippingRates.delivery)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-secondary">Retiro</span>
                                                        <span className="font-semibold">{formatMoney(shippingRates.pickup)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-secondary">IVA envío</span>
                                                        <span className="font-semibold">{shippingRates.taxRate.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 rounded-lg border border-line text-sm font-semibold hover:bg-white transition-colors text-left"
                                                        onClick={() => setActiveTab('taxes')}
                                                    >
                                                        Configurar costos e IVA
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 rounded-lg border border-line text-sm font-semibold hover:bg-white transition-colors text-left"
                                                        onClick={() => {
                                                            setActiveTab('admin-orders')
                                                            setActiveOrders('delivery')
                                                        }}
                                                    >
                                                        Ver pedidos en ruta
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-surface rounded-xl border border-line">
                                            <h6 className="heading6 mb-4">Próximas Recogidas</h6>
                                            {shippingPickups.length > 0 ? (
                                                <div className="flex flex-col gap-3">
                                                    {shippingPickups.map((pickup, index) => {
                                                        const pickupDateRaw = pickup.scheduled_at || pickup.date || ''
                                                        const pickupProvider = pickup.provider || pickup.provider_name || 'Proveedor'
                                                        const pickupReference = pickup.reference || pickup.order_id || pickup.id || '-'
                                                        return (
                                                            <div key={`${pickupReference}-${index}`} className="p-4 bg-white rounded-lg border border-line flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                                <div>
                                                                    <div className="font-semibold">{pickupProvider}</div>
                                                                    <div className="text-xs text-secondary mt-1">Ref: {pickupReference}</div>
                                                                    {pickup.notes ? <div className="text-xs text-secondary mt-1">{pickup.notes}</div> : null}
                                                                </div>
                                                                <div className="text-sm text-right">
                                                                    <div className="font-semibold">
                                                                        {pickupDateRaw ? formatDateEcuador(pickupDateRaw, { weekday: 'short', day: '2-digit', month: 'short' }) : 'Fecha pendiente'}
                                                                    </div>
                                                                    <div className="text-secondary">
                                                                        {pickupDateRaw ? formatDateTimeEcuador(pickupDateRaw, { hour: '2-digit', minute: '2-digit' }) : (pickup.window || 'Hora pendiente')}
                                                                    </div>
                                                                    <div className="text-xs mt-1 uppercase font-bold text-primary">{pickup.status || 'Pendiente'}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : pickupReadyOrders.length > 0 ? (
                                                <div className="flex flex-col gap-3">
                                                    {pickupReadyOrders.map((order) => {
                                                        const badge = getStatusBadge(order.status)
                                                        return (
                                                            <div key={order.id} className="p-4 bg-white rounded-lg border border-line flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                                <div>
                                                                    <div className="font-semibold">Pedido #{order.id}</div>
                                                                    <div className="text-xs text-secondary mt-1">Cliente: {order.user_name || 'Cliente'}</div>
                                                                    <div className="text-xs text-secondary mt-1">Creado: {formatDateEcuador(order.created_at)}</div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.className}`}>{badge.label}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="px-3 py-1.5 rounded-lg border border-line text-xs font-bold hover:bg-surface"
                                                                        onClick={() => handleViewOrder(order.id)}
                                                                    >
                                                                        Ver pedido
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-secondary text-sm">
                                                    No hay recogidas programadas ni pedidos listos para retiro.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'balances' ? 'block' : 'hidden'}`}>
                                        <div className="text-gray-400 text-sm">Balance General (Información crítica para decisiones)</div>
                                        <div className="heading2 mt-2">
                                            {formatMoney(dashboardStats?.businessMetrics?.salesSummary?.net ?? 0)}
                                        </div>
                                        <div className="text-secondary text-sm mt-1">Ventas netas (sin IVA ni envío)</div>

                                        {(() => {
                                            const summary = dashboardStats?.businessMetrics?.salesSummary
                                            const profit = dashboardStats?.businessMetrics?.profitStats
                                            const gross = Number(summary?.gross ?? 0)
                                            const net = Number(summary?.net ?? 0)
                                            const vat = Number(summary?.vat ?? 0)
                                            const shipping = Number(summary?.shipping ?? 0)
                                            const cost = Number(profit?.cost ?? 0)
                                            const utilidad = Number(profit?.profit ?? 0)
                                            const margin = Number(profit?.margin ?? 0)
                                            const roi = Number(profit?.roi ?? 0)
                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
                                                    <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                        <div className="text-xs uppercase text-secondary font-bold mb-1">Venta total</div>
                                                        <div className="heading5">{formatMoney(gross)}</div>
                                                        <div className="text-[11px] text-secondary mt-1">Incluye IVA + envío</div>
                                                    </div>
                                                    <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                        <div className="text-xs uppercase text-secondary font-bold mb-1">IVA por pagar</div>
                                                        <div className="heading5">{formatMoney(vat)}</div>
                                                        <div className="text-[11px] text-secondary mt-1">Impuesto cobrado</div>
                                                    </div>
                                                    <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                        <div className="text-xs uppercase text-secondary font-bold mb-1">Envío cobrado</div>
                                                        <div className="heading5">{formatMoney(shipping)}</div>
                                                        <div className="text-[11px] text-secondary mt-1">Ingreso operativo</div>
                                                    </div>
                                                    <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                        <div className="text-xs uppercase text-secondary font-bold mb-1">Costo (COGS)</div>
                                                        <div className="heading5 text-orange-600">-{formatMoney(cost)}</div>
                                                        <div className="text-[11px] text-secondary mt-1">Costo real de producto</div>
                                                    </div>
                                                    <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                        <div className="text-xs uppercase text-secondary font-bold mb-1">Utilidad bruta</div>
                                                        <div className="heading5 text-success">{formatMoney(utilidad)}</div>
                                                        <div className="text-[11px] text-secondary mt-1">Sin IVA ni envío</div>
                                                    </div>
                                                    <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                        <div className="text-xs uppercase text-secondary font-bold mb-1">Margen neto</div>
                                                        <div className="heading5">{margin.toFixed(1)}%</div>
                                                        <div className="text-[11px] text-secondary mt-1">Utilidad / ventas netas</div>
                                                    </div>
                                                    <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                        <div className="text-xs uppercase text-secondary font-bold mb-1">ROI</div>
                                                        <div className="heading5">{roi.toFixed(1)}%</div>
                                                        <div className="text-[11px] text-secondary mt-1">Utilidad / costo</div>
                                                    </div>
                                                    <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                        <div className="text-xs uppercase text-secondary font-bold mb-1">Venta neta</div>
                                                        <div className="heading5">{formatMoney(net)}</div>
                                                        <div className="text-[11px] text-secondary mt-1">Base real de ingresos</div>
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        <div className="mt-8 p-5 bg-surface rounded-xl border border-line">
                                            <div className="text-xs uppercase text-secondary font-bold mb-3">Acciones recomendadas</div>
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg border border-line text-sm font-semibold bg-white hover:bg-surface"
                                                    onClick={() => {
                                                        setActiveTab('reports')
                                                        setSelectedDeepDive('profit')
                                                    }}
                                                >
                                                    Analizar rentabilidad
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg border border-line text-sm font-semibold bg-white hover:bg-surface"
                                                    onClick={() => setActiveTab('margins')}
                                                >
                                                    Ajustar márgenes
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg border border-line text-sm font-semibold bg-white hover:bg-surface"
                                                    onClick={() => {
                                                        setActiveTab('admin-orders')
                                                        setActiveOrders('all')
                                                    }}
                                                >
                                                    Revisar pedidos
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 rounded-lg border border-line text-sm font-semibold bg-white hover:bg-surface"
                                                    onClick={() => setActiveTab('taxes')}
                                                >
                                                    IVA y costos de envío
                                                </button>
                                            </div>
                                        </div>

                                        <div className="heading6 mb-4 mt-10">Movimientos recientes (neto, IVA, envío)</div>
                                        <div className="flex flex-col gap-4">
                                            {(dashboardStats?.businessMetrics?.recentOrders || []).slice(0, 6).map((order: any) => {
                                                const net = Number(order.vat_subtotal ?? (Number(order.total ?? 0) - Number(order.vat_amount ?? 0) - Number(order.shipping ?? 0)))
                                                const vat = Number(order.vat_amount ?? 0)
                                                const shipping = Number(order.shipping ?? 0)
                                                return (
                                                <div key={order.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-surface rounded-xl border border-line">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-success bg-opacity-10 text-success rounded-full flex items-center justify-center">
                                                            <Icon.ArrowDownLeft weight="bold" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">Pedido #{order.id}</div>
                                                            <div className="text-secondary text-xs">{formatDateEcuador(order.created_at)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 text-right text-sm md:w-[340px]">
                                                        <div>
                                                            <div className="text-[10px] uppercase text-secondary">Neto</div>
                                                            <div className="font-bold tabular-nums">{formatMoney(net)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase text-secondary">IVA</div>
                                                            <div className="font-bold tabular-nums">{formatMoney(vat)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase text-secondary">Envío</div>
                                                            <div className="font-bold tabular-nums">{formatMoney(shipping)}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="px-3 py-1.5 rounded-lg border border-line text-xs font-bold hover:bg-white"
                                                        onClick={() => handleViewOrder(order.id)}
                                                    >
                                                        Ver pedido
                                                    </button>
                                                </div>
                                                )
                                            })}
                                            {(dashboardStats?.businessMetrics?.recentOrders || []).length === 0 && (
                                                <div className="text-center py-4 text-secondary">No hay transacciones recientes.</div>
                                            )}
                                        </div>

                                        <div className="mt-10 p-5 bg-surface rounded-xl border border-line">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                                                <h6 className="heading6">Trazabilidad de cifras</h6>
                                                <span className="text-xs text-secondary font-semibold">Fuente: pedidos no cancelados + productos vendidos</span>
                                            </div>
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                                <div className="bg-white border border-line rounded-lg p-4">
                                                    <div className="text-xs uppercase font-bold text-secondary mb-3">Pedidos que componen las ventas</div>
                                                    <div className="flex flex-col gap-2">
                                                        {(dashboardStats?.businessMetrics?.traceability?.orders || []).slice(0, 6).map((order: any) => (
                                                            <button
                                                                key={order.id}
                                                                type="button"
                                                                className="text-left p-3 rounded-lg border border-line hover:bg-surface transition-colors"
                                                                onClick={() => handleViewOrder(order.id)}
                                                            >
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <span className="font-bold text-sm">#{order.id}</span>
                                                                    <span className="text-xs text-secondary">{formatDateEcuador(order.created_at)}</span>
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-2 mt-2 text-[11px]">
                                                                    <div>
                                                                        <div className="text-secondary uppercase">Neto</div>
                                                                        <div className="font-bold tabular-nums">{formatMoney(order.net)}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-secondary uppercase">IVA</div>
                                                                        <div className="font-bold tabular-nums">{formatMoney(order.vat)}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-secondary uppercase">Envío</div>
                                                                        <div className="font-bold tabular-nums">{formatMoney(order.shipping)}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-secondary uppercase">Total</div>
                                                                        <div className="font-bold tabular-nums">{formatMoney(order.gross)}</div>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                        {(dashboardStats?.businessMetrics?.traceability?.orders || []).length === 0 && (
                                                            <div className="text-sm text-secondary">Sin pedidos para trazabilidad.</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-white border border-line rounded-lg p-4">
                                                    <div className="text-xs uppercase font-bold text-secondary mb-3">Productos que explican las ventas netas</div>
                                                    <div className="flex flex-col gap-3">
                                                        {(dashboardStats?.businessMetrics?.traceability?.products || []).slice(0, 6).map((product: any, idx: number) => {
                                                            const refs = Array.isArray(product.order_refs)
                                                                ? product.order_refs
                                                                : String(product.order_refs || '').split(',').map((value) => value.trim()).filter(Boolean)
                                                            return (
                                                                <div key={`${product.product_id || product.product_name}-${idx}`} className="p-3 rounded-lg border border-line">
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div className="font-semibold text-sm">{product.product_name}</div>
                                                                        <div className="font-bold tabular-nums">{formatMoney(product.net_revenue)}</div>
                                                                    </div>
                                                                    <div className="text-xs text-secondary mt-1">
                                                                        Categoría: <span className="font-semibold capitalize">{product.category || 'Sin categoría'}</span> | Unidades: <span className="font-semibold">{Number(product.units_sold || 0)}</span>
                                                                    </div>
                                                                    <div className="text-xs text-secondary mt-1 break-words">
                                                                        Pedidos: {refs.length > 0 ? refs.join(', ') : 'Sin referencia'}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                        {(dashboardStats?.businessMetrics?.traceability?.products || []).length === 0 && (
                                                            <div className="text-sm text-secondary">Sin productos vendidos para trazabilidad.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {user.role !== 'admin' && (
                                <>
                                    <div className={`tab text-content w-full ${activeTab === 'dashboard' ? 'block' : 'hidden'}`}>
                                        <div className="overview grid sm:grid-cols-3 gap-5">
                                            <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="counter">
                                                    <span className="text-secondary">Esperando Recojo</span>
                                                    <h5 className="heading5 mt-1">{pickupUserOrders}</h5>
                                                </div>
                                                <Icon.HourglassMedium className='text-4xl' />
                                            </div>
                                            <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="counter">
                                                    <span className="text-secondary">Pedidos Cancelados</span>
                                                    <h5 className="heading5 mt-1">{canceledUserOrders}</h5>
                                                </div>
                                                <Icon.ReceiptX className='text-4xl' />
                                            </div>
                                            <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="counter">
                                                    <span className="text-secondary">Número Total de Pedidos</span>
                                                    <h5 className="heading5 mt-1">{totalUserOrders}</h5>
                                                </div>
                                                <Icon.Package className='text-4xl' />
                                            </div>
                                        </div>
                                        <div className="recent_order pt-5 px-5 pb-2 mt-7 border border-line rounded-xl">
                                            <h6 className="heading6">Pedidos Recientes</h6>
                                            <div className="list overflow-x-auto w-full mt-5">
                                                <table className="w-full min-w-[640px]">
                                                    <thead className="border-b border-line">
                                                        <tr>
                                                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Pedido</th>
                                                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Productos</th>
                                                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Precio</th>
                                                            <th scope="col" className="pb-3 text-right text-sm font-bold uppercase text-secondary whitespace-nowrap">Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userOrdersLoading && (
                                                            <tr>
                                                                <td colSpan={4} className="py-6 text-center text-secondary">Cargando pedidos...</td>
                                                            </tr>
                                                        )}
                                                        {!userOrdersLoading && recentUserOrders.length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} className="py-6 text-center text-secondary">No tienes pedidos recientes.</td>
                                                            </tr>
                                                        )}
                                                        {!userOrdersLoading && recentUserOrders.map((order) => {
                                                            const badge = getStatusBadge(order.status)
                                                            const firstItem = order.items?.[0]
                                                            const itemsCount = order.items?.length ?? 0
                                                            return (
                                                                <tr key={order.id} className="item duration-300 border-b border-line last:border-0">
                                                                    <th scope="row" className="py-3 text-left">
                                                                        <strong className="text-title">#{order.id}</strong>
                                                                    </th>
                                                                    <td className="py-3">
                                                                        {firstItem ? (
                                                                            <div className="product flex items-center gap-3">
                                                                                <Image src={firstItem.product_image || '/images/product/1000x1000.png'} width={400} height={400} alt={firstItem.product_name} className="flex-shrink-0 w-12 h-12 rounded" />
                                                                                <div className="info flex flex-col">
                                                                                    <strong className="product_name text-button">{firstItem.product_name}</strong>
                                                                                    <span className="product_tag caption1 text-secondary">{itemsCount > 1 ? `${itemsCount} productos` : '1 producto'}</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-secondary text-sm">Sin productos</div>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 price">${Number(order.total).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                    <td className="py-3 text-right">
                                                                        <span className={`tag px-4 py-1.5 rounded-full bg-opacity-10 ${badge.className} caption1 font-semibold`}>{badge.label}</span>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tab text-content overflow-hidden w-full p-7 border border-line rounded-xl ${activeTab === 'orders' ? 'block' : 'hidden'}`}>
                                        <h6 className="heading6">Tus Pedidos</h6>
                                        <div className="w-full">
                                            <div className="menu-tab flex flex-wrap gap-2 border-b border-line mt-3 pb-3">
                                                {[
                                                    { id: 'all', label: 'Todos' },
                                                    { id: 'pending', label: 'Pendientes' },
                                                    { id: 'delivery', label: 'Enviados' },
                                                    { id: 'completed', label: 'Completados' },
                                                    { id: 'canceled', label: 'Cancelados' }
                                                ].map((item, index) => (
                                                    <button
                                                        key={index}
                                                        className={`item relative px-3 sm:px-4 py-2 text-secondary text-center duration-300 hover:text-black border-b-2 text-xs sm:text-sm ${activeOrders === item.id ? 'active border-black' : 'border-transparent'}`}
                                                        onClick={() => handleActiveOrders(item.id)}
                                                    >
                                                        <span className='relative text-button z-[1]'>
                                                            {item.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="list_order">
                                            {userOrdersLoading && (
                                                <div className="text-center py-6 text-secondary">Cargando pedidos...</div>
                                            )}
                                            {!userOrdersLoading && filteredUserOrders.length === 0 && (
                                                <div className="text-center py-6 text-secondary">No tienes pedidos en este estado.</div>
                                            )}
                                            {!userOrdersLoading && filteredUserOrders.map((order) => {
                                                const badge = getStatusBadge(order.status)
                                                return (
                                                    <div key={order.id} className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                                                        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 p-5 border-b border-line">
                                                            <div className="flex items-center gap-2">
                                                                <strong className="text-title">Número de Pedido:</strong>
                                                                <strong className="order_number text-button uppercase">{order.id}</strong>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <strong className="text-title">Estado del pedido:</strong>
                                                                <span className={`tag px-4 py-1.5 rounded-full bg-opacity-10 ${badge.className} caption1 font-semibold`}>{badge.label}</span>
                                                            </div>
                                                        </div>
                                                        <div className="list_prd px-5">
                                                            {(order.items && order.items.length > 0) ? (
                                                                order.items.map((item, idx) => (
                                                                    <div key={`${order.id}-${idx}`} className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line last:border-0">
                                                                        <Link href={'/product/default'} className="flex items-center gap-5">
                                                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                                                <Image
                                                                                    src={item.product_image || '/images/product/1000x1000.png'}
                                                                                    width={1000}
                                                                                    height={1000}
                                                                                    alt={item.product_name}
                                                                                    className='w-full h-full object-cover'
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <div className="prd_name text-title">{item.product_name}</div>
                                                                                <div className="caption1 text-secondary mt-2">
                                                                                    <span>{item.quantity} unidad{item.quantity === 1 ? '' : 'es'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </Link>
                                                                        <div className='text-title'>
                                                                            <span className="prd_quantity">{item.quantity}</span>
                                                                            <span> X </span>
                                                                            <span className="prd_price">${Number(getItemNetPrice(item, order)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="py-5 text-secondary">Sin productos asociados.</div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 p-5">
                                                            <button className="button-main" onClick={() => { setSelectedOrder(order); setOpenDetail(true); }}>Detalles del Pedido</button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className={`tab_address text-content w-full p-7 border border-line rounded-xl ${activeTab === 'address' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Direcciones de envío</div>
                                        <form onSubmit={handleSaveAddresses}>
                                            <div className="flex items-center justify-between mb-8 border-b border-line pb-4">
                                                <div className="flex gap-4">
                                                    {savedAddresses.map((addr, index) => (
                                                        <button
                                                            key={addr.id}
                                                            type="button"
                                                            onClick={() => setCurrentAddrIndex(index)}
                                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentAddrIndex === index ? 'bg-black text-white' : 'bg-surface border border-line text-secondary hover:bg-line'}`}
                                                        >
                                                            {addr.title}
                                                        </button>
                                                    ))}
                                                    {(savedAddresses.length < 3) && (
                                                        <button
                                                            type="button"
                                                            onClick={addNewAddress}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20"
                                                        >
                                                            <Icon.Plus size={16} /> Agregar
                                                        </button>
                                                    )}
                                                </div>
                                                {savedAddresses.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAddress(currentAddrIndex)}
                                                        className="text-red hover:underline text-sm font-bold flex items-center gap-1"
                                                    >
                                                        <Icon.Trash size={16} /> Eliminar actual
                                                    </button>
                                                )}
                                            </div>

                                            <button
                                                type='button'
                                                className={`tab_btn flex items-center justify-between w-full pb-1.5 border-b border-line ${activeAddress === 'billing' ? 'active' : ''}`}
                                                onClick={() => handleActiveAddress('billing')}
                                            >
                                                <strong className="heading6">Dirección de facturación</strong>
                                                <Icon.CaretDown className='text-2xl ic_down duration-300' />
                                            </button>
                                            <div className={`form_address ${activeAddress === 'billing' ? 'block' : 'hidden'}`}>
                                                <div className="flex items-center gap-3 mt-4 px-4 py-3 bg-surface rounded-lg border border-line">
                                                    <input
                                                        type="checkbox"
                                                        id="sameAsBillingTop"
                                                        checked={currentAddress.isSame}
                                                        onChange={toggleSameAsBilling}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />
                                                    <label htmlFor="sameAsBillingTop" className="caption1 cursor-pointer font-bold">Usar esta información también para el envío</label>
                                                </div>
                                                <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                                    <div className="first-name">
                                                        <label htmlFor="billingFirstName" className='caption1 capitalize'>Nombre <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingFirstName" type="text" value={currentAddress.billing.firstName} onChange={handleBillingChange} required />
                                                    </div>
                                                    <div className="last-name">
                                                        <label htmlFor="billingLastName" className='caption1 capitalize'>Apellido <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingLastName" type="text" value={currentAddress.billing.lastName} onChange={handleBillingChange} required />
                                                    </div>
                                                    <div className="company">
                                                        <label htmlFor="billingCompany" className='caption1 capitalize'>Nombre de la empresa (opcional)</label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingCompany" type="text" value={currentAddress.billing.company} onChange={handleBillingChange} />
                                                    </div>
                                                    <div className="country">
                                                        <label htmlFor="billingCountry" className='caption1 capitalize'>País / Región <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingCountry" type="text" value={currentAddress.billing.country} onChange={handleBillingChange} required />
                                                    </div>
                                                    <div className="street">
                                                        <label htmlFor="billingStreet" className='caption1 capitalize'>Dirección <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingStreet" type="text" value={currentAddress.billing.street} onChange={handleBillingChange} required />
                                                    </div>
                                                    <div className="city">
                                                        <label htmlFor="billingCity" className='caption1 capitalize'>Ciudad <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingCity" type="text" value={currentAddress.billing.city} onChange={handleBillingChange} required />
                                                    </div>
                                                    <div className="state">
                                                        <label htmlFor="billingState" className='caption1 capitalize'>Estado / Provincia <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingState" type="text" value={currentAddress.billing.state} onChange={handleBillingChange} required />
                                                    </div>
                                                    <div className="zip">
                                                        <label htmlFor="billingZip" className='caption1 capitalize'>Código Postal <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingZip" type="text" value={currentAddress.billing.zip} onChange={handleBillingChange} required />
                                                    </div>
                                                    <div className="phone">
                                                        <label htmlFor="billingPhone" className='caption1 capitalize'>Teléfono <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingPhone" type="text" value={currentAddress.billing.phone} onChange={handleBillingChange} required />
                                                    </div>
                                                    <div className="email">
                                                        <label htmlFor="billingEmail" className='caption1 capitalize'>Correo electrónico <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingEmail" type="email" value={currentAddress.billing.email} onChange={handleBillingChange} required />
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type='button'
                                                className={`tab_btn flex items-center justify-between w-full mt-8 pb-1.5 border-b border-line ${activeAddress === 'shipping' ? 'active' : ''}`}
                                                onClick={() => handleActiveAddress('shipping')}
                                            >
                                                <strong className="heading6">Dirección de envío</strong>
                                                <Icon.CaretDown className='text-2xl ic_down duration-300' />
                                            </button>
                                            <div className={`form_address ${activeAddress === 'shipping' ? 'block' : 'hidden'}`}>
                                                <div className={`flex items-center gap-3 mt-4 px-4 py-3 bg-surface rounded-lg border border-line ${currentAddress.isSame ? 'bg-success/5 border-success/30' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        id="sameAsBillingBottom"
                                                        checked={currentAddress.isSame}
                                                        onChange={toggleSameAsBilling}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />
                                                    <label htmlFor="sameAsBillingBottom" className="caption1 cursor-pointer font-bold text-secondary">La dirección de envío es la misma que la de facturación</label>
                                                </div>
                                                <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                                    <div className="first-name">
                                                        <label htmlFor="shippingFirstName" className='caption1 capitalize'>Nombre <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingFirstName" type="text" value={currentAddress.shipping.firstName} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                    <div className="last-name">
                                                        <label htmlFor="shippingLastName" className='caption1 capitalize'>Apellido <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingLastName" type="text" value={currentAddress.shipping.lastName} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                    <div className="company">
                                                        <label htmlFor="shippingCompany" className='caption1 capitalize'>Nombre de la empresa (opcional)</label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingCompany" type="text" value={currentAddress.shipping.company} onChange={handleShippingChange} disabled={currentAddress.isSame} />
                                                    </div>
                                                    <div className="country">
                                                        <label htmlFor="shippingCountry" className='caption1 capitalize'>País / Región <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingCountry" type="text" value={currentAddress.shipping.country} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                    <div className="street">
                                                        <label htmlFor="shippingStreet" className='caption1 capitalize'>Dirección <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingStreet" type="text" value={currentAddress.shipping.street} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                    <div className="city">
                                                        <label htmlFor="shippingCity" className='caption1 capitalize'>Ciudad <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingCity" type="text" value={currentAddress.shipping.city} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                    <div className="state">
                                                        <label htmlFor="shippingState" className='caption1 capitalize'>Estado / Provincia <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingState" type="text" value={currentAddress.shipping.state} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                    <div className="zip">
                                                        <label htmlFor="shippingZip" className='caption1 capitalize'>Código Postal <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingZip" type="text" value={currentAddress.shipping.zip} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                    <div className="phone">
                                                        <label htmlFor="shippingPhone" className='caption1 capitalize'>Teléfono <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingPhone" type="text" value={currentAddress.shipping.phone} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                    <div className="email">
                                                        <label htmlFor="shippingEmail" className='caption1 capitalize'>Correo electrónico <span className='text-red'>*</span></label>
                                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg disabled:bg-surface disabled:text-secondary" id="shippingEmail" type="email" value={currentAddress.shipping.email} onChange={handleShippingChange} disabled={currentAddress.isSame} required />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="block-button md:mt-10 mt-6 flex justify-end">
                                                <button className="button-main py-3 px-10 rounded-full font-bold bg-black text-white hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={addressSaving || addressLoading}>
                                                    {addressSaving ? 'Guardando...' : 'Guardar Direcciones'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className={`tab text-content w-full p-7 border border-line rounded-xl ${activeTab === 'setting' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Configuraciones de la cuenta</div>
                                        <form className='form-password' onSubmit={handleSaveSettings}>
                                            <div className="heading5 pb-4">Información Personal</div>
                                            <div className="upload_image col-span-full">
                                                <label htmlFor="uploadImage">Subir Avatar: <span className="text-red">*</span></label>
                                                <div className="flex flex-wrap items-center gap-5 mt-3">
                                                    <div className="bg_img flex-shrink-0 relative w-[7.5rem] h-[7.5rem] rounded-lg overflow-hidden bg-surface">
                                                        <span className="ph ph-image text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary"></span>
                                                        <Image
                                                            src={'/images/avatar/1.png'}
                                                            width={300}
                                                            height={300}
                                                            alt='Foto de perfil'
                                                            className="upload_img relative z-[1] w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <strong className="text-button">Subir Archivo:</strong>
                                                        <p className="caption1 text-secondary mt-1">JPG 120x120px</p>
                                                        <div className="upload_file flex items-center gap-3 w-[220px] mt-3 px-3 py-2 border border-line rounded">
                                                            <label htmlFor="uploadImage" className="caption2 py-1 px-3 rounded bg-line whitespace-nowrap cursor-pointer">Elegir Archivo</label>
                                                            <input type="file" name="uploadImage" id="uploadImage" accept="image/*" className="caption2 cursor-pointer" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                                <div className="first-name">
                                                    <label htmlFor="firstName" className='caption1 capitalize'>Nombre <span className='text-red'>*</span></label>
                                                    <input
                                                        className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                        id="firstName"
                                                        type="text"
                                                        placeholder="Nombre"
                                                        required
                                                        value={profile.firstName}
                                                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                        disabled={profileLoading}
                                                    />
                                                </div>
                                                <div className="last-name">
                                                    <label htmlFor="lastName" className='caption1 capitalize'>Apellido <span className='text-red'>*</span></label>
                                                    <input
                                                        className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                        id="lastName"
                                                        type="text"
                                                        placeholder="Apellido"
                                                        required
                                                        value={profile.lastName}
                                                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                        disabled={profileLoading}
                                                    />
                                                </div>
                                                <div className="phone-number">
                                                    <label htmlFor="phoneNumber" className='caption1 capitalize'>Número de Teléfono <span className='text-red'>*</span></label>
                                                    <input
                                                        className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                        id="phoneNumber"
                                                        type="text"
                                                        placeholder="Número de teléfono"
                                                        required
                                                        value={profile.phone}
                                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                        disabled={profileLoading}
                                                    />
                                                </div>
                                                <div className="email">
                                                    <label htmlFor="email" className='caption1 capitalize'>Correo Electrónico <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="email" type="email" defaultValue={user.email} placeholder="Correo electrónico" required disabled />
                                                </div>
                                                <div className="document-type">
                                                    <label htmlFor="documentType" className='caption1 capitalize'>Tipo de identificación <span className='text-red'>*</span></label>
                                                    <div className="select-block mt-2">
                                                        <select
                                                            className="border border-line px-4 py-3 w-full rounded-lg"
                                                            id="documentType"
                                                            name="documentType"
                                                            value={profile.documentType || 'default'}
                                                            onChange={(e) => setProfile({ ...profile, documentType: e.target.value })}
                                                            disabled={profileLoading}
                                                            required
                                                        >
                                                            <option value="default" disabled>Seleccionar</option>
                                                            <option value="Cédula">Cédula</option>
                                                            <option value="RUC">RUC</option>
                                                            <option value="Pasaporte">Pasaporte</option>
                                                            <option value="Otro">Otro</option>
                                                        </select>
                                                        <Icon.CaretDown className='arrow-down text-lg' />
                                                    </div>
                                                </div>
                                                <div className="document-number">
                                                    <label htmlFor="documentNumber" className='caption1 capitalize'>Número de identificación <span className='text-red'>*</span></label>
                                                    <input
                                                        className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                        id="documentNumber"
                                                        type="text"
                                                        placeholder="Número de identificación"
                                                        required
                                                        value={profile.documentNumber}
                                                        onChange={(e) => setProfile({ ...profile, documentNumber: e.target.value })}
                                                        disabled={profileLoading}
                                                    />
                                                </div>
                                                <div className="business-name sm:col-span-2">
                                                    <label htmlFor="businessName" className='caption1 capitalize'>Razón social (opcional)</label>
                                                    <input
                                                        className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                        id="businessName"
                                                        type="text"
                                                        placeholder="Razón social"
                                                        value={profile.businessName}
                                                        onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                                        disabled={profileLoading}
                                                    />
                                                </div>
                                                <div className="gender">
                                                    <label htmlFor="gender" className='caption1 capitalize'>Género <span className='text-red'>*</span></label>
                                                    <div className="select-block mt-2">
                                                        <select
                                                            className="border border-line px-4 py-3 w-full rounded-lg"
                                                            id="gender"
                                                            name="gender"
                                                            value={profile.gender || 'default'}
                                                            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                                            disabled={profileLoading}
                                                            required
                                                        >
                                                            <option value="default" disabled>Elegir Género</option>
                                                            <option value="Male">Masculino</option>
                                                            <option value="Female">Femenino</option>
                                                            <option value="Other">Otro</option>
                                                        </select>
                                                        <Icon.CaretDown className='arrow-down text-lg' />
                                                    </div>
                                                </div>
                                                <div className="birth">
                                                    <label htmlFor="birth" className='caption1'>Fecha de Nacimiento <span className='text-red'>*</span></label>
                                                    <input
                                                        className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                        id="birth"
                                                        type="date"
                                                        placeholder="Fecha de Nacimiento"
                                                        required
                                                        value={profile.birth}
                                                        onChange={(e) => setProfile({ ...profile, birth: e.target.value })}
                                                        disabled={profileLoading}
                                                    />
                                                </div>
                                            </div>
                                            <div className="heading5 pb-4 lg:mt-10 mt-6">Cambiar Contraseña</div>
                                            <p className="text-secondary text-sm mb-4">Opcional. Si cambias tu contraseña, se cerrará la sesión por seguridad.</p>
                                            <div className="pass">
                                                <label htmlFor="password-setting" className='caption1'>Contraseña actual</label>
                                                <input
                                                    className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                    id="password-setting"
                                                    type="password"
                                                    placeholder="Contraseña actual"
                                                    autoComplete="current-password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                    disabled={profileSaving || profileLoading}
                                                />
                                            </div>
                                            <div className="new-pass mt-5">
                                                <label htmlFor="newPassword" className='caption1'>Nueva contraseña</label>
                                                <input
                                                    className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                    id="newPassword"
                                                    type="password"
                                                    placeholder="Mínimo 12 caracteres"
                                                    autoComplete="new-password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                    disabled={profileSaving || profileLoading}
                                                />
                                            </div>
                                            <div className="confirm-pass mt-5">
                                                <label htmlFor="confirmPassword" className='caption1'>Confirmar nueva contraseña</label>
                                                <input
                                                    className="border-line mt-2 px-4 py-3 w-full rounded-lg"
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirmar nueva contraseña"
                                                    autoComplete="new-password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                    disabled={profileSaving || profileLoading}
                                                />
                                            </div>
                                            <div className="block-button lg:mt-10 mt-6 flex justify-end">
                                                <button className="button-main py-3 px-10 rounded-full font-bold bg-black text-white hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={profileSaving || profileLoading}>
                                                    {profileSaving ? 'Guardando...' : 'Guardar Cambios'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <div className={`modal-order-detail-block flex items-center justify-center`} onClick={() => setOpenDetail(false)}>
                <div className={`modal-order-detail-main grid grid-cols-1 lg:grid-cols-2 w-full max-w-[1160px] bg-white rounded-2xl max-md:mx-4 overflow-hidden shadow-2xl max-h-[90vh] ${openDetail ? 'open' : ''}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <div className="info p-8 md:p-10 bg-white lg:border-r border-line">
                        <h5 className="heading5">Detalles del Pedido</h5>
                        <div className="list_info grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div className="info_item p-5 rounded-xl bg-surface border border-line sm:col-span-2">
                                <strong className="text-button-uppercase text-secondary">Información de Contacto</strong>
                                <h6 className="heading6 order_name mt-2">{selectedOrderContact.name}</h6>
                                {selectedOrderContact.phone && selectedOrderContact.phone !== '-' ? (
                                    <h6 className="heading6 order_phone mt-2">{selectedOrderContact.phone}</h6>
                                ) : null}
                                <h6 className="heading6 normal-case order_email mt-2 text-sm">{selectedOrderContact.email}</h6>
                            </div>
                            <div className="info_item p-5 rounded-xl bg-surface border border-line">
                                <strong className="text-button-uppercase text-secondary">Método de Pago</strong>
                                <h6 className="heading6 order_payment mt-2">{selectedOrder?.payment_method || '-'}</h6>
                            </div>
                            <div className="info_item p-5 rounded-xl bg-surface border border-line">
                                <strong className="text-button-uppercase text-secondary">Empresa</strong>
                                <h6 className="heading6 order_company mt-2">{getDefaultBillingAddress()?.company || 'No aplica'}</h6>
                            </div>
                            <div className="info_item p-5 rounded-xl bg-surface border border-line sm:col-span-2">
                                <strong className="text-button-uppercase text-secondary">Indicaciones del Pedido</strong>
                                <h6 className="heading6 order_notes mt-2 text-sm leading-relaxed break-words">
                                    {selectedOrder?.order_notes ? selectedOrder.order_notes : 'Sin indicaciones adicionales.'}
                                </h6>
                            </div>
                            <div className="info_item p-5 rounded-xl bg-surface border border-line">
                                <strong className="text-button-uppercase text-secondary">Dirección de Envío</strong>
                                <div className="heading6 order_shipping_address mt-2 break-words text-sm leading-relaxed">
                                    {(() => {
                                        const shippingAddress = parseAddress(selectedOrder?.shipping_address) || {}
                                        const shippingLines = formatAddressLines(shippingAddress)
                                        if (getOrderShipping(selectedOrder) > 0 && shippingLines.length > 0) {
                                            return shippingLines.map((line, idx) => (
                                                <div key={idx}>{line}</div>
                                            ))
                                        }
                                        return (
                                            <>
                                                <div>Local Para Mascotas EC</div>
                                                <div>Retiro en tienda</div>
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>
                            <div className="info_item p-5 rounded-xl bg-surface border border-line">
                                <strong className="text-button-uppercase text-secondary">Dirección de Facturación</strong>
                                <div className="heading6 order_billing_address mt-2 break-words text-sm leading-relaxed">
                                    {(() => {
                                        const lines = formatAddressLines(getDefaultBillingAddress())
                                        if (lines.length > 0) {
                                            return lines.map((line, idx) => (
                                                <div key={idx}>{line}</div>
                                            ))
                                        }
                                        return <div>-</div>
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="list p-8 md:p-10 bg-white">
                        <h5 className="heading5">Artículos</h5>
                        <div className="list_prd mt-4">
                            {Array.isArray(selectedOrder?.items) && selectedOrder.items.length > 0 ? (
                                selectedOrder.items.map((item: any, idx: number) => (
                                    <div key={`${item.product_id}-${idx}`} className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line last:border-0">
                                        <div className="flex items-center gap-5">
                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                <Image
                                                    src={item.product_image || '/images/product/1000x1000.png'}
                                                    width={1000}
                                                    height={1000}
                                                    alt={item.product_name || 'Producto'}
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                            <div>
                                                <div className="prd_name text-title">{item.product_name || 'Producto'}</div>
                                            </div>
                                        </div>
                                        <div className='text-title'>
                                            <span className="prd_quantity">{item.quantity}</span>
                                            <span> X </span>
                                            <span className="prd_price">{formatMoney(getItemNetPrice(item, selectedOrder))}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-secondary">No hay artículos para este pedido.</div>
                            )}
                        </div>
                        <div className="mt-6 p-5 rounded-xl bg-surface border border-line space-y-3">
                            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                <strong className="text-title">Subtotal sin IVA</strong>
                                <strong className="order_total text-title text-right">{formatMoney(getOrderVatSubtotal(selectedOrder))}</strong>
                            </div>
                            {Number(selectedOrder?.vat_rate ?? 0) > 0 && (
                                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                    <span className="text-title">IVA ({Number(selectedOrder?.vat_rate ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</span>
                                    <span className="text-title text-right">{formatMoney(getOrderVatAmount(selectedOrder))}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                <span className="text-title">Envío</span>
                                <span className="order_ship text-title text-right">{formatMoney(getOrderShipping(selectedOrder))}</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                                <span className="text-title">Descuentos</span>
                                <span className="order_discounts text-title text-right">{formatMoney(0)}</span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-4 pt-3 border-t border-line">
                                <strong className="text-title">Total</strong>
                                <strong className="text-title text-right">{formatMoney(selectedOrder?.total)}</strong>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            {selectedOrder?.status !== 'canceled' ? (
                                <button className="button-main py-2 px-6" onClick={handleGenerateInvoice}>Ver factura</button>
                            ) : (
                                <span className="text-secondary text-sm">Factura no disponible para pedidos cancelados</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {
                isProductModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl">
                                <h3 className="heading4">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                                <button onClick={() => setIsProductModalOpen(false)} className="text-secondary hover:text-black">
                                    <Icon.X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1">
                                <form id="product-form" ref={productFormRef} onSubmit={handleSaveProduct} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-secondary text-sm font-bold uppercase mb-2 block">Nombre del Producto</label>
                                            <input type="text" className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all"
                                                value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required placeholder="Ej: Camiseta Deportiva" />
                                        </div>
                                        <div>
                                            <label className="text-secondary text-sm font-bold uppercase mb-2 block">Marca</label>
                                            <input type="text" className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all"
                                                value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} placeholder="Ej: Adidas" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-secondary text-sm font-bold uppercase mb-2 block">Precio base (sin IVA)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                                                <input type="number" step="0.01" className="border border-line rounded-lg pl-8 pr-4 py-3 w-full focus:border-black outline-none transition-all"
                                                    value={productForm.price} onChange={e => handleBasePriceChange(e.target.value)} required />
                                            </div>
                                            <label className="text-secondary text-xs font-bold uppercase mt-3 mb-2 block">Precio PVP (con IVA)</label>
                                            <input type="number" step="0.01" className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all"
                                                value={productForm.pvp} onChange={e => handlePvpPriceChange(e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface rounded-xl border border-line">
                                                <div>
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Utilidad bruta</div>
                                                    <div className="text-lg font-bold text-success">${productProfitLabel}</div>
                                                    <div className="text-xs text-secondary">Base sin IVA</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Margen bruto</div>
                                                    <div className="text-lg font-bold">{productGrossMarginLabel}%</div>
                                                    <div className="text-xs text-secondary">Utilidad / precio base</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Markup</div>
                                                    <div className="text-lg font-bold">{productMarkupLabel}%</div>
                                                    <div className="text-xs text-secondary">Utilidad / costo</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase font-bold text-secondary">Utilidad real</div>
                                                    <div className="text-lg font-bold text-success">${productProfitLabel}</div>
                                                    <div className="text-xs text-secondary">El IVA no es utilidad</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-secondary text-sm font-bold uppercase mb-2 block">Costo del Producto</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                                                <input type="number" step="0.01" className="border border-line rounded-lg pl-8 pr-4 py-3 w-full focus:border-black outline-none transition-all"
                                                    value={productForm.cost} onChange={e => setProductForm({ ...productForm, cost: e.target.value })} required />
                                            </div>
                                            <p className="text-secondary text-xs mt-2">Costo real de compra (base para margen).</p>
                                        </div>
                                        <div>
                                            <label className="text-secondary text-sm font-bold uppercase mb-2 block">Stock Disponible</label>
                                            <input type="number" className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all"
                                                value={productForm.quantity} onChange={e => setProductForm({ ...productForm, quantity: e.target.value })} required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-secondary text-sm font-bold uppercase mb-2 block">Categoría</label>
                                            <select className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all bg-white"
                                                value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                                                <option value="General">General</option>
                                                <option value="Comida">Comida</option>
                                                <option value="Juguetes">Juguetes</option>
                                                <option value="Accesorios">Accesorios</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl border border-line bg-surface">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-xs uppercase font-bold text-secondary">Imágenes del producto</div>
                                            <span className="text-xs text-secondary">Usa miniaturas para listado y fotos grandes para la ficha.</span>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <div className="text-sm font-semibold mb-3">Miniaturas (listado)</div>
                                                <div className="space-y-3">
                                                    {(productForm.thumbImages || []).map((img: any, idx: number) => {
                                                        const key = `thumb-${idx}`
                                                        return (
                                                            <div key={key} className="grid grid-cols-12 gap-2 items-center">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="border border-line rounded-lg px-3 py-2 col-span-7"
                                                                    onChange={(e) => handleImageFileChange('thumb', idx, e.target.files?.[0])}
                                                                />
                                                                <div className="col-span-3 text-xs text-secondary">
                                                                    {img.url ? 'Miniatura cargada' : 'Sin imagen'}
                                                                    <div>{img.width && img.height ? `${img.width}x${img.height}px` : `${requiredImageSizes.thumb.width}x${requiredImageSizes.thumb.height}px`}</div>
                                                                    {imageUploading[key] && <div>Subiendo...</div>}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="text-xs text-red-600 col-span-2"
                                                                    onClick={() => removeImageEntry('thumb', idx)}
                                                                >
                                                                    Quitar
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="mt-3 text-sm text-primary font-semibold"
                                                    onClick={() => addImageEntry('thumb')}
                                                >
                                                    + Agregar miniatura
                                                </button>
                                                <div className="text-xs text-secondary mt-2">Recomendado: 400x520</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold mb-3">Imágenes grandes (ficha)</div>
                                                <div className="space-y-3">
                                                    {(productForm.galleryImages || []).map((img: any, idx: number) => {
                                                        const key = `gallery-${idx}`
                                                        return (
                                                            <div key={key} className="grid grid-cols-12 gap-2 items-center">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="border border-line rounded-lg px-3 py-2 col-span-7"
                                                                    onChange={(e) => handleImageFileChange('gallery', idx, e.target.files?.[0])}
                                                                />
                                                                <div className="col-span-3 text-xs text-secondary">
                                                                    {img.url ? 'Imagen cargada' : 'Sin imagen'}
                                                                    <div>{img.width && img.height ? `${img.width}x${img.height}px` : `${requiredImageSizes.gallery.width}x${requiredImageSizes.gallery.height}px`}</div>
                                                                    {imageUploading[key] && <div>Subiendo...</div>}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="text-xs text-red-600 col-span-2"
                                                                    onClick={() => removeImageEntry('gallery', idx)}
                                                                >
                                                                    Quitar
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="mt-3 text-sm text-primary font-semibold"
                                                    onClick={() => addImageEntry('gallery')}
                                                >
                                                    + Agregar imagen grande
                                                </button>
                                                <div className="text-xs text-secondary mt-2">Recomendado: 1200x1400</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-secondary text-sm font-bold uppercase mb-2 block">Tipo de producto</label>
                                            <select
                                                required
                                                className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all bg-white"
                                                value={productForm.productType}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    setProductForm({
                                                        ...productForm,
                                                        productType: value,
                                                        attributes: getEmptyAttributes(value)
                                                    })
                                                }}
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="comida">Comida</option>
                                                <option value="ropa">Ropa</option>
                                                <option value="accesorios">Accesorios</option>
                                            </select>
                                            <p className="text-secondary text-xs mt-2">Define qué atributos se mostrarán en la ficha.</p>
                                        </div>
                                    </div>

                                    {productForm.productType === 'comida' && (
                                        <div className="p-5 rounded-xl border border-line bg-surface">
                                            <div className="text-xs uppercase font-bold text-secondary mb-4">Atributos de comida</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Tamaño</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.size || ''} onChange={e => setProductAttribute('size', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Peso</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.weight || ''} onChange={e => setProductAttribute('weight', e.target.value)} placeholder="Ej: 2 kg" />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Sabor</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.flavor || ''} onChange={e => setProductAttribute('flavor', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Edad</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.age || ''} onChange={e => setProductAttribute('age', e.target.value)} placeholder="Ej: Adulto, Cachorro" />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Especie</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.species || ''} onChange={e => setProductAttribute('species', e.target.value)} placeholder="Ej: Perro, Gato" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Ingredientes</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.ingredients || ''} onChange={e => setProductAttribute('ingredients', e.target.value)} placeholder="Ej: pollo, arroz, vegetales" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {productForm.productType === 'ropa' && (
                                        <div className="p-5 rounded-xl border border-line bg-surface">
                                            <div className="text-xs uppercase font-bold text-secondary mb-4">Atributos de ropa</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Talla</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.size || ''} onChange={e => setProductAttribute('size', e.target.value)} placeholder="Ej: S, M, L" />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Material</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.material || ''} onChange={e => setProductAttribute('material', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Color</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.color || ''} onChange={e => setProductAttribute('color', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Género</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.gender || ''} onChange={e => setProductAttribute('gender', e.target.value)} placeholder="Ej: Unisex" />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Especie</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.species || ''} onChange={e => setProductAttribute('species', e.target.value)} placeholder="Ej: Perro, Gato" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {productForm.productType === 'accesorios' && (
                                        <div className="p-5 rounded-xl border border-line bg-surface">
                                            <div className="text-xs uppercase font-bold text-secondary mb-4">Atributos de accesorios</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Material</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.material || ''} onChange={e => setProductAttribute('material', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Tamaño</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.size || ''} onChange={e => setProductAttribute('size', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Uso</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.usage || ''} onChange={e => setProductAttribute('usage', e.target.value)} placeholder="Ej: Paseo, entrenamiento" />
                                                </div>
                                                <div>
                                                    <label className="text-secondary text-xs uppercase font-bold mb-2 block">Especie</label>
                                                    <input className="border border-line rounded-lg px-4 py-2 w-full"
                                                        value={productForm.attributes?.species || ''} onChange={e => setProductAttribute('species', e.target.value)} placeholder="Ej: Perro, Gato" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-5 rounded-xl border border-line bg-surface">
                                        <div className="text-xs uppercase font-bold text-secondary mb-4">Datos comunes</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-secondary text-xs uppercase font-bold mb-2 block">SKU</label>
                                                <input
                                                    required
                                                    className="border border-line rounded-lg px-4 py-2 w-full"
                                                    value={productForm.attributes?.sku || ''}
                                                    onChange={e => setProductAttribute('sku', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-secondary text-xs uppercase font-bold mb-2 block">Etiqueta</label>
                                                <input
                                                    required
                                                    className="border border-line rounded-lg px-4 py-2 w-full"
                                                    value={productForm.attributes?.tag || ''}
                                                    onChange={e => setProductAttribute('tag', e.target.value)}
                                                    placeholder="Ej: abrigo, premium"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-secondary text-sm font-bold uppercase mb-2 block">Descripción</label>
                                        <textarea className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all h-32 resize-none"
                                            required
                                            value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Describe el producto..."></textarea>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-line flex justify-end gap-4 bg-white rounded-b-2xl">
                                <button type="button" className="px-8 py-3 rounded-full border border-line hover:bg-surface transition-all font-bold" onClick={() => setIsProductModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="button-main bg-black text-white px-10 py-3 rounded-full hover:bg-primary transition-all font-bold"
                                    onClick={() => {
                                        if (productFormRef.current?.requestSubmit) {
                                            productFormRef.current.requestSubmit()
                                            return
                                        }
                                        if (productFormRef.current) {
                                            productFormRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
                                        } else {
                                            showNotification('No se pudo enviar el formulario.', 'error')
                                        }
                                    }}
                                >
                                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isSalesProductModalOpen && selectedSalesProduct && (
                    <div
                        className="fixed inset-0 z-[210] flex items-center justify-center bg-black bg-opacity-50 p-4"
                        onClick={() => {
                            setIsSalesProductModalOpen(false)
                            setSelectedSalesProduct(null)
                        }}
                    >
                        <div
                            className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl">
                                <div>
                                    <h4 className="heading4">{selectedSalesProduct.product_name}</h4>
                                    <div className="text-secondary text-sm mt-1 capitalize">
                                        Categoría: {selectedSalesProduct.category || 'Sin categoría'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsSalesProductModalOpen(false)
                                        setSelectedSalesProduct(null)
                                    }}
                                    className="text-secondary hover:text-black"
                                >
                                    <Icon.X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                    <div className="p-5 rounded-xl border border-line bg-surface">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-xs uppercase font-bold text-secondary">Detalle mes seleccionado</div>
                                            <div className="text-xs font-semibold text-secondary">
                                                {productSalesRanking?.period?.start || '-'} → {productSalesRanking?.period?.end || '-'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Pedidos</div>
                                                <div className="text-lg font-bold">{selectedSalesProduct.month_orders_count}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Unidades</div>
                                                <div className="text-lg font-bold">{selectedSalesProduct.month_units_sold}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Venta bruta</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.month_gross_revenue)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Venta neta</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.month_net_revenue)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">IVA</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.month_vat_amount)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Envío</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.month_shipping_amount)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Costo</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.month_cost)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Utilidad</div>
                                                <div className={`text-lg font-bold ${selectedSalesProduct.month_profit >= 0 ? 'text-success' : 'text-red'}`}>
                                                    {formatMoney(selectedSalesProduct.month_profit)}
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white col-span-2">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Margen neto</div>
                                                <div className="text-lg font-bold">
                                                    {Number(selectedSalesProduct.month_margin).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-xl border border-line bg-surface">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-xs uppercase font-bold text-secondary">Detalle histórico total</div>
                                            <div className="text-xs font-semibold text-secondary">
                                                {productSalesRanking?.historicalPeriod?.start || '-'} → {productSalesRanking?.historicalPeriod?.end || '-'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Pedidos</div>
                                                <div className="text-lg font-bold">{selectedSalesProduct.historical_orders_count}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Unidades</div>
                                                <div className="text-lg font-bold">{selectedSalesProduct.historical_units_sold}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Venta bruta</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.historical_gross_revenue)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Venta neta</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.historical_net_revenue)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">IVA</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.historical_vat_amount)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Envío</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.historical_shipping_amount)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Costo</div>
                                                <div className="text-lg font-bold">{formatMoney(selectedSalesProduct.historical_cost)}</div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Utilidad</div>
                                                <div className={`text-lg font-bold ${selectedSalesProduct.historical_profit >= 0 ? 'text-success' : 'text-red'}`}>
                                                    {formatMoney(selectedSalesProduct.historical_profit)}
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-lg border border-line bg-white col-span-2">
                                                <div className="text-[10px] uppercase font-bold text-secondary">Margen neto</div>
                                                <div className="text-lg font-bold">
                                                    {Number(selectedSalesProduct.historical_margin).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-line flex justify-end bg-white rounded-b-2xl">
                                <button
                                    className="px-5 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold"
                                    onClick={() => {
                                        setIsSalesProductModalOpen(false)
                                        setSelectedSalesProduct(null)
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isOrderModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl">
                                <div>
                                    <h4 className="heading4">Pedido #{selectedOrder.id}</h4>
                                    <div className="text-secondary text-sm mt-1">{formatDateTimeEcuador(selectedOrder.created_at)}</div>
                                </div>
                                <button onClick={() => setIsOrderModalOpen(false)} className="text-secondary hover:text-black">
                                    <Icon.X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="bg-surface rounded-xl p-6 border border-line">
                                        <h6 className="heading6 mb-4 flex items-center gap-2">
                                            <Icon.User size={20} /> Cliente
                                        </h6>
                                        <div className="space-y-2">
                                            <div className="font-bold text-lg">{selectedOrderContact.name}</div>
                                            <div className="text-secondary">{selectedOrderContact.email}</div>
                                            <div className="text-secondary">{selectedOrderContact.phone !== '-' ? selectedOrderContact.phone : 'Sin teléfono'}</div>
                                        </div>
                                    </div>
                                    <div className="bg-surface rounded-xl p-6 border border-line flex flex-col justify-between">
                                        <h6 className="heading6 mb-4 flex items-center gap-2">
                                            <Icon.Receipt size={20} /> Resumen
                                        </h6>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-[1fr_120px] items-center">
                                                <span className="text-secondary">Subtotal sin IVA</span>
                                                <span className="font-bold tabular-nums text-right">{formatMoney(getOrderVatSubtotal(selectedOrder))}</span>
                                            </div>
                                            {Number(selectedOrder?.vat_rate ?? 0) > 0 && (
                                                <div className="grid grid-cols-[1fr_120px] items-center">
                                                    <span className="text-secondary">IVA ({Number(selectedOrder?.vat_rate ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</span>
                                                    <span className="font-bold tabular-nums text-right">{formatMoney(getOrderVatAmount(selectedOrder))}</span>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-[1fr_120px] items-center">
                                                <span className="text-secondary">Envío</span>
                                                <span className={`font-bold tabular-nums text-right ${getOrderShipping(selectedOrder) === 0 ? 'text-success' : 'text-[#111827]'}`}>
                                                    {getOrderShipping(selectedOrder) === 0 ? 'Gratis' : formatMoney(getOrderShipping(selectedOrder))}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t border-line grid grid-cols-[1fr_120px] items-center">
                                                <span className="text-lg font-bold">Total</span>
                                                <span className="text-xl font-bold text-primary tabular-nums text-right">{formatMoney(selectedOrder?.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h6 className="heading6">Productos del Pedido</h6>
                                        <span className="bg-line px-3 py-1 rounded-full text-xs font-bold">{selectedOrder.items?.length || 0} ítems</span>
                                    </div>
                                    <div className="overflow-x-auto border border-line rounded-xl">
                                        <table className="w-full text-left table-fixed">
                                            <thead className="bg-surface border-b border-line text-xs uppercase text-secondary font-bold">
                                                <tr>
                                                    <th className="px-6 py-4 w-[55%]">Producto</th>
                                                    <th className="px-6 py-4 w-[12%] text-center">Cant.</th>
                                                    <th className="px-6 py-4 w-[16%] text-right tabular-nums">Precio</th>
                                                    <th className="px-6 py-4 w-[17%] text-right tabular-nums">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {selectedOrder.items?.map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-line rounded-lg overflow-hidden border border-line flex-shrink-0">
                                                                    <img src="/images/product/1000x1000.png" className="w-full h-full object-cover" alt={item.product_name} />
                                                                </div>
                                                                <span className="font-medium text-sm">{item.product_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-right tabular-nums">${Number(getItemNetPrice(item, selectedOrder)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-primary tabular-nums">${(Number(getItemNetPrice(item, selectedOrder)) * item.quantity).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-line flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white rounded-b-2xl">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const badge = getStatusBadge(selectedOrder.status)
                                        return (
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${badge.className}`}>
                                                Estado: {badge.label}
                                            </span>
                                        )
                                    })()}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(user?.role === 'admin' || user?.role === 'customer') && selectedOrder.status !== 'canceled' && (
                                        <button className="px-4 py-2 rounded-lg bg-black text-white hover:bg-primary transition-all text-sm font-semibold" onClick={handleGenerateInvoice}>
                                            Ver factura
                                        </button>
                                    )}
                                    <button className="px-5 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold" onClick={() => setIsOrderModalOpen(false)}>
                                        Cerrar
                                    </button>
                                    {user?.role === 'admin' && selectedOrder.status !== 'canceled' && selectedOrder.status !== 'delivered' && (
                                        <>
                                            <button className="px-4 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold" onClick={() => {
                                                handleUpdateOrderStatus(selectedOrder.id, 'processing')
                                            }}>
                                                En proceso
                                            </button>
                                            <button className="px-4 py-2 rounded-lg border border-line hover:bg-surface transition-all text-sm font-semibold" onClick={() => {
                                                handleUpdateOrderStatus(selectedOrder.id, 'shipped')
                                            }}>
                                                Enviado
                                            </button>
                                            <button className="px-4 py-2 rounded-lg bg-black text-white hover:bg-primary transition-all text-sm font-semibold" onClick={() => {
                                                handleUpdateOrderStatus(selectedOrder.id, 'delivered')
                                            }}>
                                                Completado
                                            </button>
                                            <button className="px-4 py-2 rounded-lg border border-red text-red hover:bg-red/10 transition-all text-sm font-semibold" onClick={() => {
                                                handleUpdateOrderStatus(selectedOrder.id, 'canceled')
                                            }}>
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {renderDeepDive()}
        </>
    );
};

export default MyAccount;
