'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PetCategoryCard, getCategoryUrl, getHomeSecondaryCategoryCards } from '@/data/petCategoryCards'

type CollectionProps = {
    categories?: PetCategoryCard[]
}

const Collection = ({ categories = getHomeSecondaryCategoryCards() }: CollectionProps) => {
    const router = useRouter()
    const featuredCategories = categories
        .filter((item) => item.id !== 'todos' && item.id !== 'descuentos')
        .slice(0, 4)

    const sizesSecondarySingle = '(min-width: 768px) 520px, 92vw'
    const sizesSecondaryTwoUp = '(min-width: 952px) 430px, (min-width: 640px) calc((100vw - 32px - 16px) / 2), calc((100vw - 32px - 12px) / 2)'
    const sizesSecondaryThreePrimary = '(min-width: 1150px) 496px, (min-width: 640px) calc((100vw - 32px - 16px) / 2), 92vw'
    const sizesSecondaryThreeSecondary = '(min-width: 1150px) 472px, (min-width: 640px) calc((100vw - 32px - 16px) / 2), calc((100vw - 32px - 12px) / 2)'
    const sizesSecondaryFourPrimary = '(min-width: 1150px) 630px, (min-width: 640px) calc((100vw - 32px - 16px) / 2), calc((100vw - 32px - 12px) / 2)'
    const sizesSecondaryFourTop = '(min-width: 1150px) 300px, (min-width: 640px) calc((100vw - 32px - 16px) / 2), calc((100vw - 32px - 12px) / 2)'
    const sizesSecondaryFourBottom = '(min-width: 1150px) 630px, (min-width: 640px) calc((100vw - 32px - 16px) / 2), 92vw'

    const handleCategoryClick = (category: string) => {
        router.push(getCategoryUrl(category))
    }

    if (featuredCategories.length === 0) {
        return null
    }

    const renderCategoryTile = (
        item: PetCategoryCard,
        options?: {
            aspectClass?: string
            priority?: boolean
            sizes?: string
            labelWidthClass?: string
            wrapperClass?: string
        }
    ) => (
        <div
            key={item.id}
            className={`collection-item block h-full relative md:rounded-[20px] rounded-xl overflow-hidden cursor-pointer ${options?.wrapperClass ?? ''}`}
            onClick={() => handleCategoryClick(item.id)}
        >
            <div className={`bg-img h-full w-full ${options?.aspectClass ?? 'aspect-square'}`}>
                <Image
                    src={item.image}
                    alt={item.label}
                    width={1000}
                    height={1000}
                    quality={90}
                    priority={options?.priority}
                    sizes={options?.sizes ?? '(min-width: 1280px) 360px, (min-width: 640px) 44vw, 92vw'}
                    className='h-full w-full object-cover'
                />
            </div>
            <div
                className={`collection-name heading5 text-center sm:bottom-[30px] bottom-3 sm:bottom-4 ${options?.labelWidthClass ?? 'w-[calc(100%-28px)] max-w-[190px] sm:max-w-none lg:w-[200px]'} md:w-auto px-4 sm:max-lg:px-5 lg:py-3 py-2 sm:py-1.5 bg-white rounded-xl duration-500 max-md:text-[16px] max-md:leading-[22px]`}
            >
                {item.label}
            </div>
        </div>
    )

    if (featuredCategories.length === 1) {
        return (
            <div className="collection-block cosmetic md:pt-20 pt-10">
                <div className="container">
                    <div className="mx-auto max-w-[520px]">
                        {renderCategoryTile(featuredCategories[0], {
                            priority: true,
                            sizes: sizesSecondarySingle,
                            labelWidthClass: 'lg:w-[220px]',
                        })}
                    </div>
                </div>
            </div>
        )
    }

    if (featuredCategories.length === 2) {
        return (
            <div className="collection-block cosmetic md:pt-20 pt-10">
                <div className="container">
                    <div className="mx-auto grid max-w-[920px] grid-cols-2 md:gap-[30px] gap-[12px] sm:gap-[16px]">
                        {featuredCategories.map((item, index) =>
                            renderCategoryTile(item, {
                                priority: index < 2,
                                aspectClass: 'aspect-[4/5] sm:aspect-square',
                                sizes: sizesSecondaryTwoUp,
                                labelWidthClass: 'w-[calc(100%-20px)] max-w-[170px] sm:max-w-none lg:w-[220px]',
                            })
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (featuredCategories.length === 3) {
        const primary = featuredCategories[0]
        const secondary = featuredCategories.slice(1)

        return (
            <div className="collection-block cosmetic md:pt-20 pt-10">
                <div className="container">
                    <div className="grid grid-cols-2 gap-[12px] sm:hidden">
                        <div className="col-span-2">
                            {renderCategoryTile(primary, {
                                aspectClass: 'aspect-[16/10]',
                                priority: true,
                                sizes: '92vw',
                                labelWidthClass: 'w-[calc(100%-28px)] max-w-[210px]',
                            })}
                        </div>
                        {secondary.map((item, index) => (
                            <div key={item.id}>
                                {renderCategoryTile(item, {
                                    aspectClass: 'aspect-square',
                                    priority: index === 0,
                                    sizes: '46vw',
                                    labelWidthClass: 'w-[calc(100%-20px)] max-w-[160px]',
                                })}
                            </div>
                        ))}
                    </div>
                    <div className='hidden sm:grid sm:grid-cols-2 sm:items-start md:gap-[30px] gap-[16px]'>
                        <div className="left">
                            {renderCategoryTile(primary, {
                                aspectClass: 'aspect-[4/5] max-h-[620px]',
                                priority: true,
                                sizes: sizesSecondaryThreePrimary,
                                labelWidthClass: 'lg:w-[220px]',
                            })}
                        </div>
                        <div className="right grid grid-cols-1 md:gap-[30px] gap-[16px]">
                            {secondary.map((item, index) => (
                                <div key={item.id}>
                                    {renderCategoryTile(item, {
                                        aspectClass: 'aspect-[16/10] max-h-[295px]',
                                        priority: index === 0,
                                        sizes: sizesSecondaryThreeSecondary,
                                        labelWidthClass: 'lg:w-[220px]',
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const primary = featuredCategories[0]
    const secondary = featuredCategories.slice(1)
    const bottomCard = secondary[2]

    return (
        <>
            <div className="collection-block cosmetic md:pt-20 pt-10">
                <div className="container">
                    <div className="grid grid-cols-2 gap-[12px] sm:hidden">
                        {featuredCategories.map((item, index) => (
                            <div key={item.id}>
                                {renderCategoryTile(item, {
                                    aspectClass: 'aspect-square',
                                        priority: index < 2,
                                        sizes: '46vw',
                                    labelWidthClass: 'w-[calc(100%-20px)] max-w-[160px]',
                                })}
                            </div>
                        ))}
                    </div>
                    <div className='hidden sm:grid sm:grid-cols-2 md:gap-[30px] gap-[16px]'>
                        <div className="left">
                            {renderCategoryTile(primary, {
                                aspectClass: 'h-full w-full aspect-square',
                                priority: true,
                                sizes: sizesSecondaryFourPrimary,
                                labelWidthClass: 'lg:w-[220px]',
                            })}
                        </div>
                        <div className="right grid grid-rows-2 md:gap-[30px] gap-[16px]">
                            <div className="top grid grid-cols-2 md:gap-[30px] gap-[16px]">
                                {secondary.slice(0, 2).map((item) =>
                                    renderCategoryTile(item, {
                                        priority: true,
                                        sizes: sizesSecondaryFourTop,
                                        labelWidthClass: 'lg:w-[200px]',
                                    })
                                )}
                            </div>
                            <div className="bottom">
                                {renderCategoryTile(bottomCard, {
                                    sizes: sizesSecondaryFourBottom,
                                    labelWidthClass: 'lg:w-[220px]',
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Collection
