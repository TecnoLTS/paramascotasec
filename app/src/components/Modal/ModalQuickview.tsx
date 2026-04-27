'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from '@/components/Common/AppImage'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext'
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import { ProductType } from '@/type/ProductType'
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
import {
    fetchLiveCatalogSnapshot,
    findLiveCatalogProduct,
    getLiveProductAvailableStock,
    resolveLiveSelectedVariant,
} from '@/lib/liveCatalog'
import {
    getProductColorValues,
    getProductSizeValues,
    getVariantColorValue,
    getVariantSizeValue,
} from '@/lib/catalogAttributes'

const normalizeOptionValue = (value?: string | null) => (value ?? '').trim().toLowerCase()

const ModalQuickview = () => {
    const { selectedProduct, closeQuickview } = useModalQuickviewContext()
    const { addToCart, updateCart, cartState } = useCart()
    const { openModalCart } = useModalCartContext()

    const [openSizeGuide, setOpenSizeGuide] = useState(false)
    const [activeColor, setActiveColor] = useState('')
    const [activeSize, setActiveSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [liveProduct, setLiveProduct] = useState(selectedProduct)
    const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null)
    const [isRefreshingStock, setIsRefreshingStock] = useState(false)

    const variantProducts = liveProduct ? getProductVariants(liveProduct) : []
    const defaultVariant = liveProduct ? resolveSelectedVariant(liveProduct) : null
    const familySizeValues = useMemo(() => (liveProduct ? getProductSizeValues(liveProduct) : []), [liveProduct])
    const familyColorValues = useMemo(() => (liveProduct ? getProductColorValues(liveProduct) : []), [liveProduct])
    const hasSizeSelector = familySizeValues.length > 1
    const hasColorSelector = familyColorValues.length > 1
    const genericVariantOptions = useMemo(
        () => variantProducts.map((product) => ({
            id: product.id,
            label: getProductVariantLabel(product) || product.name,
        })),
        [variantProducts],
    )
    const showGenericVariantSelector = variantProducts.length > 1 && !hasSizeSelector && !hasColorSelector
    const activeVariant = useMemo(() => {
        if (!liveProduct || !defaultVariant) return null

        if (showGenericVariantSelector && activeSize) {
            return variantProducts.find((product) => {
                const label = getProductVariantLabel(product) || product.name
                return label === activeSize
            }) ?? defaultVariant
        }

        const matchesSize = (product: ProductType) =>
            !activeSize || normalizeOptionValue(getVariantSizeValue(product)) === normalizeOptionValue(activeSize)
        const matchesColor = (product: ProductType) =>
            !activeColor || normalizeOptionValue(getVariantColorValue(product)) === normalizeOptionValue(activeColor)

        const exactMatches = variantProducts.filter((product) => matchesSize(product) && matchesColor(product))
        if (exactMatches.length > 0) {
            return exactMatches.find((product) => product.id === defaultVariant.id) ?? exactMatches[0]
        }

        if (activeColor) {
            const colorMatches = variantProducts.filter(matchesColor)
            if (colorMatches.length > 0) {
                return colorMatches.find((product) => product.id === defaultVariant.id) ?? colorMatches[0]
            }
        }

        if (activeSize) {
            const sizeMatches = variantProducts.filter(matchesSize)
            if (sizeMatches.length > 0) {
                return sizeMatches.find((product) => product.id === defaultVariant.id) ?? sizeMatches[0]
            }
        }

        return resolveLiveSelectedVariant(liveProduct, {
            requestedId: selectedProduct?.id,
            preferredVariantId: defaultVariant.id,
            preferredVariantLabel: getProductVariantLabel(defaultVariant),
        })
    }, [activeColor, activeSize, defaultVariant, liveProduct, selectedProduct?.id, showGenericVariantSelector, variantProducts])
    const showReviewSummary = liveProduct ? hasRealReviews(liveProduct) : false
    const reviewCount = liveProduct ? getProductReviewCount(liveProduct) : 0

    const resolvedGalleryImages = useMemo(() => {
        if (!activeVariant) {
            return selectedProduct ? ['/images/product/1.webp'] : []
        }

        const productImages = Array.isArray((activeVariant as any)?.images)
            ? (activeVariant as any).images.map((img: any) => (typeof img === 'string' ? img : img?.url ?? '')).filter(Boolean)
            : []
        const thumbImages = Array.isArray((activeVariant as any)?.thumbImage)
            ? (activeVariant as any).thumbImage.map((img: any) => (typeof img === 'string' ? img : img?.url ?? '')).filter(Boolean)
            : []
        const variationImages = (activeVariant?.variation ?? [])
            .flatMap((variation) => [variation.image, variation.colorImage])
            .filter((img): img is string => typeof img === 'string' && img.length > 0)
        const galleryImages = Array.from(new Set([...productImages, ...variationImages])).filter(Boolean)

        if (galleryImages.length > 0) {
            return galleryImages
        }

        if (thumbImages.length > 0) {
            return thumbImages
        }

        return ['/images/product/1.webp']
    }, [activeVariant, selectedProduct])

    useEffect(() => {
        setLiveProduct(selectedProduct)
        setAvailabilityNotice(null)
    }, [selectedProduct])

    const refreshLiveProduct = useCallback(async () => {
        if (!selectedProduct) return null
        const snapshot = await fetchLiveCatalogSnapshot()
        const refreshedProduct = findLiveCatalogProduct(snapshot.groupedProducts, selectedProduct.id)
        setLiveProduct(refreshedProduct)
        return refreshedProduct
    }, [selectedProduct])

    const refreshSelectedVariant = useCallback(async () => {
        const refreshedProduct = await refreshLiveProduct()
        if (!refreshedProduct) {
            setQuantity(0)
            setAvailabilityNotice('Este producto ya no está disponible.')
            return null
        }

        const refreshedVariant = resolveLiveSelectedVariant(refreshedProduct, {
            requestedId: selectedProduct?.id,
            preferredVariantId: activeVariant?.id ?? defaultVariant?.id ?? null,
            preferredVariantLabel: getProductVariantLabel(activeVariant ?? defaultVariant ?? refreshedProduct),
            strictPreferredMatch: true,
        })
        if (!refreshedVariant) {
            setQuantity(0)
            setAvailabilityNotice('La variante seleccionada ya no está disponible.')
            return null
        }
        const refreshedStock = getLiveProductAvailableStock(refreshedVariant)

        if (refreshedStock <= 0) {
            setQuantity(0)
            setAvailabilityNotice('Esta variante ya no tiene stock disponible.')
            return null
        }

        setQuantity((current) => {
            if (current < 1) return 1
            return Math.min(current, refreshedStock)
        })
        setAvailabilityNotice(null)
        return {
            product: refreshedProduct,
            variant: refreshedVariant,
            stock: refreshedStock,
        }
    }, [activeSize, activeVariant?.id, defaultVariant?.id, refreshLiveProduct, selectedProduct?.id])

    useEffect(() => {
        if (!selectedProduct || !defaultVariant) {
            setQuantity(1)
            setActiveColor('')
            setActiveSize('')
            return
        }

        setQuantity(selectedProduct.quantityPurchase ?? 1)
        setActiveColor(getVariantColorValue(defaultVariant))
        setActiveSize(showGenericVariantSelector ? (getProductVariantLabel(defaultVariant) || defaultVariant.name) : getVariantSizeValue(defaultVariant))
    }, [selectedProduct?.id, defaultVariant?.id, showGenericVariantSelector])

    useEffect(() => {
        if (!activeVariant) return

        const nextColor = getVariantColorValue(activeVariant)
        const nextSize = showGenericVariantSelector
            ? (getProductVariantLabel(activeVariant) || activeVariant.name)
            : getVariantSizeValue(activeVariant)

        setActiveColor((current) => current === nextColor ? current : nextColor)
        setActiveSize((current) => current === nextSize ? current : nextSize)
    }, [activeVariant?.id, showGenericVariantSelector])

    const price = Number(activeVariant?.price ?? liveProduct?.price ?? 0)
    const originPrice = Number(activeVariant?.originPrice ?? liveProduct?.originPrice ?? 0)
    const availableStock = Math.max(0, getLiveProductAvailableStock(activeVariant ?? liveProduct))
    const safeQuantity = availableStock > 0 ? Math.min(Math.max(quantity, 1), availableStock) : 0
    const lineTotal = price * safeQuantity
    const hasSale = Boolean(activeVariant?.sale || liveProduct?.sale) && originPrice > price
    const percentSale = hasSale ? Math.floor(100 - ((price / originPrice) * 100)) : 0
    const categoryLabel = (liveProduct?.category ?? '').toLowerCase()
    const isFoodCategory = ['Alimento', 'alimento', 'premio'].some((word) => categoryLabel.includes(word))
    const productType = (liveProduct?.productType ?? '').toLowerCase()
    const isClothing = productType === 'ropa'
    const selectorLabel = isFoodCategory
        ? 'Tamano del paquete'
        : (isClothing ? 'Talla' : (hasSizeSelector ? 'Tamaño' : 'Variante'))
    const formattedCategory = [liveProduct?.category, liveProduct?.gender === 'dog' ? 'Perros' : liveProduct?.gender === 'cat' ? 'Gatos' : '']
        .filter(Boolean)
        .join(' · ')
    const sku = activeVariant ? getProductSku(activeVariant) : ''
    const colorOptions = useMemo(
        () => familyColorValues.map((color) => {
            const matchingVariant = variantProducts.find((product) => normalizeOptionValue(getVariantColorValue(product)) === normalizeOptionValue(color))
            const variationMatch = (matchingVariant?.variation ?? []).find((item) => normalizeOptionValue(item.color) === normalizeOptionValue(color))
            const image = variationMatch?.colorImage || variationMatch?.image || ''

            return {
                color,
                colorCode: variationMatch?.colorCode || '',
                image,
            }
        }),
        [familyColorValues, variantProducts],
    )

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

    const handleAddToCart = async () => {
        if (!selectedProduct || !activeVariant || availableStock <= 0 || safeQuantity <= 0) return

        setIsRefreshingStock(true)
        try {
            const liveSelection = await refreshSelectedVariant()
            if (!liveSelection) return

            const quantityToAdd = Math.min(safeQuantity, liveSelection.stock)
            const variantLabel = getProductVariantLabel(liveSelection.variant)
            const selectedColor = activeColor || getVariantColorValue(liveSelection.variant)
            const existingItem = cartState.cartArray.find((item) => item.id === liveSelection.variant.id)

            if (!existingItem) {
                addToCart({ ...liveSelection.variant, quantityPurchase: quantityToAdd })
                updateCart(liveSelection.variant.id, quantityToAdd, variantLabel, selectedColor)
            } else {
                const nextQuantity = Math.min((existingItem.quantity ?? 0) + quantityToAdd, liveSelection.stock)
                updateCart(liveSelection.variant.id, nextQuantity, variantLabel, selectedColor)
            }

            openModalCart()
            closeQuickview()
        } finally {
            setIsRefreshingStock(false)
        }
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

    if (!selectedProduct) {
        return null
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
                                        unoptimized={image.startsWith('data:') || image.startsWith('blob:')}
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
                                {hasColorSelector && (
                                    <div className="choose-color">
                                        <div className="text-title">Color: <span className="text-title color">{activeColor}</span></div>
                                        <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                                            {colorOptions.map((item, index) => (
                                                item.image ? (
                                                    <button
                                                        type="button"
                                                        className={`color-item w-12 h-12 rounded-xl duration-300 relative ${activeColor === item.color ? 'active' : ''}`}
                                                        key={`${item.color}-${index}`}
                                                        onClick={() => setActiveColor(item.color)}
                                                    >
                                                        <Image
                                                            src={item.image}
                                                            width={100}
                                                            height={100}
                                                            alt={item.color || 'color'}
                                                            className="rounded-xl"
                                                            unoptimized={item.image.startsWith('data:') || item.image.startsWith('blob:')}
                                                        />
                                                        <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                            {item.color}
                                                        </div>
                                                    </button>
                                                ) : item.colorCode ? (
                                                    <button
                                                        type="button"
                                                        className={`color-item w-12 h-12 rounded-full border duration-300 relative flex items-center justify-center ${activeColor === item.color ? 'border-black scale-105' : 'border-line'}`}
                                                        key={`${item.color}-${index}`}
                                                        onClick={() => setActiveColor(item.color)}
                                                        aria-label={`Color ${item.color}`}
                                                    >
                                                        <span className="w-10 h-10 rounded-full block" style={{ backgroundColor: item.colorCode || '#d9d9d9' }} />
                                                        <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                            {item.color}
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={`px-3 py-2 flex items-center justify-center text-button rounded-full bg-white border border-line ${activeColor === item.color ? 'active' : ''}`}
                                                        key={`${item.color}-${index}`}
                                                        onClick={() => setActiveColor(item.color)}
                                                        aria-label={`Color ${item.color}`}
                                                    >
                                                        {item.color}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(showGenericVariantSelector || hasSizeSelector || isClothing) && (
                                    <div className="choose-size mt-5">
                                        <div className="heading flex items-center justify-between">
                                            <div className="text-title">{selectorLabel}: <span className="text-title size">{showGenericVariantSelector ? (activeVariant ? (getProductVariantLabel(activeVariant) || activeVariant.name || '') : '') : activeSize}</span></div>
                                            {isClothing && hasSizeSelector && (
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
                                        {(showGenericVariantSelector || hasSizeSelector) && (
                                            <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                                                {(showGenericVariantSelector
                                                    ? genericVariantOptions
                                                    : familySizeValues.map((label) => ({ id: label, label }))
                                                ).map((option) => {
                                                    const isActive = showGenericVariantSelector
                                                        ? (activeVariant ? (getProductVariantLabel(activeVariant) || activeVariant.name || '') : '') === option.label
                                                        : activeSize === option.label
                                                    return (
                                                        <button
                                                            type="button"
                                                            className={`size-item px-3 py-2 flex items-center justify-center text-button rounded-full bg-white border border-line ${isActive ? 'active' : ''}`}
                                                            key={option.id}
                                                            onClick={() => setActiveSize(option.label)}
                                                        >
                                                            {option.label}
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
                                        disabled={availableStock <= 0 || isRefreshingStock}
                                        className="button-main w-full text-center bg-white text-black border border-black disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isRefreshingStock ? 'Validando stock...' : 'Agregar al carrito'}
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
                                {availabilityNotice && (
                                    <div className="mt-3 rounded-xl border border-red px-4 py-3 text-sm text-red">
                                        {availabilityNotice}
                                    </div>
                                )}

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
                                    {liveProduct?.brand && (
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">Marca:</div>
                                            <div className="text-secondary">{liveProduct.brand}</div>
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
