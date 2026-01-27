'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { getQuote } from '@/lib/api'

const Cart = () => {


    const router = useRouter()
    const { cartState, updateCart, removeFromCart } = useCart();

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        // Tìm sản phẩm trong giỏ hàng
        const itemToUpdate = cartState.cartArray.find((item) => item.id === productId);

        // Kiểm tra xem sản phẩm có tồn tại không
        if (itemToUpdate) {
            // Truyền giá trị hiện tại của selectedSize và selectedColor
            updateCart(productId, newQuantity, itemToUpdate.selectedSize, itemToUpdate.selectedColor);
        }
    };

    const totalCart = cartState.cartArray.reduce(
        (acc, item) => acc + Number(item.price ?? 0) * Number(item.quantity ?? 1),
        0
    )
    const [vatRate, setVatRate] = useState(0)
    const [vatSubtotal, setVatSubtotal] = useState(0)
    const [vatAmount, setVatAmount] = useState(0)
    let [discountCart, setDiscountCart] = useState<number>(0)
    let [applyCode, setApplyCode] = useState<number>(0)
    const formattedSubtotal = totalCart.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedDiscount = discountCart.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedCartTotal = (totalCart - discountCart).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedVatSubtotal = vatSubtotal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedVatAmount = vatAmount.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const handleApplyCode = (minValue: number, discount: number) => {
        if (totalCart > minValue) {
            setApplyCode(minValue)
            setDiscountCart(discount)
        } else {
            alert(`Minimum order must be ${minValue}$`)
        }
    }

    if (totalCart < applyCode) {
        applyCode = 0
        discountCart = 0
    }

    useEffect(() => {
        const items = cartState.cartArray.map((item) => ({
            product_id: item.id,
            quantity: Number(item.quantity ?? 1)
        }))
        if (items.length === 0) {
            setVatRate(0)
            setVatSubtotal(0)
            setVatAmount(0)
            return
        }
        getQuote({ items, delivery_method: 'pickup' })
            .then((res: any) => {
                setVatRate(Number(res?.vat_rate ?? 0))
                setVatSubtotal(Number(res?.vat_subtotal ?? 0))
                setVatAmount(Number(res?.vat_amount ?? 0))
            })
            .catch((err) => {
                console.error('No se pudo calcular IVA del carrito', err)
                setVatRate(0)
                setVatSubtotal(0)
                setVatAmount(0)
            })
    }, [cartState.cartArray])

    const redirectToCheckout = () => {
        router.push(`/checkout?discount=${discountCart}&ship=0`)
    }

    return (
        <>
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex justify-between max-xl:flex-col gap-y-8">
                        <div className="xl:w-2/3 xl:pr-3 w-full">
                            
                            <div className="heading banner mt-5" />
                            <div className="list-product w-full sm:mt-7 mt-5">
                                <div className='w-full'>
                                    <div className="heading bg-surface bora-4 pt-4 pb-4">
                                        <div className="flex">
                                            <div className="w-1/2">
                                                <div className="text-button text-center">Productos</div>
                                            </div>
                                            <div className="w-1/12">
                                                <div className="text-button text-center">Precio</div>
                                            </div>
                                            <div className="w-1/6">
                                                <div className="text-button text-center">Cantidad</div>
                                            </div>
                                            <div className="w-1/6">
                                                <div className="text-button text-center">Total</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-product-main w-full mt-3">
                                        {cartState.cartArray.length < 1 ? (
                                            <p className='text-button pt-3'>No hay productos en el carrito</p>
                                        ) : (
                                            cartState.cartArray.map((product) => {
                                                const itemPrice = Number((product as any).price ?? 0)
                                                const itemQuantity = Number((product as any).quantity ?? 1)
                                                const itemTotal = itemPrice * itemQuantity
                                                return (
                                                    <div className="item flex md:mt-7 md:pb-7 mt-5 pb-5 border-b border-line w-full" key={product.id}>
                                                        <div className="w-1/2">
                                                            <div className="flex items-center gap-6">
                                                                <div className="bg-img md:w-[100px] w-20 aspect-[3/4]">
                                                                    <Image
                                                                        src={
                                                                            Array.isArray((product as any).thumbImage)
                                                                                ? (product as any).thumbImage[0]
                                                                                : Array.isArray((product as any).images)
                                                                                    ? (typeof (product as any).images[0] === 'string'
                                                                                        ? (product as any).images[0]
                                                                                        : ((product as any).images[0]?.url ?? ''))
                                                                                    : '/images/product/1.jpg'
                                                                        }
                                                                        width={1000}
                                                                        height={1000}
                                                                        alt={product.name}
                                                                        className='w-full h-full object-cover rounded-lg'
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div className="text-title">{product.name}</div>
                                                                    <div className="list-select mt-3"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-1/12 price flex items-center justify-center">
                                                            <div className="text-title text-center">${itemPrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                        </div>
                                                        <div className="w-1/6 flex items-center justify-center">
                                                            <div className="quantity-block bg-surface md:p-3 p-2 flex items-center justify-between rounded-lg border border-line md:w-[100px] flex-shrink-0 w-20">
                                                                <Icon.Minus
                                                                    onClick={() => {
                                                                        if (itemQuantity > 1) {
                                                                            handleQuantityChange(product.id, itemQuantity - 1)
                                                                        }
                                                                    }}
                                                                    className={`text-base max-md:text-sm ${itemQuantity === 1 ? 'disabled' : ''}`}
                                                                />
                                                                <div className="text-button quantity">{itemQuantity}</div>
                                                                <Icon.Plus
                                                                    onClick={() => handleQuantityChange(product.id, itemQuantity + 1)}
                                                                    className='text-base max-md:text-sm'
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="w-1/6 flex total-price items-center justify-center">
                                                            <div className="text-title text-center">${itemTotal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                        </div>
                                                        <div className="w-1/12 flex items-center justify-center">
                                                            <Icon.XCircle
                                                                className='text-xl max-md:text-base text-red cursor-pointer hover:text-black duration-500'
                                                                onClick={() => {
                                                                    removeFromCart(product.id)
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        <div className="xl:w-1/3 xl:pl-12 w-full">
                            <div className="checkout-block bg-surface p-6 rounded-2xl">
                                <div className="heading5">Resumen de compra</div>
                                <div className="total-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Subtotal sin IVA</div>
                                    <div className="text-title">$<span className="total-product">{formattedVatSubtotal}</span></div>
                                </div>
                                {vatRate > 0 && (
                                    <div className="discount-block py-5 flex justify-between border-b border-line">
                                        <div className="text-title">IVA ({vatRate.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</div>
                                        <div className="text-title">$<span className="discount">{formattedVatAmount}</span></div>
                                    </div>
                                )}
                                <div className="discount-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Descuentos</div>
                                    <div className="text-title"> <span>$</span><span className="discount">{formattedDiscount}</span></div>
                                </div>
                                <div className="total-cart-block pt-4 pb-4 flex justify-between">
                                    <div className="heading5">Total</div>
                                    <div className="heading5">$<span className="total-cart heading5">{formattedCartTotal}</span></div>
                                </div>
                                <div className="block-button flex flex-col items-center gap-y-4 mt-5">
                                    <div className="checkout-btn button-main text-center w-full" onClick={redirectToCheckout}>Continuar al pago</div>
                                    <Link className="text-button hover-underline" href={"/shop/breadcrumb1"}>Seguir comprando</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            <Footer />
        </>
    )
}

export default Cart
