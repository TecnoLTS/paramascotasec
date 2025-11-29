"use client"

import React, { useEffect, useState, useRef } from 'react'

const Instagram: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  
  const instagramEmbeds = [
    'https://www.instagram.com/reel/DRcLHtlEZJ4/',
    'https://www.instagram.com/reel/DRh5OZzEZ7o/',
    'https://www.instagram.com/reel/DRcLHtlEZJ4/',
    'https://www.instagram.com/reel/DRh5OZzEZ7o/',
    'https://www.instagram.com/reel/DRcLHtlEZJ4/',
    'https://www.instagram.com/reel/DRh5OZzEZ7o/',
  ]

  useEffect(() => {
    // Inject custom CSS to remove black bars and style Instagram embeds
    if (!document.getElementById('instagram-custom-style')) {
      const style = document.createElement('style')
      style.id = 'instagram-custom-style'
      style.innerHTML = `
        .instagram-wrapper {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          position: relative;
          background: transparent;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .instagram-wrapper::before {
          content: '';
          display: block;
          padding-top: 177.78%;
        }
        
        .instagram-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .instagram-media {
          margin: 0 !important;
          background: white !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          min-width: 100% !important;
          max-width: 100% !important;
          width: 100% !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;
        }
        
        .instagram-media iframe {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 100% !important;
          min-width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        @media (max-width: 640px) {
          .instagram-wrapper {
            max-width: 320px;
          }
        }
      `
      document.head.appendChild(style)
    }

    // Load Instagram embed script
    const loadInstagram = () => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process()
        setIsLoaded(true)
      } else {
        const script = document.createElement('script')
        script.src = 'https://www.instagram.com/embed.js'
        script.async = true
        script.onload = () => {
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process()
            setIsLoaded(true)
          }
        }
        document.body.appendChild(script)
      }
    }

    const timer = setTimeout(loadInstagram, 100)
    return () => clearTimeout(timer)
  }, [])

  // Autoplay functionality
  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      handleNext()
    }, 4000)

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [currentIndex])

  const handleNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const itemWidth = container.scrollWidth / instagramEmbeds.length
      const newIndex = (currentIndex + 1) % instagramEmbeds.length
      
      container.scrollTo({
        left: itemWidth * newIndex,
        behavior: 'smooth'
      })
      setCurrentIndex(newIndex)
    }
  }

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const itemWidth = container.scrollWidth / instagramEmbeds.length
      const newIndex = currentIndex === 0 ? instagramEmbeds.length - 1 : currentIndex - 1
      
      container.scrollTo({
        left: itemWidth * newIndex,
        behavior: 'smooth'
      })
      setCurrentIndex(newIndex)
    }
  }

  const resetAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
    }
    autoplayRef.current = setInterval(() => {
      handleNext()
    }, 4000)
  }

  return (
    <div className="instagram-block md:pt-20 pt-10">
      <div className="container">
        <div className="heading">
          <div className="heading3 text-center">Sígueme en Instagram</div>
          <div className="text-center mt-3">
            <a 
              href="https://www.instagram.com/petstation_ec/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-button-uppercase"
            >
              @petstation_ec
            </a>
          </div>
        </div>
      </div>

      <div className="relative px-4 md:px-8 mt-10">
        {/* Navigation buttons */}
        <button
          onClick={() => { handlePrev(); resetAutoplay(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
          aria-label="Previous"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => { handleNext(); resetAutoplay(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
          aria-label="Next"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scroll container */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-5" style={{ width: 'max-content' }}>
            {instagramEmbeds.map((url, idx) => (
              <div key={idx} className="flex-shrink-0 w-80 sm:w-96">
                <div className="instagram-wrapper">
                  <div className="instagram-content">
                    {!isLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                      </div>
                    )}
                    <blockquote
                      className="instagram-media"
                      data-instgrm-permalink={url}
                      data-instgrm-version="14"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {instagramEmbeds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx)
                if (scrollContainerRef.current) {
                  const container = scrollContainerRef.current
                  const itemWidth = container.scrollWidth / instagramEmbeds.length
                  container.scrollTo({
                    left: itemWidth * idx,
                    behavior: 'smooth'
                  })
                }
                resetAutoplay()
              }}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? 'w-8 bg-black' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        <a 
          href="https://www.instagram.com/petstation_ec/" 
          target="_blank" 
          rel="noreferrer" 
          className="button-main"
        >
          Ver más en Instagram
        </a>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default Instagram