'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext'
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import ModalSizeguide from './ModalSizeguide'
import Rate from '../Other/Rate'
import {
    getProductReviewCount,
    getProductSku,
    getProductVariantLabel,
    getProductVariants,
    hasRealReviews,
    resolveSelectedVariant,
} from '@/lib/catalog'

const ModalQuickview = () => {
    const { selectedProduct, closeQuickview } = useModalQuickviewContext()
    const { addToCart, updateCart, cartState } = useCart()
    const { openModalCart } = useModalCartContext()

    const [openSizeGuide, setOpenSizeGuide] = useState(false)
    const [activeColor, setActiveColor] = useState('')
    const [activeSize, setActiveSize] = useState('')
    const [quantity, setQuantity] = useState(1)

    const variantProducts = selectedProduct ? getProductVariants(selectedProduct) : []
    const defaultVariant = selectedProduct ? resolveSelectedVariant(selectedProduct) : null
    const activeVariant = variantProducts.find((product) => getProductVariantLabel(product) === activeSize) ?? defaultVariant
    const showReviewSummary = selectedProduct ? hasRealReviews(selectedProduct) : false
    const reviewCount = selectedProduct ? getProductReviewCount(selectedProduct) : 0

    const galleryImages = !activeVariant ? [] : Array.from(new Set([
        ...(Array.isArray((activeVariant as any)?.images)
            ? (activeVariant as any).images.map((img: any) => (typeof img === 'string' ? img : img?.url ?? '')).filter(Boolean)
            : []),
        ...(Array.isArray((activeVariant as any)?.thumbImage)
            ? (activeVariant as any).thumbImage.map((img: any) => (typeof img === 'string' ? img : img?.url ?? '')).filter(Boolean)
            : []),
    ])).filter(Boolean)
    const resolvedGalleryImages = galleryImages.length > 0 ? galleryImages : ['/images/product/1.jpg']

    useEffect(() => {
        if (!selectedProduct || !defaultVariant) {
            setQuantity(1)
            setActiveColor('')
            setActiveSize('')
            return
        }

        setQuantity(selectedProduct.quantityPurchase ?? 1)
        setActiveColor('')
        setActiveSize(getProductVariantLabel(defaultVariant))
    }, [selectedProduct?.id, defaultVariant?.id])

    const price = Number(activeVariant?.price ?? selectedProduct?.price ?? 0)
    const originPrice = Number(activeVariant?.originPrice ?? selectedProduct?.originPrice ?? 0)
    const availableStock = Math.max(0, Number(activeVariant?.quantity ?? selectedProduct?.quantity ?? 0))
    const safeQuantity = availableStock > 0 ? Math.min(Math.max(quantity, 1), availableStock) : 0
    const lineTotal = price * safeQuantity
    const hasSale = (activeVariant?.sale || selectedProduct?.sale || originPrice > price) && originPrice > price
    const percentSale = hasSale ? Math.floor(100 - ((price / originPrice) * 100)) : 0
    const categoryLabel = (selectedProduct?.category ?? '').toLowerCase()
    const isFoodCategory = ['comida', 'alimento', 'premio'].some((word) => categoryLabel.includes(word))
    const selectorLabel = isFoodCategory ? 'Tamano del paquete' : ((selectedProduct?.productType ?? '').toLowerCase() === 'ropa' ? 'Talla' : 'Variante')
    const formattedCategory = [selectedProduct?.category, selectedProduct?.gender === 'dog' ? 'Perros' : selectedProduct?.gender === 'cat' ? 'Gatos' : '']
        .filter(Boolean)
        .join(' · ')
    const sku = activeVariant ? getProductSku(activeVariant) : ''

    useEffect(() => {
        setQuantity((current) => {
            if (availableStock <= 0) return 0
            if (current < 1) return 1
            if (current > availableStock) return availableStock
            return current
        })
    }, [availableStock, activeVariant?.id])

    const handleIncreaseQuantity = () => {
        if (availableStock <= 0) return
        setQuantity((current) => Math.min(current + 1, availableStock))
    }

    const handleDecreaseQuantity = () => {
        setQuantity((current) => {
            if (availableStock <= 0) return 0
            return current <= 1 ? 1 : current - 1
        })
    }

    const handleAddToCart = () => {
        if (!selectedProduct || !activeVariant || availableStock <= 0 || safeQuantity <= 0) return

        const quantityToAdd = safeQuantity
        const variantLabel = activeSize || getProductVariantLabel(activeVariant)
        const existingItem = cartState.cartArray.find((item) => item.id === activeVariant.id)

        if (!existingItem) {
            addToCart({ ...activeVariant, quantityPurchase: quantityToAdd })
            updateCart(activeVariant.id, quantityToAdd, variantLabel, activeColor)
        } else {
            const nextQuantity = (existingItem.quantity ?? 0) + quantityToAdd
            updateCart(activeVariant.id, nextQuantity, variantLabel, activeColor)
        }

        openModalCart()
        closeQuickview()
    }

    const isOpen = selectedProduct !== null
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
    }

    const panelStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        maxHeight: '100vh',
        zIndex: 100000,
    }

    return (
        <div
            className="modal-quickview-block"
            style={overlayStyle}
            aria-hidden={!isOpen}
            onClick={closeQuickview}
        >
            <div
                className={`modal-quickview-main py-6 ${isOpen ? 'open' : ''}`}
                style={panelStyle}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex h-full max-md:flex-col gap-y-6">
                    <div className="left lg:w-[388px] md:w-[300px] flex-shrink-0 px-6">
                        <div className="list-img max-md:flex max-md:justify-center items-center gap-4">
                            {resolvedGalleryImages.map((image, index) => (
                                <div className="bg-img w-full aspect-[3/4] max-md:w-[150px] max-md:flex-shrink-0 rounded-[20px] overflow-hidden md:mt-6" key={`${image}-${index}`}>
                                    <Image
                                        src={image}
                                        width={1500}
                                        height={2000}
                                        alt={selectedProduct?.name ?? 'product'}
                                        priority
                                        unoptimized={image.startsWith('/uploads/') || image.startsWith('/images/')}
                                        className="w-full h-full object-contain bg-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="right w-full px-4">
                        <div className="heading pb-6 px-4 flex items-center justify-between relative">
                            <div className="heading5">Vista rapida</div>
                            <div
                                className="close-btn absolute right-0 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                onClick={closeQuickview}
                            >
                                <Icon.X size={14} />
                            </div>
                        </div>

                        <div className="product-infor px-4">
                            <div className="heading5">{selectedProduct?.name}</div>
                            {showReviewSummary && (
                                <div className="flex items-center mt-3 gap-2">
                                    <Rate currentRate={selectedProduct?.rate} size={14} />
                                    <span className="caption1 text-secondary">({reviewCount} resenas)</span>
                                </div>
                            )}

                            <div className="mt-5 pb-6 border-b border-line">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="product-price heading5">${price.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    {hasSale && (
                                        <>
                                            <div className="w-px h-4 bg-line"></div>
                                            <div className="product-origin-price font-normal text-secondary2">
                                                <del>${originPrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</del>
                                            </div>
                                            <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                                                -{percentSale}%
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="desc text-secondary mt-3">{activeVariant?.description ?? selectedProduct?.description}</div>
                            </div>

                            <div className="list-action mt-6">
                                {(activeVariant?.variation ?? []).length > 0 && (
                                    <div className="choose-color">
                                        <div className="text-title">Colores: <span className="text-title color">{activeColor}</span></div>
                                        <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                                            {(activeVariant?.variation ?? []).map((item, index) => (
                                                <button
                                                    type="button"
                                                    className={`color-item w-12 h-12 rounded-xl duration-300 relative ${activeColor === item.color ? 'active' : ''}`}
                                                    key={`${item.color}-${index}`}
                                                    onClick={() => setActiveColor(item.color)}
                                                >
                                                    <Image
                                                        src={item.colorImage || item.image || resolvedGalleryImages[0] || '/images/product/1.jpg'}
                                                        width={100}
                                                        height={100}
                                                        alt={item.color || 'color'}
                                                        className="rounded-xl"
                                                        unoptimized
                                                    />
                                                    <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                        {item.color}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(variantProducts.length > 1 || (selectedProduct?.productType ?? '').toLowerCase() === 'ropa') && (
                                    <div className="choose-size mt-5">
                                        <div className="heading flex items-center justify-between">
                                            <div className="text-title">{selectorLabel}: <span className="text-title size">{activeSize}</span></div>
                                            {(selectedProduct?.productType ?? '').toLowerCase() === 'ropa' && (
                                                <>
                                                    <div
                                                        className="caption1 size-guide text-red underline cursor-pointer"
                                                        onClick={() => setOpenSizeGuide(true)}
                                                    >
                                                        Guia de tallas
                                                    </div>
                                                    <ModalSizeguide data={activeVariant ?? selectedProduct} isOpen={openSizeGuide} onClose={() => setOpenSizeGuide(false)} />
                                                </>
                                            )}
                                        </div>
                                        {variantProducts.length > 1 && (
                                            <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                                                {variantProducts.map((product) => {
                                                    const label = getProductVariantLabel(product) || product.name
                                                    return (
                                                        <button
                                                            type="button"
                                                            className={`size-item px-3 py-2 flex items-center justify-center text-button rounded-full bg-white border border-line ${activeSize === label ? 'active' : ''}`}
                                                            key={product.id}
                                                            onClick={() => setActiveSize(label)}
                                                        >
                                                            {label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="text-title mt-5">Cantidad:</div>
                                <div className="choose-quantity flex items-center max-xl:flex-wrap lg:justify-between gap-5 mt-3">
                                    <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                                        <Icon.Minus onClick={handleDecreaseQuantity} className="cursor-pointer body1" />
                                        <div className="body1 font-semibold">{safeQuantity}</div>
                                        <Icon.Plus onClick={handleIncreaseQuantity} className="cursor-pointer body1" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={availableStock <= 0}
                                        className="button-main w-full text-center bg-white text-black border border-black disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3">
                                    <div>
                                        <div className="caption1 text-secondary">Existencia</div>
                                        <div className="text-title mt-1">
                                            {availableStock > 0 ? `${availableStock} disponible${availableStock === 1 ? '' : 's'}` : 'Sin stock'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="caption1 text-secondary">Total</div>
                                        <div className="heading6 mt-1">
                                            ${lineTotal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                <div className="more-infor mt-6">
                                    {sku && (
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">SKU:</div>
                                            <div className="text-secondary">{sku}</div>
                                        </div>
                                    )}
                                    {formattedCategory && (
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">Categoria:</div>
                                            <div className="text-secondary">{formattedCategory}</div>
                                        </div>
                                    )}
                                    {selectedProduct?.brand && (
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">Marca:</div>
                                            <div className="text-secondary">{selectedProduct.brand}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalQuickview
