'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";

// --- IMPORTS DE ESTRUCTURA (Basado en tu HomePet) ---
import MenuPet from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
// ----------------------------------------------------

const AboutUs = () => {
    return (
        <>
            {/* --- HEADER Y NAVEGACIÓN --- */}
            <div id="header" className='relative w-full style-pet'>
                <MenuPet />
            </div>
            {/* --- CONTENIDO PRINCIPAL (HISTORIA) --- */}
            <div className="about-us-intro md:pt-10 pt-6 pb-16">
                <div className="container">
                    <div className="flex max-lg:flex-col items-center gap-10 lg:gap-16">
                        
                        {/* Imagen Principal */}
                        <div className="bg-img lg:w-1/2 w-full">
                            <div className="image relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg">
                                <Image
                                    // REEMPLAZA ESTA RUTA CON TU FOTO REAL
                                    src={'/images/banner/5.jpg'} 
                                    fill
                                    alt='Quiénes somos - ParaMascotasEC'
                                    className='object-cover hover:scale-105 duration-500'
                                />
                            </div>
                        </div>

                        {/* Texto */}
                        <div className="content lg:w-1/2 w-full">
                            <h2 className="heading3 font-bold mb-6">¿Quiénes somos?</h2>
                            
                            <div className="body1 text-secondary leading-relaxed space-y-4 text-lg">
                                <p>
                                    Somos una <strong>familia pet friendly</strong> que ama profundamente a los animales y cree que las mascotas son parte esencial del hogar y de la familia. 
                                </p>
                                <p>
                                    Este proyecto nace del cariño por ellos y del deseo de crear un espacio donde las personas puedan encontrar productos confiables, atención cercana y un trato hecho con amor.
                                </p>
                                <p>
                                    Para nosotros, cuidar a una mascota va más allá de alimentarla: <strong>se trata de entenderla, acompañarla y brindarle lo mejor en cada etapa de su vida.</strong>
                                </p>
                            </div>

                            <div className="mt-8">
                                <Link href="/shop/breadcrumb1" className="button-main bg-black text-white hover:bg-green-600 rounded-full px-8 py-3 transition-colors">
                                    Ver nuestros productos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: VALORES --- */}
            <div className="about-values bg-[#F7F7F7] py-20 rounded-t-[40px] md:rounded-t-[60px]">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        
                        {/* Tarjeta 1 */}
                        <div className="item bg-white p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="icon bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                <Icon.Package size={32} className="text-blue-600" />
                            </div>
                            <h3 className="heading4 mb-4">Lo que ofrecemos</h3>
                            <p className="body1 text-secondary mb-4">
                                Ofrecemos productos pensados para el cuidado diario, trabajando con marcas responsables y opciones de calidad.
                            </p>
                            <p className="body1 text-secondary">
                                Nos enfocamos en brindar una experiencia simple, honesta y cercana, tanto en nuestra tienda como en nuestros canales digitales. Queremos que cada persona que nos visite se sienta acompañada y segura de que está eligiendo lo mejor para su mascota.
                            </p>
                        </div>

                        {/* Tarjeta 2 */}
                        <div className="item bg-white p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="icon bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                <Icon.HandHeart size={32} className="text-green-600" />
                            </div>
                            <h3 className="heading4 mb-4">Nuestra forma de hacer las cosas</h3>
                            <p className="body1 text-secondary mb-4">
                                Más que vender, nos gusta aconsejar y construir relaciones de confianza con quienes, como nosotros, aman a sus compañeros de cuatro patas.
                            </p>
                            <p className="body1 text-secondary">
                                <strong>Cuidamos cada detalle</strong> porque entendemos que detrás de cada compra hay una historia, una familia y una mascota que importa.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            
            <div className="pb-20 bg-[#F7F7F7]"></div>

            {/* --- FOOTER Y ELEMENTOS FINALES --- */}
            <Footer />
        </>
    )
}

export default AboutUs