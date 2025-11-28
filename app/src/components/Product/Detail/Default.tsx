'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
import { useWishlist } from '@/context/WishlistContext'
import { useModalWishlistContext } from '@/context/ModalWishlistContext'
import { useCompare } from '@/context/CompareContext'
import { useModalCompareContext } from '@/context/ModalCompareContext'
import ModalSizeguide from '@/components/Modal/ModalSizeguide'

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
  const { addToCart, updateCart, cartState } = useCart()
  const { openModalCart } = useModalCartContext()
  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist()
  const { openModalWishlist } = useModalWishlistContext()
  const { addToCompare, removeFromCompare, compareState } = useCompare();
  const { openModalCompare } = useModalCompareContext()
  let productMain = data.find(product => product.id === productId) as ProductType
  if (productMain === undefined) {
    productMain = data[0]
  }

  const sampleImages = [
    '/images/slider/slade1-1080.jpg',
    '/images/slider/slade2-1080.jpg',
    '/images/slider/slade3-1080.jpg',
  ]

  const galleryImages = (
    productMain.images && productMain.images.length > 0 ? productMain.images : sampleImages
  ).map((img, idx) =>
    img.includes('1000x1000') ? sampleImages[idx % sampleImages.length] : img
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

  const percentSale = Math.floor(100 - ((productMain?.price / productMain?.originPrice) * 100))
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

  const handleIncreaseQuantity = () => {
    productMain.quantityPurchase += 1
    updateCart(productMain.id, productMain.quantityPurchase + 1, activeSize, activeColor);
  };

  const handleDecreaseQuantity = () => {
    if (productMain.quantityPurchase > 1) {
      productMain.quantityPurchase -= 1
      updateCart(productMain.id, productMain.quantityPurchase - 1, activeSize, activeColor);
    }
  };

  const handleAddToCart = () => {
    if (!cartState.cartArray.find(item => item.id === productMain.id)) {
      addToCart({ ...productMain });
      updateCart(productMain.id, productMain.quantityPurchase, activeSize, activeColor)
    } else {
      updateCart(productMain.id, productMain.quantityPurchase, activeSize, activeColor)
    }
    openModalCart()
  };

  const handleAddToWishlist = () => {
    if (wishlistState.wishlistArray.some(item => item.id === productMain.id)) {
      removeFromWishlist(productMain.id);
    } else {
      addToWishlist(productMain);
    }
    openModalWishlist();
  };

  const handleAddToCompare = () => {
    if (compareState.compareArray.length < 3) {
      if (compareState.compareArray.some(item => item.id === productMain.id)) {
        removeFromCompare(productMain.id);
      } else {
        addToCompare(productMain);
      }
    } else {
      alert('Compare up to 3 products')
    }
    openModalCompare();
  };

  const handleActiveTab = (tab: string) => setActiveTab(tab)

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
                      width={1000}
                      height={1000}
                      alt='prd-img'
                      className='w-full aspect-[3/4] object-cover'
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
                      mainSwiperRef.current?.slideTo(index);
                      setPhotoIndex(index);
                    }}
                  >
                    <Image
                      src={item}
                      width={1000}
                      height={1000}
                      alt='prd-img'
                      className='w-full aspect-[3/4] object-cover rounded-xl'
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
                  loop={true}
                  className="popupSwiper"
                  initialSlide={photoIndex}
                  onSwiper={(swiper) => {
                    popupSwiperRef.current = swiper
                  }}
                >
                  {galleryImages.map((item, index) => (
                    <SwiperSlide
                      key={index}
                      onClick={() => setOpenPopupImg(false)
                        
                      }
                    >
                      <Image
                        src={item}
                        width={1000}
                        height={1000}
                        alt='prd-img'
                        className='w-full aspect-[3/4] object-cover rounded-xl'
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
              <div className="flex justify-between gap-4">
                <div>
                  <div className="caption2 text-secondary font-semibold uppercase">
                    {productMain.type}
                  </div>
                  <div className="heading4 mt-1">{productMain.name}</div>
                </div>
                <div
                  className={`add-wishlist-btn w-12 h-12 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white ${wishlistState.wishlistArray.some(item => item.id === productMain.id) ? 'active' : ''}`}
                  onClick={handleAddToWishlist}
                >
                  {wishlistState.wishlistArray.some(item => item.id === productMain.id) ? (
                    <Icon.Heart size={24} weight='fill' className='text-white' />
                  ) : (
                    <Icon.Heart size={24} />
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mt-3 gap-2">
                <Rate currentRate={productMain.rate} size={14} />
                <span className='caption1 text-secondary'>(1.234 reviews)</span>
              </div>

              {/* Precio + descripción corta */}
              <div className="mt-5 pb-6 border-b border-line">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="product-price heading5">${productMain.price}.00</div>
                  {productMain.originPrice && (
                    <>
                      <div className='w-px h-4 bg-line'></div>
                      <div className="product-origin-price font-normal text-secondary2">
                        <del>${productMain.originPrice}.00</del>
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
              </div>

              {/* Variaciones: color */}
              <div className="list-action mt-6">
                <div className="choose-color">
                  <div className="text-title">
                    Colors: <span className='text-title color'>{activeColor}</span>
                  </div>
                  <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                    {normalizedVariations.map((item, index) => (
                      <div
                        className={`color-item w-12 h-12 rounded-xl duration-300 relative ${activeColor === item.color ? 'active' : ''}`}
                        key={index}
                        datatype={item.image}
                        onClick={() => handleActiveColor(item.color)}
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

                {/* Variaciones: talla */}
                <div className="choose-size mt-5">
                  <div className="heading flex items-center justify-between gap-3">
                    <div className="text-title">
                      Size: <span className='text-title size'>{activeSize}</span>
                    </div>
                    <div
                      className="caption1 size-guide text-red underline cursor-pointer whitespace-nowrap"
                      onClick={handleOpenSizeGuide}
                    >
                      Size Guide
                    </div>
                    <ModalSizeguide
                      data={productMain}
                      isOpen={openSizeGuide}
                      onClose={handleCloseSizeGuide}
                    />
                  </div>
                  <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                    {productMain.sizes.map((item, index) => (
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

                {/* Cantidad + Add to cart */}
                <div className="text-title mt-5">Quantity:</div>
                <div className="choose-quantity flex items-center lg:justify-between gap-5 gap-y-3 mt-3 flex-wrap">
                  <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                    <Icon.Minus
                      size={20}
                      onClick={handleDecreaseQuantity}
                      className={`${productMain.quantityPurchase === 1 ? 'disabled' : ''} cursor-pointer`}
                    />
                    <div className="body1 font-semibold">{productMain.quantityPurchase}</div>
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
                    Add To Cart
                  </div>
                </div>

                {/* CTA principal */}
                <div className="button-block mt-5">
                  <div className="button-main w-full text-center">Buy It Now</div>
                </div>

                {/* Acciones secundarias: compare / share */}
                <div className="flex items-center lg:gap-20 gap-8 mt-5 pb-6 border-b border-line">
                  <div
                    className="compare flex items-center gap-3 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleAddToCompare() }}
                  >
                    <div className="compare-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                      <Icon.ArrowsCounterClockwise className='heading6' />
                    </div>
                    <span>Compare</span>
                  </div>
                  <div className="share flex items-center gap-3 cursor-pointer">
                    <div className="share-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duración-300 hover:bg-black hover:text-white">
                      <Icon.ShareNetwork weight='fill' className='heading6' />
                    </div>
                    <span>Share Products</span>
                  </div>
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
                    className={`text-button pb-1 relative ${
                      activeTab === 'description'
                        ? 'font-semibold after:content-[""] after:absolute after:left-0 after:-bottom-[2px] after:w-full after:h-[2px] after:bg-black'
                        : 'text-secondary'
                    }`}
                    onClick={() => handleActiveTab('description')}
                  >
                    Description
                  </button>
                  <button
                    type="button"
                    className={`text-button pb-1 relative ${
                      activeTab === 'specifications'
                        ? 'font-semibold after:content-[""] after:absolute after:left-0 after:-bottom-[2px] after:w-full after:h-[2px] after:bg-black'
                        : 'text-secondary'
                    }`}
                    onClick={() => handleActiveTab('specifications')}
                  >
                    Specifications
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
                          <li>Category: {productMain.category}</li>
                          <li>Gender: {productMain.gender}</li>
                          <li>Tag: {productMain.type}</li>
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
                  <div className="text-title">Delivery & Return</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Icon.Timer className='body1' />
                  <div className="text-title">Estimated Delivery:</div>
                  <div className="text-secondary">14 January - 18 January</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Icon.Eye className='body1' />
                  <div className="text-title">38</div>
                  <div className="text-secondary">people viewing this product right now!</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Icon.Question className='body1' />
                  <div className="text-title">Ask A Question</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <div className="text-title">SKU:</div>
                  <div className="text-secondary">53453412</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <div className="text-title">Categories:</div>
                  <div className="text-secondary">{productMain.category}, {productMain.gender}</div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <div className="text-title">Tag:</div>
                  <div className="text-secondary">{productMain.type}</div>
                </div>
              </div>

              {/* Card: Safe checkout */}
              <div className="border border-line rounded-xl p-4 lg:p-6">
                <div className="heading6 mb-4">Guaranteed Safe Checkout</div>
                <div className="grid grid-cols-6 gap-2">
                  {['Frame-0', 'Frame-1', 'Frame-2', 'Frame-3', 'Frame-4', 'Frame-5'].map((frame) => (
                    <div key={frame} className="flex items-center justify-center">
                      <Image
                        src={`/images/payment/${frame}.png`}
                        width={500}
                        height={450}
                        alt='payment'
                        className='w-full'
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Card: Get it today */}
              <div className="border border-line rounded-xl p-4 lg:p-6">
                <div className="heading5">Get it Today</div>
                <div className="item flex items-center gap-3 mt-4">
                  <div className="icon-delivery-truck text-4xl"></div>
                  <div>
                    <div className="text-title">Free Shipping</div>
                    <div className="caption1 text-secondary mt-1">
                      Free shipping on orders over $75.
                    </div>
                  </div>
                </div>
                <div className="item flex items-center gap-3 mt-4">
                  <div className="icon-phone-call text-4xl"></div>
                  <div>
                    <div className="text-title">Support Everyday</div>
                    <div className="caption1 text-secondary mt-1">
                      Support from 8:30 AM to 10:00 PM everyday
                    </div>
                  </div>
                </div>
                <div className="item flex items-center gap-3 mt-4">
                  <div className="icon-return text-4xl"></div>
                  <div>
                    <div className="text-title">100 Day Returns</div>
                    <div className="caption1 text-secondary mt-1">
                      Not impressed? Get a refund. You have 100 days to break our hearts.
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
            <div className="heading3 text-center">Related Products</div>
            <div className="list-product hide-product-sold  grid lg:grid-cols-4 grid-cols-2 md:gap-[30px] gap-5 md:mt-10 mt-6">
              {data.slice(Number(productId), Number(productId) + 4).map((item, index) => (
                <Product key={index} data={item} type='grid' style='style-1' />
              ))}
            </div>
          </div>
        </div>

        {/* ===================== 4. LO DEMÁS: REVIEWS + FORM (FULL WIDTH) ===================== */}
        <div className="review-block md:py-20 py-10 bg-surface">
          <div className="container">
            <div className="heading flex items-center justify-between flex-wrap gap-4">
              <div className="heading4">Customer Review</div>
              <Link href={'#form-review'} className='button-main bg-white text-black border border-black'>
                Write Reviews
              </Link>
            </div>

            <div className="top-overview flex justify-between py-6 max-md:flex-col gap-y-6">
              <div className="rating lg:w-1/4 md:w-[30%] lg:pr-[75px] md:pr-[35px]">
                <div className="heading flex items-center justify-center flex-wrap gap-3 gap-y-4">
                  <div className="text-display">4.6</div>
                  <div className='flex flex-col items-center'>
                    <Rate currentRate={5} size={18} />
                    <div className='text-secondary text-center mt-1'>(1,968 Ratings)</div>
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
                <div className="heading5">All Image (128)</div>
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
                  <div className="text-button">Sort by</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">Newest</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">5 Star</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">4 Star</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">3 Star</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">2 Star</div>
                  <div className="item bg-white px-4 py-1 border border-line rounded-full">1 Star</div>
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
                        <div className="text-secondary2">1 days ago</div>
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
                      {id === 1 && 'Unbeatable Style and Quality: A Fashion Brand That Delivers'}
                      {id === 2 && 'Exceptional Fashion: The Perfect Blend of Style and Durability'}
                      {id === 3 && 'Elevate Your Wardrobe: Stunning Dresses That Make a Statement'}
                    </div>
                    <div className="body1 mt-3">
                      {id === 1 &&
                        'I can\'t get enough of the fashion pieces from this brand. They have a great selection for every occasion and the prices are reasonable. The shipping is fast and the items always arrive in perfect condition.'}
                      {id === 2 &&
                        'The fashion brand\'s online shopping experience is seamless. The website is user-friendly, the product images are clear, and the checkout process is quick.'}
                      {id === 3 &&
                        'I love how sustainable and ethically conscious this fashion brand is. They prioritize eco-friendly materials and fair trade practices, which makes me feel good about supporting them.'}
                    </div>
                    <div className="action mt-3">
                      <div className="flex items-center gap-4">
                        <div className="like-btn flex items-center gap-1 cursor-pointer">
                          <Icon.HandsClapping size={18} />
                          <div className="text-button">20</div>
                        </div>
                        <Link href={'#form-review'} className="reply-btn text-button text-secondary cursor-pointer hover:text-black">
                          Reply
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-button more-review-btn text-center mt-2 underline">
                View More Comments
              </div>
            </div>

            {/* Formulario review */}
            <div id="form-review" className='form-review pt-6'>
              <div className="heading4">Leave A comment</div>
              <form className="grid sm:grid-cols-2 gap-4 gap-y-5 mt-6">
                <div className="name ">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="username"
                    type="text"
                    placeholder="Your Name *"
                    required
                  />
                </div>
                <div className="mail ">
                  <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    id="email"
                    type="email"
                    placeholder="Your Email *"
                    required
                  />
                </div>
                <div className="col-span-full message">
                  <textarea
                    className="border border-line px-4 py-3 w-full rounded-lg"
                    id="message"
                    name="message"
                    placeholder="Your message *"
                    required
                  ></textarea>
                </div>
                <div className="col-span-full flex items-start -mt-2 gap-2">
                  <input type="checkbox" id="saveAccount" name="saveAccount" className='mt-1.5' />
                  <label htmlFor="saveAccount">
                    Save my name, email, and website in this browser for the next time I comment.
                  </label>
                </div>
                <div className="col-span-full sm:pt-3">
                  <button className='button-main bg-white text-black border border-black'>Submit Reviews</button>
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
