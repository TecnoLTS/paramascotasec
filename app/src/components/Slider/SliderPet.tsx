'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

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

type SlideId = 1 | 2 | 3

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

const sourceOrder: Array<{ media?: string; suffix: SliderSuffix }> = [
  { media: '(min-width: 3840px)', suffix: 'uhd' },
  { media: '(min-width: 2560px)', suffix: 'qhd' },
  { media: '(min-width: 1920px)', suffix: 'fhd' },
  { media: '(min-width: 1280px)', suffix: 'desktop' },
  { media: '(min-width: 1024px)', suffix: 'laptop' },
  { media: '(min-width: 768px)', suffix: 'tablet' },
  { media: '(min-width: 640px)', suffix: 'mobile-wide' },
  { media: '(min-width: 480px)', suffix: 'mobile' },
  { suffix: 'mobile-xs' },
]

const buildCandidateSources = (slide: SlideId, suffix: SliderSuffix) => {
  return Array.from(
    new Set([
      `/images/slider/slade${slide}-${suffix}.jpg`,
      ...legacyFallbackBySuffix[suffix].map((legacy) => `/images/slider/slade${slide}-${legacy}.jpg`),
    ]),
  )
}

const buildSourceSet = (slide: SlideId, suffix: SliderSuffix) => buildCandidateSources(slide, suffix).join(', ')

const SliderImage = ({ alt, slide, priority }: { alt: string; slide: SlideId; priority?: boolean }) => {
  const fallbackCandidates = useMemo(() => buildCandidateSources(slide, 'desktop'), [slide])
  const [fallbackIndex, setFallbackIndex] = useState(0)

  useEffect(() => {
    setFallbackIndex(0)
  }, [slide])

  const fallbackSrc = fallbackCandidates[Math.min(fallbackIndex, fallbackCandidates.length - 1)]

  return (
    <picture>
      {sourceOrder.map(({ media, suffix }) => (
        <source
          key={`${slide}-${suffix}`}
          media={media}
          srcSet={buildSourceSet(slide, suffix)}
        />
      ))}
      <img
        src={fallbackSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => {
          setFallbackIndex((prev) => (prev >= fallbackCandidates.length - 1 ? prev : prev + 1))
        }}
        className="absolute left-0 top-0 h-full w-full object-cover object-right sm:object-center"
      />
    </picture>
  )
}

const SliderSlideContent = ({ slide, priority }: { slide: SlideId; priority?: boolean }) => {
  const content = {
    1: {
      subtitle: '¡Oferta! Hasta 50% de descuento',
      title: 'La tienda perfecta para tu mascota',
    },
    2: {
      subtitle: '¡Oferta! Hasta 50% de descuento',
      title: 'Alimenta el apetito de tu mascota',
    },
    3: {
      subtitle: '¡Oferta! Hasta 50% de descuento',
      title: 'Alimenta el apetito de tu mascota',
    },
  }[slide]

  return (
    <div className="slider-item h-full w-full relative overflow-hidden">
      <SliderImage alt={`bg-pet1-${slide}`} slide={slide} priority={priority} />
      <div className="container w-full h-full flex items-center relative">
        <div className="text-content sm:w-1/2 w-full max-w-[720px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] px-4">
          <div className="text-sub-display slider-text-sub normal-case">
            {content.subtitle}
          </div>
          <div className="text-display slider-text-display md:mt-5 mt-2 normal-case">
            {content.title}
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
  )
}

const SliderPet = () => {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3)
    }, 7000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="slider-block style-one w-full md:pb-0 pb-0 overflow-hidden slider-height">
      <div className="slider-main relative h-full w-full overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translate3d(-${activeSlide * 100}%, 0, 0)` }}
        >
          <div className="h-full w-full shrink-0">
            <SliderSlideContent slide={1} priority />
          </div>
          <div className="h-full w-full shrink-0">
            <SliderSlideContent slide={2} />
          </div>
          <div className="h-full w-full shrink-0">
            <SliderSlideContent slide={3} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-3">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ir al slide ${index + 1}`}
              onClick={() => setActiveSlide(index)}
              className={`pointer-events-auto h-3.5 w-3.5 rounded-full border transition-all duration-300 ${
                activeSlide === index
                  ? 'border-black bg-black shadow-[0_0_0_3px_rgba(255,255,255,0.55)]'
                  : 'border-black bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SliderPet
