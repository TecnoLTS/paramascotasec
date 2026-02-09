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
          <div className="lg:hidden">
            <Swiper
              spaceBetween={12}
              slidesPerView={2}
              navigation
              loop={enableLoop}
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
              }}
              className="h-full"
            >
              {resolvedCategories.map((category, index) => (
                <SwiperSlide key={category.id}>
                  <div
                    className="trending-item w-full relative cursor-pointer flex flex-col items-center"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="bg-img mx-auto w-full max-w-[170px] sm:max-w-[190px] md:max-w-[210px] rounded-[22px] overflow-hidden relative aspect-square sm:aspect-[4/5] bg-[#f6f7f9]">
                      <Image
                        src={category.image}
                        alt={category.label}
                        fill
                        sizes="(min-width: 992px) 18vw, (min-width: 768px) 22vw, (min-width: 576px) 28vw, 44vw"
                        className="w-full h-full object-cover"
                        // solo la primera imagen es prioritaria
                        priority={index === 0}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        placeholder="blur"
                        blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                      />
                    </div>
                    <div className="trending-name text-center mt-3 duration-500">
                      <span className="heading6 text-[12px] leading-[18px] sm:text-[14px] sm:leading-[20px]">{category.label}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="hidden lg:grid grid-cols-5 xl:grid-cols-6 gap-6 xl:gap-8">
            {resolvedCategories.map((category, index) => (
              <div
                key={category.id}
                className="trending-item w-full relative cursor-pointer flex flex-col items-center"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="bg-img w-full rounded-[24px] overflow-hidden relative aspect-[4/5] bg-[#f6f7f9]">
                  <Image
                    src={category.image}
                    alt={category.label}
                    fill
                    sizes="(min-width: 1536px) 10vw, (min-width: 1280px) 12vw, (min-width: 1024px) 16vw, 20vw"
                    className="w-full h-full object-cover"
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    placeholder="blur"
                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                  />
                </div>
                <div className="trending-name text-center mt-4 duration-500">
                  <span className="heading6 text-[14px] leading-[20px] xl:text-[16px] xl:leading-[22px]">{category.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collection
