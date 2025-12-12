'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType';
import { useModalCartContext } from '@/context/ModalCartContext'
import { useCart } from '@/context/CartContext'
import { countdownTime } from '@/store/countdownTime'
import CountdownTimeType from '@/type/CountdownType';
import { fetchProducts } from '@/lib/products'

const ModalCart = ({ serverTimeLeft }: { serverTimeLeft: CountdownTimeType }) => {
    const [timeLeft, setTimeLeft] = useState(serverTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(countdownTime());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const [activeTab, setActiveTab] = useState<string | undefined>('')
    const { isModalOpen, closeModalCart } = useModalCartContext();
    const { cartState, addToCart, removeFromCart, updateCart } = useCart()
    const [suggested, setSuggested] = useState<ProductType[]>([])
    const [loadingSuggested, setLoadingSuggested] = useState<boolean>(false)
    const [errorSuggested, setErrorSuggested] = useState<string | null>(null)

    useEffect(() => {
        const loadSuggested = async () => {
            setLoadingSuggested(true)
            try {
                const data = await fetchProducts()
                setSuggested(data.slice(0, 4))
                setErrorSuggested(null)
            } catch (err: any) {
                setErrorSuggested(err?.message ?? 'No se pudieron cargar sugerencias')
            } finally {
                setLoadingSuggested(false)
            }
        }
        loadSuggested()
    }, [])

    const handleAddToCart = (productItem: ProductType) => {
        // Desde sugerencias siempre agregamos 1 unidad, sin importar el valor por defecto del producto
        const quantityToAdd = 1
        addToCart({ ...productItem, quantityPurchase: quantityToAdd })
    };

    const handleActiveTab = (tab: string) => {
        setActiveTab(tab)
    }

    let moneyForFreeship = 150;
    const totalCart = cartState.cartArray.reduce(
        (acc, item) => acc + Number(item.price ?? 0) * Number(item.quantity ?? 1),
        0
    )
    let [discountCart, setDiscountCart] = useState<number>(0)

    return (
        <>
            <div className={`modal-cart-block`} onClick={closeModalCart}>
                <div
                    className={`modal-cart-main flex ${isModalOpen ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="left w-1/2 border-r border-line py-6 max-md:hidden">
                        <div className="heading5 px-6 pb-3">Tambien te puede gustar</div>
                        <div className="list px-6">
                            {loadingSuggested && (
                                <div className="py-4 text-secondary">Cargando sugerencias...</div>
                            )}
                            {errorSuggested && !loadingSuggested && (
                                <div className="py-4 text-secondary">No se pudieron cargar sugerencias.</div>
                            )}
                            {suggested.map((product) => {
                                const firstImage = Array.isArray(product.images) ? product.images[0] : null
                                const src = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url ?? '/images/product/1.jpg'
                                return (
                                    <div key={product.id} className='item py-5 flex items-center justify-between gap-3 border-b border-line'>
                                        <div className="infor flex items-center gap-5">
                                            <div className="bg-img">
                                                <Image
                                                    src={src}
                                                    width={300}
                                                    height={300}
                                                    alt={product.name}
                                                    className='w-[100px] aspect-square flex-shrink-0 rounded-lg'
                                                />
                                            </div>
                                            <div className=''>
                                                <div className="name text-button">{product.name}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="product-price text-title">${product.price}.00</div>
                                                    <div className="product-origin-price text-title text-secondary2"><del>${product.originPrice}.00</del></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="text-xl bg-white w-10 h-10 rounded-xl border border-black flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAddToCart(product)
                                            }}
                                        >
                                            <Icon.Handbag />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="right cart-block md:w-1/2 w-full py-6 relative overflow-hidden">
                        <div className="heading px-6 pb-3 flex items-center justify-between relative">
                            <div className="heading5">Carrito de compras</div>
                            <div
                                className="close-btn absolute right-6 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                onClick={closeModalCart}
                            >
                                <Icon.X size={14} />
                            </div>
                        </div>
                 
                        <div className="heading banner mt-3 px-6">
                            <div className="text">Compra <span className="text-button"> $<span className="more-price">{moneyForFreeship - totalCart > 0 ? (<>{moneyForFreeship - totalCart}</>) : (0)}</span>.00 </span>
                                <span>más para obtener </span>
                                <span className="text-button">envío gratis</span></div>
                            <div className="tow-bar-block mt-3">
                                <div
                                    className="progress-line"
                                    style={{ width: totalCart <= moneyForFreeship ? `${(totalCart / moneyForFreeship) * 100}%` : `100%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="list-product px-6">
            {cartState.cartArray.map((product) => (
                <div key={product.id} className='item py-5 flex items-center justify-between gap-3 border-b border-line'>
                    <div className="infor flex items-center gap-3 w-full">
                        <div className="bg-img w-[100px] aspect-square flex-shrink-0 rounded-lg overflow-hidden">
                            {(() => {
                                const imgs = Array.isArray(product.images) ? product.images : []
                                const first = imgs[0]
                                const src = typeof first === 'string' ? first : (first as any)?.url ?? ''
                                return (
                                    <Image
                                        src={src || '/images/product/1.jpg'}
                                        width={300}
                                        height={300}
                                        alt={product.name}
                                        className='w-full h-full object-cover'
                                    />
                                )
                            })()}
                        </div>
                        <div className='w-full'>
                            <div className="flex items-center justify-between w-full">
                                <div className="name text-button">{product.name}</div>
                                                <div
                                                    className="remove-cart-btn caption1 font-semibold text-red underline cursor-pointer"
                                                    onClick={() => removeFromCart(product.id)}
                                                >
                                                    Quitar
                                                </div>
                                            </div>
                            <div className="flex items-center justify-between gap-2 mt-3 w-full">
                                <div className="flex items-center text-secondary2 capitalize">
                                    {(product.selectedSize || (product.sizes ?? [])[0] || '').toString()}/
                                    {(product.selectedColor || (product.variation ?? [])[0]?.color || '').toString()}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 border border-line rounded-md px-2 py-1">
                                        <button
                                            aria-label="Decrease quantity"
                                            className="text-lg px-2 disabled:text-secondary2"
                                            onClick={() => updateCart(product.id, Math.max((product.quantity ?? 1) - 1, 1), product.selectedSize, product.selectedColor)}
                                            disabled={(product.quantity ?? 1) <= 1}
                                        >
                                            -
                                        </button>
                                        <div className="text-button min-w-[24px] text-center">{product.quantity ?? 1}</div>
                                        <button
                                            aria-label="Increase quantity"
                                            className="text-lg px-2"
                                            onClick={() => updateCart(product.id, (product.quantity ?? 1) + 1, product.selectedSize, product.selectedColor)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="product-price text-title">
                                        ${Number(product.price ?? 0) * Number(product.quantity ?? 1)}.00
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
                        </div>
                        <div className="footer-modal bg-white absolute bottom-0 left-0 w-full">
                            <div className="flex items-center justify-center lg:gap-14 gap-8 px-6 py-4 border-b border-line">
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('note')}
                                >
                                    <Icon.NotePencil className='text-xl' />
                                    <div className="caption1">Nota</div>
                                </div>
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('shipping')}
                                >
                                    <Icon.Truck className='text-xl' />
                                    <div className="caption1">Envío</div>
                                </div>
                                <div
                                    className="item flex items-center gap-3 cursor-pointer"
                                    onClick={() => handleActiveTab('coupon')}
                                >
                                    <Icon.Tag className='text-xl' />
                                    <div className="caption1">Cupón</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-6 px-6">
                                    <div className="heading5">Subtotal</div>
                                <div className="heading5">${totalCart}.00</div>
                            </div>
                            <div className="block-button text-center p-6">
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={'/cart'}
                                        className='button-main basis-1/2 bg-white border border-black text-black text-center uppercase'
                                        onClick={closeModalCart}
                                    >
                                        Ver carrito
                                    </Link>
                                    <Link
                                        href={'/checkout'}
                                        className='button-main basis-1/2 text-center uppercase'
                                        onClick={closeModalCart}
                                    >
                                        Pagar
                                    </Link>
                                </div>
                                <div onClick={closeModalCart} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">O seguir comprando</div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'note' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.NotePencil className='text-xl' />
                                        <div className="caption1">Nota</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <textarea name="form-note" id="form-note" rows={4} placeholder='Agrega instrucciones para tu pedido...' className='caption1 py-3 px-4 bg-surface border-line rounded-md w-full'></textarea>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Guardar</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancelar</div>
                                </div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'shipping' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.Truck className='text-xl' />
                                        <div className="caption1">Calcular envío</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <div className="">
                                        <label htmlFor='select-country' className="caption1 text-secondary">País/región</label>
                                        <div className="select-block relative mt-2">
                                            <select
                                                id="select-country"
                                                name="select-country"
                                                className='w-full py-3 pl-5 rounded-xl bg-white border border-line'
                                                defaultValue={'País/región'}
                                            >
                                                <option value="Country/region" disabled>País/región</option>
                                                <option value="France">Francia</option>
                                                <option value="Spain">España</option>
                                                <option value="UK">Reino Unido</option>
                                                <option value="USA">Estados Unidos</option>
                                            </select>
                                            <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-5 right-2' />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor='select-state' className="caption1 text-secondary">Estado</label>
                                        <div className="select-block relative mt-2">
                                            <select
                                                id="select-state"
                                                name="select-state"
                                                className='w-full py-3 pl-5 rounded-xl bg-white border border-line'
                                                defaultValue={'Estado'}
                                            >
                                                <option value="State" disabled>Estado</option>
                                                <option value="Paris">Paris</option>
                                                <option value="Madrid">Madrid</option>
                                                <option value="London">London</option>
                                                <option value="New York">New York</option>
                                            </select>
                                            <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-5 right-2' />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor='select-code' className="caption1 text-secondary">Código postal</label>
                                        <input className="border-line px-5 py-3 w-full rounded-xl mt-3" id="select-code" type="text" placeholder="Código postal" />
                                    </div>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Calcular</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancelar</div>
                                </div>
                            </div>
                            <div className={`tab-item note-block ${activeTab === 'coupon' ? 'active' : ''}`}>
                                <div className="px-6 py-4 border-b border-line">
                                    <div className="item flex items-center gap-3 cursor-pointer">
                                        <Icon.Tag className='text-xl' />
                                        <div className="caption1">Agregar un cupón</div>
                                    </div>
                                </div>
                                <div className="form pt-4 px-6">
                                    <div className="">
                                        <label htmlFor='select-discount' className="caption1 text-secondary">Ingresa el código</label>
                                        <input className="border-line px-5 py-3 w-full rounded-xl mt-3" id="select-discount" type="text" placeholder="Código de descuento" />
                                    </div>
                                </div>
                                <div className="block-button text-center pt-4 px-6 pb-6">
                                    <div className='button-main w-full text-center' onClick={() => setActiveTab('')}>Aplicar</div>
                                    <div onClick={() => setActiveTab('')} className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block">Cancelar</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalCart
