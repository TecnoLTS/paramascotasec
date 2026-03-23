'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from '@/components/Common/AppImage'
import { useRouter } from 'next/navigation'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'
import SwiperCore from 'swiper/core'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import 'swiper/css/bundle'
import { ProductType } from '@/type/ProductType'
import Product from '../Product'
import Rate from '@/components/Other/Rate'
import ModalSizeguide from '@/components/Modal/ModalSizeguide'
import ShareMenu from '@/components/Product/ShareMenu'
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import {
  findCatalogProduct,
  getProductReviewCount,
  getProductSku,
  getProductVariantLabel,
  getProductVariants,
  hasRealReviews,
  resolveSelectedVariant,
} from '@/lib/catalog'

interface Props {
  data: Array<ProductType>
  productId: string | number | null
}

const Default: React.FC<Props> = ({ data, productId }) => {
  const router = useRouter()
  const mainSwiperRef = useRef<SwiperCore | null>(null)
  const popupSwiperRef = useRef<SwiperCore | null>(null)

  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null)
  const [openPopupImg, setOpenPopupImg] = useState(false)
  const [openSizeGuide, setOpenSizeGuide] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [activeColor, setActiveColor] = useState('')
  const [activeSize, setActiveSize] = useState('')
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description')
  const [quantity, setQuantity] = useState(1)

  const { addToCart, updateCart, cartState } = useCart()
  const { openModalCart } = useModalCartContext()

  const requestedId = typeof productId === 'string' ? productId : String(productId ?? '')
  const productFamily = useMemo(() => findCatalogProduct(data, requestedId) ?? data[0], [data, requestedId])
  const variantProducts = useMemo(() => getProductVariants(productFamily), [productFamily])
  const defaultVariant = useMemo(() => resolveSelectedVariant(productFamily, requestedId), [productFamily, requestedId])
  const activeVariant = variantProducts.find((product) => getProductVariantLabel(product) === activeSize) ?? defaultVariant
  const showReviewSummary = hasRealReviews(productFamily)
  const reviewCount = getProductReviewCount(productFamily)

  useEffect(() => {
    if (!openPopupImg) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenPopupImg(false)
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openPopupImg])

  useEffect(() => {
    setQuantity(productFamily.quantityPurchase ?? 1)
    setActiveColor('')
    setActiveSize(getProductVariantLabel(defaultVariant))
  }, [productFamily.id, defaultVariant.id, productFamily.quantityPurchase])

  const productType = (productFamily.productType ?? '').toLowerCase()
  const isClothing = productType === 'ropa'
  const categoryLabel = (productFamily.category ?? '').toLowerCase()
  const isFoodCategory = ['Alimento', 'alimento', 'premio'].some((word) => categoryLabel.includes(word))
  const selectorLabel = isFoodCategory ? 'Tamano del paquete' : (isClothing ? 'Talla' : 'Variante')
  const sku = getProductSku(activeVariant)
  const price = Number(activeVariant.price ?? 0)
  const originPrice = Number(activeVariant.originPrice ?? 0)
  const hasSale = (activeVariant.sale || productFamily.sale || originPrice > price) && originPrice > price
  const percentSale = hasSale ? Math.floor(100 - ((price / originPrice) * 100)) : 0

  const pageSettings = productFamily.pageSettings ?? {
    deliveryEstimate: '14 de enero - 18 de enero',
    viewerCount: 38,
    freeShippingThreshold: 75,
    supportHours: '8:30 AM a 10:00 PM',
    returnDays: 100,
  }

  const attributeLabels: Record<string, Record<string, string>> = {
    Alimento: {
      size: 'Tamano',
      flavor: 'Sabor',
      target: 'Etapa',
      species: 'Especie',
      presentation: 'Presentacion',
    },
    ropa: {
      size: 'Talla',
      material: 'Material',
      color: 'Color',
      gender: 'Genero de la prenda',
      species: 'Mascota',
    },
    accesorios: {
      material: 'Material',
      usage: 'Uso',
      species: 'Especie',
      presentation: 'Presentacion',
    },
  }

  const attributeRows = useMemo(() => {
    const attributes = activeVariant.attributes ?? {}
    const labels = attributeLabels[productType] ?? {}

    return Object.entries(labels)
      .map(([key, label]) => {
        let value: unknown = attributes[key]
        if (key === 'size' && !value) value = getProductVariantLabel(activeVariant)
        return { key, label, value }
      })
      .filter((item) => item.value !== undefined && item.value !== null && String(item.value).trim() !== '')
  }, [activeVariant, productType])

  const productImages = Array.isArray((activeVariant as any)?.images)
    ? (activeVariant as any).images.map((img: any) => (typeof img === 'string' ? img : img?.url ?? '')).filter(Boolean)
    : []
  const thumbImages = Array.isArray((activeVariant as any)?.thumbImage)
    ? (activeVariant as any).thumbImage.map((img: any) => (typeof img === 'string' ? img : img?.url ?? '')).filter(Boolean)
    : []
  const variationImages = (activeVariant.variation ?? [])
    .flatMap((variation) => [variation.image, variation.colorImage])
    .filter((img): img is string => typeof img === 'string' && img.length > 0)
  const galleryImages = Array.from(new Set([...productImages, ...variationImages])).filter(Boolean)
  const resolvedGalleryImages = galleryImages.length > 0
    ? galleryImages
    : (thumbImages.length > 0 ? thumbImages : ['/images/product/1.jpg'])
  const colorOptions = (activeVariant.variation ?? []).filter((item) => item.color)

  const relatedProducts = useMemo(() => {
    return data
      .filter((product) => product.id !== productFamily.id && product.variantGroupKey !== productFamily.variantGroupKey)
      .filter((product) => !productFamily.gender || product.gender === productFamily.gender)
      .slice(0, 4)
  }, [data, productFamily.gender, productFamily.id, productFamily.variantGroupKey])

  const handleAddToCart = () => {
    const quantityToAdd = quantity ?? 1
    const existingItem = cartState.cartArray.find((item) => item.id === activeVariant.id)
    const variantLabel = activeSize || getProductVariantLabel(activeVariant)

    if (!existingItem) {
      addToCart({ ...activeVariant, quantityPurchase: quantityToAdd })
      updateCart(activeVariant.id, quantityToAdd, variantLabel, activeColor)
    } else {
      const nextQuantity = (existingItem.quantity ?? 0) + quantityToAdd
      updateCart(activeVariant.id, nextQuantity, variantLabel, activeColor)
    }

    openModalCart()
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  const formattedCategory = [productFamily.category, productFamily.gender === 'dog' ? 'Perros' : productFamily.gender === 'cat' ? 'Gatos' : '']
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="product-detail default">
      <div className="featured-product underwear md:py-20 py-10">
        <div className="container grid md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="list-img w-full">
            <Swiper
              slidesPerView={1}
              spaceBetween={0}
              thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
              modules={[Thumbs]}
              className="mySwiper2 rounded-2xl overflow-hidden"
              onSwiper={(swiper) => {
                mainSwiperRef.current = swiper
              }}
            >
              {resolvedGalleryImages.map((image, index) => (
                <SwiperSlide
                  key={`${image}-${index}`}
                  onClick={() => {
                    mainSwiperRef.current?.slideTo(index, 0)
                    setPhotoIndex(index)
                    setOpenPopupImg(true)
                  }}
                >
                  <Image
                    src={image}
                    width={1200}
                    height={1400}
                    alt={`${productFamily.name} - Vista ${index + 1}`}
                    sizes="(min-width: 1024px) 560px, 90vw"
                    quality={90}
                    unoptimized={image.startsWith('/uploads/') || image.startsWith('/images/')}
                    className="w-full aspect-[4/5] object-contain bg-white"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView={4}
              freeMode
              watchSlidesProgress
              modules={[Navigation, Thumbs]}
              className="mySwiper mt-3"
            >
              {resolvedGalleryImages.map((image, index) => (
                <SwiperSlide
                  key={`${image}-thumb-${index}`}
                  onClick={() => {
                    mainSwiperRef.current?.slideTo(index, 0)
                    setPhotoIndex(index)
                  }}
                >
                  <Image
                    src={image}
                    width={240}
                    height={300}
                    alt={`${productFamily.name} - Miniatura ${index + 1}`}
                    sizes="80px"
                    quality={85}
                    unoptimized={image.startsWith('/uploads/') || image.startsWith('/images/')}
                    className="w-full aspect-[4/5] object-contain bg-white rounded-xl"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <div
              className={`popup-img ${openPopupImg ? 'open' : ''}`}
              onClick={() => setOpenPopupImg(false)}
              aria-hidden={!openPopupImg}
            >
              <button
                type="button"
                className="close-popup-btn"
                onClick={(event) => {
                  event.stopPropagation()
                  setOpenPopupImg(false)
                }}
                aria-label="Cerrar visor de imagen"
              >
                <Icon.X weight="bold" />
              </button>
              <div className="popup-img-dialog" onClick={(event) => event.stopPropagation()}>
                <Swiper
                  spaceBetween={0}
                  slidesPerView={1}
                  modules={[Navigation]}
                  navigation
                  loop={resolvedGalleryImages.length > 1}
                  className="popupSwiper"
                  initialSlide={photoIndex}
                  onSwiper={(swiper) => {
                    popupSwiperRef.current = swiper
                  }}
                >
                  {resolvedGalleryImages.map((image, index) => (
                    <SwiperSlide key={`${image}-zoom-${index}`}>
                      <Image
                        src={image}
                        width={1400}
                        height={1600}
                        alt={`${productFamily.name} - Zoom ${index + 1}`}
                        sizes="(min-width: 1024px) 70vw, 90vw"
                        quality={92}
                        unoptimized={image.startsWith('/uploads/') || image.startsWith('/images/')}
                        className="w-full aspect-[4/5] object-contain bg-white rounded-xl"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>

          <div className="product-infor w-full">
            <div className="flex gap-4">
              <div>
                {productFamily.brand && (
                  <div className="caption2 text-secondary font-semibold uppercase">{productFamily.brand}</div>
                )}
                <h1 className="heading4 mt-1">{productFamily.name}</h1>
              </div>
            </div>

            {showReviewSummary && (
              <div className="flex items-center mt-3 gap-2">
                <Rate currentRate={productFamily.rate} size={14} />
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
              <div className="desc text-secondary mt-3">{activeVariant.description}</div>

              {attributeRows.length > 0 && (
                <div className="mt-4 p-4 bg-surface border border-line rounded-xl">
                  <div className="text-title mb-3">Detalles del producto</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {attributeRows.map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-3">
                        <span className="text-secondary">{item.label}</span>
                        <span className="font-semibold text-right">{String(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="list-action mt-6">
              {colorOptions.length > 0 && (
                <div className="choose-color">
                  <div className="text-title">Color: <span className="text-title color">{activeColor}</span></div>
                  <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                    {colorOptions.map((item, index) => (
                      <button
                        type="button"
                        key={`${item.color}-${index}`}
                        onClick={() => setActiveColor(item.color)}
                        className={`color-item w-12 h-12 rounded-full border duration-300 relative flex items-center justify-center ${activeColor === item.color ? 'border-black scale-105' : 'border-line'}`}
                        aria-label={`Color ${item.color}`}
                      >
                        <span className="w-10 h-10 rounded-full block" style={{ backgroundColor: item.colorCode || '#d9d9d9' }} />
                        <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                          {item.color}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(variantProducts.length > 1 || isClothing) && (
                <div className="choose-size mt-5">
                  <div className="heading flex items-center justify-between gap-3">
                    <div className="text-title">{selectorLabel}: <span className="text-title size">{activeSize}</span></div>
                    {isClothing && (
                      <>
                        <div
                          className="caption1 size-guide text-red underline cursor-pointer whitespace-nowrap"
                          onClick={() => setOpenSizeGuide(true)}
                        >
                          Guia de tallas
                        </div>
                        <ModalSizeguide data={activeVariant} isOpen={openSizeGuide} onClose={() => setOpenSizeGuide(false)} />
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

              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                {sku && (
                  <div className="rounded-xl border border-line p-4 bg-white">
                    <div className="caption1 text-secondary">SKU</div>
                    <div className="text-title mt-1">{sku}</div>
                  </div>
                )}
                <div className="rounded-xl border border-line p-4 bg-white">
                  <div className="caption1 text-secondary">Disponibilidad</div>
                  <div className="text-title mt-1">{activeVariant.quantity > 0 ? `${activeVariant.quantity} en stock` : 'Sin stock'}</div>
                </div>
              </div>

              <div className="text-title mt-5">Cantidad:</div>
              <div className="choose-quantity flex items-center lg:justify-between gap-5 gap-y-3 mt-3 flex-wrap">
                <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                  <Icon.Minus
                    size={20}
                    onClick={() => setQuantity((current) => current <= 1 ? current : current - 1)}
                    className="cursor-pointer"
                  />
                  <div className="body1 font-semibold">{quantity}</div>
                  <Icon.Plus size={20} onClick={() => setQuantity((current) => current + 1)} className="cursor-pointer" />
                </div>
                <div onClick={handleAddToCart} className="button-main w-full text-center bg-white text-black border border-black">
                  Agregar al carrito
                </div>
              </div>

              <div className="button-block mt-5">
                <div className="button-main w-full text-center" onClick={handleBuyNow}>Comprar ahora</div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-5 pb-6 border-b border-line">
                <div className="rounded-xl border border-line p-4 bg-surface">
                  <div className="caption1 text-secondary">Categoria</div>
                  <div className="text-title mt-1">{formattedCategory}</div>
                </div>
                <div className="rounded-xl border border-line p-4 bg-surface">
                  <div className="caption1 text-secondary">Entrega estimada</div>
                  <div className="text-title mt-1">{pageSettings.deliveryEstimate}</div>
                </div>
              </div>

              <div className="flex items-center lg:gap-20 gap-8 mt-5">
                <ShareMenu product={activeVariant} />
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-10">
          <div className="product-tabs pb-10 border-b border-line">
            <div className="tab-headers flex items-center gap-6 border-b border-line pb-3 overflow-x-auto">
              <button
                type="button"
                className={`text-button pb-1 relative ${activeTab === 'description'
                  ? 'font-semibold after:content-[""] after:absolute after:left-0 after:-bottom-[2px] after:w-full after:h-[2px] after:bg-black'
                  : 'text-secondary'
                  }`}
                onClick={() => setActiveTab('description')}
              >
                Descripcion
              </button>
              <button
                type="button"
                className={`text-button pb-1 relative ${activeTab === 'specifications'
                  ? 'font-semibold after:content-[""] after:absolute after:left-0 after:-bottom-[2px] after:w-full after:h-[2px] after:bg-black'
                  : 'text-secondary'
                  }`}
                onClick={() => setActiveTab('specifications')}
              >
                Especificaciones
              </button>
            </div>

            {activeTab === 'description' ? (
              <div className="mt-6 text-secondary leading-7">{activeVariant.description}</div>
            ) : (
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {attributeRows.length > 0 ? (
                  attributeRows.map((item) => (
                    <div key={`spec-${item.key}`} className="rounded-xl border border-line p-4 bg-white">
                      <div className="caption1 text-secondary">{item.label}</div>
                      <div className="text-title mt-1">{String(item.value)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-secondary">Este producto aun no tiene especificaciones adicionales cargadas.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="container mt-10">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-line p-5 bg-surface">
              <div className="text-title">Envio y devoluciones</div>
              <div className="caption1 text-secondary mt-2">Atencion de {pageSettings.supportHours} todos los dias.</div>
            </div>
            <div className="rounded-2xl border border-line p-5 bg-surface">
              <div className="text-title">Envio gratis</div>
              <div className="caption1 text-secondary mt-2">Disponible desde ${Number(pageSettings.freeShippingThreshold ?? 0).toFixed(2)}.</div>
            </div>
            <div className="rounded-2xl border border-line p-5 bg-surface">
              <div className="text-title">Politica de devolucion</div>
              <div className="caption1 text-secondary mt-2">Hasta {pageSettings.returnDays} dias para solicitar cambios o devoluciones.</div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-product md:py-20 py-10">
          <div className="container">
            <div className="heading3 text-center">Productos relacionados</div>
            <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 md:gap-[30px] gap-5 md:mt-10 mt-6">
              {relatedProducts.map((item) => (
                <Product key={item.id} data={item} type="grid" style="style-1" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Default
