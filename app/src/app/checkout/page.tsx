'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
import { Package, Truck, CreditCard, Building2, Banknote } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useSearchParams } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr";

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

    const { cartState } = useCart()
    const [showLogin, setShowLogin] = useState(false)
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'transfer' | 'cash'>('credit')
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
    const [transferSecondsLeft, setTransferSecondsLeft] = useState(600)

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

    const usingFallback = normalizedCart.length === 0
    const items = usingFallback ? fallbackItems : normalizedCart
    const subtotal = usingFallback
        ? fallbackSubtotal
        : normalizedCart.reduce((total, item) => total + item.price * item.quantity, 0)
    const shipping = deliveryMethod === 'pickup' ? 0 : baseShip
    const total = subtotal - safeDiscount + shipping

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

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
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
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                                            active ? 'border-[#2e4d4d] bg-[#2e4d4d1a]' : 'border-[#e5e7eb]'
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                                                active || done ? 'bg-[#2e4d4d] text-white' : 'bg-[#e5e7eb] text-[#6b7280]'
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
                                                placeholder="Nombre *"
                                                className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Apellido *"
                                                className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email *"
                                                className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Teléfono *"
                                                className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(31,59,59,0.12)] p-6 border border-[#e5e7eb]">
                                        <h2 className="text-xl font-semibold text-[#111827] mb-4">Método de entrega</h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDeliveryMethod('delivery')}
                                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                                    deliveryMethod === 'delivery'
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
                                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                                    deliveryMethod === 'pickup'
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
                                                <h3 className="font-medium text-[#111827]">Dirección de envío</h3>
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <select className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2 bg-white">
                                                        <option>País/Región *</option>
                                                        <option>España</option>
                                                        <option>México</option>
                                                        <option>Argentina</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="Ciudad *"
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Código Postal *"
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Calle y número *"
                                                        className="border border-[#e5e7eb] placeholder:text-[#9ca3af] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#2e4d4d]/60 focus:border-transparent sm:col-span-2"
                                                    />
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
                                                onClick={() => setCurrentStep(2)}
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
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                                paymentMethod === 'credit'
                                                    ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                    : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                            }`}
                                        >
                                            <CreditCard className={`w-5 h-5 ${paymentMethod === 'credit' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                            <span className="font-medium text-[#111827]">Tarjeta de crédito/débito</span>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('transfer')}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                                paymentMethod === 'transfer'
                                                    ? 'border-[#2e4d4d] bg-[#2e4d4d1a]'
                                                    : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                                            }`}
                                        >
                                            <Building2 className={`w-5 h-5 ${paymentMethod === 'transfer' ? 'text-[#2e4d4d]' : 'text-[#94a3b8]'}`} />
                                            <span className="font-medium text-[#111827]">Transferencia bancaria</span>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                                paymentMethod === 'cash'
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
                                    <h2 className="text-xl font-semibold text-[#111827] mb-4">Confirmación</h2>
                                    <p className="text-[#374151] text-sm">
                                        Revisa los datos de envío y el método de pago. Cuando estés listo, confirma tu pedido.
                                    </p>
                                    <div className="mt-6 flex justify-between">
                                        <button
                                            className="text-sm font-medium text-[#1f3b3b] border border-[#1f3b3b] rounded-lg px-4 py-2 hover:bg-[#2e4d4d1a] transition-colors"
                                            onClick={() => setCurrentStep(2)}
                                        >
                                            Volver a pago
                                        </button>
                                        <button className="bg-[#1f3b3b] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-[#2e4d4d] transition-colors">
                                            Confirmar pedido
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
