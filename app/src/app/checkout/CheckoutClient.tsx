'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
import { Package, Truck, CreditCard, Building2, Banknote } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useSearchParams, useRouter } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { createOrder, getQuote } from '@/lib/api'

interface AddressData {
    firstName: string;
    lastName: string;
    company: string;
    country: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
}

interface SavedAddress {
    id: string;
    title: string;
    billing: AddressData;
    shipping: AddressData;
    isSame: boolean;
}

const emptyAddress: AddressData = {
    firstName: '',
    lastName: '',
    company: '',
    country: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
};

const fallbackItems = [
    {
        id: 'sample-1',
        name: 'Off-The-Shoulder Blouse',
        size: 'M',
        color: 'Pink',
        quantity: 2,
        price: 32.0,
        image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
    {
        id: 'sample-2',
        name: 'Raglan Sleeve T-Shirt',
        size: 'XS',
        color: 'White',
        quantity: 1,
        price: 28.0,
        image: 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=500',
    }
]

const fallbackSubtotal = fallbackItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

const Checkout = () => {
    const searchParams = useSearchParams()
    const discountParam = Number(searchParams.get('discount') ?? 0)
    const shipParam = Number(searchParams.get('ship') ?? 10)
    const safeDiscount = Number.isNaN(discountParam) ? 0 : discountParam
    const baseShip = Number.isNaN(shipParam) ? 5 : shipParam

    const [showLogin, setShowLogin] = useState(false)
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'transfer' | 'cash'>('credit')
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
    const [transferSecondsLeft, setTransferSecondsLeft] = useState(600)

    // Address management state
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string>('one-time')
    const [tempAddress, setTempAddress] = useState<AddressData>(emptyAddress)
    const [overwriteOriginal, setOverwriteOriginal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
    const { cartState, clearCart } = useCart()
    const router = useRouter()
    const [contactInfo, setContactInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    })

    useEffect(() => {
        const saved = localStorage.getItem('savedAddresses')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setSavedAddresses(parsed)
                if (parsed.length > 0) {
                    setSelectedAddressId(parsed[0].id)
                    setTempAddress(parsed[0].shipping)
                }
            } catch (e) {
                console.error('Error parsing addresses', e)
            }
        }
    }, [])


    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target
        setTempAddress(prev => ({ ...prev, [id]: value }))
    }

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setContactInfo(prev => ({ ...prev, [id]: value }))
    }

    const handleConfirmStep1 = () => {
        if (overwriteOriginal && selectedAddressId !== 'one-time') {
            const updated = savedAddresses.map(addr =>
                addr.id === selectedAddressId
                    ? { ...addr, shipping: tempAddress, billing: addr.isSame ? tempAddress : addr.billing }
                    : addr
            )
            setSavedAddresses(updated)
            localStorage.setItem('userAddresses', JSON.stringify(updated))
        }
        setCurrentStep(2)
    }

    const [quote, setQuote] = useState<{ subtotal: number, shipping: number, total: number } | null>(null)

    const normalizedCart = useMemo(
        () =>
            cartState.cartArray.map((item) => ({
                id: item.id,
                name: item.name,
                size: item.selectedSize || item.sizes?.[0] || '—',
                color: item.selectedColor || item.variation?.[0]?.color || '—',
                quantity: item.quantity,
                price: item.price,
                image: item.thumbImage?.[0] || '/images/placeholder.jpg',
            })),
        [cartState.cartArray]
    )

    useEffect(() => {
        const updateQuote = async () => {
            if (normalizedCart.length === 0) return;
            try {
                const res = await getQuote({
                    items: normalizedCart.map(i => ({ product_id: i.id, quantity: i.quantity })),
                    delivery_method: deliveryMethod
                });
                setQuote(res);
            } catch (err) {
                console.error("Error fetching quote", err);
            }
        };
        updateQuote();
    }, [normalizedCart, deliveryMethod]);

    const items = normalizedCart
    const subtotal = quote?.subtotal || 0
    const shipping = quote?.shipping || 0
    const total = quote?.total || 0

    useEffect(() => {
        if (normalizedCart.length === 0) {
            router.push('/cart')
        }
    }, [normalizedCart, router])

    useEffect(() => {
        if (paymentMethod !== 'transfer') {
            setTransferSecondsLeft(600)
            return
        }
        setTransferSecondsLeft(600)
    }, [paymentMethod])

    useEffect(() => {
        if (paymentMethod !== 'transfer') return
        const interval = setInterval(() => {
            setTransferSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [paymentMethod])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const isStep1 = currentStep === 1
    const isStep2 = currentStep === 2
    const isStep3 = currentStep === 3

    const handleFinalizeOrder = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setMessage({ text: 'Debes iniciar sesión para finalizar la compra.', type: 'error' });
            setShowLogin(true);
            setCurrentStep(1);
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const orderData = {
                total, // This is just for local UI, backend will re-calculate.
                status: 'pending',
                delivery_method: deliveryMethod,
                shipping_address: {
                    ...tempAddress,
                    ...contactInfo
                },
                payment_method: paymentMethod,
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };

            await createOrder(orderData);

            setMessage({ text: '¡Pedido realizado con éxito!', type: 'success' });
            clearCart();

            setTimeout(() => {
                router.push('/my-account');
            }, 2000);

        } catch (err: any) {
            setMessage({ text: err.message || 'Error al procesar el pedido', type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {message && (
                <div className={`fixed top-5 right-5 z-[200] p-4 rounded-lg shadow-2xl border ${message.type === 'success' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'} animate-fadeIn`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <Icon.CheckCircle size={24} weight="fill" /> : <Icon.Warning size={24} weight="fill" />}
                        <span className="font-semibold">{message.text}</span>
                    </div>
                </div>
            )}
            <div id="header" className='relative w-full'>
                <MenuOne />
            </div>
            <div className="bg-[#f7f8fb] py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#111827]">Checkout</h1>
                        <p className="mt-2 text-sm text-[#6b7280]">Complete su pedido en pocos pasos</p>
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { step: 1 as const, label: 'Envío' },
                                { step: 2 as const, label: 'Pago' },
                                { step: 3 as const, label: 'Confirmación' },
                            ].map(({ step, label }) => {
                                const active = currentStep === step
                                const done = currentStep > step
                                return (
                                    <div
                                        key={step}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${active ? 'border-[#2e4d4d] bg-[#2e4d4d1a]' : 'border-[#e5e7eb]'
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${active || done ? 'bg-[#2e4d4d] text-white' : 'bg-[#e5e7eb] text-[#6b7280]'
                                                }`}
                                        >
                                            {done ? '✓' : step}
                                        </div>
                                        <div className={`text-sm font-medium ${active ? 'text-[#1f3b3b]' : 'text-[#6b7280]'}`}>{label}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {isStep1 && (
                                <>
                                    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => setShowLogin(!showLogin)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#6b7280]">¿Ya tienes cuenta?</span>
                                                <button className="text-[#2e4d4d] hover:text-[#1f3b3b] font-medium">
                                                    Iniciar sesión
                                                </button>
                                            </div>
                                            <Icon.CaretDown
                                                className={`text-[#9ca3af] transition-transform ${showLogin ? 'rotate-180' : ''}`}
                                                size={20}
                                                weight="bold"
                                            />
                                        </div>

                                        {showLogin && (
                                            <div className="mt-4 grid sm:grid-cols-2 gap-4">
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Contraseña"
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <button className="sm:col-span-2 bg-[#1f3b3b] text-white rounded-lg px-4 py-2.5 font-medium hover:bg-[#2e4d4d] transition-colors">
                                                    Iniciar sesión
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                        <h2 className="text-xl font-semibold text-[#111827] mb-4">Información de contacto</h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                id="firstName"
                                                placeholder="Nombre *"
                                                value={contactInfo.firstName}
                                                onChange={handleContactChange}
                                                className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <input
                                                type="text"
                                                id="lastName"
                                                placeholder="Apellido *"
                                                value={contactInfo.lastName}
                                                onChange={handleContactChange}
                                                className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="Email *"
                                                value={contactInfo.email}
                                                onChange={handleContactChange}
                                                className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <input
                                                type="tel"
                                                id="phone"
                                                placeholder="Teléfono *"
                                                value={contactInfo.phone}
                                                onChange={handleContactChange}
                                                className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                        <h2 className="text-xl font-semibold text-[#111827] mb-4">Método de entrega</h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDeliveryMethod('delivery')}
                                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${deliveryMethod === 'delivery'
                                                    ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                    : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                    }`}
                                            >
                                                <Truck className={`w-8 h-8 mb-2 ${deliveryMethod === 'delivery' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                                <span className="font-medium text-[#111827]">Envío a domicilio</span>
                                                <span className="text-sm text-[#6b7280] mt-1">${baseShip.toFixed(2)}</span>
                                            </button>
                                            <button
                                                onClick={() => setDeliveryMethod('pickup')}
                                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${deliveryMethod === 'pickup'
                                                    ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                    : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                    }`}
                                            >
                                                <Package className={`w-8 h-8 mb-2 ${deliveryMethod === 'pickup' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                                <span className="font-medium text-[#111827]">Retiro en tienda</span>
                                                <span className="text-sm text-[#6b7280] mt-1">Gratis</span>
                                            </button>
                                        </div>

                                        {deliveryMethod === 'delivery' && (
                                            <div className="mt-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium text-[#111827]">Dirección de envío</h3>
                                                    {savedAddresses.length > 0 && (
                                                        <select
                                                            className="text-sm border border-[#e5e7eb] rounded-lg px-3 py-1.5"
                                                            value={selectedAddressId}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setSelectedAddressId(val);
                                                                if (val !== 'one-time') {
                                                                    const addr = savedAddresses.find(a => a.id === val);
                                                                    if (addr) setTempAddress(addr.shipping);
                                                                    setOverwriteOriginal(false);
                                                                } else {
                                                                    setTempAddress(emptyAddress);
                                                                }
                                                            }}
                                                        >
                                                            {savedAddresses.map(addr => (
                                                                <option key={addr.id} value={addr.id}>{addr.title}</option>
                                                            ))}
                                                            <option value="one-time">Usar otra dirección (un solo uso)</option>
                                                        </select>
                                                    )}
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <select
                                                        id="country"
                                                        value={tempAddress.country}
                                                        onChange={handleAddressChange}
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2 bg-white"
                                                    >
                                                        <option value="">País/Región *</option>
                                                        <option value="Ecuador">Ecuador</option>
                                                        <option value="España">España</option>
                                                        <option value="México">México</option>
                                                        <option value="Argentina">Argentina</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        id="city"
                                                        placeholder="Ciudad *"
                                                        value={tempAddress.city}
                                                        onChange={handleAddressChange}
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        id="zip"
                                                        placeholder="Código Postal *"
                                                        value={tempAddress.zip}
                                                        onChange={handleAddressChange}
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        id="street"
                                                        placeholder="Calle y número *"
                                                        value={tempAddress.street}
                                                        onChange={handleAddressChange}
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2"
                                                    />

                                                    {selectedAddressId !== 'one-time' && (
                                                        <div className="sm:col-span-2 flex items-center gap-2 p-3 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                                                            <input
                                                                type="checkbox"
                                                                id="overwrite"
                                                                checked={overwriteOriginal}
                                                                onChange={(e) => setOverwriteOriginal(e.target.checked)}
                                                                className="w-4 h-4 cursor-pointer text-[#2e4d4d] focus:ring-[#2e4d4d]"
                                                            />
                                                            <label htmlFor="overwrite" className="text-sm cursor-pointer text-[#6b7280]">Actualizar esta dirección guardada con los nuevos cambios</label>
                                                        </div>
                                                    )}

                                                    <textarea
                                                        placeholder="Notas adicionales (opcional)"
                                                        rows={3}
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {deliveryMethod === 'pickup' && (
                                            <div className="mt-6 p-4 bg-[#2e4d4d1a] rounded-lg border border-[#2e4d4d]/30">
                                                <p className="text-sm text-[#374151]">
                                                    <strong>Dirección de la tienda:</strong><br />
                                                    Av. Principal 123, Local 45<br />
                                                    Ciudad, CP 12345<br />
                                                    Horario: Lun-Vie 9:00-18:00
                                                </p>
                                            </div>
                                        )}
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                className="bg-[#1f3b3b] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-[#2e4d4d] transition-colors"
                                                onClick={handleConfirmStep1}
                                            >
                                                Continuar a pago
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {isStep2 && (
                                <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                    <h2 className="text-xl font-semibold text-[#111827] mb-4">Método de pago</h2>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setPaymentMethod('credit')}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'credit'
                                                ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                }`}
                                        >
                                            <CreditCard className={`w-5 h-5 ${paymentMethod === 'credit' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                            <span className="font-medium text-[#111827]">Tarjeta de crédito/débito</span>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('transfer')}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'transfer'
                                                ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                }`}
                                        >
                                            <Building2 className={`w-5 h-5 ${paymentMethod === 'transfer' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                            <span className="font-medium text-[#111827]">Transferencia bancaria</span>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'cash'
                                                ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                                }`}
                                        >
                                            <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                            <span className="font-medium text-[#111827]">Pago en efectivo</span>
                                        </button>
                                    </div>

                                    {paymentMethod === 'credit' && (
                                        <div className="mt-6 space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Número de tarjeta"
                                                className="w-full border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="MM/AA"
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="CVV"
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 text-[#2e4d4d] border-[#e5e7eb] rounded focus:ring-[#2e4d4d]" />
                                                <span className="text-sm text-[#6b7280]">Guardar tarjeta para futuras compras</span>
                                            </label>
                                        </div>
                                    )}

                                    {paymentMethod === 'transfer' && (
                                        <div className="mt-6 p-4 bg-[#f3f4f6] rounded-lg border border-[#e5e7eb] space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-[#374151] font-medium">Transferencia bancaria</p>
                                                <span className="text-sm font-semibold text-[#1f3b3b]">
                                                    Tiempo restante: {formatTime(transferSecondsLeft)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[#374151]">
                                                <strong>Datos bancarios:</strong><br />
                                                Banco: Banco Ejemplo<br />
                                                Cuenta: 1234567890<br />
                                                IBAN: ES91 2100 0418 4502 0005 1332<br />
                                                Concepto: Pedido #{Math.floor(Math.random() * 10000)}
                                            </p>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Referencia de pago"
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Monto pagado"
                                                    className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                                <input
                                                    type="file"
                                                    className="sm:col-span-2 border border-[#e5e7eb] text-[#6b7280] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'cash' && (
                                        <div className="mt-6 p-4 bg-[#fef9c3] rounded-lg border border-[#fde68a]">
                                            <p className="text-sm text-[#374151]">
                                                El pago se realizará al momento de {deliveryMethod === 'pickup' ? 'recoger' : 'recibir'} el pedido.
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-between">
                                        <button
                                            className="text-sm font-medium text-[#1f3b3b] border border-[#1f3b3b] rounded-lg px-4 py-2 hover:bg-[#2e4d4d1a] transition-colors"
                                            onClick={() => setCurrentStep(1)}
                                        >
                                            Volver a envío
                                        </button>
                                        <button
                                            className="bg-[#1f3b3b] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-[#2e4d4d] transition-colors"
                                            onClick={() => setCurrentStep(3)}
                                        >
                                            Ir a resumen
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isStep3 && (
                                <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                    <h2 className="text-xl font-semibold text-[#111827] mb-6">Confirmación de Pedido</h2>

                                    <div className="grid sm:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <h3 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-3">Contacto</h3>
                                            <p className="text-[#111827] font-medium">{contactInfo.firstName} {contactInfo.lastName}</p>
                                            <p className="text-sm text-[#6b7280]">{contactInfo.email}</p>
                                            <p className="text-sm text-[#6b7280]">{contactInfo.phone}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-3">Entrega</h3>
                                            {deliveryMethod === 'pickup' ? (
                                                <p className="text-sm text-[#374151]">Retiro en tienda (Gratis)</p>
                                            ) : (
                                                <>
                                                    <p className="text-[#111827] font-medium">{tempAddress.street}</p>
                                                    <p className="text-sm text-[#6b7280]">{tempAddress.city}, {tempAddress.zip}</p>
                                                    <p className="text-sm text-[#6b7280]">{tempAddress.country}</p>
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#6b7280] uppercase tracking-wider mb-3">Método de Pago</h3>
                                            <p className="text-[#111827] font-medium">
                                                {paymentMethod === 'credit' && 'Tarjeta de Crédito/Débito'}
                                                {paymentMethod === 'transfer' && 'Transferencia Bancaria'}
                                                {paymentMethod === 'cash' && 'Pago en Efectivo'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-8">
                                        <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                                            <Icon.CheckCircle weight="fill" />
                                            Revisa que toda la información sea correcta antes de confirmar.
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t border-[#e5e7eb]">
                                        <button
                                            className="text-sm font-medium text-[#1f3b3b] hover:underline"
                                            onClick={() => setCurrentStep(2)}
                                        >
                                            ← Volver a pago
                                        </button>
                                        <button
                                            className="bg-[#1f3b3b] text-white rounded-lg px-8 py-3 font-bold hover:bg-[#2e4d4d] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleFinalizeOrder}
                                            disabled={loading}
                                        >
                                            {loading ? 'Procesando...' : 'Finalizar Compra'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb] sticky top-8">
                                <h2 className="text-xl font-semibold text-[#111827] mb-4">Resumen del pedido</h2>

                                <div className="space-y-4 mb-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#f3f4f6] flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    width={80}
                                                    height={80}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-[#111827] truncate">{item.name}</h3>
                                                <p className="text-xs text-[#6b7280] mt-1">
                                                    {item.size} / {item.color}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-sm text-[#6b7280]">x{item.quantity}</span>
                                                    <span className="text-sm font-medium text-[#111827]">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-[#e5e7eb] pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">Subtotal</span>
                                        <span className="text-[#111827]">${subtotal.toFixed(2)}</span>
                                    </div>
                                    {safeDiscount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#6b7280]">Descuento</span>
                                            <span className="text-green-600">-${safeDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">Envío</span>
                                        <span className="text-[#111827]">
                                            {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-[#e5e7eb] pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold text-[#111827]">Total</span>
                                            <span className="text-lg font-semibold text-[#111827]">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="w-full mt-6 bg-[#1f3b3b] text-white rounded-lg px-6 py-3 font-medium hover:bg-[#2e4d4d] transition-colors"
                                    onClick={() => setCurrentStep(3)}
                                >
                                    Confirmar pedido
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6b7280]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Pago seguro y encriptado</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Checkout
