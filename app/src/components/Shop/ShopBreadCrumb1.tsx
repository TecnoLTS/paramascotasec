'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType'
import Product from '../Product/Product';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import HandlePagination from '../Other/HandlePagination';
import { getCategoryFilter, visibleProductCategoryIds, getCategoryUrl, getCategoryLabel } from '@/data/petCategoryCards';

interface Props {
    data: Array<ProductType>
    productPerPage: number
    dataType: string | null | undefined
    gender: string | null
    category: string | null
}

const ShopBreadCrumb1: React.FC<Props> = ({ data, productPerPage, dataType, gender, category }) => {
    const [showOnlySale, setShowOnlySale] = useState(false)
    const [sortOption, setSortOption] = useState('');
    const [type, setType] = useState<string | null | undefined>(dataType)
    const [size, setSize] = useState<string | null>()
    const [color, setColor] = useState<string | null>()
    const [brand, setBrand] = useState<string | null>()
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
    const [currentPage, setCurrentPage] = useState(0);
    const productsPerPage = 15;
    const offset = currentPage * productsPerPage;
    const productsRef = useRef<HTMLDivElement>(null)

    const handleShowOnlySale = () => {
        setShowOnlySale(toggleSelect => !toggleSelect)
    }

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setCurrentPage(0);
    };

    const handleType = (type: string | null) => {
        setType((prevType) => (prevType === type ? null : type))
        setCurrentPage(0);
    }

    const handleSize = (size: string) => {
        setSize((prevSize) => (prevSize === size ? null : size))
        setCurrentPage(0);
    }

    const handlePriceChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            setPriceRange({ min: values[0], max: values[1] });
            setCurrentPage(0);
        }
    };

    const handleColor = (color: string) => {
        setColor((prevColor) => (prevColor === color ? null : color))
        setCurrentPage(0);
    }

    const handleBrand = (brand: string) => {
        setBrand((prevBrand) => (prevBrand === brand ? null : brand));
        setCurrentPage(0);
    }


    // Filter product
    const normalizedCategoryInput = category?.toLowerCase();
    const normalizedCategory = normalizedCategoryInput === 'ofertas' ? 'descuentos' : normalizedCategoryInput;
    const categoryFilter = normalizedCategory ? getCategoryFilter(normalizedCategory) : undefined;
    const categoryToMatch = categoryFilter?.category;
    const genderToMatch = categoryFilter?.gender ?? gender;
    const isDiscountCategory = normalizedCategory === 'descuentos';

    const categoryOptions = ['todos', 'descuentos', ...visibleProductCategoryIds];
    const categoryCounts = (categoryId: string) => {
        const filter = getCategoryFilter(categoryId);
        return data.filter((product) => {
            let matchesCategory = true;
            if (filter.category) {
                matchesCategory = product.category === filter.category;
            }
            let matchesGender = true;
            if (filter.gender) {
                matchesGender = product.gender === filter.gender;
            }
            if (categoryId === 'descuentos') {
                matchesCategory = product.sale;
            }
            return matchesCategory && matchesGender;
        }).length;
    };

    const uniqueSizes = Array.from(new Set(data.flatMap((product) => product.sizes))).sort();
    const uniqueColors = Array.from(new Set(data.flatMap((product) => product.variation.map((variation) => variation.color)))).sort();
    const uniqueBrands = Array.from(new Set(data.map((product) => product.brand))).sort();
    const brandCounts = (brandValue: string) => data.filter((product) => product.brand === brandValue).length;

    let filteredData = data.filter(product => {
        let isShowOnlySaleMatched = true;
        if (showOnlySale) {
            isShowOnlySaleMatched = product.sale
        }

        let isDatagenderMatched = true;
        if (genderToMatch) {
            isDatagenderMatched = product.gender === genderToMatch
        }

        let isDataCategoryMatched = true;
        if (categoryToMatch) {
            isDataCategoryMatched = product.category === categoryToMatch
        }

        let isDataTypeMatched = true;
        if (dataType) {
            isDataTypeMatched = product.type === dataType
        }

        let isTypeMatched = true;
        if (type) {
            dataType = type
            isTypeMatched = product.type === type;
        }

        let isSizeMatched = true;
        if (size) {
            isSizeMatched = product.sizes.includes(size)
        }

        let isPriceRangeMatched = true;
        if (priceRange.min !== 0 || priceRange.max !== 100) {
            isPriceRangeMatched = product.price >= priceRange.min && product.price <= priceRange.max;
        }

        let isColorMatched = true;
        if (color) {
            isColorMatched = product.variation.some(item => item.color === color)
        }

        let isBrandMatched = true;
        if (brand) {
            isBrandMatched = product.brand === brand;
        }

        let isDiscountCategoryMatched = true;
        if (isDiscountCategory) {
            isDiscountCategoryMatched = product.sale;
        }

        return (
            isShowOnlySaleMatched &&
            isDatagenderMatched &&
            isDataCategoryMatched &&
            isDataTypeMatched &&
            isTypeMatched &&
            isSizeMatched &&
            isColorMatched &&
            isBrandMatched &&
            isPriceRangeMatched &&
            isDiscountCategoryMatched
        )
    })


    // Create a copy array filtered to sort
    let sortedData = [...filteredData];

    if (sortOption === 'soldQuantityHighToLow') {
        filteredData = sortedData.sort((a, b) => b.sold - a.sold)
    }

    if (sortOption === 'discountHighToLow') {
        filteredData = sortedData
            .sort((a, b) => (
                (Math.floor(100 - ((b.price / b.originPrice) * 100))) - (Math.floor(100 - ((a.price / a.originPrice) * 100)))
            ))
    }

    if (sortOption === 'priceHighToLow') {
        filteredData = sortedData.sort((a, b) => b.price - a.price)
    }

    if (sortOption === 'priceLowToHigh') {
        filteredData = sortedData.sort((a, b) => a.price - b.price)
    }

    const totalProducts = filteredData.length
    const selectedType = type
    const selectedSize = size
    const selectedColor = color
    const selectedBrand = brand


    if (filteredData.length === 0) {
        filteredData = [{
            id: 'no-data',
            category: 'no-data',
            type: 'no-data',
            name: 'no-data',
            gender: 'no-data',
            new: false,
            sale: false,
            rate: 0,
            price: 0,
            originPrice: 0,
            brand: 'no-data',
            sold: 0,
            quantity: 0,
            quantityPurchase: 0,
            sizes: [],
            variation: [],
            thumbImage: [],
            images: [],
            description: 'no-data',
            action: 'no-data',
            slug: 'no-data'
        }];
    }


    // Find page number base on filteredData
    const pageCount = Math.ceil(filteredData.length / productsPerPage);

    // If page number 0, set current page = 0
    if (pageCount === 0) {
        setCurrentPage(0);
    }

    // Get product data for current page
    let currentProducts: ProductType[];

    if (filteredData.length > 0) {
        currentProducts = filteredData.slice(offset, offset + productsPerPage);
    } else {
        currentProducts = []
    }

    const handlePageChange = (selected: number) => {
        setCurrentPage(selected);

        productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    };

    const handleClearAll = () => {
        dataType = null
        setShowOnlySale(false);
        setSortOption('');
        setType(null);
        setSize(null);
        setColor(null);
        setBrand(null);
        setPriceRange({ min: 0, max: 100 });
        setCurrentPage(0);
        handleType(null)
    };

    return (
        <>
            <div ref={productsRef} className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
                <div className="container">
                    <div className="flex max-md:flex-wrap max-md:flex-col-reverse gap-y-8">
                        <div className="sidebar lg:w-1/4 md:w-1/3 w-full md:pr-12">
                            <div className="filter-type pb-8 border-b border-line">
                                <div className="heading6">Categorías</div>
                                <div className="list-type mt-4">
                                    {categoryOptions.map((item, index) => {
                                        const isActiveCategory = normalizedCategory ? normalizedCategory === item : item === 'todos';
                                        return (
                                            <Link
                                                key={index}
                                                href={getCategoryUrl(item)}
                                                className={`item flex items-center cursor-pointer ${isActiveCategory ? 'active' : ''}`}
                                            >
                                                <div className='text-secondary has-line-before hover:text-black capitalize'>{getCategoryLabel(item)}</div>
                                                <div className='text-secondary2'>
                                                    ({categoryCounts(item)})
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="filter-size pb-8 border-b border-line mt-8">
                                <div className="heading6">Tamaños</div>
                                <div className="list-size flex items-center flex-wrap gap-3 gap-y-4 mt-4">
                                    {uniqueSizes.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`size-item text-button h-[44px] px-4 flex items-center justify-center rounded-full border border-line ${size === item ? 'active' : ''}`}
                                            onClick={() => handleSize(item)}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-price pb-8 border-b border-line mt-8">
                                <div className="heading6">Rango de precios</div>
                                <Slider
                                    range
                                    defaultValue={[0, 100]}
                                    min={0}
                                    max={100}
                                    onChange={handlePriceChange}
                                    className='mt-5'
                                />
                                <div className="price-block flex items-center justify-between flex-wrap mt-4">
                                    <div className="min flex items-center gap-1">
                                        <div>Precio mínimo:</div>
                                        <div className='price-min'>$<span>{priceRange.min}</span></div>
                                    </div>
                                    <div className="min flex items-center gap-1">
                                        <div>Precio máximo:</div>
                                        <div className='price-max'>$<span>{priceRange.max}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="filter-color pb-8 border-b border-line mt-8">
                                <div className="heading6">Colores</div>
                                <div className="list-color flex items-center flex-wrap gap-3 gap-y-4 mt-4">
                                    {uniqueColors.map((item) => (
                                        <div
                                            key={item}
                                            className={`color-item px-3 py-[5px] flex items-center justify-center gap-2 rounded-full border border-line ${color === item ? 'active' : ''}`}
                                            onClick={() => handleColor(item)}
                                        >
                                            <span className='color me-1 bg-[#d9d9d9] w-5 h-5 rounded-full'></span>
                                            <div className="caption1 capitalize">{item}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-brand mt-8">
                                <div className="heading6">Marcas</div>
                                <div className="list-type mt-4">
                                    {uniqueBrands.map((brandItem, index) => (
                                        <div
                                            key={index}
                                            className={`item flex items-center justify-between cursor-pointer ${brand === brandItem ? 'active' : ''}`}
                                            onClick={() => handleBrand(brandItem)}
                                        >
                                            <div className='text-secondary has-line-before hover:text-black capitalize'>{brandItem}</div>
                                            <div className='text-secondary2'>
                                                ({brandCounts(brandItem)})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="list-product-block lg:w-3/4 md:w-2/3 w-full md:pl-3">
                            <div className="filter-heading flex items-center gap-5 flex-wrap">
                                <div className="left flex has-line items-center flex-wrap gap-5">
                                    <div className="choose-layout flex items-center gap-2">
                     
                                    </div>
                                    <div className="check-sale flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="filterSale"
                                            id="filter-sale"
                                            className='border-line'
                                            onChange={handleShowOnlySale}
                                        />
                                        <label htmlFor="filter-sale" className='cation1 cursor-pointer'>Ver solo productos en oferta</label>
                                    </div>
                                </div>
                                <div className="right flex items-center gap-3">
                                    <div className="select-block relative">
                                        <select
                                            id="select-filter"
                                            name="select-filter"
                                            className='caption1 py-2 pl-3 md:pr-20 pr-10 rounded-lg border border-line'
                                            onChange={(e) => { handleSortChange(e.target.value) }}
                                            defaultValue={'Sorting'}
                                        >
                                            <option value="Sorting" disabled>Sorting</option>
                                            <option value="soldQuantityHighToLow">Best Selling</option>
                                            <option value="discountHighToLow">Best Discount</option>
                                            <option value="priceHighToLow">Price High To Low</option>
                                            <option value="priceLowToHigh">Price Low To High</option>
                                        </select>
                                        <Icon.CaretDown size={12} className='absolute top-1/2 -translate-y-1/2 md:right-4 right-2' />
                                    </div>
                                </div>
                            </div>

                            <div className="list-filtered flex items-center gap-3 mt-4">
                                <div className="total-product">
                                    {totalProducts}
                                    <span className='text-secondary pl-1'>Products Found</span>
                                </div>
                                {
                                    (selectedType || selectedSize || selectedColor || selectedBrand) && (
                                        <>
                                            <div className="list flex items-center gap-3">
                                                <div className='w-px h-4 bg-line'></div>
                                                {selectedType && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setType(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedType}</span>
                                                    </div>
                                                )}
                                                {selectedSize && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setSize(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedSize}</span>
                                                    </div>
                                                )}
                                                {selectedColor && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setColor(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedColor}</span>
                                                    </div>
                                                )}
                                                {selectedBrand && (
                                                    <div className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize" onClick={() => { setBrand(null) }}>
                                                        <Icon.X className='cursor-pointer' />
                                                        <span>{selectedBrand}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className="clear-btn flex items-center px-2 py-1 gap-1 rounded-full border border-red cursor-pointer"
                                                onClick={handleClearAll}
                                            >
                                                <Icon.X color='rgb(219, 68, 68)' className='cursor-pointer' />
                                                <span className='text-button-uppercase text-red'>Clear All</span>
                                            </div>
                                        </>
                                    )
                                }
                            </div>

                            <div className="list-product hide-product-sold grid lg:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-7">
                                {currentProducts.map((item) => (
                                    item.id === 'no-data' ? (
                                        <div key={item.id} className="no-data-product">No products match the selected criteria.</div>
                                    ) : (
                                        <Product key={item.id} data={item} type='grid' />
                                    )
                                ))}
                            </div>

                            {pageCount > 1 && (
                                <div className="list-pagination flex items-center md:mt-10 mt-7">
                                    <HandlePagination pageCount={pageCount} onPageChange={handlePageChange} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default ShopBreadCrumb1
