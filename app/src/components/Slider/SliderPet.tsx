'use client'

import React, { useEffect, useState } from 'react'

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
  text: string
}

const AUTOPLAY_DELAY_MS = 7000

const slides: SlideContent[] = [
  {
    id: 1,
    text: 'Cuidado que enamora',
  },
  {
    id: 2,
    text: 'Bienestar que se siente',
  },
  {
    id: 3,
    text: 'Mucho más que una tienda',
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
    <picture className="block h-full w-full">
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
        className="block h-full w-full object-cover object-center"
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
    <div className="slider-item relative h-full w-full overflow-hidden bg-[#46bcd3]">
      <HeroPicture
        alt={`Slide principal ${slide.id} de ParaMascotasEC`}
        slide={slide.id}
        priority={priority}
      />
      <div className="container absolute inset-0 z-[1] flex h-full w-full items-center">
        <div className="w-full max-w-[760px] px-4 text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:w-[58%]">
          <h1 className="text-display slider-text-display normal-case">
            {slide.text}
          </h1>
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
      className="slider-block style-one pet-hero-frame mt-2 w-full overflow-hidden md:mt-3"
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
                className="relative min-w-0 h-full flex-[0_0_100%]"
                aria-hidden={selectedIndex !== index}
              >
                <SliderSlideContent slide={slide} priority={index === 0} />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex items-center justify-center px-4 md:bottom-10 md:px-6">
          <div className="pointer-events-auto mx-auto flex items-center justify-center gap-3 rounded-full border border-black/10 bg-white/70 px-3 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir al slide ${index + 1}`}
                aria-pressed={selectedIndex === index}
                onClick={() => goToSlide(index)}
                className={`h-3 w-3 rounded-full border transition-all duration-300 ${
                  selectedIndex === index
                    ? 'scale-110 border-[var(--blue)] bg-[var(--blue)] shadow-[0_0_0_4px_rgba(10,123,143,0.18)]'
                    : 'border-[var(--blue)]/45 bg-white hover:bg-[var(--blue)]/12'
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
