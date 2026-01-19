'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, Storefront } from "@phosphor-icons/react/dist/ssr";
import MenuPet from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'

// Lógica para detectar ancho de pantalla
const getSuffixByWidth = (w: number) => {
    if (w < 768) return 'mobile';
    return '1920';
}

const AboutUs = () => {
    const [suffix, setSuffix] = useState('1920');

    useEffect(() => {
        const updateSuffix = () => {
            setSuffix(getSuffixByWidth(window.innerWidth));
        };
        // Ejecutar al inicio para asegurar la carga correcta
        updateSuffix();

        window.addEventListener('resize', updateSuffix);
        return () => window.removeEventListener('resize', updateSuffix);
    }, []);

    return (
        <>
            <div id="header" className='relative w-full style-pet'>
                <MenuPet />
            </div>

            <main>
                {/* --- BANNER PRINCIPAL --- */}
                <section className="about-banner relative w-full overflow-hidden">
                    <div className="relative h-[300px] md:h-[500px] w-full">
                        <Image
                            src={`/images/banner/27.jpg`}
                            /*src={`/images/banner/about-banner-${suffix}.jpg`}*/
                            fill
                            priority={true}
                            alt='About Us Banner'
                            className='object-cover'
                        />
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="container relative z-10 h-full flex flex-col justify-center items-center text-center">
                            <h1 className="heading2 text-white font-bold mb-4">Conoce nuestra historia</h1>
                            <p className="body1 text-white text-lg md:text-xl">Amor incondicional en cada detalle</p>
                        </div>
                    </div>
                </section>

                {/* --- SECCIÓN 1: QUIÉNES SOMOS --- */}
                <section className="about-who-we-are py-16 md:py-24 bg-white">
                    <div className="container">
                        <div className="flex max-lg:flex-col items-center gap-10 lg:gap-20">
                            {/* Imagen Izquierda */}
                            <div className="lg:w-1/2 w-full">
                                <div className="image relative w-full h-[400px] md:h-[600px] rounded-[40px] overflow-hidden shadow-xl">
                                    <Image
                                        src={`/images/banner/28.jpg`}
                                        /*src={`/images/banner/about-1-${suffix}.jpg`} */
                                        fill
                                        alt='Quiénes somos'
                                        className='object-cover hover:scale-105 duration-700'
                                    />
                                </div>
                            </div>
                            {/* Texto Derecha */}
                            <div className="lg:w-1/2 w-full">
                                <div className="tag text-button-uppercase text-orange-500 bg-orange-100 px-4 py-2 rounded-full w-fit mb-6">
                                    Nuestra Esencia
                                </div>
                                <h2 className="heading3 font-bold mb-8">¿Quiénes somos?</h2>
                                <div className="body1 text-secondary leading-relaxed space-y-6 text-lg">
                                    <p>
                                        Somos una familia pet friendly que ama profundamente a los animales y cree que las mascotas son parte esencial del hogar y de la familia. Este proyecto nace del cariño por ellos y del deseo de crear un espacio donde las personas puedan encontrar productos confiables, atención cercana y un trato hecho con amor.
                                    </p>
                                    <p>
                                        Para nosotros, cuidar a una mascota va más allá de alimentarla: se trata de entenderla, acompañarla y brindarle lo mejor en cada etapa de su vida.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SECCIÓN 2: LO QUE OFRECEMOS --- */}
                <section className="about-what-we-offer py-16 md:py-24 bg-[#F8F8F8]">
                    <div className="container">
                        <div className="flex max-lg:flex-col-reverse items-center gap-10 lg:gap-20">
                            {/* Texto Izquierda */}
                            <div className="lg:w-1/2 w-full">
                                <h2 className="heading3 font-bold mb-8">Lo que ofrecemos</h2>
                                <div className="space-y-8">
                                    {/* Bloque 1 */}
                                    <div className="flex gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full h-fit flex-shrink-0">
                                            <Package size={28} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="heading5 mb-2">Productos Cuidadosos</h4>
                                            <p className="body1 text-secondary">
                                                Ofrecemos productos pensados para el cuidado diario, trabajando con marcas responsables y opciones de calidad.
                                            </p>
                                        </div>
                                    </div>
                                    {/* Bloque 2 */}
                                    <div className="flex gap-4">
                                        <div className="bg-green-100 p-3 rounded-full h-fit flex-shrink-0">
                                            <Storefront size={28} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="heading5 mb-2">Experiencia Cercana</h4>
                                            <p className="body1 text-secondary">
                                                Nos enfocamos en brindar una experiencia simple, honesta y cercana, tanto en nuestra tienda como en nuestros canales digitales. Queremos que cada persona que nos visite se sienta acompañada y segura.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <Link href="/shop/breadcrumb1" className="button-main bg-black text-white px-8 py-3 rounded-full hover:bg-green-600 transition-all">
                                        Explorar Productos
                                    </Link>
                                </div>
                            </div>
                            {/* Imagen Derecha */}
                            <div className="lg:w-1/2 w-full">
                                <div className="image relative w-full h-[400px] md:h-[600px] rounded-[40px] overflow-hidden shadow-xl">
                                    <Image
                                        src={`/images/banner/30.jpg`}
                                        //src={`/images/banner/about-2-${suffix}.jpg`} 
                                        fill
                                        alt='Lo que ofrecemos'
                                        className='object-cover hover:scale-105 duration-700'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SECCIÓN 3: FILOSOFÍA --- */}
                <section className="about-how-we-do py-16 md:py-24 bg-white">
                    <div className="container">
                        <div className="text-center max-w-4xl mx-auto mb-16">
                            <h2 className="heading3 font-bold mb-6">Nuestra forma de hacer las cosas</h2>
                            <p className="body1 text-secondary text-lg">
                                Más que vender, nos gusta aconsejar y construir relaciones de confianza con quienes, como nosotros, aman a sus compañeros de cuatro patas.
                            </p>
                        </div>
                        <div className="relative w-full h-[300px] md:h-[500px] rounded-[40px] overflow-hidden shadow-xl mb-16">
                            <Image
                                src={`/images/banner/31.jpg`}
                                //src={`/images/banner/about-3-${suffix}.jpg`}
                                fill
                                alt='Nuestra filosofía'
                                className='object-cover'
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
                                <blockquote className="text-white text-xl md:text-3xl font-medium text-center max-w-3xl italic leading-relaxed">
                                    "Cuidamos cada detalle porque entendemos que detrás de cada compra hay una historia, una familia y una mascota que importa."
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default AboutUs