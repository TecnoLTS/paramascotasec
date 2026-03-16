'use client'

import React, { useState } from 'react'
import Product from '../Product/Product'
import { ProductType } from '@/type/ProductType'
import { motion } from 'framer-motion'
import { useTenant } from '@/context/TenantContext'
import { getCategoryLabel } from '@/data/petCategoryCards'

interface Props {
    data: Array<ProductType>;
    start: number;
    limit: number;
}

const FeatureProduct: React.FC<Props> = ({ data, start, limit }) => {
    const tenant = useTenant()
    const [activeTab, setActiveTab] = useState<string>('');

    const newProducts = data.filter((product) => product.new);
    const availableTabs = Array.from(new Set(newProducts.map((product: ProductType) => product.category))).filter(Boolean);

    React.useEffect(() => {
        if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
            setActiveTab(availableTabs[0]);
        }
    }, [activeTab, availableTabs]);

    const handleTabClick = (type: string) => {
        setActiveTab(type);
    };

    const filteredProducts = newProducts.filter((product: ProductType) => product.category === activeTab);

    return (
        <>
            <div className="what-new-block md:pt-20 pt-10">
                <div className="container">
                    <div className="heading flex flex-col items-center text-center">
                        <div className="heading3">Novedades</div>
                        <div className="menu-tab style-pet flex items-center gap-2 p-1 bg-surface rounded-2xl mt-6">
                            {availableTabs.map((type: string) => (
                                <div
                                    key={type}
                                    className={`tab-item relative text-secondary text-button-uppercase py-2 px-5 cursor-pointer duration-500 ${activeTab === type ? 'active text-white' : 'hover:text-black'}`}
                                    onClick={() => handleTabClick(type)}
                                >
                                    {activeTab === type && (
                                        <motion.div layoutId='active-pill' className='absolute inset-0 rounded-2xl bg-black'></motion.div>
                                    )}
                                    <span className='relative text-button-uppercase z-[1]'>
                                        {getCategoryLabel(type, tenant.id)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
                        {filteredProducts.slice(start, limit).map((prd: ProductType) => (
                            <Product data={prd} type='grid' key={prd.id} style='style-1' />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default FeatureProduct
