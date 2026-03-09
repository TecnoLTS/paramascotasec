'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css/bundle'
import 'swiper/css/effect-fade'

type SliderSuffix =
  | 'mobile-xs'
  | 'mobile'
  | 'mobile-wide'
  | 'tablet'
  | 'laptop'
  | 'desktop'
  | 'fhd'
  | 'qhd'
  | 'uhd'

type LegacySuffix = '243' | '720' | '1080' | '1920' | '2k' | '4k'

const getSuffixByWidth = (w: number): SliderSuffix => {
  if (w >= 3840) return 'uhd'
  if (w >= 2560) return 'qhd'
  if (w >= 1920) return 'fhd'
  if (w >= 1280) return 'desktop'
  if (w >= 1024) return 'laptop'
  if (w >= 768) return 'tablet'
  if (w >= 640) return 'mobile-wide'
  if (w >= 480) return 'mobile'
  return 'mobile-xs'
}

const legacyFallbackBySuffix: Record<SliderSuffix, LegacySuffix[]> = {
  'mobile-xs': ['243', '720'],
  mobile: ['243', '720'],
  'mobile-wide': ['720', '243'],
  tablet: ['720', '1080'],
  laptop: ['1080', '720'],
  desktop: ['1080', '1920'],
  fhd: ['1920', '1080'],
  qhd: ['2k', '1920'],
  uhd: ['4k', '2k'],
}

const buildCandidateSources = (slide: 1 | 2 | 3, suffix: SliderSuffix) => {
  const sources = [
    `/images/slider/slade${slide}-${suffix}.jpg`,
    ...legacyFallbackBySuffix[suffix].map((legacy) => `/images/slider/slade${slide}-${legacy}.jpg`),
  ]
  return Array.from(new Set(sources))
}

type SliderImageProps = {
  alt: string
  slide: 1 | 2 | 3
  suffix: SliderSuffix
  priority?: boolean
}

const SliderImage = ({ alt, slide, suffix, priority }: SliderImageProps) => {
  const candidates = useMemo(() => buildCandidateSources(slide, suffix), [slide, suffix])
  const [candidateIndex, setCandidateIndex] = useState(0)

  useEffect(() => {
    setCandidateIndex(0)
  }, [slide, suffix])

  const src = candidates[Math.min(candidateIndex, candidates.length - 1)]

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      unoptimized
      sizes="100vw"
      onError={() => {
        setCandidateIndex((prev) => {
          if (prev >= candidates.length - 1) return prev
          return prev + 1
        })
      }}
      className="absolute left-0 top-0 h-full w-full object-cover object-right sm:object-center"
    />
  )
}

const SliderPet = () => {
  const [suffix, setSuffix] = useState<SliderSuffix>('mobile-xs')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth || 1920
      setSuffix(getSuffixByWidth(width))
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
                <SliderImage alt="bg-pet1-1" slide={1} suffix={suffix} priority />
                <div className="container w-full h-full flex items-center relative">
                  <div className="text-content sm:w-1/2 w-full max-w-[720px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] px-4">
                    <div className="text-sub-display slider-text-sub normal-case">
                      ¡Oferta! Hasta 50% de descuento
                    </div>
                    <div className="text-display slider-text-display md:mt-5 mt-2 normal-case">
                      La tienda perfecta para tu mascota
                    </div>
                    <Link
                      href="/shop/breadcrumb1"
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
                <SliderImage alt="bg-pet1-2" slide={2} suffix={suffix} />
                <div className="container w-full h-full flex items-center relative">
                  <div className="text-content sm:w-1/2 w-full max-w-[720px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] px-4">
                    <div className="text-sub-display slider-text-sub normal-case">
                      ¡Oferta! Hasta 50% de descuento
                    </div>
                    <div className="text-display slider-text-display md:mt-5 mt-2 normal-case">
                      Alimenta el apetito de tu mascota
                    </div>
                    <Link
                      href="/shop/breadcrumb1"
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
                <SliderImage alt="bg-pet1-3" slide={3} suffix={suffix} />
                <div className="container w-full h-full flex items-center relative">
                  <div className="text-content sm:w-1/2 w-full max-w-[720px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] px-4">
                    <div className="text-sub-display slider-text-sub normal-case">
                      ¡Oferta! Hasta 50% de descuento
                    </div>
                    <div className="text-display slider-text-display md:mt-5 mt-2 normal-case">
                      Alimenta el apetito de tu mascota
                    </div>
                    <Link
                      href="/shop/breadcrumb1"
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
