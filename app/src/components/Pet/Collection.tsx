'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import { useRouter } from 'next/navigation';

const Collection = () => {
    const router = useRouter()

    const handleCategoryClick = (category: string) => {
        router.push(`/shop/breadcrumb1?category=${category}`);
    };

    return (
        <>
            <div className="trending-block style-six md:py-10 py-5">
                <div className="container">
                    <div className="heading3 text-center">Compra por categorías</div>
                    <div className="list-trending section-swiper-navigation style-small-border style-outline md:mt-10 mt-6">
                        <Swiper
                            spaceBetween={12}
                            slidesPerView={2}
                            navigation
                            loop={true}
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
                            className='h-full'
                        >
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => handleCategoryClick('pet')}>
                                    <div className="bg-img rounded-[32px] overflow-hidden">
                                        <Image
                                            src={'/images/collection/1.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='outerwear'
                                            priority={true}
                                            className='w-full'
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading6'>Comida</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => handleCategoryClick('pet')}>
                                    <div className="bg-img rounded-[32px] overflow-hidden">
                                        <Image
                                            src={'/images/collection/2.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='swimwear'
                                            priority={true}
                                            className='w-full'
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading6'>Ropa</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => handleCategoryClick('pet')}>
                                    <div className="bg-img rounded-[32px] overflow-hidden">
                                        <Image
                                            src={'/images/collection/3.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='clothes'
                                            priority={true}
                                            className='w-full'
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading6'>Camas</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => handleCategoryClick('pet')}>
                                    <div className="bg-img rounded-[32px] overflow-hidden">
                                        <Image
                                            src={'/images/collection/4.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='sets'
                                            priority={true}
                                            className='w-full'
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading6'>Juguetes</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => handleCategoryClick('pet')}>
                                    <div className="bg-img rounded-[32px] overflow-hidden">
                                        <Image
                                            src={'/images/collection/5.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='accessories'
                                            priority={true}
                                            className='w-full'
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading6'>Suplementos</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => handleCategoryClick('pet')}>
                                    <div className="bg-img rounded-[32px] overflow-hidden">
                                        <Image
                                            src={'/images/collection/6.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='lingerie'
                                            priority={true}
                                            className='w-full'
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading6'>Farmacia</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="trending-item block relative cursor-pointer" onClick={() => handleCategoryClick('pet')}>
                                    <div className="bg-img rounded-[32px] overflow-hidden">
                                        <Image
                                            src={'/images/collection/7.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='lingerie'
                                            priority={true}
                                            className='w-full'
                                        />
                                    </div>
                                    <div className="trending-name text-center mt-5 duration-500">
                                        <span className='heading6'>Aros</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Collection
