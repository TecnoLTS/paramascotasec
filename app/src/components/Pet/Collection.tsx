'use client'

import React from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import { useRouter } from 'next/navigation'
import petCategoryCards, { PetCategoryCard } from '@/data/petCategoryCards'

interface CollectionProps {
  categories?: PetCategoryCard[]
}

const Collection: React.FC<CollectionProps> = ({ categories = petCategoryCards }) => {
  const router = useRouter()

  const handleCategoryClick = (category: string) => {
    router.push(`/shop/breadcrumb1?category=${category}`)
  }

  return (
    <div className="trending-block style-six md:py-10 py-5">
      <div className="container">
        <div className="heading3 text-center">Categorías</div>
        <div className="list-trending section-swiper-navigation style-small-border style-outline md:mt-10 mt-6">
          <Swiper
            spaceBetween={12}
            slidesPerView={2}
            navigation
            loop
            preloadImages
            modules={[Navigation, Autoplay]}
            breakpoints={{
              576: {
                slidesPerView: 3,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
              992: {
                slidesPerView: 5,
                spaceBetween: 20,
              },
              1290: {
                slidesPerView: 6,
                spaceBetween: 30,
              },
            }}
            className="h-full"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category.id}>
                <div
                  className="trending-item block relative cursor-pointer"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="bg-img rounded-[32px] overflow-hidden relative aspect-[4/5] max-h-[360px] sm:max-h-[320px] md:max-h-[280px] bg-[#f6f7f9]">
                    <Image
                      src={category.image}
                      alt={category.label}
                      fill
                      sizes="(min-width: 1290px) 14vw, (min-width: 992px) 18vw, (min-width: 768px) 22vw, (min-width: 576px) 28vw, 44vw"
                      className="w-full h-full object-cover"
                      // solo la primera imagen es prioritaria
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      placeholder="blur"
                      blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                    />
                  </div>
                  <div className="trending-name text-center mt-5 duration-500">
                    <span className="heading6">{category.label}</span>
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
