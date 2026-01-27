'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { motion } from 'framer-motion'

import { useRouter } from 'next/navigation'
import { requestApi } from '@/lib/apiClient'

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
        profitStats: { revenue: number, cost: number, profit: number, margin: number };
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
    };
    strategicAlerts?: Array<{ type: 'critical' | 'warning' | 'info', message: string, action: string }>;
}

interface Order {
    id: string;
    user_name?: string;
    total: number;
    status: string;
    created_at: string;
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

const MyAccount = () => {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<string | undefined>('dashboard')
    const [activeAddress, setActiveAddress] = useState<string | null>('billing')
    const [activeOrders, setActiveOrders] = useState<string | undefined>('all')
    const [openDetail, setOpenDetail] = useState<boolean | undefined>(false)
    const [user, setUser] = useState<{ id: string, name: string, email: string, role?: 'customer' | 'admin' } | null>(null)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    // Address management
    const emptyAddress = { firstName: '', lastName: '', company: '', country: '', street: '', city: '', state: '', zip: '', phone: '', email: '' }
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
        birth: ''
    })

    // Admin Data State
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
    const [trendRange, setTrendRange] = useState<7 | 30>(7)
    const [selectedDeepDive, setSelectedDeepDive] = useState<string | null>(null)
    const [adminOrdersList, setAdminOrdersList] = useState<Order[]>([])
    const [adminProductsList, setAdminProductsList] = useState<any[]>([])
    const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([])
    const [vatRate, setVatRate] = useState<number>(0)
    const [vatLoading, setVatLoading] = useState(false)
    const [vatSaving, setVatSaving] = useState(false)
    const [shippingRates, setShippingRates] = useState<{ delivery: number; pickup: number; taxRate: number }>({ delivery: 0, pickup: 0, taxRate: 0 })
    const [shippingLoading, setShippingLoading] = useState(false)
    const [shippingSaving, setShippingSaving] = useState(false)

    // Modal & Form State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any | null>(null)
    const [productForm, setProductForm] = useState({
        id: '', name: '', price: '', cost: '', quantity: '', category: 'General', brand: 'Generico', description: '', image: ''
    })

    const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const [userOrders, setUserOrders] = useState<Order[]>([])
    const [userOrdersLoading, setUserOrdersLoading] = useState(false)

    // Handlers
    const handleNewProduct = () => {
        setEditingProduct(null)
        setProductForm({ id: '', name: '', price: '', cost: '', quantity: '', category: 'General', brand: 'Generico', description: '', image: '' })
        setIsProductModalOpen(true)
    }

    const handleEditProduct = (product: any) => {
        const rate = Number(dashboardStats?.tax?.rate ?? vatRate ?? 0)
        const multiplier = 1 + rate / 100
        const basePrice = multiplier > 0 ? Number(product.price ?? 0) / multiplier : Number(product.price ?? 0)
        setEditingProduct(product)
        setProductForm({
            id: product.id,
            name: product.name,
            price: Number.isFinite(basePrice) ? basePrice.toFixed(2) : product.price,
            cost: product.business?.cost || product.cost || 0,
            quantity: product.quantity,
            category: product.category || 'General',
            brand: product.brand || 'Generico',
            description: product.description || '',
            image: product.images && product.images.length > 0 ? product.images[0] : ''
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
            setAdminProductsList(res.body);
        } catch (error) {
            console.error(error);
            showNotification('Error al eliminar producto', 'error');
        }
    }

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            const data = {
                name: productForm.name,
                price: parseFloat(productForm.price),
                cost: parseFloat(productForm.cost),
                quantity: parseInt(productForm.quantity),
                category: productForm.category,
                brand: productForm.brand,
                description: productForm.description,
                images: productForm.image ? [productForm.image] : []
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
            setAdminProductsList(res.body);
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
            setAdminProductsList(res.body);
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

    const parseAddress = (value: any) => {
        if (!value) return null
        if (typeof value === 'string') {
            try {
                return JSON.parse(value)
            } catch {
                return value
            }
        }
        return value
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

    const getDefaultBillingAddress = () => {
        if (!savedAddresses || savedAddresses.length === 0) return null
        const primary = savedAddresses[0]
        return primary?.billing || null
    }

    const formatMoney = (value: any) => {
        const num = Number(value ?? 0)
        return `$${num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
        const shipping = parseAddress(order.shipping_address) || {}
        const billing = parseAddress(order.billing_address) || {}
        const nameFromAddress = [shipping.firstName || billing.firstName, shipping.lastName || billing.lastName].filter(Boolean).join(' ')
        const defaultBilling = getDefaultBillingAddress() || {}
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
        try {
            setProfileSaving(true)
            const token = localStorage.getItem('authToken');
            const name = `${profile.firstName} ${profile.lastName}`.trim()
            const res = await requestApi<{ name?: string; profile?: typeof profile }>('/api/user/profile', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, profile })
            });

            if (res.body.profile) {
                setProfile({
                    firstName: res.body.profile.firstName || '',
                    lastName: res.body.profile.lastName || '',
                    phone: res.body.profile.phone || '',
                    gender: res.body.profile.gender || '',
                    birth: res.body.profile.birth || ''
                })
            }

            if (res.body.name && user) {
                const updatedUser = { ...user, name: res.body.name }
                setUser(updatedUser)
                localStorage.setItem('user', JSON.stringify(updatedUser))
            }

            showNotification('Información personal guardada correctamente.');
        } catch (error) {
            console.error(error);
            showNotification('Error al guardar información personal', 'error');
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
            showNotification('No se pudieron cargar los costos de envío.', 'error')
        } finally {
            setShippingLoading(false)
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

    const getStatusBadge = (status?: string) => {
        const normalized = normalizeStatus(status)
        if (['processing', 'in_process', 'in-process'].includes(normalized)) {
            return { label: 'En proceso', className: 'bg-blue-100 text-blue-600' }
        }
        if (['completed', 'delivered'].includes(normalized)) {
            return { label: 'Completado', className: 'bg-success text-success' }
        }
        if (['canceled', 'cancelled'].includes(normalized)) {
            return { label: 'Cancelado', className: 'bg-red text-red' }
        }
        if (['shipped', 'shipping', 'delivery', 'delivering'].includes(normalized)) {
            return { label: 'Enviado', className: 'bg-purple text-purple' }
        }
        if (['pickup', 'ready_for_pickup', 'ready'].includes(normalized)) {
            return { label: 'Esperando Recojo', className: 'bg-amber-400 text-amber-400' }
        }
        return { label: 'Pendiente', className: 'bg-yellow text-yellow' }
    }

    // Fetch Admin Data
    React.useEffect(() => {
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role !== 'admin') return

        const headers = { Authorization: `Bearer ${token}` }

        const handleError = (err: any) => {
            console.error(err)
            if (err.message && (err.message.includes('Error 401') || err.message.includes('Unauthenticated'))) {
                handleLogout()
            }
        }

        if (activeTab === 'reports') {
            requestApi<DashboardStats>('/api/admin/dashboard/stats', { headers })
                .then(res => setDashboardStats(res.body))
                .catch(handleError)
            loadVatRate()
            loadShippingRates()
        } else if (activeTab === 'products' || activeTab === 'prices') {
            requestApi<any[]>('/api/products', { headers })
                .then(res => setAdminProductsList(res.body))
                .catch(handleError)
            loadVatRate()
            loadShippingRates()
        } else if (activeTab === 'admin-orders') {
            requestApi<Order[]>('/api/orders', { headers })
                .then(res => setAdminOrdersList(res.body))
                .catch(handleError)
        } else if (activeTab === 'shipments') {
            requestApi<{ providers: ShippingProvider[] }>('/api/shipments', { headers })
                .then(res => setShippingProviders(res.body.providers))
                .catch(handleError)
        }
    }, [activeTab, user])

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
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role === 'admin') return

        setProfileLoading(true)
        requestApi<{ name?: string; profile?: typeof profile }>('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const apiProfile = res.body.profile || {}
                const fallbackName = res.body.name || user.name || ''
                const [firstName, ...rest] = fallbackName.split(' ')
                setProfile({
                    firstName: apiProfile.firstName || firstName || '',
                    lastName: apiProfile.lastName || rest.join(' ') || '',
                    phone: apiProfile.phone || '',
                    gender: apiProfile.gender || '',
                    birth: apiProfile.birth || ''
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
    const vatDisplayRate = Number(dashboardStats?.tax?.rate ?? vatRate ?? 0)
    const vatDisplayMultiplier = Number(dashboardStats?.tax?.multiplier ?? (1 + vatDisplayRate / 100))
    const vatRateLabel = vatDisplayRate.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const vatMultiplierLabel = vatDisplayMultiplier.toLocaleString('es-EC', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
    const vatExampleTotal = (100 * vatDisplayMultiplier).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const vatRateValue = Number(dashboardStats?.tax?.rate ?? vatRate ?? 0)
    const vatMultiplier = 1 + vatRateValue / 100
    const productPvpPrice = Number(productForm.price || 0) * vatMultiplier
    const productPvpPriceLabel = productPvpPrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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

    const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const field = id.replace('billing', '').charAt(0).toLowerCase() + id.replace('billing', '').slice(1);
        updateAddressData('billing', field, value)
    }

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses))
        showNotification('¡Direcciones guardadas exitosamente!')
    }

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate API call
        showNotification('Información personal guardada correctamente.')
    }

    const renderDeepDive = () => {
        if (!selectedDeepDive || !dashboardStats?.businessMetrics) return null;

        const metrics = dashboardStats.businessMetrics;
        const salesDeepDive = metrics.salesDeepDive;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-8 border-b border-line flex justify-between items-center bg-surface">
                        <div>
                            <h3 className="heading4">
                                {selectedDeepDive === 'sales' ? 'Análisis Detallado de Ventas' :
                                    selectedDeepDive === 'profit' ? 'Detalle de Rentabilidad' :
                                        selectedDeepDive === 'aov' ? 'Análisis de Ticket Promedio' : 'Salud de Inventario'}
                            </h3>
                            <p className="text-secondary text-sm">Desglose comparativo y factores de crecimiento</p>
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
                                                "El {Math.round((metrics.aovDeepDive?.distribution.find(d => d.bucket.includes('Bajo'))?.count || 0) / (metrics.aovDeepDive?.distribution.reduce((acc, curr) => acc + Number(curr.count), 0) || 1) * 100)}% de tus pedidos son menores a $50. Implementar un umbral de 'Envío Gratis' en $60 podría incrementar el Ticket Promedio en un 15%."
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

    if (!user) return null

    return (
        <>
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-xl border ${message.type === 'success' ? 'bg-success/10 border-success text-success' : 'bg-red/10 border-red text-red'}`}
                >
                    <div className="flex items-center gap-3">
                        <Icon.CheckCircle size={24} />
                        <span className="font-semibold">{message.text}</span>
                    </div>
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
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                                                <Icon.ShoppingBag size={20} />
                                                <strong className="heading6">Productos</strong>
                                            </Link>
                                            <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'prices' ? 'active' : ''}`} onClick={() => setActiveTab('prices')}>
                                                <Icon.CurrencyDollar size={20} />
                                                <strong className="heading6">Precios</strong>
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
                                    <div className={`tab text-content w-full ${activeTab === 'reports' ? 'block' : 'hidden'}`}>
                                        <div className="flex items-center justify-between pb-6">
                                            <div className="heading5">Reportes de Negocio</div>
                                            <div className="text-sm font-bold text-secondary bg-surface px-4 py-2 rounded-lg border border-line">
                                                {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>

                                        <div className="mb-8 p-6 rounded-xl border border-line bg-surface">
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
                                                        <button className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-current hover:bg-white/20 transition-colors">
                                                            {alert.action}
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                            {(() => {
                                                const summary = dashboardStats?.businessMetrics?.salesSummary
                                                const gross = Number(summary?.gross ?? 0)
                                                const net = Number(summary?.net ?? 0)
                                                const vat = Number(summary?.vat ?? 0)
                                                const shipping = Number(summary?.shipping ?? 0)
                                                return (
                                                    <>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Venta Total</div>
                                                            <div className="heading5">${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Incluye IVA + Envío</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Venta Neta</div>
                                                            <div className="heading5">${net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Sin IVA ni envío</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">IVA Cobrado</div>
                                                            <div className="heading5">${vat.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Impuesto del cliente</div>
                                                        </div>
                                                        <div className="p-5 bg-white rounded-xl border border-line shadow-sm">
                                                            <div className="text-secondary text-xs uppercase font-bold mb-1">Envío Cobrado</div>
                                                            <div className="heading5">${shipping.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-secondary text-xs mt-1">Cobro al cliente</div>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                            <div
                                                className="p-6 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => setSelectedDeepDive('sales')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Ventas (Mes, netas)</div>
                                                    <Icon.CurrencyDollar className="text-success" size={20} />
                                                </div>
                                                <div className="heading4">${dashboardStats?.totalSales?.amount ? Number(dashboardStats.totalSales.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</div>
                                                <div className="text-success text-xs mt-3 font-bold flex items-center gap-1">
                                                    <Icon.TrendUp weight="bold" />
                                                    +{dashboardStats?.totalSales?.progress?.percentage ?? 0}%
                                                    <span className="text-secondary font-normal ml-1 flex items-center gap-1 underline">ver detalle <Icon.ArrowRight size={10} /></span>
                                                </div>
                                            </div>

                                            <div
                                                className="p-6 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => setSelectedDeepDive('aov')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Ticket Promedio</div>
                                                    <Icon.Receipt className="text-blue-500" size={20} />
                                                </div>
                                                <div className="heading4">${dashboardStats?.businessMetrics?.averageOrderValue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}</div>
                                                <div className="text-secondary text-xs mt-3 underline">Analizar distribución <Icon.ArrowRight size={10} className="inline ml-1" /></div>
                                            </div>

                                            <div
                                                className="p-6 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => setSelectedDeepDive('profit')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Utilidad Bruta (sin IVA y sin envío)</div>
                                                    <Icon.HandCoins className="text-orange-500" size={20} />
                                                </div>
                                                <div className="heading4 text-success">${dashboardStats?.businessMetrics?.profitStats?.profit?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}</div>
                                                <div className="text-success text-xs mt-3 font-bold">{dashboardStats?.businessMetrics?.profitStats?.margin ?? 0}% <span className="text-secondary font-normal underline">margen neto</span></div>
                                            </div>

                                            <div
                                                className="p-6 bg-white rounded-xl border border-line shadow-sm cursor-pointer hover:border-primary transition-all"
                                                onClick={() => setSelectedDeepDive('inventory')}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Valor Inventario</div>
                                                    <Icon.Archive className="text-purple-500" size={20} />
                                                </div>
                                                <div className="heading4">${dashboardStats?.businessMetrics?.inventoryValue?.cost_value?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}</div>
                                                <div className="text-secondary text-xs mt-3">{dashboardStats?.businessMetrics?.inventoryValue?.total_items ?? 0} items <span className="underline">ver riesgos <Icon.ArrowRight size={10} className="inline ml-1" /></span></div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <div className="bg-white p-8 rounded-2xl border border-line shadow-sm relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-8">
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

                                                <div className="h-80 relative mt-4">
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
                                                                        const step = Math.floor(data.length / 5);
                                                                        const labels = [];
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
                                                            return (
                                                                <div key={i} className="cursor-pointer group hover:bg-surface -mx-2 p-2 rounded-lg transition-colors" onClick={() => setActiveTab('admin-orders')}>
                                                                    <div className="flex justify-between text-sm mb-2">
                                                                        <span className="capitalize font-bold text-secondary group-hover:text-black transition-colors">{status.status}</span>
                                                                        <span className="font-bold">{status.count} ({perc}%)</span>
                                                                    </div>
                                                                    <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                                                                        <div className={`h-full ${status.status === 'completed' ? 'bg-success' :
                                                                            status.status === 'processing' ? 'bg-yellow' :
                                                                                status.status === 'pending' ? 'bg-amber-400' :
                                                                                    'bg-primary'}`} style={{ width: `${perc}%` }}></div>
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
                                                                            <td className="py-4 text-right text-[10px] text-secondary whitespace-nowrap">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
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
                                                                    <Image src={product.images && product.images.length > 0 ? product.images[0] : '/images/product/1000x1000.png'} width={100} height={100} alt={product.name} className="w-full h-full object-cover" />
                                                                </div>
                                                            </td>
                                                            <td className="py-4 font-semibold">{product.name}</td>
                                                            <td className="py-4">{product.quantity ?? 0} unidades</td>
                                                            <td className="py-4 font-bold">${Number(product.price).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td className="py-4">
                                                                <div className="flex gap-2">
                                                                    <button className="p-2 hover:bg-line rounded-full transition-colors" onClick={() => handleEditProduct(product)}><Icon.PencilSimple size={18} /></button>
                                                                    <button className="p-2 hover:bg-line rounded-full transition-colors text-red" onClick={() => handleDeleteProduct(product.id)}><Icon.Trash size={18} /></button>
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

                                    <div className={`tab text-content w-full ${activeTab === 'prices' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Gestión Inteligente de Precios</div>
                                        <p className="text-secondary mb-6">Optimiza tus márgenes con sugerencias basadas en costos.</p>
                                        <div className="mb-8 p-6 rounded-xl border border-line bg-surface">
                                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                                <div className="flex-1">
                                                    <label htmlFor="vatRate" className="text-secondary text-xs uppercase font-bold mb-2 block">IVA (%)</label>
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
                                                    <div>
                                                        <label htmlFor="shippingDelivery" className="text-secondary text-xs uppercase font-bold mb-2 block">Envío a domicilio ($)</label>
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
                                                    </div>
                                                    <div>
                                                        <label htmlFor="shippingPickup" className="text-secondary text-xs uppercase font-bold mb-2 block">Retiro en tienda ($)</label>
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
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label htmlFor="shippingTaxRate" className="text-secondary text-xs uppercase font-bold mb-2 block">IVA aplicado al envío (%)</label>
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
                                                <div className="heading4">High</div>
                                            </div>
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
                                                            <th className="pb-4 font-bold text-secondary text-sm">PRECIO P.V.P</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">MARGEN</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">SUGERIDO</th>
                                                            <th className="pb-4 font-bold text-secondary text-sm">ACCIÓN</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {adminProductsList.length > 0 ? adminProductsList.map((product: any) => (
                                                            <tr key={product.id} className="border-b border-line last:border-0 hover:bg-surface duration-300">
                                                                <td className="py-4">
                                                                    <div className="font-semibold text-sm">{product.name}</div>
                                                                    <div className="text-xs text-secondary">SKU: {product.id.substring(0, 6)}</div>
                                                                </td>
                                                                <td className="py-4 font-medium text-secondary text-sm">${Number(product.business?.cost || 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                <td className="py-4 font-bold text-sm">${Number(product.price).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                <td className="py-4">
                                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${((product.business?.margin || 0) < 20) ? 'bg-red text-white' :
                                                                        ((product.business?.margin || 0) < 35) ? 'bg-yellow text-white' : 'bg-success text-white'
                                                                        }`}>
                                                                        {product.business?.margin || 0}%
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 text-xs">
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-secondary">Min: <span className="font-bold text-black">${product.business?.suggestions?.min_price}</span></div>
                                                                        <div className="text-secondary">Rec: <span className="font-bold text-green-600">${product.business?.suggestions?.recommended_price}</span></div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4">
                                                                    <button className="text-button-uppercase text-xs underline font-bold" onClick={() => {
                                                                        handleOptimizePrice(product)
                                                                    }}>Optimizar</button>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr><td colSpan={6} className="py-8 text-center text-secondary">Cargando análisis de precios...</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
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
                                                            <td className="py-4">{new Date(order.created_at).toLocaleDateString()}</td>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-surface rounded-xl border border-line">
                                                <h6 className="heading6 mb-4">Proveedores de Envío</h6>
                                                <div className="flex flex-col gap-3">
                                                    {shippingProviders.length > 0 ? shippingProviders.map((prov) => (
                                                        <div key={prov.id} className="flex items-center justify-between p-3 bg-white rounded border border-line">
                                                            <span>{prov.name}</span>
                                                            <span className="text-success text-xs font-bold">{prov.status}</span>
                                                        </div>
                                                    )) : (
                                                        <div className="p-3 text-sm text-secondary">Cargando proveedores...</div>
                                                    )}
                                                </div>
                                            </div>
                                            <button className="mt-4 text-sm underline font-bold" onClick={() => showNotification('Configurar métodos de envío')}>Configurar Metodos</button>
                                        </div>
                                        <div className="p-6 bg-surface rounded-xl border border-line">
                                            <h6 className="heading6 mb-4">Próximas Recogidas</h6>
                                            <div className="text-center py-6 text-secondary text-sm">
                                                No hay recogidas programadas para hoy.
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`tab text-content w-full ${activeTab === 'balances' ? 'block' : 'hidden'}`}>
                                        <div className="text-gray-400 text-sm">Balance General (Ventas sin IVA y sin envío)</div>
                                        <div className="heading2 mt-2">${dashboardStats?.totalSales?.amount ? Number(dashboardStats.totalSales.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</div>
                                        <div className="mt-6 flex gap-8">
                                            <div>
                                                <div className="text-gray-400 text-xs uppercase">Ingresos (Histórico, sin IVA y sin envío)</div>
                                                <div className="heading5">${dashboardStats?.totalSales?.amount ? Number(dashboardStats.totalSales.amount).toLocaleString('en-US', { minimumFractionDigits: 0 }) : '0'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400 text-xs uppercase">Gastos (Estimado)</div>
                                                <div className="heading5">$0</div>
                                            </div>
                                        </div>
                                        <div className="heading6 mb-4 mt-8">Últimos Pedidos (Ingresos sin IVA y sin envío)</div>
                                        <div className="flex flex-col gap-4">
                                            {adminOrdersList.slice(0, 5).map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-line">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-success bg-opacity-10 text-success rounded-full flex items-center justify-center">
                                                            <Icon.ArrowDownLeft weight="bold" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">Pago Recibido - Order #{order.id}</div>
                                                            <div className="text-secondary text-xs">{new Date(order.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-success">+${Number(order.total).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                </div>
                                            ))}
                                            {adminOrdersList.length === 0 && (
                                                <div className="text-center py-4 text-secondary">No hay transacciones recientes.</div>
                                            )}
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
                                                                            <span className="prd_price">${Number(getItemNetPrice(item, selectedOrder)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                                            <div className="pass">
                                                <label htmlFor="password-setting" className='caption1'>Contraseña actual <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="password-setting" type="password" placeholder="Contraseña *" />
                                            </div>
                                            <div className="new-pass mt-5">
                                                <label htmlFor="newPassword" className='caption1'>Nueva contraseña <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="newPassword" type="password" placeholder="Nueva Contraseña *" />
                                            </div>
                                            <div className="confirm-pass mt-5">
                                                <label htmlFor="confirmPassword" className='caption1'>Confirmar nueva contraseña <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="confirmPassword" type="password" placeholder="Confirmar Contraseña *" />
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
                                <h6 className="heading6 order_name mt-2">{getOrderContact(selectedOrder).name}</h6>
                                {getOrderContact(selectedOrder).phone ? (
                                    <h6 className="heading6 order_phone mt-2">{getOrderContact(selectedOrder).phone}</h6>
                                ) : null}
                                <h6 className="heading6 normal-case order_email mt-2 text-sm">{getOrderContact(selectedOrder).email}</h6>
                            </div>
                            <div className="info_item p-5 rounded-xl bg-surface border border-line">
                                <strong className="text-button-uppercase text-secondary">Método de Pago</strong>
                                <h6 className="heading6 order_payment mt-2">{selectedOrder?.payment_method || '-'}</h6>
                            </div>
                            <div className="info_item p-5 rounded-xl bg-surface border border-line">
                                <strong className="text-button-uppercase text-secondary">Empresa</strong>
                                <h6 className="heading6 order_company mt-2">{getDefaultBillingAddress()?.company || 'No aplica'}</h6>
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
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl">
                                <h3 className="heading4">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                                <button onClick={() => setIsProductModalOpen(false)} className="text-secondary hover:text-black">
                                    <Icon.X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1">
                                <form id="product-form" onSubmit={handleSaveProduct} className="space-y-6">
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
                                                    value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                            </div>
                                            <label className="text-secondary text-xs font-bold uppercase mt-3 mb-2 block">Precio PVP (con IVA)</label>
                                            <input type="text" className="border border-line rounded-lg px-4 py-3 w-full bg-surface text-secondary" readOnly
                                                value={vatLoading ? 'Cargando...' : `$${productPvpPriceLabel}`} />
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
                                        <div>
                                            <label className="text-secondary text-sm font-bold uppercase mb-2 block">Imagen URL (Opcional)</label>
                                            <input type="text" className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all"
                                                value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} placeholder="URL de la imagen" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-secondary text-sm font-bold uppercase mb-2 block">Descripción</label>
                                        <textarea className="border border-line rounded-lg px-4 py-3 w-full focus:border-black outline-none transition-all h-32 resize-none"
                                            value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Describe el producto..."></textarea>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-line flex justify-end gap-4 bg-white rounded-b-2xl">
                                <button type="button" className="px-8 py-3 rounded-full border border-line hover:bg-surface transition-all font-bold" onClick={() => setIsProductModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" form="product-form" className="button-main bg-black text-white px-10 py-3 rounded-full hover:bg-primary transition-all font-bold">
                                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isOrderModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-line flex justify-between items-center bg-white rounded-t-2xl">
                                <div>
                                    <h4 className="heading4">Pedido #{selectedOrder.id}</h4>
                                    <div className="text-secondary text-sm mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</div>
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
                                            <div className="font-bold text-lg">{selectedOrder.user_name || 'Invitado'}</div>
                                            <div className="text-secondary">{selectedOrder.user_email}</div>
                                            <div className="text-secondary">{selectedOrder.user_phone || 'Sin teléfono'}</div>
                                        </div>
                                    </div>
                                    <div className="bg-surface rounded-xl p-6 border border-line flex flex-col justify-between">
                                        <h6 className="heading6 mb-4 flex items-center gap-2">
                                            <Icon.Receipt size={20} /> Resumen
                                        </h6>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-secondary">Subtotal sin IVA</span>
                                                <span className="font-bold">{formatMoney(getOrderVatSubtotal(selectedOrder))}</span>
                                            </div>
                                            {Number(selectedOrder?.vat_rate ?? 0) > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-secondary">IVA ({Number(selectedOrder?.vat_rate ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</span>
                                                    <span className="font-bold">{formatMoney(getOrderVatAmount(selectedOrder))}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-secondary">Envío</span>
                                                <span className={`font-bold ${getOrderShipping(selectedOrder) === 0 ? 'text-success' : 'text-[#111827]'}`}>
                                                    {getOrderShipping(selectedOrder) === 0 ? 'Gratis' : formatMoney(getOrderShipping(selectedOrder))}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t border-line flex justify-between items-center">
                                                <span className="text-lg font-bold">Total</span>
                                                <span className="text-xl font-bold text-primary">{formatMoney(selectedOrder?.total)}</span>
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
                                        <table className="w-full text-left">
                                            <thead className="bg-surface border-b border-line text-xs uppercase text-secondary font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Producto</th>
                                                    <th className="px-6 py-4 text-center">Cant.</th>
                                                    <th className="px-6 py-4 text-right">Precio</th>
                                                    <th className="px-6 py-4 text-right">Total</th>
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
                                                        <td className="px-6 py-4 text-right">${Number(getItemNetPrice(item, selectedOrder)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-primary">${(Number(getItemNetPrice(item, selectedOrder)) * item.quantity).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
