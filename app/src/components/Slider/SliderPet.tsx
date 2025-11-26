'use client'

import React from 'react'
import Image, { ImageLoaderProps } from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import 'swiper/css/effect-fade';

const sliderLoader = ({ src, width }: ImageLoaderProps) => {
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
    const parts = cleanSrc.split('/');
    const file = parts.pop() || '';
    const dotIndex = file.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? file.slice(0, dotIndex) : file;
    const ext = dotIndex !== -1 ? file.slice(dotIndex) : '';
    const dir = parts.join('/');

    const suffix =
        width >= 3840 ? '4k' :
        width >= 2560 ? '2k' :
        width >= 1920 ? '1080' :
        width >= 1280 ? '720' :
        'mobile';

    return `/${dir}/${baseName}-${suffix}${ext}`;
};


const SliderPet = () => {
    return (
        <>
            <div className="slider-block style-one 2xl:h-[780px] xl:h-[740px] lg:h-[680px] md:h-[580px] sm:h-[500px] h-[420px] w-full md:pb-0 pb-0 overflow-hidden">
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
                            <div className="slider-item h-full w-full relative overflow-hidden">
                                <Image
                                    src="/images/slider/slade1.jpg"
                                    alt="bg-pet1-1"
                                    fill
                                    priority
                                    sizes="100vw"
                                    loader={sliderLoader}
                                    className="absolute left-0 top-0 h-full w-full object-cover object-center"
                                />
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
                            <div className="slider-item h-full w-full relative overflow-hidden">
                                <Image
                                    src="/images/slider/slade2.jpg"
                                    alt="bg-pet1-2"
                                    fill
                                    sizes="100vw"
                                    loader={sliderLoader}
                                    className="absolute left-0 top-0 h-full w-full object-cover object-center"
                                />
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
                            <div className="slider-item h-full w-full relative overflow-hidden">
                                <Image
                                    src="/images/slider/slade3.jpg"
                                    alt="bg-pet1-3"
                                    fill
                                    sizes="100vw"
                                    loader={sliderLoader}
                                    className="absolute left-0 top-0 h-full w-full object-cover object-center"
                                />
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
