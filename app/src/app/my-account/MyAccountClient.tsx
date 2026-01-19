'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { motion } from 'framer-motion'

import { useRouter } from 'next/navigation'
import { requestApi } from '@/lib/apiClient'

interface DashboardStats {
    totalSales: number;
    newOrders: number;
    newClients: number;
    monthlyPerformance: Array<{ day: string, total: number }>;
}

interface Order {
    id: string;
    user_name?: string;
    total: number;
    status: string;
    created_at: string;
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

    // Admin Data State
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
    const [adminOrdersList, setAdminOrdersList] = useState<Order[]>([])
    const [adminProductsList, setAdminProductsList] = useState<any[]>([])
    const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([])

    // Modal & Form State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any | null>(null)
    const [productForm, setProductForm] = useState({
        id: '', name: '', price: '', cost: '', quantity: '', category: 'General', brand: 'Generico', description: '', image: ''
    })

    const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

    // Handlers
    const handleNewProduct = () => {
        setEditingProduct(null)
        setProductForm({ id: '', name: '', price: '', cost: '', quantity: '', category: 'General', brand: 'Generico', description: '', image: '' })
        setIsProductModalOpen(true)
    }

    const handleEditProduct = (product: any) => {
        setEditingProduct(product)
        setProductForm({
            id: product.id,
            name: product.name,
            price: product.price,
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
            const res = await requestApi<Order[]>('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
            setAdminOrdersList(res.body);
        } catch (error) {
            console.error(error);
            showNotification('Error al actualizar el pedido', 'error');
        }
    }

    const handleSaveAddresses = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            await requestApi('/api/user/addresses', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ addresses: savedAddresses })
            });
            showNotification('Direcciones guardadas correctamente');
        } catch (error) {
            console.error(error);
            showNotification('Error al guardar direcciones', 'error');
        }
    }

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        showNotification('Configuración guardada (Simulado)');
    }

    const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type })
        setTimeout(() => setMessage(null), 5000)
    }

    // Fetch Admin Data
    React.useEffect(() => {
        const token = localStorage.getItem('authToken')
        if (!token || !user || user.role !== 'admin') return

        const headers = { Authorization: `Bearer ${token}` }

        if (activeTab === 'reports') {
            requestApi<DashboardStats>('/api/admin/dashboard/stats', { headers })
                .then(res => setDashboardStats(res.body))
                .catch(err => console.error(err))
        } else if (activeTab === 'products' || activeTab === 'prices') {
            requestApi<any[]>('/api/products', { headers })
                .then(res => setAdminProductsList(res.body))
                .catch(err => console.error(err))
        } else if (activeTab === 'admin-orders') {
            requestApi<Order[]>('/api/orders', { headers })
                .then(res => setAdminOrdersList(res.body))
                .catch(err => console.error(err))
        } else if (activeTab === 'shipments') {
            requestApi<{ providers: ShippingProvider[] }>('/api/shipments', { headers })
                .then(res => setShippingProviders(res.body.providers))
                .catch(err => console.error(err))
        }
    }, [activeTab, user])

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

    if (!user) return null

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="Nuevos clientes ahorran 10% con el código GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Mi Cuenta' subHeading='Mi Cuenta' />
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
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col w-full">
                        <div className="left md:w-1/3 w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
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
                                    <div className="mail heading6 font-normal normal-case text-secondary text-center mt-1">{user.email}</div>
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
                        <div className="right md:w-2/3 w-full pl-2.5">
                            {user.role === 'admin' && (
                                <>
                                    <div className={`tab text-content w-full ${activeTab === 'reports' ? 'block' : 'hidden'}`}>
                                        <div className="heading5 pb-4">Reportes de Ventas</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="p-6 bg-white rounded-xl border border-line shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Ventas Totales</div>
                                                    <Icon.TrendUp className="text-success" size={20} />
                                                </div>
                                                <div className="heading4">${dashboardStats?.totalSales ? Number(dashboardStats.totalSales).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</div>
                                                <div className="text-success text-xs mt-3 flex items-center gap-1 font-bold">
                                                    +15% <span className="text-secondary font-normal">vs mes anterior</span>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-white rounded-xl border border-line shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Pedidos Nuevos</div>
                                                    <Icon.Cube className="text-blue-500" size={20} />
                                                </div>
                                                <div className="heading4">{dashboardStats?.newOrders ?? 0}</div>
                                                <div className="text-success text-xs mt-3 flex items-center gap-1 font-bold">
                                                    +8.4% <span className="text-secondary font-normal">vs ayer</span>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-white rounded-xl border border-line shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-secondary text-sm font-medium">Clientes Nuevos</div>
                                                    <Icon.Users className="text-purple-500" size={20} />
                                                </div>
                                                <div className="heading4">{dashboardStats?.newClients ?? 0}</div>
                                                <div className="text-success text-xs mt-3 flex items-center gap-1 font-bold">
                                                    +12% <span className="text-secondary font-normal">esta semana</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8">
                                            <div className="heading6 mb-4">Rendimiento Mensual</div>
                                            <div className="bg-surface rounded-2xl border border-line p-8">
                                                <div className="flex items-end gap-3 h-48 justify-around">
                                                    {dashboardStats?.monthlyPerformance && dashboardStats.monthlyPerformance.length > 0 ? (
                                                        dashboardStats.monthlyPerformance.map((item, i) => {
                                                            const maxVal = Math.max(...dashboardStats.monthlyPerformance.map(p => Number(p.total))) || 1;
                                                            const height = Math.max((Number(item.total) / maxVal) * 100, 5); // Min 5% height
                                                            return (
                                                                <div key={i} className="w-12 bg-black rounded-t-lg transition-all hover:bg-primary cursor-pointer relative group" style={{ height: `${height}%` }}>
                                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                        ${Number(item.total).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-secondary">Cargando datos del gráfico...</div>
                                                    )}
                                                </div>
                                                <div className="flex justify-around mt-4 text-xs font-bold text-secondary">
                                                    {dashboardStats?.monthlyPerformance?.map((item, i) => (
                                                        <span key={i}>{item.day}</span>
                                                    )) ?? <span>Cargando...</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-surface rounded-xl border border-line p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Icon.Lightbulb size={24} className="text-yellow" />
                                                    <div className="heading6">Sugerencias Inteligentes</div>
                                                </div>
                                                <ul className="space-y-4">
                                                    <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-line hover:border-yellow transition-colors cursor-pointer" onClick={() => setActiveTab('prices')}>
                                                        <div className="w-2 h-2 rounded-full bg-red mt-2 shrink-0"></div>
                                                        <div>
                                                            <div className="font-bold text-sm">Ajustar Precios de Inventario Antiguo</div>
                                                            <div className="text-xs text-secondary mt-1">3 productos tienen baja rotación. Considera una oferta.</div>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-line hover:border-success transition-colors cursor-pointer" onClick={() => setActiveTab('prices')}>
                                                        <div className="w-2 h-2 rounded-full bg-success mt-2 shrink-0"></div>
                                                        <div>
                                                            <div className="font-bold text-sm">Optimizar Márgenes</div>
                                                            <div className="text-xs text-secondary mt-1">El margen promedio es del 35%. Puedes mejorarlo en Categoría Juguetes.</div>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="bg-surface rounded-xl border border-line p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Icon.ChartPieSlice size={24} className="text-blue-500" />
                                                    <div className="heading6">Salud Financiera</div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-secondary">Rentabilidad de Ventas</span>
                                                            <span className="font-bold text-success">35%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                                                            <div className="h-full bg-success w-[35%]"></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-secondary">Costo Operativo Est.</span>
                                                            <span className="font-bold">12%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                                                            <div className="h-full bg-orange-400 w-[12%]"></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-secondary">Rotación de Inventario</span>
                                                            <span className="font-bold text-blue-500">Alta</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 w-[78%]"></div>
                                                        </div>
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
                                                            <td className="py-4 font-bold">${Number(product.price).toFixed(2)}</td>
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

                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            <div className="p-5 rounded-xl bg-surface border border-line">
                                                <div className="text-secondary text-xs uppercase font-bold mb-1">Margen Promedio</div>
                                                <div className="heading4 text-success">
                                                    {adminProductsList.length > 0 ? (
                                                        Math.round(adminProductsList.reduce((acc: any, curr: any) => acc + (curr.business?.margin || 0), 0) / adminProductsList.length) + '%'
                                                    ) : '0%'}
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-xl bg-surface border border-line">
                                                <div className="text-secondary text-xs uppercase font-bold mb-1">Oportunidades de Precio</div>
                                                <div className="heading4 text-yellow">
                                                    {(adminProductsList.filter((p: any) => p.business?.margin < 25)).length} <span className="text-sm text-secondary font-normal">productos bajo margen</span>
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
                                                                <td className="py-4 font-medium text-secondary text-sm">${Number(product.business?.cost || 0).toFixed(2)}</td>
                                                                <td className="py-4 font-bold text-sm">${Number(product.price).toFixed(2)}</td>
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
                                        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                                            <button className="px-4 py-1.5 rounded-full bg-black text-white text-sm">Todos (2,450)</button>
                                            <button className="px-4 py-1.5 rounded-full bg-surface border border-line text-sm">Nuevos (12)</button>
                                            <button className="px-4 py-1.5 rounded-full bg-surface border border-line text-sm">En Proceso (45)</button>
                                            <button className="px-4 py-1.5 rounded-full bg-surface border border-line text-sm">Enviados (180)</button>
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
                                                    {adminOrdersList.length > 0 ? adminOrdersList.map((order) => (
                                                        <tr key={order.id} className="border-b border-line last:border-0 hover:bg-surface duration-300 text-sm">
                                                            <td className="py-4 font-bold">#{order.id}</td>
                                                            <td className="py-4">{order.user_name || 'Cliente'}</td>
                                                            <td className="py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                                                            <td className="py-4 font-bold">${Number(order.total).toFixed(2)}</td>
                                                            <td className="py-4">
                                                                <span className={`tag px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-yellow bg-opacity-10 text-yellow' : 'bg-success bg-opacity-10 text-success'}`}>
                                                                    {order.status === 'pending' ? 'Pendiente' : order.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-4">
                                                                <button className="text-button-uppercase text-xs underline font-bold" onClick={() => {
                                                                    handleViewOrder(order.id)
                                                                }}>Ver Detalles</button>
                                                            </td>
                                                        </tr>
                                                    )) : (
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
                                        <div className="heading5 pb-4">Balances Financieros</div>
                                        <div className="p-8 bg-black text-white rounded-2xl mb-8">
                                            <div className="text-gray-400 text-sm">Balance General (Ventas Totales)</div>
                                            <div className="heading2 mt-2">${dashboardStats?.totalSales ? Number(dashboardStats.totalSales).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</div>
                                            <div className="mt-6 flex gap-8">
                                                <div>
                                                    <div className="text-gray-400 text-xs uppercase">Ingresos (Histórico)</div>
                                                    <div className="heading5">${dashboardStats?.totalSales ? Number(dashboardStats.totalSales).toLocaleString('en-US', { minimumFractionDigits: 0 }) : '0'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400 text-xs uppercase">Gastos (Estimado)</div>
                                                    <div className="heading5">$0</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="heading6 mb-4">Últimos Pedidos (Ingresos)</div>
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
                                                    <div className="font-bold text-success">+${Number(order.total).toFixed(2)}</div>
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
                                                    <h5 className="heading5 mt-1">4</h5>
                                                </div>
                                                <Icon.HourglassMedium className='text-4xl' />
                                            </div>
                                            <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="counter">
                                                    <span className="text-secondary">Pedidos Cancelados</span>
                                                    <h5 className="heading5 mt-1">12</h5>
                                                </div>
                                                <Icon.ReceiptX className='text-4xl' />
                                            </div>
                                            <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="counter">
                                                    <span className="text-secondary">Número Total de Pedidos</span>
                                                    <h5 className="heading5 mt-1">200</h5>
                                                </div>
                                                <Icon.Package className='text-4xl' />
                                            </div>
                                        </div>
                                        <div className="recent_order pt-5 px-5 pb-2 mt-7 border border-line rounded-xl">
                                            <h6 className="heading6">Pedidos Recientes</h6>
                                            <div className="list overflow-x-auto w-full mt-5">
                                                <table className="w-full max-[1400px]:w-[700px] max-md:w-[700px]">
                                                    <thead className="border-b border-line">
                                                        <tr>
                                                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Pedido</th>
                                                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Productos</th>
                                                            <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Precio</th>
                                                            <th scope="col" className="pb-3 text-right text-sm font-bold uppercase text-secondary whitespace-nowrap">Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="item duration-300 border-b border-line">
                                                            <th scope="row" className="py-3 text-left">
                                                                <strong className="text-title">54312452</strong>
                                                            </th>
                                                            <td className="py-3">
                                                                <Link href={'/product/default'} className="product flex items-center gap-3">
                                                                    <Image src={'/images/product/1000x1000.png'} width={400} height={400} alt='Camiseta Deportiva' className="flex-shrink-0 w-12 h-12 rounded" />
                                                                    <div className="info flex flex-col">
                                                                        <strong className="product_name text-button">Camiseta Deportiva</strong>
                                                                        <span className="product_tag caption1 text-secondary">Mascotas, Ropa</span>
                                                                    </div>
                                                                </Link>
                                                            </td>
                                                            <td className="py-3 price">$45.00</td>
                                                            <td className="py-3 text-right">
                                                                <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-yellow text-yellow caption1 font-semibold">Pendiente</span>
                                                            </td>
                                                        </tr>
                                                        <tr className="item duration-300 border-b border-line">
                                                            <th scope="row" className="py-3 text-left">
                                                                <strong className="text-title">54312452</strong>
                                                            </th>
                                                            <td className="py-3">
                                                                <Link href={'/product/default'} className="product flex items-center gap-3">
                                                                    <Image src={'/images/product/1000x1000.png'} width={400} height={400} alt='Pantalones de Cuero Sintético' className="flex-shrink-0 w-12 h-12 rounded" />
                                                                    <div className="info flex flex-col">
                                                                        <strong className="product_name text-button">Pantalones de Cuero Sintético</strong>
                                                                        <span className="product_tag caption1 text-secondary">Mascotas, Ropa</span>
                                                                    </div>
                                                                </Link>
                                                            </td>
                                                            <td className="py-3 price">$45.00</td>
                                                            <td className="py-3 text-right">
                                                                <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-purple text-purple caption1 font-semibold">Enviado</span>
                                                            </td>
                                                        </tr>
                                                        <tr className="item duration-300 border-b border-line">
                                                            <th scope="row" className="py-3 text-left">
                                                                <strong className="text-title">54312452</strong>
                                                            </th>
                                                            <td className="py-3">
                                                                <Link href={'/product/default'} className="product flex items-center gap-3">
                                                                    <Image src={'/images/product/1000x1000.png'} width={400} height={400} alt='Top de Punto con Cuello en V' className="flex-shrink-0 w-12 h-12 rounded" />
                                                                    <div className="info flex flex-col">
                                                                        <strong className="product_name text-button">Top de Punto con Cuello en V</strong>
                                                                        <span className="product_tag caption1 text-secondary">Mascotas, Ropa</span>
                                                                    </div>
                                                                </Link>
                                                            </td>
                                                            <td className="py-3 price">$45.00</td>
                                                            <td className="py-3 text-right">
                                                                <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-success text-success caption1 font-semibold">Completado</span>
                                                            </td>
                                                        </tr>
                                                        <tr className="item duration-300 border-b border-line">
                                                            <th scope="row" className="py-3 text-left">
                                                                <strong className="text-title">54312452</strong>
                                                            </th>
                                                            <td className="py-3">
                                                                <Link href={'/product/default'} className="product flex items-center gap-3">
                                                                    <Image src={'/images/product/1000x1000.png'} width={400} height={400} alt='Camiseta Deportiva' className="flex-shrink-0 w-12 h-12 rounded" />
                                                                    <div className="info flex flex-col">
                                                                        <strong className="product_name text-button">Pantalones de Cuero Sintético</strong>
                                                                        <span className="product_tag caption1 text-secondary">Mascotas, Ropa</span>
                                                                    </div>
                                                                </Link>
                                                            </td>
                                                            <td className="py-3 price">$45.00</td>
                                                            <td className="py-3 text-right">
                                                                <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-purple text-purple caption1 font-semibold">Enviado</span>
                                                            </td>
                                                        </tr>
                                                        <tr className="item duration-300">
                                                            <th scope="row" className="py-3 text-left">
                                                                <strong className="text-title">54312452</strong>
                                                            </th>
                                                            <td className="py-3">
                                                                <Link href={'/product/default'} className="product flex items-center gap-3">
                                                                    <Image src={'/images/product/1000x1000.png'} width={400} height={400} alt='Top de Punto con Cuello en V' className="flex-shrink-0 w-12 h-12 rounded" />
                                                                    <div className="info flex flex-col">
                                                                        <strong className="product_name text-button">Top de Punto con Cuello en V</strong>
                                                                        <span className="product_tag caption1 text-secondary">Mascotas, Ropa</span>
                                                                    </div>
                                                                </Link>
                                                            </td>
                                                            <td className="py-3 price">$45.00</td>
                                                            <td className="py-3 text-right">
                                                                <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-red text-red caption1 font-semibold">Cancelado</span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tab text-content overflow-hidden w-full p-7 border border-line rounded-xl ${activeTab === 'orders' ? 'block' : 'hidden'}`}>
                                        <h6 className="heading6">Tus Pedidos</h6>
                                        <div className="w-full overflow-x-auto">
                                            <div className="menu-tab grid grid-cols-5 max-lg:w-[500px] border-b border-line mt-3">
                                                {[
                                                    { id: 'all', label: 'Todos' },
                                                    { id: 'pending', label: 'Pendientes' },
                                                    { id: 'delivery', label: 'Enviados' },
                                                    { id: 'completed', label: 'Completados' },
                                                    { id: 'canceled', label: 'Cancelados' }
                                                ].map((item, index) => (
                                                    <button
                                                        key={index}
                                                        className={`item relative px-3 py-2.5 text-secondary text-center duration-300 hover:text-black border-b-2 ${activeOrders === item.id ? 'active border-black' : 'border-transparent'}`}
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
                                            <div className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-title">Número de Pedido:</strong>
                                                        <strong className="order_number text-button uppercase">s184989823</strong>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-title">Estado del pedido:</strong>
                                                        <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-purple text-purple caption1 font-semibold">Enviado</span>
                                                    </div>
                                                </div>
                                                <div className="list_prd px-5">
                                                    <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                                        <Link href={'/product/default'} className="flex items-center gap-5">
                                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={'/images/product/1000x1000.png'}
                                                                    width={1000}
                                                                    height={1000}
                                                                    alt={'Camiseta Deportiva'}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="prd_name text-title">Camiseta Deportiva</div>
                                                                <div className="caption1 text-secondary mt-2">
                                                                    <span className="prd_size uppercase">XL</span>
                                                                    <span>/</span>
                                                                    <span className="prd_color capitalize">Amarillo</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className='text-title'>
                                                            <span className="prd_quantity">1</span>
                                                            <span> X </span>
                                                            <span className="prd_price">$45.00</span>
                                                        </div>
                                                    </div>
                                                    <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                                        <Link href={'/product/default'} className="flex items-center gap-5">
                                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={'/images/product/1000x1000.png'}
                                                                    width={1000}
                                                                    height={1000}
                                                                    alt={'Camiseta Deportiva'}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="prd_name text-title">Camiseta Deportiva</div>
                                                                <div className="caption1 text-secondary mt-2">
                                                                    <span className="prd_size uppercase">XL</span>
                                                                    <span>/</span>
                                                                    <span className="prd_color capitalize">Blanco</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className='text-title'>
                                                            <span className="prd_quantity">2</span>
                                                            <span> X </span>
                                                            <span className="prd_price">$70.00</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4 p-5">
                                                    <button className="button-main" onClick={() => setOpenDetail(true)}>Detalles del Pedido</button>
                                                    <button className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white">Cancelar Pedido</button>
                                                </div>
                                            </div>
                                            <div className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-title">Número de Pedido:</strong>
                                                        <strong className="order_number text-button uppercase">s184989824</strong>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-title">Estado del pedido:</strong>
                                                        <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-yellow text-yellow caption1 font-semibold">Pendiente</span>
                                                    </div>
                                                </div>
                                                <div className="list_prd px-5">
                                                    <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                                        <Link href={'/product/default'} className="flex items-center gap-5">
                                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={'/images/product/1000x1000.png'}
                                                                    width={1000}
                                                                    height={1000}
                                                                    alt={'Camiseta Deportiva'}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="prd_name text-title">Camiseta Deportiva</div>
                                                                <div className="caption1 text-secondary mt-2">
                                                                    <span className="prd_size uppercase">L</span>
                                                                    <span>/</span>
                                                                    <span className="prd_color capitalize">Rosa</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className='text-title'>
                                                            <span className="prd_quantity">1</span>
                                                            <span> X </span>
                                                            <span className="prd_price">$69.00</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4 p-5">
                                                    <button className="button-main" onClick={() => setOpenDetail(true)}>Detalles del Pedido</button>
                                                    <button className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white">Cancelar Pedido</button>
                                                </div>
                                            </div>
                                            <div className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-title">Número de Pedido:</strong>
                                                        <strong className="order_number text-button uppercase">s184989824</strong>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-title">Estado del pedido:</strong>
                                                        <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-success text-success caption1 font-semibold">Completado</span>
                                                    </div>
                                                </div>
                                                <div className="list_prd px-5">
                                                    <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                                        <Link href={'/product/default'} className="flex items-center gap-5">
                                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={'/images/product/1000x1000.png'}
                                                                    width={1000}
                                                                    height={1000}
                                                                    alt={'Camiseta Deportiva'}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="prd_name text-title">Camiseta Deportiva</div>
                                                                <div className="caption1 text-secondary mt-2">
                                                                    <span className="prd_size uppercase">L</span>
                                                                    <span>/</span>
                                                                    <span className="prd_color capitalize">Blanco</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className='text-title'>
                                                            <span className="prd_quantity">1</span>
                                                            <span> X </span>
                                                            <span className="prd_price">$32.00</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4 p-5">
                                                    <button className="button-main" onClick={() => setOpenDetail(true)}>Detalles del Pedido</button>
                                                    <button className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white">Cancelar Pedido</button>
                                                </div>
                                            </div>
                                            <div className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                                                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-title">Número de Pedido:</strong>
                                                        <strong className="order_number text-button uppercase">s184989824</strong>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-title">Estado del pedido:</strong>
                                                        <span className="tag px-4 py-1.5 rounded-full bg-opacity-10 bg-red text-red caption1 font-semibold">Cancelado</span>
                                                    </div>
                                                </div>
                                                <div className="list_prd px-5">
                                                    <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                                        <Link href={'/product/default'} className="flex items-center gap-5">
                                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={'/images/product/1000x1000.png'}
                                                                    width={1000}
                                                                    height={1000}
                                                                    alt={'Camiseta Deportiva'}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="prd_name text-title">Camiseta Deportiva</div>
                                                                <div className="caption1 text-secondary mt-2">
                                                                    <span className="prd_size uppercase">M</span>
                                                                    <span>/</span>
                                                                    <span className="prd_color capitalize">Negro</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className='text-title'>
                                                            <span className="prd_quantity">1</span>
                                                            <span> X </span>
                                                            <span className="prd_price">$49.00</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4 p-5">
                                                    <button className="button-main" onClick={() => setOpenDetail(true)}>Detalles del Pedido</button>
                                                    <button className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white">Cancelar Pedido</button>
                                                </div>
                                            </div>
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
                                                <button className="button-main py-3 px-10 rounded-full font-bold bg-black text-white hover:bg-primary transition-all">Guardar Direcciones</button>
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
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="firstName" type="text" defaultValue={user.name.split(' ')[0]} placeholder='Nombre' required />
                                                </div>
                                                <div className="last-name">
                                                    <label htmlFor="lastName" className='caption1 capitalize'>Apellido <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="lastName" type="text" defaultValue={user.name.split(' ').slice(1).join(' ')} placeholder='Apellido' required />
                                                </div>
                                                <div className="phone-number">
                                                    <label htmlFor="phoneNumber" className='caption1 capitalize'>Número de Teléfono <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="phoneNumber" type="text" placeholder="Número de teléfono" />
                                                </div>
                                                <div className="email">
                                                    <label htmlFor="email" className='caption1 capitalize'>Correo Electrónico <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="email" type="email" defaultValue={user.email} placeholder="Correo electrónico" required disabled />
                                                </div>
                                                <div className="gender">
                                                    <label htmlFor="gender" className='caption1 capitalize'>Género <span className='text-red'>*</span></label>
                                                    <div className="select-block mt-2">
                                                        <select className="border border-line px-4 py-3 w-full rounded-lg" id="gender" name="gender" defaultValue={'default'}>
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
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="birth" type="date" placeholder="Fecha de Nacimiento" />
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
                                                <button className="button-main py-3 px-10 rounded-full font-bold bg-black text-white hover:bg-primary transition-all">Guardar Cambios</button>
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
                <div className={`modal-order-detail-main grid grid-cols-2 w-[1160px] bg-white rounded-2xl ${openDetail ? 'open' : ''}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <div className="info p-10 border-r border-line">
                        <h5 className="heading5">Detalles del Pedido</h5>
                        <div className="list_info grid grid-cols-2 gap-10 gap-y-8 mt-5">
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Información de Contacto</strong>
                                <h6 className="heading6 order_name mt-2">{user.name}</h6>
                                <h6 className="heading6 order_phone mt-2">(+593) 99 999 9999</h6>
                                <h6 className="heading6 normal-case order_email mt-2">{user.email}</h6>
                            </div>
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Método de Pago</strong>
                                <h6 className="heading6 order_payment mt-2">Pago contra entrega</h6>
                            </div>
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Dirección de Envío</strong>
                                <h6 className="heading6 order_shipping_address mt-2">Quito, Ecuador</h6>
                            </div>
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Dirección de Facturación</strong>
                                <h6 className="heading6 order_billing_address mt-2">Quito, Ecuador</h6>
                            </div>
                            <div className="info_item">
                                <strong className="text-button-uppercase text-secondary">Empresa</strong>
                                <h6 className="heading6 order_company mt-2">-</h6>
                            </div>
                        </div>
                    </div>
                    <div className="list p-10">
                        <h5 className="heading5">Artículos</h5>
                        <div className="list_prd">
                            <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                <Link href={'/product/default'} className="flex items-center gap-5">
                                    <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                        <Image
                                            src={'/images/product/1000x1000.png'}
                                            width={1000}
                                            height={1000}
                                            alt={'Camiseta Deportiva'}
                                            className='w-full h-full object-cover'
                                        />
                                    </div>
                                    <div>
                                        <div className="prd_name text-title">Camiseta Deportiva</div>
                                        <div className="caption1 text-secondary mt-2">
                                            <span className="prd_size uppercase">XL</span>
                                            <span>/</span>
                                            <span className="prd_color capitalize">Amarillo</span>
                                        </div>
                                    </div>
                                </Link>
                                <div className='text-title'>
                                    <span className="prd_quantity">1</span>
                                    <span> X </span>
                                    <span className="prd_price">$45.00</span>
                                </div>
                            </div>
                            <div className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                <Link href={'/product/default'} className="flex items-center gap-5">
                                    <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                        <Image
                                            src={'/images/product/1000x1000.png'}
                                            width={1000}
                                            height={1000}
                                            alt={'Camiseta Deportiva'}
                                            className='w-full h-full object-cover'
                                        />
                                    </div>
                                    <div>
                                        <div className="prd_name text-title">Camiseta Deportiva</div>
                                        <div className="caption1 text-secondary mt-2">
                                            <span className="prd_size uppercase">XL</span>
                                            <span>/</span>
                                            <span className="prd_color capitalize">Blanco</span>
                                        </div>
                                    </div>
                                </Link>
                                <div className='text-title'>
                                    <span className="prd_quantity">2</span>
                                    <span> X </span>
                                    <span className="prd_price">$70.00</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-5">
                            <strong className="text-title">Envío</strong>
                            <strong className="order_ship text-title">Gratis</strong>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <strong className="text-title">Descuentos</strong>
                            <strong className="order_discounts text-title">-$80.00</strong>
                        </div>
                        <div className="flex items-center justify-between mt-5 pt-5 border-t border-line">
                            <h5 className="heading5">Subtotal</h5>
                            <h5 className="order_total heading5">$105.00</h5>
                        </div>
                    </div>
                </div>
            </div>
            {isProductModalOpen && (
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
                                        <label className="text-secondary text-sm font-bold uppercase mb-2 block">Precio (PVP)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                                            <input type="number" step="0.01" className="border border-line rounded-lg pl-8 pr-4 py-3 w-full focus:border-black outline-none transition-all"
                                                value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-secondary text-sm font-bold uppercase mb-2 block">Costo de Negocio</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                                            <input type="number" step="0.01" className="border border-line rounded-lg pl-8 pr-4 py-3 w-full focus:border-black outline-none transition-all"
                                                value={productForm.cost} onChange={e => setProductForm({ ...productForm, cost: e.target.value })} required />
                                        </div>
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
            )}

            {isOrderModalOpen && selectedOrder && (
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
                                            <span className="text-secondary">Subtotal</span>
                                            <span className="font-bold">${Number(selectedOrder.total).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-secondary">Envío</span>
                                            <span className="font-bold text-success">Gratis</span>
                                        </div>
                                        <div className="pt-3 border-t border-line flex justify-between items-center">
                                            <span className="text-lg font-bold">Total</span>
                                            <span className="text-xl font-bold text-primary">${Number(selectedOrder.total).toFixed(2)}</span>
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
                                                    <td className="px-6 py-4 text-right">${Number(item.price).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-primary">${(Number(item.price) * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-line flex justify-between items-center bg-white rounded-b-2xl">
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${selectedOrder.status === 'delivered' ? 'bg-success/10 text-success' :
                                    selectedOrder.status === 'canceled' ? 'bg-red/10 text-red' : 'bg-primary/10 text-primary'
                                    }`}>
                                    Estado: {selectedOrder.status}
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-8 py-3 rounded-full border border-line hover:bg-surface transition-all font-bold" onClick={() => setIsOrderModalOpen(false)}>
                                    Cerrar
                                </button>
                                <button className="button-main bg-black text-white px-10 py-3 rounded-full hover:bg-primary transition-all font-bold" onClick={() => {
                                    handleUpdateOrderStatus(selectedOrder.id, 'en route')
                                }}>
                                    Confirmar Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyAccount;