
'use client'

import React from 'react'
import Link from 'next/link'
import Image from '@/components/Common/AppImage'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useSite } from '@/context/SiteContext'
import { getCategoryLabel, getCategoryUrl } from '@/data/petCategoryCards'

type FooterProps = {
    categoryIds?: string[]
}

const Footer = ({ categoryIds }: FooterProps) => {
    const site = useSite()
    const currentYear = 2026
    const [hasMounted, setHasMounted] = React.useState(false)

    React.useEffect(() => {
        setHasMounted(true)
    }, [])

    const footerCategories = React.useMemo(() => {
        if (!hasMounted || !categoryIds || categoryIds.length === 0) {
            return site.footerCategoryLinks
        }

        const available = new Set(categoryIds.map((categoryId) => String(categoryId).trim().toLowerCase()))
        return site.footerCategoryLinks.filter((categoryId) => available.has(categoryId.toLowerCase()))
    }, [categoryIds, hasMounted, site.footerCategoryLinks])
    return (
        <div id="footer" className='footer'>
            <div className="footer-main bg-surface pt-[60px] pb-[20px]">
                <div className="container">
                    <div className="content-footer flex flex-wrap lg:flex-nowrap justify-between gap-10">
                        
                        {/* COLUMNA 1: LOGO Y CONTACTO (Ancho fijo en desktop 25%) */}
                        <div className="company-infor w-full lg:w-1/4">
                            <Link href={'/'} className="logo inline-block mb-6">
                                <div className="logo-image relative w-[150px] h-[50px]">
                                    <Image
                                        src={site.logo.src}
                                        alt={site.logo.alt}
                                        fill
                                        className="object-contain object-left"
                                        sizes="150px"
                                    />
                                </div>
                            </Link>
                            
                            <div className='flex gap-4'>
                                <div className="flex flex-col gap-3 font-bold text-secondary">
                                    <span>Correo:</span>
                                    <span>WhatsApp:</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <a href={`mailto:${site.contact.email}`} className='hover:text-green-600 transition-colors'>
                                        {site.contact.email}
                                    </a>
                                    <a 
                                        href={`https://wa.me/${site.contact.whatsappNumber}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className='hover:text-green-600 transition-colors'
                                    >
                                        {site.contact.whatsappLabel}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNAS DERECHA (Información, Categorías, Atencion, Boletín) */}
                        <div className="right-content w-full lg:w-3/4 flex flex-wrap gap-y-10">
                            
                            {/* GRUPO DE LINKS (Ocupa 2/3 del espacio derecho) */}
                            <div className="list-nav w-full md:w-2/3 flex flex-wrap justify-between gap-8">
                                <div className="item">
                                    <div className="text-button-uppercase pb-4 text-black font-bold">Información</div>
                                    <div className="flex flex-col gap-2">
                                        <Link className='caption1 hover:text-green-600 duration-300' href={'/pages/about'}>Conócenos</Link>
                                        <Link className='caption1 hover:text-green-600 duration-300' href={'/pages/contact'}>Contáctanos</Link>
                                        <Link className='caption1 hover:text-green-600 duration-300' href={'/pages/preguntas-frecuentes'}>Preguntas frecuentes</Link>
                                    </div>
                                </div>

                                <div className="item">
                                    <div className="text-button-uppercase pb-4 text-black font-bold">Categorías</div>
                                    <div className="flex flex-col gap-2">
                                        {footerCategories.map((categoryId) => (
                                            <Link
                                                key={categoryId}
                                                className='caption1 hover:text-green-600 duration-300'
                                                href={getCategoryUrl(categoryId)}
                                            >
                                                {getCategoryLabel(categoryId)}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="item">
                                    <div className="text-button-uppercase pb-4 text-black font-bold">Atención al cliente</div>
                                    <div className="flex flex-col gap-2">
                                        <Link className='caption1 hover:text-green-600 duration-300' href={'/my-account'}>Mi cuenta</Link>
                                        <Link 
            className='caption1 hover:text-green-600 duration-300' 
            href={'/pages/terminos-y-condiciones#envios'}
        >
            Envíos
        </Link>
                                        <Link className='caption1 hover:text-green-600 duration-300' href={'/pages/terminos-y-condiciones'}>Términos y condiciones</Link>
                                        <Link className='caption1 hover:text-green-600 duration-300' href={'/pages/politica-de-privacidad'}>Política de privacidad</Link>
                                    </div>
                                </div>
                            </div>

                            {/* BOLETÍN (Ocupa 1/3 del espacio derecho) */}
                            <div className="newsletter w-full md:w-1/3 md:pl-10">
                                <div className="text-button-uppercase pb-4 text-black font-bold">Boletín</div>
                                <div className="caption1 mb-4">Suscríbete y obtén un 10% de descuento en tu primera compra</div>
                                <div className="input-block w-full h-[52px]">
                                    <form className='w-full h-full relative' action="post" suppressHydrationWarning>
                                        <input type="email" placeholder='Ingresa tu correo' className='caption1 w-full h-full pl-4 pr-14 rounded-xl border border-line focus:outline-none focus:border-green-500' required suppressHydrationWarning />
                                        <button className='w-[44px] h-[44px] bg-[#1F2937] hover:bg-green-600 transition-colors flex items-center justify-center rounded-xl absolute top-1 right-1'>
                                            <Icon.ArrowRight size={24} color='#fff' />
                                        </button>
                                    </form>
                                </div>
                                <div className="list-social flex items-center gap-4 mt-6">
                                    <Link href={site.social.facebook ?? 'https://www.facebook.com/'} target='_blank' className="hover:opacity-70">
                                        <div className="icon-facebook text-2xl text-black"></div>
                                    </Link>
                                    <Link href={site.social.instagram ?? 'https://www.instagram.com/'} target='_blank' className="hover:opacity-70">
                                        <div className="icon-instagram text-2xl text-black"></div>
                                    </Link>
                                    <Link href={site.social.twitter ?? 'https://www.twitter.com/'} target='_blank' className="hover:opacity-70">
                                        <div className="icon-twitter text-2xl text-black"></div>
                                    </Link>
                                    <Link href={site.social.youtube ?? 'https://www.youtube.com/'} target='_blank' className="hover:opacity-70">
                                        <div className="icon-youtube text-2xl text-black"></div>
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                    
                    <div className="footer-bottom py-6 mt-8 flex items-center justify-between gap-5 max-lg:justify-center max-lg:flex-col border-t border-gray-200">
                        <div className="left flex items-center gap-8">
                            <div className="copyright caption1 text-secondary text-center">
                                ©{currentYear} {site.name} - Con el apoyo de nuestros aliados tecnológicos - TecnoLTS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer
