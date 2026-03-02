'use client'

import React from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import { useRouter } from 'next/navigation'
import { PetCategoryCard, getCategoryCards, getCategoryUrl } from '@/data/petCategoryCards'
import { useTenant } from '@/context/TenantContext'

interface CollectionProps {
  categories?: PetCategoryCard[]
}

const Collection: React.FC<CollectionProps> = ({ categories }) => {
  const tenant = useTenant()
  const resolvedCategories = categories ?? getCategoryCards(tenant.id)
  const router = useRouter()

  const handleCategoryClick = (category: string) => {
    router.push(getCategoryUrl(category, undefined, tenant.id))
  }

  const enableLoop = resolvedCategories.length > 6

  return (
    <div className="trending-block style-six md:py-10 py-5">
      <div className="container">
        <div className="heading3 text-center">Categorías</div>
        <div className="list-trending section-swiper-navigation style-small-border style-outline md:mt-10 mt-6">
          <Swiper
            spaceBetween={8}
            slidesPerView={3}
            centeredSlides={false}
            navigation
            loop={enableLoop}
            modules={[Navigation, Autoplay]}
            breakpoints={{
              420: {
                slidesPerView: 3,
                spaceBetween: 8,
              },
              576: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 12,
              },
              992: {
                slidesPerView: 5,
                spaceBetween: 14,
              },
              1200: {
                slidesPerView: 6,
                spaceBetween: 16,
              },
            }}
            className="h-full"
          >
            {resolvedCategories.map((category, index) => (
              <SwiperSlide key={category.id}>
                <div
                  className="trending-item w-full relative cursor-pointer flex flex-col items-center"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="bg-img mx-auto w-full max-w-[128px] sm:max-w-[150px] md:max-w-none rounded-[18px] sm:rounded-[22px] lg:rounded-[24px] overflow-hidden relative aspect-square sm:aspect-[4/5] bg-[#f6f7f9]">
                    <Image
                      src={category.image}
                      alt={category.label}
                      fill
                      sizes="(min-width: 1200px) 14vw, (min-width: 992px) 17vw, (min-width: 768px) 21vw, (min-width: 576px) 30vw, 32vw"
                      className="w-full h-full object-cover"
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      placeholder="blur"
                      blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                    />
                  </div>
                  <div className="trending-name text-center mt-3 sm:mt-4 duration-500">
                    <span className="font-semibold text-[13px] leading-[18px] sm:text-[14px] sm:leading-[20px] lg:text-[15px] lg:leading-[22px] text-[var(--blue)]">{category.label}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}

export default Collection
