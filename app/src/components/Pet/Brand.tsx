'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';

const Brand = () => {
    const brands = [
        { src: '/images/brand/7.png', alt: 'Marca 1' },
        { src: '/images/brand/8.png', alt: 'Marca 2' },
        { src: '/images/brand/9.png', alt: 'Marca 3' },
        { src: '/images/brand/10.png', alt: 'Marca 4' },
        { src: '/images/brand/13.png', alt: 'Marca 5' },
        { src: '/images/brand/12.png', alt: 'Marca 6' },
    ]

    const enableLoop = brands.length > 6

    return (
        <>
            <div className="brand-block md:py-[60px] py-[32px]">
                <div className="container">
                    <div className="heading3 text-center mb-8">Marcas con las que trabajamos</div>
                    <div className="list-brand">
                        <Swiper
                            spaceBetween={12}
                            slidesPerView={2}
                            loop={enableLoop}
                            modules={[Autoplay]}
                            autoplay={{
                                delay: 4000,
                            }}
                            breakpoints={{
                                500: {
                                    slidesPerView: 3,
                                    spaceBetween: 16,
                                },
                                680: {
                                    slidesPerView: 4,
                                    spaceBetween: 16,
                                },
                                992: {
                                    slidesPerView: 5,
                                    spaceBetween: 16,
                                },
                                1200: {
                                    slidesPerView: 6,
                                    spaceBetween: 16,
                                },
                            }}
                        >
                            {brands.map((brand) => (
                                <SwiperSlide key={brand.src}>
                                    <div className="brand-item relative flex items-center justify-center h-[36px]">
                                        <Image
                                            src={brand.src}
                                            width={300}
                                            height={300}
                                            alt={brand.alt}
                                            className='h-full w-auto duration-500 relative object-cover'
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Brand
