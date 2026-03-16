'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { CategoryCard } from '@/lib/tenant';
import { getCategoryUrl } from '@/data/petCategoryCards';
import { useTenant } from '@/context/TenantContext';

type CollectionProps = {
    categories?: CategoryCard[]
}

const Collection = ({ categories = [] }: CollectionProps) => {
    const router = useRouter()
    const tenant = useTenant()
    const featuredCategories = categories.filter((item) => item.id !== 'todos').slice(0, 4)

    const handleCategoryClick = (category: string) => {
        router.push(getCategoryUrl(category, undefined, tenant.id))
    };

    if (featuredCategories.length === 0) {
        return null
    }

    const primary = featuredCategories[0]
    const secondary = featuredCategories.slice(1)
    const accessoryFallback = secondary[2] ?? secondary[secondary.length - 1] ?? primary

    return (
        <>
            <div className="collection-block cosmetic md:pt-20 pt-10">
                <div className="container">
                    <div className='grid sm:grid-cols-2 md:gap-[30px] gap-[16px]'>
                        <div className="left">
                            <div
                                className="collection-item block h-full relative md:rounded-[20px] rounded-xl overflow-hidden cursor-pointer"
                                onClick={() => handleCategoryClick(primary.id)}
                            >
                                <div className="bg-img h-full w-full aspect-square">
                                    <Image
                                        src={primary.image}
                                        width={1000}
                                        height={1000}
                                        alt={primary.label}
                                        className='h-full object-cover'
                                    />
                                </div>
                                <div className="collection-name heading5 text-center sm:bottom-[30px] bottom-4 lg:w-[240px] md:w-auto max-lg:px-5 lg:py-3 py-1.5 bg-white rounded-xl duration-500">{primary.label}</div>
                            </div>
                        </div>
                        <div className="right grid grid-rows-2 md:gap-[30px] gap-[16px]">
                            <div className="top grid grid-cols-2 md:gap-[30px] gap-[16px]">
                                {secondary.slice(0, 2).map((item) => (
                                    <div
                                        key={item.id}
                                        className="collection-item block relative md:rounded-[20px] rounded-xl overflow-hidden cursor-pointer"
                                        onClick={() => handleCategoryClick(item.id)}
                                    >
                                        <div className="bg-img h-full">
                                            <Image
                                                src={item.image}
                                                width={1000}
                                                height={1000}
                                                alt={item.label}
                                                className='h-full object-cover'
                                            />
                                        </div>
                                        <div className="collection-name heading5 text-center sm:bottom-[30px] bottom-4 lg:w-[220px] md:w-auto max-lg:px-5 lg:py-3 py-1.5 bg-white rounded-xl duration-500">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="bottom">
                                <div
                                    className="collection-item block relative md:rounded-[20px] rounded-xl overflow-hidden cursor-pointer"
                                    onClick={() => handleCategoryClick(accessoryFallback.id)}
                                >
                                    <div className="bg-img h-full">
                                        <Image
                                            src={accessoryFallback.image}
                                            width={1000}
                                            height={1000}
                                            alt={accessoryFallback.label}
                                            className='h-full object-cover'
                                        />
                                    </div>
                                    <div className="collection-name heading5 text-center sm:bottom-[30px] bottom-4 lg:w-[240px] md:w-auto max-lg:px-5 lg:py-3 py-1.5 bg-white rounded-xl duration-500">{accessoryFallback.label}</div>
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
