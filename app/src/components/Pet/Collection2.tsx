'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';

const Collection = () => {
    const router = useRouter()

    const categoryRoute: Record<string, string> = {
        perros: '/shop/breadcrumb1?category=perros&gender=dog',
        gatos: '/shop/breadcrumb1?category=gatos&gender=cat',
        descuentos: '/shop/breadcrumb1?category=descuentos',
        accesorios: '/shop/breadcrumb1?category=accesorios',
    }

    const handleCategoryClick = (category: string) => {
        const target = categoryRoute[category] ?? '/shop/breadcrumb1'
        router.push(target)
    };

    return (
        <>
            <div className="collection-block cosmetic md:pt-20 pt-10">
                <div className="container">
                    <div className='grid sm:grid-cols-2 md:gap-[30px] gap-[16px]'>
                        <div className="left">
                            <div
                                className="collection-item block h-full relative md:rounded-[20px] rounded-xl overflow-hidden cursor-pointer"
                                onClick={() => handleCategoryClick('perros')}
                            >
                                <div className="bg-img h-full w-full aspect-square">
                                    <Image
                                        src={'/images/collection/body.jpg'}
                                        width={1000}
                                        height={1000}
                                        alt='Perritos'
                                        className='h-full object-cover'
                                    />
                                </div>
                                <div className="collection-name heading5 text-center sm:bottom-[30px] bottom-4 lg:w-[200px] md:w-auto max-lg:px-5 lg:py-3 py-1.5 bg-white rounded-xl duration-500">Perritos</div>
                            </div>
                        </div>
                        <div className="right grid grid-rows-2 md:gap-[30px] gap-[16px]">
                            <div className="top grid grid-cols-2 md:gap-[30px] gap-[16px]">
                                <div
                                    className="collection-item block relative md:rounded-[20px] rounded-xl overflow-hidden cursor-pointer"
                                    onClick={() => handleCategoryClick('gatos')}
                                >
                                    <div className="bg-img h-full">
                                        <Image
                                            src={'/images/collection/skin.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='Gatitos'
                                            className='h-full object-cover'
                                        />
                                    </div>
                                    <div className="collection-name heading5 text-center sm:bottom-[30px] bottom-4 lg:w-[200px] md:w-auto max-lg:px-5 lg:py-3 py-1.5 bg-white rounded-xl duration-500">Gatitos</div>
                                </div>
                                <div
                                    className="collection-item block relative md:rounded-[20px] rounded-xl overflow-hidden cursor-pointer"
                                    onClick={() => handleCategoryClick('descuentos')}
                                >
                                    <div className="bg-img h-full">
                                        <Image
                                            src={'/images/collection/hair.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='Ofertas'
                                            className='h-full object-cover'
                                        />
                                    </div>
                                    <div className="collection-name heading5 text-center sm:bottom-[30px] bottom-4 lg:w-[200px] md:w-auto max-lg:px-5 lg:py-3 py-1.5 bg-white rounded-xl duration-500">Ofertas</div>
                                </div>
                            </div>
                            <div className="bottom">
                                <div
                                    className="collection-item block relative md:rounded-[20px] rounded-xl overflow-hidden cursor-pointer"
                                    onClick={() => handleCategoryClick('accesorios')}
                                >
                                    <div className="bg-img h-full">
                                        <Image
                                            src={'/images/collection/accessories-cos.jpg'}
                                            width={1000}
                                            height={1000}
                                            alt='Accesorios'
                                            className='h-full object-cover'
                                        />
                                    </div>
                                    <div className="collection-name heading5 text-center sm:bottom-[30px] bottom-4 lg:w-[200px] md:w-auto max-lg:px-5 lg:py-3 py-1.5 bg-white rounded-xl duration-500">Accesorios</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Collection
