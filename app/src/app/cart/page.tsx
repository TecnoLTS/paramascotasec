'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from '@/context/CartContext'

const Cart = () => {


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

    const moneyForFreeship = 150;
    const totalCart = cartState.cartArray.reduce(
        (acc, item) => acc + Number(item.price ?? 0) * Number(item.quantity ?? 1),
        0
    )
    let [discountCart, setDiscountCart] = useState<number>(0)
    let [shipCart, setShipCart] = useState<number>(30)
    let [applyCode, setApplyCode] = useState<number>(0)
    const formattedSubtotal = totalCart.toFixed(2)
    const formattedDiscount = discountCart.toFixed(2)
    const formattedCartTotal = (totalCart - discountCart + shipCart).toFixed(2)
    const remainingForFreeShip = Math.max(moneyForFreeship - totalCart, 0).toFixed(2)

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

    if (totalCart < moneyForFreeship) {
        shipCart = 30
    }

    if (cartState.cartArray.length === 0) {
        shipCart = 0
    }

    const redirectToCheckout = () => {
        router.push(`/checkout?discount=${discountCart}&ship=${shipCart}`)
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
                            
                            <div className="heading banner mt-5">
                                <div className="text">Compra
                                    <span className="text-button"> $<span className="more-price">{remainingForFreeShip}</span> </span>
                                    <span>más para obtener </span>
                                    <span className="text-button">envío gratis</span>
                                </div>
                                <div className="tow-bar-block mt-4">
                                    <div
                                        className="progress-line"
                                        style={{ width: totalCart <= moneyForFreeship ? `${(totalCart / moneyForFreeship) * 100}%` : `100%` }}
                                    ></div>
                                </div>
                            </div>
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
                                                            <div className="text-title text-center">${itemPrice.toFixed(2)}</div>
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
                                                            <div className="text-title text-center">${itemTotal.toFixed(2)}</div>
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
                                    <div className="text-title">Subtotal</div>
                                    <div className="text-title">$<span className="total-product">{formattedSubtotal}</span></div>
                                </div>
                                <div className="discount-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Descuentos</div>
                                    <div className="text-title"> <span>-$</span><span className="discount">{formattedDiscount}</span></div>
                                </div>
                                <div className="ship-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Envío</div>
                                    <div className="choose-type flex gap-12">
                                        <div className="left">
                                            <div className="type">
                                                {moneyForFreeship - totalCart > 0 ?
                                                    (
                                                        <input
                                                            id="shipping"
                                                            type="radio"
                                                            name="ship"
                                                            disabled
                                                        />
                                                    ) : (
                                                        <input
                                                            id="shipping"
                                                            type="radio"
                                                            name="ship"
                                                            checked={shipCart === 0}
                                                            onChange={() => setShipCart(0)}
                                                        />
                                                    )}
                                                <label className="pl-1" htmlFor="shipping">Envío gratis:</label>
                                            </div>
                                            <div className="type mt-1">
                                                <input
                                                    id="local"
                                                    type="radio"
                                                    name="ship"
                                                    value={30}
                                                    checked={shipCart === 30}
                                                    onChange={() => setShipCart(30)}
                                                />
                                                <label className="text-on-surface-variant1 pl-1" htmlFor="local">Local:</label>
                                            </div>
                                            <div className="type mt-1">
                                                <input
                                                    id="flat"
                                                    type="radio"
                                                    name="ship"
                                                    value={40}
                                                    checked={shipCart === 40}
                                                    onChange={() => setShipCart(40)}
                                                />
                                                <label className="text-on-surface-variant1 pl-1" htmlFor="flat">Tarifa plana:</label>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <div className="ship">$0.00</div>
                                            <div className="local text-on-surface-variant1 mt-1">$30.00</div>
                                            <div className="flat text-on-surface-variant1 mt-1">$40.00</div>
                                        </div>
                                    </div>
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
