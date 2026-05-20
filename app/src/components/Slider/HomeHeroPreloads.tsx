import { versionLocalImagePath } from '@/lib/staticAsset'

const homeHeroPreloads = [
  { media: '(max-width: 479px)', src: '/images/slider/generated/slade1-mobile-xs.webp' },
  { media: '(min-width: 480px) and (max-width: 639px)', src: '/images/slider/generated/slade1-mobile.webp' },
  { media: '(min-width: 640px) and (max-width: 767px)', src: '/images/slider/generated/slade1-mobile-wide.webp' },
  { media: '(min-width: 768px) and (max-width: 1023px)', src: '/images/slider/generated/slade1-tablet.webp' },
  { media: '(min-width: 1024px) and (max-width: 1279px)', src: '/images/slider/generated/slade1-laptop.webp' },
  { media: '(min-width: 1280px) and (max-width: 1535px)', src: '/images/slider/generated/slade1-desktop-1440.webp' },
  { media: '(min-width: 1536px) and (max-width: 1919px)', src: '/images/slider/generated/slade1-desktop.webp' },
  { media: '(min-width: 1920px) and (max-width: 2559px)', src: '/images/slider/generated/slade1-fhd.webp' },
  { media: '(min-width: 2560px) and (max-width: 3839px)', src: '/images/slider/generated/slade1-qhd.webp' },
  { media: '(min-width: 3840px)', src: '/images/slider/generated/slade1-uhd.webp' },
]

export default function HomeHeroPreloads() {
  return (
    <>
      {homeHeroPreloads.map(({ media, src }) => (
        <link
          key={src}
          rel="preload"
          as="image"
          href={versionLocalImagePath(src)}
          type="image/webp"
          media={media}
          fetchPriority="high"
        />
      ))}
    </>
  )
}
