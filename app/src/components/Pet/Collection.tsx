'use client'

import React from 'react'
import Image from '@/components/Common/AppImage'
import { useRouter } from 'next/navigation'
import { PetCategoryCard, getCategoryCards, getCategoryUrl } from '@/data/petCategoryCards'

interface CollectionProps {
  categories?: PetCategoryCard[]
}

const Collection: React.FC<CollectionProps> = ({ categories }) => {
  const resolvedCategories = categories ?? getCategoryCards()
  const router = useRouter()
  const mobileTrackRef = React.useRef<HTMLDivElement | null>(null)
  const dragStartXRef = React.useRef(0)
  const dragStartScrollLeftRef = React.useRef(0)
  const isMouseDraggingRef = React.useRef(false)
  const dragMovedRef = React.useRef(false)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleCategoryClick = (category: string) => {
    router.push(getCategoryUrl(category))
  }

  const handleMouseMove = React.useCallback((event: MouseEvent) => {
    if (!isMouseDraggingRef.current) return
    const track = mobileTrackRef.current
    if (!track) return

    const deltaX = event.clientX - dragStartXRef.current
    if (Math.abs(deltaX) > 4) {
      dragMovedRef.current = true
    }
    track.scrollLeft = dragStartScrollLeftRef.current - deltaX
  }, [])

  const stopMouseDrag = React.useCallback(() => {
    if (!isMouseDraggingRef.current) return
    isMouseDraggingRef.current = false
    setIsDragging(false)
    window.setTimeout(() => {
      dragMovedRef.current = false
    }, 0)
  }, [])

  React.useEffect(() => {
    if (!isDragging) return

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopMouseDrag)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopMouseDrag)
    }
  }, [handleMouseMove, isDragging, stopMouseDrag])

  const startMouseDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const track = mobileTrackRef.current
    if (!track) return

    isMouseDraggingRef.current = true
    dragMovedRef.current = false
    dragStartXRef.current = event.clientX
    dragStartScrollLeftRef.current = track.scrollLeft
    setIsDragging(true)
  }

  const preventDraggedClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!dragMovedRef.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  const renderCategoryCard = (category: PetCategoryCard, index: number, wrapperClassName: string) => {
    const isPriority = index < 5

    return (
      <button
        key={category.id}
        type="button"
        className={`trending-item relative cursor-pointer flex flex-col items-center group text-left ${wrapperClassName}`}
        draggable={false}
        onClickCapture={preventDraggedClick}
        onClick={() => handleCategoryClick(category.id)}
      >
        <div className="bg-img mx-auto w-full rounded-[18px] sm:rounded-[22px] lg:rounded-[24px] overflow-hidden relative aspect-[4/5] bg-[#f6f7f9] transition-transform duration-300 group-hover:scale-[1.03]">
          <Image
            src={category.image}
            alt={category.alt || category.label}
            fill
            quality={90}
            sizes="(min-width: 1200px) 202px, (min-width: 992px) calc((100vw - 32px - 64px) / 5), (min-width: 768px) calc((100vw - 32px - 48px) / 5), 132px"
            className="w-full h-full object-cover"
            priority={isPriority}
            loading={isPriority ? 'eager' : 'lazy'}
            draggable={false}
          />
        </div>
        <div className="trending-name text-center mt-3 sm:mt-4 duration-500 w-full">
          <span className="font-semibold text-[13px] leading-[18px] sm:text-[14px] sm:leading-[20px] lg:text-[15px] lg:leading-[22px] text-[var(--blue)]">
            {category.label}
          </span>
        </div>
      </button>
    )
  }

  return (
    <div className="trending-block style-six md:py-10 py-5">
      <div className="container">
        <div className="heading3 text-center">Categorías</div>
        <div className="list-trending md:mt-10 mt-6">
          <div className="md:hidden">
            <div className="overflow-hidden">
              <div
                ref={mobileTrackRef}
                onMouseDown={startMouseDrag}
                onMouseLeave={stopMouseDrag}
                className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {resolvedCategories.map((category, index) =>
                  renderCategoryCard(
                    category,
                    index,
                    'min-w-0 flex-none basis-[calc((100%-24px)/3)] snap-start'
                  )
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:mx-auto md:grid md:w-full md:max-w-[1110px] md:grid-cols-5 md:gap-4 lg:max-w-[1160px] lg:gap-5">
            {resolvedCategories.map((category, index) =>
              renderCategoryCard(category, index, 'w-full')
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collection
