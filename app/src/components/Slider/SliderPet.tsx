'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import 'swiper/css/effect-fade';


const SliderPet = () => {
    return (
        <>
            <div className="slider-block style-one 2xl:h-[780px] xl:h-[740px] lg:h-[680px] md:h-[580px] sm:h-[500px] h-[420px] w-full md:pb-0 pb-0">
                <div className="slider-main h-full w-full">
                    <Swiper
                        spaceBetween={0}
                        slidesPerView={1}
                        loop={true}
                        pagination={{ clickable: true }}
                        modules={[Pagination, Autoplay]}
                        className='h-full relative'
                        speed={900}
                        autoplay={{
                            delay: 7000,
                        }}
                    >
                        <SwiperSlide>
                            <div className="slider-item h-full w-full relative">
                                <div className="sub-img absolute left-0 top-0 w-full h-full z-[-1]">
                                    <Image
                                        src={'/images/slider/slade1.jpg'}
                                        width={2560}
                                        height={1080}
                                        alt='bg-pet1-1'
                                        priority={true}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <div className="container w-full h-full flex items-center relative">
                                    <div className="text-content sm:w-1/2 w-2/3 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                        <div className="text-sub-display normal-case">¡Oferta! Hasta 50% de descuento</div>
                                        <div className="text-display md:mt-5 mt-2 normal-case">La tienda perfecta para tu mascota</div>
                                        <Link href='/shop/breadcrumb-img' className="button-main md:mt-8 mt-3 normal-case bg-white text-black hover:bg-black hover:text-white">Compra ahora</Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="slider-item h-full w-full relative">
                                <div className="sub-img absolute left-0 top-0 w-full h-full z-[-1]">
                                    <Image
                                        src={'/images/slider/slade2.jpg'}
                                        width={2560}
                                        height={1080}
                                        alt='bg-pet1-2'
                                        priority={true}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <div className="container w-full h-full flex items-center relative">
                                    <div className="text-content sm:w-1/2 w-2/3 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                        <div className="text-sub-display normal-case">¡Oferta! Hasta 50% de descuento</div>
                                        <div className="text-display md:mt-5 mt-2 normal-case">Alimenta el apetito de tu mascota</div>
                                        <Link href='/shop/breadcrumb-img' className="button-main md:mt-8 mt-3 normal-case bg-white text-black hover:bg-black hover:text-white">Compra ahora</Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="slider-item h-full w-full relative">
                                <div className="sub-img absolute left-0 top-0 w-full h-full z-[-1]">
                                    <Image
                                        src={'/images/slider/slade3.jpg'}
                                        width={2560}
                                        height={1080}
                                        alt='bg-pet1-3'
                                        priority={true}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <div className="container w-full h-full flex items-center relative">
                                    <div className="text-content sm:w-1/2 w-2/3 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                        <div className="text-sub-display normal-case">¡Oferta! Hasta 50% de descuento</div>
                                        <div className="text-display md:mt-5 mt-2 normal-case">Alimenta el apetito de tu mascota</div>
                                        <Link href='/shop/breadcrumb-img' className="button-main md:mt-8 mt-3 normal-case bg-white text-black hover:bg-black hover:text-white">Compra ahora</Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        </>
    )
}

export default SliderPet
