'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { ProductType } from '@/type/ProductType';
import { getCatalogBrands } from '@/lib/catalog';

type BrandProps = {
    products?: ProductType[]
}

const Brand = ({ products = [] }: BrandProps) => {
    const brands = getCatalogBrands(products)

    if (brands.length === 0) {
        return null
    }

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
                                <SwiperSlide key={brand}>
                                    <div className="brand-item relative flex items-center justify-center min-h-[76px] rounded-2xl border border-line bg-white px-4">
                                        <div className="text-center">
                                            <div className="text-[11px] uppercase tracking-[0.22em] text-secondary">Marca</div>
                                            <div className="mt-2 text-title font-semibold">{brand}</div>
                                        </div>
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
