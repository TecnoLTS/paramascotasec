'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { ProductType } from '@/type/ProductType'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useModalWishlistContext } from '@/context/ModalWishlistContext'
import { useCompare } from '@/context/CompareContext'
import { useModalCompareContext } from '@/context/ModalCompareContext'
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext'
import { useRouter } from 'next/navigation'
import Rate from '../Other/Rate'

interface ProductProps {
    data: ProductType
    type: string
    style?: string
    showQuickView?: boolean
}

const Product: React.FC<ProductProps> = ({ data, type, style = '', showQuickView = false }) => {
    const [activeColor, setActiveColor] = useState<string>('')
    const [activeSize, setActiveSize] = useState<string>('')
    const [openQuickShop, setOpenQuickShop] = useState<boolean>(false)
    const { addToCart, updateCart, cartState } = useCart();
    const { openModalCart } = useModalCartContext()
    const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
    const { openModalWishlist } = useModalWishlistContext()
    const { addToCompare, removeFromCompare, compareState } = useCompare();
    const { openModalCompare } = useModalCompareContext()
    const { openQuickview } = useModalQuickviewContext()
    const router = useRouter()

    const handleActiveColor = (item: string) => {
        setActiveColor(item)
    }

    const handleActiveSize = (item: string) => {
        setActiveSize(item)
    }

    const handleAddToCart = () => {
        const existingItem = cartState.cartArray.find((item: any) => item.id === data.id)
        const qtyToAdd = data.quantityPurchase ?? 1

        if (existingItem) {
            const nextQuantity = (existingItem.quantity ?? 0) + qtyToAdd
            updateCart(data.id, nextQuantity, activeSize, activeColor)
        } else {
            addToCart({ ...data });
            updateCart(data.id, qtyToAdd, activeSize, activeColor)
        }
        openModalCart()
    };

    const handleAddToWishlist = () => {
        // if product existed in wishlist, remove from wishlist and set state to false
        if (wishlistState.wishlistArray.some((item: any) => item.id === data.id)) {
            removeFromWishlist(data.id);
        } else {
            // else, add to wishlist and set state to true
            addToWishlist(data);
        }
        openModalWishlist();
    };

    const handleAddToCompare = () => {
        // if product existed in compare, remove from compare and set state to false
        if (compareState.compareArray.length < 3) {
            if (compareState.compareArray.some((item: any) => item.id === data.id)) {
                removeFromCompare(data.id);
            } else {
                // else, add to compare and set state to true
                addToCompare(data);
            }
        } else {
            alert('Compare up to 3 products')
        }

        openModalCompare();
    };

    const handleQuickviewOpen = () => {
        openQuickview(data)
    }

    const handleDetailProduct = (productId: string) => {
        // redirect to shop with category selected
        router.push(`/product/default?id=${productId}`);
    };

    const thumbImages: string[] =
        Array.isArray((data as any)?.thumbImage) && (data as any)?.thumbImage.length
            ? (data as any).thumbImage
            : (Array.isArray((data as any)?.images)
                ? (data as any).images
                    .map((img: any) => img?.url ?? img)
                    .filter(Boolean)
                : []);

    const sizes: string[] = data.sizes ?? []
    const variations = data.variation ?? []

    const price = Number(data.price ?? 0)
    const originPrice = Number(data.originPrice ?? 0)
    const hasSale = (data.sale || originPrice > price) && originPrice > price
    const percentSale = hasSale ? Math.floor(100 - ((price / originPrice) * 100)) : 0
    const percentSold = data.quantity > 0
        ? Math.floor((data.sold / data.quantity) * 100)
        : 0

    return (
        <>
            {type === "grid" ? (
                <div className={`product-item grid-type ${style}`}>
                    <div onClick={() => handleDetailProduct(data.id)} className="product-main cursor-pointer block">
                        <div className="product-thumb bg-white relative overflow-hidden rounded-2xl">
                            {data.new && (
                                <div className="product-tag text-button-uppercase text-white bg-[var(--green)] px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">
                                    Nuevo
                                </div>
                            )}
                            {data.sale && (
                                <div className="product-tag text-button-uppercase text-white bg-red px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">
                                    Oferta
                                </div>
                            )}

                            <div className="product-img w-full h-full aspect-[3/4]">
                                {activeColor ? (
                                    <>
                                        <Image
                                            src={variations.find((item: any) => item.color === activeColor)?.image ?? ''}
                                            width={500}
                                            height={500}
                                            alt={data.name}
                                            priority={true}
                                            className='w-full h-full object-cover duration-700'
                                        />
                                    </>
                                ) : (
                                    <>
                                        {thumbImages.map((img: string, index: number) => (
                                            <Image
                                                key={index}
                                                src={img}
                                                width={500}
                                                height={500}
                                                priority={true}
                                                alt={data.name}
                                                className='w-full h-full object-cover duration-700'
                                            />
                                        ))}
                                    </>
                                )}
                            </div>

                            {style === 'style-2' || style === 'style-4' ? (
                                <div className="list-size-block flex items-center justify-center gap-4 absolute bottom-0 left-0 w-full h-8">
                                    {sizes.map((item: string, index: number) => (
                                        <strong key={index} className="size-item text-xs font-bold uppercase">{item}</strong>
                                    ))}
                                </div>
                            ) : null}

                            {(style === 'style-1' || style === 'style-3' || showQuickView) && (
                                <div className={`list-action ${(style === 'style-1' || showQuickView) ? 'flex justify-center' : ''} px-5 absolute w-full bottom-5 max-lg:hidden`}>
                                    {(style === 'style-1' || showQuickView) && (
                                        <div
                                            className="quick-view-btn w-auto min-w-[160px] text-button-uppercase py-2 px-5 text-center rounded-full duration-300 bg-white hover:bg-black hover:text-white"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleQuickviewOpen()
                                            }}
                                        >
                                            Vista rápida
                                        </div>
                                    )}
                                </div>
                            )}

                            {(style === 'style-2' || style === 'style-5') ? (
                                <>
                                    <div className={`list-action flex items-center justify-center gap-3 px-5 absolute w-full ${style === 'style-2' ? 'bottom-12' : 'bottom-5'} max-lg:hidden`}>
                                        {style === 'style-2' && (
                                            <div
                                                className={`add-cart-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duration-300 relative ${compareState.compareArray.some((item: any) => item.id === data.id) ? 'active' : ''}`}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleAddToCart()
                                                }}
                                            >
                                                <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">Agregar al carrito</div>
                                                <Icon.ShoppingBagOpen size={20} />
                                            </div>
                                        )}
                                        <div
                                            className={`add-wishlist-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duración-300 relative ${wishlistState.wishlistArray.some((item: any) => item.id === data.id) ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleAddToWishlist()
                                            }}
                                        >
                                            <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">Agregar a favoritos</div>
                                            {wishlistState.wishlistArray.some((item: any) => item.id === data.id) ? (
                                                <Icon.Heart size={18} weight='fill' className='text-white' />
                                            ) : (
                                                <Icon.Heart size={18} />
                                            )}
                                        </div>
                                        <div
                                            className={`compare-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duration-300 relative ${compareState.compareArray.some((item: any) => item.id === data.id) ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleAddToCompare()
                                            }}
                                        >
                                            <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">Comparar producto</div>
                                            <Icon.Repeat size={18} className='compare-icon' />
                                            <Icon.CheckCircle size={20} className='checked-icon' />
                                        </div>
                                        <div
                                            className={`quick-view-btn w-9 h-9 flex items-center justify-center rounded-full bg-white duration-300 relative ${compareState.compareArray.some((item: any) => item.id === data.id) ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleQuickviewOpen()
                                            }}
                                        >
                                            <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">Vista rápida</div>
                                            <Icon.Eye size={20} />
                                        </div>
                                        {style === 'style-5' && data.action !== 'add to cart' && (
                                            <div
                                                className={`quick-shop-block absolute left-5 right-5 bg-white p-5 rounded-[20px] ${openQuickShop ? 'open' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <div className="list-size flex items-center justify-center flex-wrap gap-2">
                                                    {sizes.map((item: string, index: number) => (
                                                        <div
                                                            className={`size-item w-10 h-10 rounded-full flex items-center justify-center text-button bg-white border border-line ${activeSize === item ? 'active' : ''}`}
                                                            key={index}
                                                            onClick={() => handleActiveSize(item)}
                                                        >
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div
                                                    className="button-main w-full text-center rounded-full py-3 mt-4"
                                                    onClick={() => {
                                                        handleAddToCart()
                                                        setOpenQuickShop(false)
                                                    }}
                                                >
                                                    Agregar al carrito
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : null}

                            <div className="list-action-icon flex items-center justify-center gap-2 absolute w-full bottom-3 z-[1] lg:hidden">
                                <div
                                    className="quick-view-btn w-9 h-9 flex items-center justify-center rounded-lg duration-300 bg-white hover:bg-black hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleQuickviewOpen()
                                    }}
                                >
                                    <Icon.Eye className='text-lg' />
                                </div>
                                <div
                                    className="add-cart-btn w-9 h-9 flex items-center justify-center rounded-lg duration-300 bg-white hover:bg-black hover:text-white"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleAddToCart()
                                    }}
                                >
                                    <Icon.ShoppingBagOpen className='text-lg' />
                                </div>
                            </div>
                        </div>

                        <div className="product-infor mt-4 lg:mb-7">
                            <div className="product-sold sm:pb-4 pb-2">
                                <div className="progress bg-line h-1.5 w-full rounded-full overflow-hidden relative">
                                    <div
                                        className="progress-sold bg-red absolute left-0 top-0 h-full"
                                        style={{ width: `${percentSold}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-3 gap-y-1 flex-wrap mt-2">
                                    <div className="text-button-uppercase">
                                        <span className='text-secondary2 max-sm:text-xs'>Vendidos: </span>
                                        <span className='max-sm:text-xs'>{data.sold}</span>
                                    </div>
                                    <div className="text-button-uppercase">
                                        <span className='text-secondary2 max-sm:text-xs'>Disponibles: </span>
                                        <span className='max-sm:text-xs'>{data.quantity - data.sold}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="product-name text-title duration-300">{data.name}</div>
                            <div className="product-price-block flex items-center gap-2 flex-wrap mt-1 duration-300 relative z-[1]">
                                <div className="product-price text-title">${data.price}.00</div>
                                {hasSale && (
                                    <>
                                        <div className="product-origin-price caption1 text-secondary2">
                                            <del>${data.originPrice}.00</del>
                                        </div>
                                        <div className="product-sale caption1 font-medium bg-[var(--bluefor)] px-3 py-0.5 inline-block rounded-full">
                                            -{percentSale}%
                                        </div>
                                    </>
                                )}
                            </div>

                            {style === 'style-5' && (
                                <>
                                    {data.action === 'add to cart' ? (
                                        <div
                                            className="add-cart-btn w-full text-button-uppercase py-2.5 text-center mt-2 rounded-full duration-300 bg-white border border-black hover:bg-black hover:text-white max-lg:hidden"
                                            onClick={e => {
                                                e.stopPropagation()
                                                handleAddToCart()
                                            }}
                                        >
                                            Agregar al carrito
                                        </div>
                                    ) : (
                                        <div
                                            className="quick-shop-btn text-button-uppercase py-2.5 text-center mt-2 rounded-full duration-300 bg-white border border-black hover:bg-black hover:text-white max-lg:hidden"
                                            onClick={e => {
                                                e.stopPropagation()
                                                setOpenQuickShop(!openQuickShop)
                                            }}
                                        >
                                            Compra rápida
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {type === "list" ? (
                        <div className="product-item list-type border-b border-line pb-6 last:border-none">
                            <div className="product-main cursor-pointer grid md:grid-cols-[300px,1fr,auto] grid-cols-1 items-center gap-7 max-lg:gap-5">
                                <div
                                    onClick={() => handleDetailProduct(data.id)}
                                    className="product-thumb bg-white relative overflow-hidden rounded-2xl block max-sm:w-1/2 md:w-full md:max-w-[300px] md:flex-shrink-0"
                                >
                                    {data.new && (
                                        <div className="product-tag text-button-uppercase bg-green px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">
                                            Nuevo
                                        </div>
                                    )}
                                    {hasSale && (
                                        <div className="product-tag text-button-uppercase text-white bg-red px-3 py-0.5 inline-block rounded-full absolute top-3 left-3 z-[1]">
                                            Oferta
                                        </div>
                                    )}
                                    <div className="product-img w-full aspect-[3/4] rounded-2xl overflow-hidden">
                                        {thumbImages.map((img: string, index: number) => (
                                            <Image
                                                key={index}
                                                src={img}
                                                width={500}
                                                height={500}
                                                priority={true}
                                                alt={data.name}
                                                className='w-full h-full object-cover duration-700'
                                            />
                                        ))}
                                    </div>
                                    <div className="list-action px-5 absolute w-full bottom-5 max-lg:hidden">
                                        <div
                                            className={`quick-shop-block absolute left-5 right-5 bg-white p-5 rounded-[20px] ${openQuickShop ? 'open' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                            }}
                                        >
                                            <div className="list-size flex items-center justify-center flex-wrap gap-2">
                                                {sizes.map((item: string, index: number) => (
                                                    <div
                                                        className={`size-item ${item !== 'freesize' ? 'w-10 h-10' : 'h-10 px-4'} flex items-center justify-center text-button bg-white rounded-full border border-line ${activeSize === item ? 'active' : ''}`}
                                                        key={index}
                                                        onClick={() => handleActiveSize(item)}
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                            <div
                                                className="button-main w-full text-center rounded-full py-3 mt-4"
                                                onClick={() => {
                                                    handleAddToCart()
                                                    setOpenQuickShop(false)
                                                }}
                                            >
                                                Agregar al carrito
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-start gap-7 max-lg:gap-4 max-lg:flex-wrap max-lg:w-full max-sm:flex-col max-sm:w-full'>
                                    <div className="product-infor max-sm:w-full flex-1 min-w-[260px]">
                                        <div onClick={() => handleDetailProduct(data.id)} className="product-name heading6 inline-block duration-300">{data.name}</div>
                                        <div className="product-price-block flex items-center gap-2 flex-wrap mt-2 duration-300 relative z-[1]">
                                            <div className="product-price text-title">${data.price}.00</div>
                                            {hasSale && (
                                                <>
                                                    <div className="product-origin-price caption1 text-secondary2">
                                                        <del>${data.originPrice}.00</del>
                                                    </div>
                                                    <div className="product-sale caption1 font-medium bg-green px-3 py-0.5 inline-block rounded-full">
                                                        -{percentSale}%
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {(variations.length > 0 || sizes.length > 0) && (
                                            <div className="flex items-center gap-4 flex-wrap mt-5 mb-1">
                                                {variations.length > 0 && (
                                                    <div className="list-color py-2 flex items-center gap-3 flex-wrap duration-300">
                                                        {variations.map((item: any, index: number) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleActiveColor(item.color)
                                                                }}
                                                                className={`color-item w-10 h-10 rounded-full border relative flex items-center justify-center ${activeColor === item.color ? 'border-black scale-105' : 'border-line'}`}
                                                                aria-label={`Color ${item.color}`}
                                                            >
                                                                <span
                                                                    className="w-8 h-8 rounded-full block"
                                                                    style={{ backgroundColor: item.colorCode || '#d9d9d9' }}
                                                                />
                                                                <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                                    {item.color}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {sizes.length > 0 && (
                                                    <div className="list-size flex items-center gap-2 flex-wrap">
                                                        {sizes.map((item: string, index: number) => (
                                                            <div
                                                                key={index}
                                                                className="px-3 py-1 rounded-full border border-line text-button bg-white"
                                                            >
                                                                {item}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div
                                            className='text-secondary desc mt-5 max-sm:hidden'
                                            style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                maxWidth: '520px',
                                                minHeight: '48px',
                                            }}
                                        >
                                            {data.description}
                                        </div>
                                    </div>

                                    <div className="action w-fit flex flex-col items-center justify-center self-center flex-shrink-0">
                                        <div
                                            className="quick-shop-btn button-main whitespace-nowrap py-2 px-9 max-lg:px-5 rounded-full bg-white text-black border border-black hover:bg-black hover:text-white"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleQuickviewOpen()
                                            }}
                                        >
                                            Vista rápida
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </>
            )}

            {type === 'marketplace' ? (
                <div className="product-item style-marketplace p-4 border border-line rounded-2xl" onClick={() => handleDetailProduct(data.id)}>
                    <div className="bg-img relative w-full">
                        <Image
                            className='w-full aspect-square'
                            width={5000}
                            height={5000}
                            src={thumbImages[0] ?? ''}
                            alt="img"
                        />
                        <div className="list-action flex flex-col gap-1 absolute top-0 right-0">
                            <span
                                className={`add-wishlist-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300 ${wishlistState.wishlistArray.some((item: any) => item.id === data.id) ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddToWishlist()
                                }}
                            >
                                {wishlistState.wishlistArray.some((item: any) => item.id === data.id) ? (
                                    <Icon.Heart size={18} weight='fill' className='text-white' />
                                ) : (
                                    <Icon.Heart size={18} />
                                )}
                            </span>
                            <span
                                className={`compare-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300 ${compareState.compareArray.some((item: any) => item.id === data.id) ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddToCompare()
                                }}
                            >
                                <Icon.Repeat size={18} className='compare-icon' />
                                <Icon.CheckCircle size={20} className='checked-icon' />
                            </span>
                            <span
                                className="quick-view-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuickviewOpen()
                                }}
                            >
                                <Icon.Eye />
                            </span>
                            <span
                                className="add-cart-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleAddToCart()
                                }}
                            >
                                <Icon.ShoppingBagOpen />
                            </span>
                        </div>
                    </div>
                    <div className="product-infor mt-4">
                        <span className="text-title">{data.name}</span>
                        <div className="flex gap-0.5 mt-1">
                            <Rate currentRate={data.rate} size={16} />
                        </div>
                        <span className="text-title inline-block mt-1">${data.price}.00</span>
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default Product
