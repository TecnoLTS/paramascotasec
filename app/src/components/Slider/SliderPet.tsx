'use client'

import React, { useEffect, useState } from 'react'
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

type SlideContent = {
  id: SlideId
  subtitle: string
  title: string
}

const AUTOPLAY_DELAY_MS = 7000

const slides: SlideContent[] = [
  {
    id: 1,
    subtitle: '¡Oferta! Hasta 50% de descuento',
    title: 'La tienda perfecta para tu mascota',
  },
  {
    id: 2,
    subtitle: '¡Oferta! Hasta 50% de descuento',
    title: 'Alimenta el apetito de tu mascota',
  },
  {
    id: 3,
    subtitle: '¡Oferta! Hasta 50% de descuento',
    title: 'Alimenta el apetito de tu mascota',
  },
]

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

const buildCandidateSources = (slide: SlideId, suffix: SliderSuffix) =>
  Array.from(
    new Set([
      `/images/slider/slade${slide}-${suffix}.jpg`,
      ...legacyFallbackBySuffix[suffix].map((legacy) => `/images/slider/slade${slide}-${legacy}.jpg`),
    ]),
  )

const HeroPicture = ({
  alt,
  slide,
  priority,
}: {
  alt: string
  slide: SlideId
  priority?: boolean
}) => {
  const fallbackCandidates = buildCandidateSources(slide, 'desktop')
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
          srcSet={`/images/slider/slade${slide}-${suffix}.jpg`}
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
        className="absolute inset-0 h-full w-full object-contain object-center"
      />
    </picture>
  )
}

const SliderSlideContent = ({
  slide,
  priority,
}: {
  slide: SlideContent
  priority?: boolean
}) => {
  return (
    <div className="slider-item relative h-full w-full overflow-hidden">
      <HeroPicture
        alt={`Slide principal ${slide.id} de ParaMascotasEC`}
        slide={slide.id}
        priority={priority}
      />
      <div className="container relative z-[1] flex h-full w-full items-center">
        <div className="w-full max-w-[760px] px-4 text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:w-[58%]">
          <p className="text-sub-display slider-text-sub normal-case">
            {slide.subtitle}
          </p>
          <h1 className="text-display slider-text-display mt-2 normal-case md:mt-5">
            {slide.title}
          </h1>
          <Link
            href="/shop/breadcrumb1"
            className="button-main mt-4 inline-flex normal-case bg-[var(--blue)] text-white hover:bg-[var(--bluesecondary)] hover:text-white md:mt-8"
          >
            Compra ahora
          </Link>
        </div>
      </div>
    </div>
  )
}

const SliderPet = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches)

    syncPreference()
    mediaQuery.addEventListener('change', syncPreference)

    return () => mediaQuery.removeEventListener('change', syncPreference)
  }, [])

  const goToSlide = (index: number) => {
    const normalizedIndex = (index + slides.length) % slides.length
    setSelectedIndex(normalizedIndex)
  }

  const goToPrev = () => goToSlide(selectedIndex - 1)
  const goToNext = () => goToSlide(selectedIndex + 1)

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return

    const autoplay = window.setInterval(() => {
      if (document.hidden) return
      setSelectedIndex((prev) => (prev + 1) % slides.length)
    }, AUTOPLAY_DELAY_MS)

    return () => window.clearInterval(autoplay)
  }, [isPaused, prefersReducedMotion])

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const point = event.touches[0]
    setTouchStartX(point.clientX)
    setTouchCurrentX(point.clientX)
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return
    setTouchCurrentX(event.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchCurrentX === null) {
      setTouchStartX(null)
      setTouchCurrentX(null)
      return
    }

    const deltaX = touchStartX - touchCurrentX
    const swipeThreshold = 48

    if (deltaX > swipeThreshold) goToNext()
    if (deltaX < -swipeThreshold) goToPrev()

    setTouchStartX(null)
    setTouchCurrentX(null)
  }

  return (
    <section
      className="slider-block style-one pet-hero-height mt-2 w-full overflow-hidden md:mt-3"
      aria-roledescription="carousel"
      aria-label="Promociones principales"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="slider-main relative h-full w-full">
        <div
          className="h-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-500 ease-out will-change-transform touch-pan-y"
            style={{ transform: `translate3d(-${selectedIndex * 100}%, 0, 0)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="relative h-full min-w-0 flex-[0_0_100%]"
                aria-hidden={selectedIndex !== index}
              >
                <SliderSlideContent slide={slide} priority={index === 0} />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex items-center justify-center px-4 md:bottom-6 md:px-6">
          <div className="pointer-events-auto mx-auto flex items-center justify-center gap-3 rounded-full bg-white/18 px-3 py-2 backdrop-blur-sm">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir al slide ${index + 1}`}
                aria-pressed={selectedIndex === index}
                onClick={() => goToSlide(index)}
                className={`h-3 w-3 rounded-full border transition-all duration-300 ${
                  selectedIndex === index
                    ? 'scale-110 border-white bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.2)]'
                    : 'border-white/75 bg-white/45 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SliderPet
