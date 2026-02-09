'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css/bundle'
import 'swiper/css/effect-fade'

const getSuffixByHeight = (h: number) => {
  if (h >= 840) return '4k'
  if (h >= 700) return '2k'
  if (h >= 620) return '1920'
  if (h >= 580) return '1080'
  if (h >= 453) return '720'
  if (h >= 243) return '720'
  return 'mobile'
}

type Suffix = '4k' | '2k' | '1920' | '1080' | '720' | '243' | 'mobile'

const SliderPet = () => {
  const [suffix, setSuffix] = useState<Suffix>('mobile')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth || 1920
      const height = Math.round(width * (620 / 1920))
      setSuffix(getSuffixByHeight(height))
    }

    update()              // calculamos el sufijo correcto
    setMounted(true)      // solo después mostramos el slider

    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div
      className="slider-block style-one w-full md:pb-0 pb-0 overflow-hidden slider-height"
    >
      {/* Mientras no esté montado, mantenemos solo el contenedor (sin Swiper) */}
      {mounted && (
        <div className="slider-main h-full w-full">
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            loop
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            className="h-full relative"
            speed={900}
            autoplay={{ delay: 7000 }}
          >
            <SwiperSlide>
              <div className="slider-item h-full w-full relative overflow-hidden">
                <Image
                  src={`/images/slider/slade1-${suffix}.jpg`}
                  alt="bg-pet1-1"
                  fill
                  priority
                  sizes="100vw"
                  className="absolute left-0 top-0 h-full w-full object-cover object-center"
                />
                <div className="container w-full h-full flex items-center relative">
                  <div className="text-content sm:w-1/2 w-full max-w-[720px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] px-4">
                    <div className="text-sub-display slider-text-sub normal-case">
                      ¡Oferta! Hasta 50% de descuento
                    </div>
                    <div className="text-display slider-text-display md:mt-5 mt-2 normal-case">
                      La tienda perfecta para tu mascota
                    </div>
                    <Link
                      href="/shop/breadcrumb-img"
                      className="button-main md:mt-8 mt-3 normal-case bg-[var(--blue)] text-white hover:bg-[var(--bluesecondary)] hover:text-white"
                    >
                      Compra ahora
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="slider-item h-full w-full relative overflow-hidden">
                <Image
                  src={`/images/slider/slade2-${suffix}.jpg`}
                  alt="bg-pet1-2"
                  fill
                  sizes="100vw"
                  className="absolute left-0 top-0 h-full w-full object-cover object-center"
                />
                <div className="container w-full h-full flex items-center relative">
                  <div className="text-content sm:w-1/2 w-full max-w-[720px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] px-4">
                    <div className="text-sub-display slider-text-sub normal-case">
                      ¡Oferta! Hasta 50% de descuento
                    </div>
                    <div className="text-display slider-text-display md:mt-5 mt-2 normal-case">
                      Alimenta el apetito de tu mascota
                    </div>
                    <Link
                      href="/shop/breadcrumb-img"
                      className="button-main md:mt-8 mt-3 normal-case bg-[var(--blue)] text-white hover:bg-[var(--bluesecondary)] hover:text-white"
                    >
                      Compra ahora
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="slider-item h-full w-full relative overflow-hidden">
                <Image
                  src={`/images/slider/slade3-${suffix}.jpg`}
                  alt="bg-pet1-3"
                  fill
                  sizes="100vw"
                  className="absolute left-0 top-0 h-full w-full object-cover object-center"
                />
                <div className="container w-full h-full flex items-center relative">
                  <div className="text-content sm:w-1/2 w-full max-w-[720px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] px-4">
                    <div className="text-sub-display slider-text-sub normal-case">
                      ¡Oferta! Hasta 50% de descuento
                    </div>
                    <div className="text-display slider-text-display md:mt-5 mt-2 normal-case">
                      Alimenta el apetito de tu mascota
                    </div>
                    <Link
                      href="/shop/breadcrumb-img"
                      className="button-main md:mt-8 mt-3 normal-case bg-[var(--blue)] text-white hover:bg-[var(--bluesecondary)] hover:text-white"
                    >
                      Compra ahora
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      )}
    </div>
  )
}

export default SliderPet
