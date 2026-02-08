'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProductType } from '@/type/ProductType'
import Product from '../Product'
import Rate from '@/components/Other/Rate'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Scrollbar } from 'swiper/modules';
import 'swiper/css/bundle';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import SwiperCore from 'swiper/core';
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import ModalSizeguide from '@/components/Modal/ModalSizeguide'
import ShareMenu from '@/components/Product/ShareMenu'

SwiperCore.use([Navigation, Thumbs]);

interface Props {
  data: Array<ProductType>
  productId: string | number | null
}

const Default: React.FC<Props> = ({ data, productId }) => {
  // ref SOLO para el slider principal
  const mainSwiperRef = useRef<SwiperCore | null>(null);
  // ref SOLO para el popup
  const popupSwiperRef = useRef<SwiperCore | null>(null);

  const [photoIndex, setPhotoIndex] = useState(0)
  const [openPopupImg, setOpenPopupImg] = useState(false)
  const [openSizeGuide, setOpenSizeGuide] = useState<boolean>(false)
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
  const [activeColor, setActiveColor] = useState<string>('')
  const [activeSize, setActiveSize] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string | undefined>('description')
  const [quantity, setQuantity] = useState<number>(1)
  const { addToCart, updateCart, cartState } = useCart()
  const { openModalCart } = useModalCartContext()
  const router = useRouter()

  let productMain = data.find(product => product.id === productId) as ProductType
  if (productMain === undefined) {
    productMain = data[0]
  }
  productMain.quantityPurchase = productMain.quantityPurchase ?? 1
  const productType = (productMain.productType ?? '').toLowerCase()
  const isClothing = productType === 'ropa'
  const attributes = productMain.attributes ?? {}

  const attributeLabels: Record<string, Record<string, string>> = {
    comida: {
      brand: 'Marca',
      size: 'Tamaño',
      weight: 'Peso',
      flavor: 'Sabor',
      age: 'Edad',
      species: 'Especie',
      ingredients: 'Ingredientes',
    },
    ropa: {
      size: 'Talla',
      material: 'Material',
      color: 'Color',
      gender: 'Género',
      species: 'Especie',
    },
    accesorios: {
      material: 'Material',
      size: 'Tamaño',
      usage: 'Uso',
      species: 'Especie',
    },
  }

  const attributeRows = (() => {
    const labels = attributeLabels[productType]
    if (!labels) return []
    return Object.keys(labels).map((key) => {
      let value: any = (attributes as any)[key]
      if (key === 'brand' && !value) value = productMain.brand
      if (key === 'gender' && !value) value = productMain.gender
      return { key, label: labels[key], value }
    }).filter((item) => item.value !== undefined && item.value !== null && String(item.value).trim() !== '')
  })()

  const [pageSettings, setPageSettings] = useState({
    deliveryEstimate: '14 de enero - 18 de enero',
    viewerCount: 38,
    freeShippingThreshold: 75,
    supportHours: '8:30 AM a 10:00 PM',
    returnDays: 100
  })

  useEffect(() => {
    if ((productMain as any)?.pageSettings) {
      setPageSettings((productMain as any).pageSettings)
      return
    }
  }, [productMain?.id])

  const relatedCandidates = data.filter((p) => p.id !== productMain.id && p.gender === productMain.gender)
  const primaryRelated = relatedCandidates.filter((p) => p.category === productMain.category)
  const relatedProducts = [
    ...primaryRelated,
    ...relatedCandidates.filter((p) => p.category !== productMain.category),
  ].slice(0, 4)

  const sampleImages = [
    '/images/slider/slade1-1080.jpg',
    '/images/slider/slade2-1080.jpg',
    '/images/slider/slade3-1080.jpg',
  ]

  const productImages = Array.isArray((productMain as any)?.images)
    ? (productMain as any).images
      .map((img: any) => (typeof img === 'string' ? img : img?.url ?? ''))
      .filter(Boolean)
    : []
  const variationImages = (productMain.variation ?? [])
    .flatMap((variation) => [variation.image, variation.colorImage])
    .filter((img): img is string => typeof img === 'string' && img.length > 0)

  const rawGallery = [
    ...productImages,
    ...variationImages
  ]

  const dedupedGallery = Array.from(new Set(rawGallery)).filter(Boolean)
  const fallbackThumbs = Array.isArray((productMain as any)?.thumbImage)
    ? (productMain as any).thumbImage.filter(Boolean)
    : []

  const galleryBase = dedupedGallery.length > 0
    ? dedupedGallery
    : (fallbackThumbs.length > 0 ? fallbackThumbs : sampleImages)

  const galleryImages: string[] = galleryBase.map((img: string, idx: number) =>
    img.includes('1000x1000')
      ? sampleImages[idx % sampleImages.length]
      : img
  )

  const normalizedVariations = (productMain.variation ?? []).map((variation, idx) => ({
    ...variation,
    image: variation.image?.includes('1000x1000')
      ? galleryImages[idx % galleryImages.length]
      : variation.image,
    colorImage: variation.colorImage?.includes('48x48')
      ? galleryImages[idx % galleryImages.length]
      : variation.colorImage,
  }))
  const colorOptions = normalizedVariations.filter((item) => item.color)
  const fallbackColor = (attributes as any)?.color

  const price = Number(productMain?.price ?? 0)
  const originPrice = Number(productMain?.originPrice ?? 0)
  const hasSale = (productMain?.sale || originPrice > price) && originPrice > 0
  const percentSale = hasSale ? Math.floor(100 - ((price / originPrice) * 100)) : 0
  const specifications = (productMain as any)?.specifications as string[] | undefined
  const longDescription = (productMain as any)?.longDescription as string | undefined

  const handleOpenSizeGuide = () => setOpenSizeGuide(true)
  const handleCloseSizeGuide = () => setOpenSizeGuide(false)
  const handleSwiper = (swiper: SwiperCore) => setThumbsSwiper(swiper)

  const handleActiveColor = (item: string) => {
    setActiveColor(item)
    const foundColor = normalizedVariations.find((variation) => variation.color === item)
    if (foundColor) {
      const index = galleryImages.indexOf(foundColor.image)
      if (index !== -1) {
        mainSwiperRef.current?.slideTo(index)
        setPhotoIndex(index)
      }
    }
  }

  const handleActiveSize = (item: string) => setActiveSize(item)

  useEffect(() => {
    setQuantity(productMain.quantityPurchase ?? 1)
  }, [productMain.id])

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => (prev <= 1 ? prev : prev - 1))
  };

  const handleAddToCart = () => {
    const quantityToAdd = quantity ?? 1
    const existing = cartState.cartArray.find(item => item.id === productMain.id)

    if (!existing) {
      addToCart({ ...productMain, quantityPurchase: quantityToAdd });
      updateCart(productMain.id, quantityToAdd, activeSize, activeColor)
    } else {
      const nextQty = (existing.quantity ?? 0) + quantityToAdd
      updateCart(productMain.id, nextQty, activeSize, activeColor)
    }
    openModalCart()
  };

  const handleBuyNow = () => {
    const quantityToAdd = quantity ?? 1
    const existing = cartState.cartArray.find(item => item.id === productMain.id)

    if (!existing) {
      addToCart({ ...productMain, quantityPurchase: quantityToAdd });
      updateCart(productMain.id, quantityToAdd, activeSize, activeColor)
    } else {
      const nextQty = (existing.quantity ?? 0) + quantityToAdd
      updateCart(productMain.id, nextQty, activeSize, activeColor)
    }
    router.push('/cart')
  }

  const handleActiveTab = (tab: string) => setActiveTab(tab)
  const enableGalleryLoop = galleryImages.length > 1

  return (
    <>
      <div className="product-detail default">
        {/* ===================== 1. IMAGEN + CARACTERÍSTICAS (2 COLUMNAS) ===================== */}
        <div className="featured-product underwear md:py-20 py-10">
          <div className="container grid md:grid-cols-2 gap-x-10 gap-y-8">
            {/* --------- COLUMNA IZQUIERDA: GALERÍA --------- */}
            <div className="list-img w-full">
              {/* Slider principal */}
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
                {galleryImages.map((item, index) => (
                  <SwiperSlide
                    key={index}
                    onClick={() => {
                      mainSwiperRef.current?.slideTo(index, 0)
                      setPhotoIndex(index)
                      setOpenPopupImg(true)
                    }}
                  >
                    <Image
                      src={item}
                      width={1200}
                      height={1400}
                      alt={`${productMain.name} - Vista ${index + 1}`}
                      sizes="(min-width: 1024px) 560px, 90vw"
                      quality={90}
                      unoptimized={item.startsWith('/uploads/') || item.startsWith('/images/')}
                      className='w-full aspect-[4/5] object-contain bg-white'
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Thumbs */}
              <Swiper
                onSwiper={handleSwiper}
                spaceBetween={0}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[Navigation, Thumbs]}
                className="mySwiper mt-3"
              >
                {galleryImages.map((item, index) => (
                  <SwiperSlide
                    key={index}
                    onClick={() => {
                      mainSwiperRef.current?.slideTo(index, 0)
                      setPhotoIndex(index);
                    }}
                  >
                    <Image
                      src={item}
                      width={240}
                      height={300}
                      alt={`${productMain.name} - Miniatura ${index + 1}`}
                      sizes="80px"
                      quality={85}
                      unoptimized={item.startsWith('/uploads/') || item.startsWith('/images/')}
                      className='w-full aspect-[4/5] object-contain bg-white rounded-xl'
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Popup imágenes full screen */}
              <div className={`popup-img ${openPopupImg ? 'open' : ''}`}>
                <span
                  className="close-popup-btn absolute top-4 right-4 z-[2] cursor-pointer"
                  onClick={() => setOpenPopupImg(false)}
                >
                  <Icon.X className="text-3xl text-white" />
                </span>
                <Swiper
                  spaceBetween={0}
                  slidesPerView={1}
                  modules={[Navigation, Thumbs]}
                  navigation={true}
                  loop={enableGalleryLoop}
                  className="popupSwiper"
                  initialSlide={photoIndex}
                  onSwiper={(swiper) => {
                    popupSwiperRef.current = swiper
                  }}
                >
                  {galleryImages.map((item, index) => (
                    <SwiperSlide
                      key={index}
                      onClick={() => setOpenPopupImg(false)}
                    >
                      <Image
                        src={item}
                        width={1400}
                        height={1600}
                        alt={`${productMain.name} - Zoom ${index + 1}`}
                        sizes="(min-width: 1024px) 70vw, 90vw"
                        quality={92}
                        unoptimized={item.startsWith('/uploads/') || item.startsWith('/images/')}
                        className='w-full aspect-[4/5] object-contain bg-white rounded-xl'
                        onClick={(e) => e.stopPropagation()}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* --------- COLUMNA DERECHA: INFO + ACCIONES --------- */}
            <div className="product-infor w-full">
              {/* Título + wishlist */}
              <div className="flex gap-4">
                <div>
                  <div className="caption2 text-secondary font-semibold uppercase">
                    {productMain.type}
                  </div>
                  <h1 className="heading4 mt-1">{productMain.name}</h1>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mt-3 gap-2">
                <Rate currentRate={productMain.rate} size={14} />
                <span className='caption1 text-secondary'>(1.234 reseñas)</span>
              </div>

              {/* Precio + descripción corta */}
              <div className="mt-5 pb-6 border-b border-line">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="product-price heading5">${Number(productMain.price ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  {hasSale && (
                    <>
                      <div className='w-px h-4 bg-line'></div>
                      <div className="product-origin-price font-normal text-secondary2">
                        <del>${Number(productMain.originPrice ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</del>
                      </div>
                      <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                        -{percentSale}%
                      </div>
                    </>
                  )}
                </div>
                <div className='desc text-secondary mt-3'>
                  {productMain.description}
                </div>
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

              {/* Variaciones: color */}
              <div className="list-action mt-6">
                {(colorOptions.length > 0 || fallbackColor) && (
                  <div className="choose-color">
                    <div className="text-title">
                      Color: <span className='text-title color'>{activeColor || fallbackColor}</span>
                    </div>
                    {colorOptions.length > 0 ? (
                      <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                        {colorOptions.map((item, index) => (
                          <button
                            type="button"
                            key={index}
                            onClick={() => handleActiveColor(item.color)}
                            className={`color-item w-12 h-12 rounded-full border duration-300 relative flex items-center justify-center ${activeColor === item.color ? 'border-black scale-105' : 'border-line'}`}
                            aria-label={`Color ${item.color}`}
                          >
                            <span
                              className="w-10 h-10 rounded-full block"
                              style={{ backgroundColor: item.colorCode || '#d9d9d9' }}
                            />
                            <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                              {item.color}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full border border-line text-sm">
                        {fallbackColor}
                      </div>
                    )}
                  </div>
                )}

                {/* Variaciones: talla */}
                {isClothing && (productMain.sizes ?? []).length > 0 && (
                <div className="choose-size mt-5">
                  <div className="heading flex items-center justify-between gap-3">
                    <div className="text-title">
                      Talla: <span className='text-title size'>{activeSize}</span>
                    </div>
                    <div
                      className="caption1 size-guide text-red underline cursor-pointer whitespace-nowrap"
                      onClick={handleOpenSizeGuide}
                    >
                      Guía de tallas
                    </div>
                    <ModalSizeguide
                      data={productMain}
                      isOpen={openSizeGuide}
                      onClose={handleCloseSizeGuide}
                    />
                  </div>
                  <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                    {(productMain.sizes ?? []).map((item, index) => (
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

                {/* Cantidad + Add to cart */}
                <div className="text-title mt-5">Cantidad:</div>
                <div className="choose-quantity flex items-center lg:justify-between gap-5 gap-y-3 mt-3 flex-wrap">
                  <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                    <Icon.Minus
                      size={20}
                      onClick={handleDecreaseQuantity}
                      className={`${productMain.quantityPurchase === 1 ? 'disabled' : ''} cursor-pointer`}
                    />
                    <div className="body1 font-semibold">{quantity}</div>
                    <Icon.Plus
                      size={20}
                      onClick={handleIncreaseQuantity}
                      className='cursor-pointer'
                    />
                  </div>
                  <div
                    onClick={handleAddToCart}
                    className="button-main w-full text-center bg-white text-black border border-black"
                  >
                    Agregar al carrito
                  </div>
                </div>

                {/* CTA principal */}
                <div className="button-block mt-5">
                  <div className="button-main w-full text-center" onClick={handleBuyNow}>Comprar ahora</div>
                </div>

                {/* Acciones secundarias: compare / share */}
                <div className="flex items-center lg:gap-20 gap-8 mt-5 pb-6 border-b border-line">
                  <ShareMenu product={productMain} />
                </div>
              </div>{/* list-action */}
            </div>
          </div>

          {/* ===================== INFO EXTRA + DESCRIPCIÓN / ESPECIFICACIONES ===================== */}
          <div className="container mt-8">
            {/* Tabs descripción/especificaciones */}
            <div className="container mt-10">
              <div className="product-tabs pb-10 border-b border-line">
                <div className="tab-headers flex items-center gap-6 border-b border-line pb-3 overflow-x-auto">
                  <button
                    type="button"
                    className={`text-button pb-1 relative ${activeTab === 'description'
                      ? 'font-semibold after:content-[""] after:absolute after:left-0 after:-bottom-[2px] after:w-full after:h-[2px] after:bg-black'
                      : 'text-secondary'
                      }`}
                    onClick={() => handleActiveTab('description')}
                  >
                    Descripción
                  </button>
                  <button
                    type="button"
                    className={`text-button pb-1 relative ${activeTab === 'specifications'
                      ? 'font-semibold after:content-[""] after:absolute after:left-0 after:-bottom-[2px] after:w-full after:h-[2px] after:bg-black'
                      : 'text-secondary'
                      }`}
                    onClick={() => handleActiveTab('specifications')}
                  >
                    Especificaciones
                  </button>
                </div>

                <div className="tab-content pt-4">
                  {activeTab === 'description' && (
                    <div className="body1 text-secondary space-y-3 max-w-3xl">
                      <p>{longDescription || productMain.description}</p>
                    </div>
                  )}

                  {activeTab === 'specifications' && (
                    <div className="body1 text-secondary">
                      {specifications && specifications.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                          {specifications.map((spec, idx) => (
                            <li key={idx}>{spec}</li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="list-disc pl-5 space-y-1 max-w-3xl">
                          <li>Categoría: {productMain.category}</li>
                          <li>Mascota: {(attributes as any)?.species || productMain.gender || '-'}</li>
                          <li>Etiqueta: {(attributes as any)?.tag || productMain.type || '-'}</li>
                          <li>SKU: {(attributes as any)?.sku || '-'}</li>
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cards info extra */}
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
              {/* Card: Delivery & product info */}
              <div className="border border-line rounded-xl p-4 lg:p-6">
                <div className="flex items-center gap-2">
                  <Icon.ArrowClockwise className='body1' />
                  <div className="text-title">Envío y devoluciones</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Icon.Timer className='body1' />
                  <div className="text-title">Entrega estimada:</div>
                  <div className="text-secondary">{pageSettings.deliveryEstimate}</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Icon.Eye className='body1' />
                  <div className="text-title">{pageSettings.viewerCount}</div>
                  <div className="text-secondary">personas viendo este producto ahora mismo</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Icon.Question className='body1' />
                  <div className="text-title">Hacer una pregunta</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <div className="text-title">SKU:</div>
                  <div className="text-secondary">{(attributes as any)?.sku || '-'}</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <div className="text-title">Categorías:</div>
                  <div className="text-secondary">{productMain.category}{(attributes as any)?.species ? `, ${(attributes as any)?.species}` : ''}</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <div className="text-title">Etiqueta:</div>
                  <div className="text-secondary">{(attributes as any)?.tag || productMain.type || '-'}</div>
                </div>
              </div>

              {/* Card: Safe checkout */}
              <div className="border border-line rounded-xl p-4 lg:p-6">
                <div className="heading6 mb-4">Pago seguro garantizado</div>
                <div className="grid grid-cols-6 gap-2">
                  {['Frame-0', 'Frame-1', 'Frame-2', 'Frame-3', 'Frame-4', 'Frame-5'].map((frame) => (
                    <div key={frame} className="flex items-center justify-center">
                      <Image
                        src={`/images/payment/${frame}.png`}
                        width={500}
                        height={450}
                        alt={`Método de pago ${frame}`}
                        className='w-full'
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Card: Get it today */}
              <div className="border border-line rounded-xl p-4 lg:p-6">
                <div className="heading5">Recíbelo hoy</div>
                <div className="item flex items-center gap-3 mt-4">
                  <div className="icon-delivery-truck text-4xl"></div>
                  <div>
                    <div className="text-title">Envío gratis</div>
                    <div className="caption1 text-secondary mt-1">
                      Envío gratis en pedidos mayores a ${pageSettings.freeShippingThreshold}.
                    </div>
                  </div>
                </div>
                <div className="item flex items-center gap-3 mt-4">
                  <div className="icon-phone-call text-4xl"></div>
                  <div>
                    <div className="text-title">Soporte diario</div>
                    <div className="caption1 text-secondary mt-1">
                      Atención de {pageSettings.supportHours} todos los días
                    </div>
                  </div>
                </div>
                <div className="item flex items-center gap-3 mt-4">
                  <div className="icon-return text-4xl"></div>
                  <div>
                    <div className="text-title">Devoluciones hasta {pageSettings.returnDays} días</div>
                    <div className="caption1 text-secondary mt-1">
                      ¿No te convence? Solicita reembolso dentro de {pageSettings.returnDays} días.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== 3. RELATED PRODUCTS (FULL WIDTH) ===================== */}
        <div className="related-product md:py-20 py-10">
          <div className="container">
            <div className="heading3 text-center">Productos relacionados</div>
            <div className="list-product hide-product-sold  grid lg:grid-cols-4 grid-cols-2 md:gap-[30px] gap-5 md:mt-10 mt-6">
              {relatedProducts.map((item, index) => (
                <Product key={index} data={item} type='grid' style='style-1' />
              ))}
            </div>
          </div>
        </div>

        {/* ===================== 4. LO DEMÁS: REVIEWS + FORM (FULL WIDTH) ===================== */}
        <div className="review-block md:py-20 py-10 bg-surface">
          <div className="container">
            <div className="heading flex items-center justify-between flex-wrap gap-4">
              <div className="heading4">Opiniones de clientes</div>
              <Link href={'#form-review'} className='button-main bg-white text-black border border-black'>
                Escribir reseña
              </Link>
            </div>

            <div className="top-overview flex justify-between py-6 max-md:flex-col gap-y-6">
              <div className="rating lg:w-1/4 md:w-[30%] lg:pr-[75px] md:pr-[35px]">
                <div className="heading flex items-center justify-center flex-wrap gap-3 gap-y-4">
                  <div className="text-display">4.6</div>
                  <div className='flex flex-col items-center'>
                    <Rate currentRate={5} size={18} />
                    <div className='text-secondary text-center mt-1'>(1,968 valoraciones)</div>
                  </div>
                </div>
                <div className="list-rating mt-3">
                  <div className="item flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <div className="caption1">5</div>
                      <Icon.Star size={14} weight='fill' />
                    </div>
                    <div className="progress bg-line relative w-3/4 h-2">
                      <div className="progress-percent absolute bg-yellow w-[50%] h-full left-0 top-0"></div>
                    </div>
                    <div className="caption1">50%</div>
                  </div>
                  <div className="item flex items-center justify-between gap-1.5 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="caption1">4</div>
                      <Icon.Star size={14} weight='fill' />
                    </div>
                    <div className="progress bg-line relative w-3/4 h-2">
                      <div className="progress-percent absolute bg-yellow w-[20%] h-full left-0 top-0"></div>
                    </div>
                    <div className="caption1">20%</div>
                  </div>
                  <div className="item flex items-center justify-between gap-1.5 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="caption1">3</div>
                      <Icon.Star size={14} weight='fill' />
                    </div>
                    <div className="progress bg-line relative w-3/4 h-2">
                      <div className="progress-percent absolute bg-yellow w-[10%] h-full left-0 top-0"></div>
                    </div>
                    <div className="caption1">10%</div>
                  </div>
                  <div className="item flex items-center justify-between gap-1.5 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="caption1">2</div>
                      <Icon.Star size={14} weight='fill' />
                    </div>
                    <div className="progress bg-line relative w-3/4 h-2">
                      <div className="progress-percent absolute bg-yellow w-[10%] h-full left-0 top-0"></div>
                    </div>
                    <div className="caption1">10%</div>
                  </div>
                  <div className="item flex items-center justify-between gap-1.5 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="caption1">1</div>
                      <Icon.Star size={14} weight='fill' />
                    </div>
                    <div className="progress bg-line relative w-3/4 h-2">
                      <div className="progress-percent absolute bg-yellow w-[10%] h-full left-0 top-0"></div>
                    </div>
                    <div className="caption1">10%</div>
                  </div>
                </div>
              </div>

              <div className="list-img lg:w-3/4 md:w-[70%] lg:pl-[15px] md:pl-[15px]">
                <div className="heading5">Todas las imágenes (128)</div>
                <div className="list md:mt-6 mt-3">
                  <Swiper
                    spaceBetween={16}
                    slidesPerView={3}
                    modules={[Navigation]}
                    breakpoints={{
                      576: { slidesPerView: 4, spaceBetween: 16 },
                      640: { slidesPerView: 5, spaceBetween: 16 },
                      768: { slidesPerView: 4, spaceBetween: 16 },
                      992: { slidesPerView: 5, spaceBetween: 20 },
                      1100: { slidesPerView: 5, spaceBetween: 20 },
                      1290: { slidesPerView: 7, spaceBetween: 20 },
                    }}
                  >
                    {[...Array(7)].map((_, i) => (
                      <SwiperSlide key={i}>
                        <Image
                          src={'/images/product/1000x1000.png'}
                          width={400}
                          height={400}
                          alt=''
                          className='w-[120px] aspect-square object-cover rounded-lg'
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="sorting flex items-center flex-wrap md:gap-5 gap-3 gap-y-3 mt-6">
                  <div className="text-button">Ordenar por</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">Más recientes</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">5 estrellas</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">4 estrellas</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">3 estrellas</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">2 estrellas</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">1 estrella</div>
                </div>
              </div>
            </div>

            {/* Lista de reviews */}
            <div className="list-review">
              {[1, 2, 3].map((id) => (
                <div key={id} className="item flex max-lg:flex-col gap-y-4 w-full py-6 border-t border-line">
                  <div className="left lg:w-1/4 w-full lg:pr-[15px]">
                    <div className="list-img-review flex gap-2">
                      {[1, 2, 3].map((img) => (
                        <Image
                          key={img}
                          src={'/images/product/1000x1000.png'}
                          width={200}
                          height={200}
                          alt='img'
                          className='w-[60px] aspect-square rounded-lg'
                        />
                      ))}
                    </div>
                    <div className="user mt-3">
                      <div className="text-title">Tony Nguyen</div>
                      <div className="flex items-center gap-2">
                        <div className="text-secondary2">Hace 1 día</div>
                        <div className="text-secondary2">-</div>
                        <div className="text-secondary2">
                          <span>Yellow</span> / <span>XL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="right lg:w-3/4 w-full lg:pl-[15px]">
                    <Rate currentRate={5} size={16} />
                    <div className="heading5 mt-3">
                      {id === 1 && 'Estilo y calidad imbatibles'}
                      {id === 2 && 'Moda excepcional: equilibrio entre estilo y durabilidad'}
                      {id === 3 && 'Eleva tu clóset: prendas que destacan'}
                    </div>
                    <div className="body1 mt-3">
                      {id === 1 &&
                        'Me encanta la selección, siempre encuentro algo para cada ocasión y los precios son razonables. El envío es rápido y los productos llegan en perfecto estado.'}
                      {id === 2 &&
                        'La experiencia de compra es fluida. El sitio es fácil de usar, las imágenes claras y el checkout rápido.'}
                      {id === 3 &&
                        'Aprecio el enfoque sostenible y ético. Materiales responsables y buenas prácticas que me hacen sentir bien al comprar.'}
                    </div>
                    <div className="action mt-3">
                      <div className="flex items-center gap-4">
                        <div className="like-btn flex items-center gap-1 cursor-pointer">
                          <Icon.HandsClapping size={18} />
                          <div className="text-button">20</div>
                        </div>
                        <Link href={'#form-review'} className="reply-btn text-button text-secondary cursor-pointer hover:text-black">
                          Responder
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-button more-review-btn text-center mt-2 underline">
                Ver más comentarios
              </div>
            </div>

            {/* Formulario review */}
            <div id="form-review" className='form-review pt-6'>
              <div className="heading4">Deja un comentario</div>
              <form className="grid sm:grid-cols-2 gap-4 gap-y-5 mt-6">
                <div className="name ">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="username"
                    type="text"
                    placeholder="Tu nombre *"
                    required
                  />
                </div>
                <div className="mail ">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="email"
                    type="email"
                    placeholder="Tu correo *"
                    required
                  />
                </div>
                <div className="col-span-full message">
                  <textarea
                    className="border border-line px-4 py-3 w-full rounded-lg"
                    id="message"
                    name="message"
                    placeholder="Tu mensaje *"
                    required
                  ></textarea>
                </div>
                <div className="col-span-full flex items-start -mt-2 gap-2">
                  <input type="checkbox" id="saveAccount" name="saveAccount" className='mt-1.5' />
                  <label htmlFor="saveAccount">
                    Guardar mi nombre y correo para la próxima vez que comente.
                  </label>
                </div>
                <div className="col-span-full sm:pt-3">
                  <button className='button-main bg-white text-black border border-black'>Enviar reseña</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Default
