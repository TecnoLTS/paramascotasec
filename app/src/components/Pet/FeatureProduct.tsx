'use client'

import React, { useState } from 'react'
import Product from '../Product/Product'
import { ProductType } from '@/type/ProductType'
import { motion } from 'framer-motion'

interface Props {
    data: Array<ProductType>;
    start: number;
    limit: number;
}

const FeatureProduct: React.FC<Props> = ({ data, start, limit }) => {
    const [activeTab, setActiveTab] = useState<string>('juguetes');
    const tabLabels: Record<string, string> = {
        'juguetes': 'Juguetes',
        'comida perro': 'Comida (Perros)',
        'comida gato': 'Comida (Gatos)',
        'camas': 'Camas',
        'comederos': 'Comederos',
        'accesorios': 'Accesorios',
        'cuidado': 'Cuidado',
    };

    const newProducts = data.filter((product) => product.new);

    // Orden preferido de pestañas. Usaremos este orden pero solo mostraremos
    // las categorías que realmente tengan productos nuevos en `data`.
    const tabOrder: string[] = ['juguetes', 'comida perro', 'comida gato', 'camas', 'comederos', 'accesorios', 'cuidado'];

    // Computar pestañas disponibles dinámicamente (sin categorías vacías)
    const availableTabs = tabOrder.filter((cat) => newProducts.some((product: ProductType) => product.category === cat));

    // Si la pestaña activa no está entre las disponibles, seleccionar la primera disponible
    React.useEffect(() => {
        if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
            setActiveTab(availableTabs[0]);
        }
    }, [availableTabs.join(',')]);

    const handleTabClick = (type: string) => {
        setActiveTab(type);
    };

    // Filtrar por la categoría (ahora en español) que seleccionó el usuario
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
                                        {tabLabels[type] ?? type}
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
