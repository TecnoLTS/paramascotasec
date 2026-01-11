'use client'

// Quickview.tsx
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext';
import { useCart } from '@/context/CartContext';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useModalCompareContext } from '@/context/ModalCompareContext'
import { useWishlist } from '@/context/WishlistContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useCompare } from '@/context/CompareContext';
import Rate from '../Other/Rate';
import ModalSizeguide from './ModalSizeguide';

const ModalQuickview = () => {
    const [photoIndex, setPhotoIndex] = useState(0)
    const [openPopupImg, setOpenPopupImg] = useState(false)
    const [openSizeGuide, setOpenSizeGuide] = useState<boolean>(false)
    const { selectedProduct, closeQuickview } = useModalQuickviewContext()
    const [activeColor, setActiveColor] = useState<string>('')
    const [activeSize, setActiveSize] = useState<string>('')
    const [quantity, setQuantity] = useState<number>(1)
    const { addToCart, updateCart, cartState } = useCart()
    const { openModalCart } = useModalCartContext()
    const { openModalCompare } = useModalCompareContext()
    const { wishlistState, addToWishlist, removeFromWishlist } = useWishlist();
    const { openModalWishlist } = useModalWishlistContext();
    const { compareState, addToCompare, removeFromCompare } = useCompare();
    const price = Number(selectedProduct?.price ?? 0)
    const originPrice = Number(selectedProduct?.originPrice ?? 0)
    const hasSale = (selectedProduct?.sale || originPrice > price) && originPrice > 0
    const percentSale = hasSale ? Math.floor(100 - ((price / originPrice) * 100)) : 0
    const categoryLabel = (selectedProduct?.category ?? '').toLowerCase()
    const isFoodCategory = ['comida', 'alimento', 'premio'].some(word => categoryLabel.includes(word))
    const hasSizes = (selectedProduct?.sizes ?? []).length > 0
    const showSizeSelector = hasSizes && !isFoodCategory
    const showCapacitySelector = hasSizes && isFoodCategory

    const formatCategory = () => {
        const map: Record<string, string> = {
            'juguetes': 'Juguetes',
            'comida para perros': 'Comida para perros',
            'comida para gatos': 'Comida para gatos',
            'camas': 'Camas',
            'accesorios': 'Accesorios',
            'comederos': 'Comederos',
            'cuidado': 'Cuidado',
        }
        const key = (selectedProduct?.category ?? '').toLowerCase()
        return map[key] ?? (selectedProduct?.category ? selectedProduct.category : '')
    }

    const genderLabel = selectedProduct?.gender === 'dog'
        ? 'Perros'
        : selectedProduct?.gender === 'cat'
            ? 'Gatos'
            : ''

    const formattedCategory = [formatCategory(), genderLabel].filter(Boolean).join(' · ')
    const formattedTag = (selectedProduct?.type && selectedProduct.type.trim().length > 0)
        ? selectedProduct.type
        : (selectedProduct?.brand ?? formatCategory())
    const galleryImages = Array.isArray((selectedProduct as any)?.images)
        ? (selectedProduct as any).images.map((img: any) => (typeof img === 'string' ? img : img?.url ?? '')).filter(Boolean)
        : []

    useEffect(() => {
        if (selectedProduct) {
            setQuantity(selectedProduct.quantityPurchase ?? 1)
            setActiveColor('')
            const firstSize = (selectedProduct.sizes ?? [])[0] ?? ''
            setActiveSize(firstSize)
        } else {
            setQuantity(1)
        }
    }, [selectedProduct])

    const handleOpenSizeGuide = () => {
        setOpenSizeGuide(true);
    };

    const handleCloseSizeGuide = () => {
        setOpenSizeGuide(false);
    };

    const handleActiveColor = (item: string) => {
        setActiveColor(item)
    }

    const handleActiveSize = (item: string) => {
        setActiveSize(item)
    }

    const handleIncreaseQuantity = () => {
        if (!selectedProduct) return
        const nextQuantity = (quantity ?? 1) + 1
        setQuantity(nextQuantity)
        updateCart(selectedProduct.id, nextQuantity, activeSize, activeColor);
    };

    const handleDecreaseQuantity = () => {
        if (!selectedProduct) return
        const currentQty = quantity ?? 1
        if (currentQty <= 1) return
        const nextQuantity = currentQty - 1
        setQuantity(nextQuantity)
        updateCart(selectedProduct.id, nextQuantity, activeSize, activeColor);
    };

    const handleAddToCart = () => {
        if (selectedProduct) {
            const quantityToAdd = quantity ?? 1
            if (!cartState.cartArray.find(item => item.id === selectedProduct.id)) {
                addToCart({ ...selectedProduct, quantityPurchase: quantityToAdd });
                updateCart(selectedProduct.id, quantityToAdd, activeSize, activeColor)
            } else {
                updateCart(selectedProduct.id, quantityToAdd, activeSize, activeColor)
            }
            openModalCart()
            closeQuickview()
        }
    };

    const handleAddToWishlist = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (selectedProduct) {
            if (wishlistState.wishlistArray.some(item => item.id === selectedProduct.id)) {
                removeFromWishlist(selectedProduct.id);
            } else {
                // else, add to wishlist and set state to true
                addToWishlist(selectedProduct);
            }
        }
        openModalWishlist();
    };

    const handleAddToCompare = () => {
        // if product existed in wishlit, remove from wishlist and set state to false
        if (selectedProduct) {
            if (compareState.compareArray.length < 3) {
                if (compareState.compareArray.some(item => item.id === selectedProduct.id)) {
                    removeFromCompare(selectedProduct.id);
                } else {
                    // else, add to wishlist and set state to true
                    addToCompare(selectedProduct);
                }
            } else {
                alert('Compare up to 3 products')
            }
        }
        openModalCompare();
    };

    return (
        <>
            <div className={`modal-quickview-block`} onClick={closeQuickview}>
                <div
                    className={`modal-quickview-main py-6 ${selectedProduct !== null ? 'open' : ''}`}
                    onClick={(e) => { e.stopPropagation() }}
                >
                    <div className="flex h-full max-md:flex-col gap-y-6">
                        <div className="left lg:w-[388px] md:w-[300px] flex-shrink-0 px-6">
                            <div className="list-img max-md:flex max-md:justify-center items-center gap-4">
                                {galleryImages.map((item: string, index: number) => (
                                    <div className="bg-img w-full aspect-[3/4] max-md:w-[150px] max-md:flex-shrink-0 rounded-[20px] overflow-hidden md:mt-6" key={index}>
                                        <Image
                                            src={item}
                                            width={1500}
                                            height={2000}
                                            alt={selectedProduct?.name ?? 'product'}
                                            priority={true}
                                            className='w-full h-full object-cover'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="right w-full px-4">
                            <div className="heading pb-6 px-4 flex items-center justify-between relative">
                                <div className="heading5">Vista rápida</div>
                                <div
                                    className="close-btn absolute right-0 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                    onClick={closeQuickview}
                                >
                                    <Icon.X size={14} />
                                </div>
                            </div>
                            <div className="product-infor px-4">
                                
                                <div className="flex items-center mt-3">
                                    <Rate currentRate={selectedProduct?.rate} size={14} />
                                    <span className='caption1 text-secondary'>(1.234 reseñas)</span>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap mt-5 pb-6 border-b border-line">
                                    <div className="product-price heading5">${selectedProduct?.price}.00</div>
                                    {hasSale && (
                                        <>
                                            <div className='w-px h-4 bg-line'></div>
                                            <div className="product-origin-price font-normal text-secondary2"><del>${selectedProduct?.originPrice}.00</del></div>
                                            <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                                                -{percentSale}%
                                            </div>
                                        </>
                                    )}
                                    <div className='desc text-secondary mt-3'>{selectedProduct?.description}</div>
                                </div>
                                    <div className="list-action mt-6">
                                        <div className="choose-color">
                                        <div className="text-title">Colores: <span className='text-title color'>{activeColor}</span></div>
                                        <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                                            {(selectedProduct?.variation ?? []).map((item, index) => (
                                                <div
                                                    className={`color-item w-12 h-12 rounded-xl duration-300 relative ${activeColor === item.color ? 'active' : ''}`}
                                                    key={index}
                                                    datatype={item.image}
                                                    onClick={() => {
                                                        handleActiveColor(item.color)
                                                    }}
                                                >
                                                    <Image
                                                        src={item.colorImage}
                                                        width={100}
                                                        height={100}
                                                        alt='color'
                                                        className='rounded-xl'
                                                    />
                                                    <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                        {item.color}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {showSizeSelector && (
                                        <div className="choose-size mt-5">
                                            <div className="heading flex items-center justify-between">
                                                <div className="text-title">Talla: <span className='text-title size'>{activeSize}</span></div>
                                                <div
                                                    className="caption1 size-guide text-red underline cursor-pointer"
                                                    onClick={handleOpenSizeGuide}
                                                >
                                                    Guía de tallas
                                                </div>
                                                <ModalSizeguide data={selectedProduct} isOpen={openSizeGuide} onClose={handleCloseSizeGuide} />
                                            </div>
                                            <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                                                {(selectedProduct?.sizes ?? []).map((item, index) => (
                                                    <div
                                                        className={`size-item ${item === 'freesize' ? 'px-3 py-2' : 'w-12 h-12'} flex items-center justify-center text-button rounded-full bg-white border border-line ${activeSize === item ? 'active' : ''}`}
                                                        key={index}
                                                        onClick={() => handleActiveSize(item)}
                                                    >
                                                    {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {showCapacitySelector && (
                                        <div className="choose-size mt-5">
                                            <div className="heading flex items-center justify-between">
                                                <div className="text-title">Tamaño del paquete: <span className='text-title size'>{activeSize}</span></div>
                                            </div>
                                            <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                                                {(selectedProduct?.sizes ?? []).map((item, index) => (
                                                    <div
                                                        className={`size-item ${item === 'freesize' ? 'px-3 py-2' : 'w-12 h-12'} flex items-center justify-center text-button rounded-full bg-white border border-line ${activeSize === item ? 'active' : ''}`}
                                                        key={index}
                                                        onClick={() => handleActiveSize(item)}
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-title mt-5">Cantidad:</div>
                                    <div className="choose-quantity flex items-center max-xl:flex-wrap lg:justify-between gap-5 mt-3">
                                        <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                                            <Icon.Minus
                                                onClick={handleDecreaseQuantity}
                                                className={`${selectedProduct?.quantityPurchase === 1 ? 'disabled' : ''} cursor-pointer body1`}
                                            />
                                            <div className="body1 font-semibold">{quantity}</div>
                                            <Icon.Plus
                                                onClick={handleIncreaseQuantity}
                                                className='cursor-pointer body1'
                                            />
                                        </div>
                                        <div onClick={handleAddToCart} className="button-main w-full text-center bg-white text-black border border-black">Agregar al carrito</div>
                                    </div>
                                    <div className="button-block mt-5">
                                        <div className="button-main w-full text-center">Comprar ahora</div>
                                    </div>
                                    <div className="flex items-center flex-wrap lg:gap-20 gap-8 gap-y-4 mt-5">
                                        <div className="share flex items-center gap-3 cursor-pointer">
                                            <div className="share-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                                                <Icon.ShareNetwork weight='fill' className='heading6' />
                                            </div>
                                            <span>Compartir producto</span>
                                        </div>
                                    </div>
                                    <div className="more-infor mt-6">
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <Icon.ArrowClockwise className='body1' />
                                                <div className="text-title">Envío y devoluciones</div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Icon.Question className='body1' />
                                                <div className="text-title">Hacer una pregunta</div>
                                            </div>
                                        </div>
                                <div className="flex items-center flex-wrap gap-1 mt-3">
                                            <Icon.Timer className='body1' />
                                            <span className="text-title">Entrega estimada:</span>
                                            <span className="text-secondary">14 de enero - 18 de enero</span>
                                        </div>
                                        <div className="flex items-center flex-wrap gap-1 mt-3">
                                            <Icon.Eye className='body1' />
                                            <span className="text-title">38</span>
                                            <span className="text-secondary">personas viendo este producto ahora mismo</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">SKU:</div>
                                            <div className="text-secondary">53453412</div>
                                        </div>
                                        {(selectedProduct?.category || selectedProduct?.gender) && (
                                            <div className="flex items-center gap-1 mt-3">
                                                <div className="text-title">Categoría:</div>
                                                <div className="text-secondary">{formattedCategory}</div>
                                            </div>
                                        )}
                                        {(selectedProduct?.type || selectedProduct?.brand || formattedTag) && (
                                            <div className="flex items-center gap-1 mt-3">
                                                <div className="text-title">Etiqueta:</div>
                                                <div className="text-secondary">{formattedTag}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="list-payment mt-7">
                                        <div className="main-content lg:pt-8 pt-6 lg:pb-6 pb-4 sm:px-4 px-3 border border-line rounded-xl relative max-md:w-2/3 max-sm:w-full">
                                            <div className="heading6 px-5 bg-white absolute -top-[14px] left-1/2 -translate-x-1/2 whitespace-nowrap">Pago seguro garantizado</div>
                                            <div className="list grid grid-cols-6">
                                                <div className="item flex items-center justify-center lg:px-3 px-1">
                                                    <Image
                                                        src={'/images/payment/Frame-0.png'}
                                                        width={500}
                                                        height={450}
                                                        alt='payment'
                                                        className='w-full'
                                                    />
                                                </div>
                                                <div className="item flex items-center justify-center lg:px-3 px-1">
                                                    <Image
                                                        src={'/images/payment/Frame-1.png'}
                                                        width={500}
                                                        height={450}
                                                        alt='payment'
                                                        className='w-full'
                                                    />
                                                </div>
                                                <div className="item flex items-center justify-center lg:px-3 px-1">
                                                    <Image
                                                        src={'/images/payment/Frame-2.png'}
                                                        width={500}
                                                        height={450}
                                                        alt='payment'
                                                        className='w-full'
                                                    />
                                                </div>
                                                <div className="item flex items-center justify-center lg:px-3 px-1">
                                                    <Image
                                                        src={'/images/payment/Frame-3.png'}
                                                        width={500}
                                                        height={450}
                                                        alt='payment'
                                                        className='w-full'
                                                    />
                                                </div>
                                                <div className="item flex items-center justify-center lg:px-3 px-1">
                                                    <Image
                                                        src={'/images/payment/Frame-4.png'}
                                                        width={500}
                                                        height={450}
                                                        alt='payment'
                                                        className='w-full'
                                                    />
                                                </div>
                                                <div className="item flex items-center justify-center lg:px-3 px-1">
                                                    <Image
                                                        src={'/images/payment/Frame-5.png'}
                                                        width={500}
                                                        height={450}
                                                        alt='payment'
                                                        className='w-full'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default ModalQuickview;
