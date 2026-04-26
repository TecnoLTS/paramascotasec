
'use client'

import React from 'react'
import Link from 'next/link'
import Image from '@/components/Common/AppImage'
import { useSite } from '@/context/SiteContext'
import { getCategoryLabel, getCategoryUrl } from '@/data/petCategoryCards'

type FooterProps = {
    categoryIds?: string[]
}

const Footer = ({ categoryIds }: FooterProps) => {
    const site = useSite()
    const currentYear = 2026

    const footerCategories = React.useMemo(() => {
        if (!categoryIds || categoryIds.length === 0) {
            return site.footerCategoryLinks
        }

        const available = new Set(categoryIds.map((categoryId) => String(categoryId).trim().toLowerCase()))
        return site.footerCategoryLinks.filter((categoryId) => available.has(categoryId.toLowerCase()))
    }, [categoryIds, site.footerCategoryLinks])
    return (
        <div id="footer" className='footer'>
            <div className="footer-main bg-surface pt-14 pb-5">
                <div className="container">
                    <Link href={'/'} className="logo mb-10 inline-block">
                        <div className="logo-image relative h-[50px] w-[150px]">
                            <Image
                                src={site.logo.src}
                                alt={site.logo.alt}
                                fill
                                className="object-contain object-left"
                                sizes="150px"
                            />
                        </div>
                    </Link>

                    <div className="content-footer grid grid-cols-1 items-start gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
                        <div className="item min-w-0">
                            <div className="pb-5 text-[15px] font-bold uppercase tracking-[0.06em] text-heading">Contacto</div>
                            <div className='grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-3 text-[14px] leading-[1.45]'>
                                <div className="flex h-[28px] w-[28px] items-center justify-center text-secondary" aria-hidden="true">
                                    <span className="text-[18px] leading-none">@</span>
                                </div>
                                <div>
                                    <a
                                        href={`mailto:${site.contact.email}`}
                                        className='hover:text-green-600 transition-colors'
                                        aria-label={`Correo: ${site.contact.email}`}
                                    >
                                        {site.contact.email}
                                    </a>
                                </div>
                                <div className="flex h-[28px] w-[28px] items-center justify-center text-secondary" aria-hidden="true">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-[18px] w-[18px]"
                                        fill="currentColor"
                                    >
                                        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.62 2 2.2 6.4 2.2 11.83c0 1.74.45 3.43 1.31 4.93L2 22l5.39-1.41a9.86 9.86 0 0 0 4.64 1.18h.01c5.41 0 9.83-4.41 9.83-9.84a9.8 9.8 0 0 0-2.82-7.02Zm-7.02 15.2h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.2.84.86-3.12-.2-.32a8.12 8.12 0 0 1-1.26-4.35c0-4.48 3.65-8.13 8.14-8.13 2.17 0 4.21.84 5.74 2.39A8.08 8.08 0 0 1 20.15 12c0 4.48-3.64 8.12-8.12 8.12Zm4.46-6.08c-.24-.12-1.42-.7-1.64-.77-.22-.08-.38-.12-.55.12-.16.24-.63.77-.77.93-.14.16-.28.18-.52.06a6.63 6.63 0 0 1-1.96-1.21 7.38 7.38 0 0 1-1.36-1.68c-.14-.24-.01-.36.11-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.31-.75-1.79-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.7 2.6 4.11 3.64.57.24 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
                                    </svg>
                                </div>
                                <div>
                                    <a 
                                        href={`https://wa.me/${site.contact.whatsappNumber}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className='hover:text-green-600 transition-colors'
                                        aria-label={`WhatsApp: ${site.contact.whatsappLabel}`}
                                    >
                                        {site.contact.whatsappLabel}
                                    </a>
                                </div>
                            </div>

                            <div className="list-social mt-7 flex items-center gap-5">
                                <Link href={site.social.facebook ?? 'https://www.facebook.com/'} target='_blank' className="text-[24px] text-black transition-opacity hover:opacity-70" aria-label="Facebook">
                                    <div className="icon-facebook"></div>
                                </Link>
                                <Link href={site.social.instagram ?? 'https://www.instagram.com/'} target='_blank' className="text-[24px] text-black transition-opacity hover:opacity-70" aria-label="Instagram">
                                    <div className="icon-instagram"></div>
                                </Link>
                                <Link href={site.social.twitter ?? 'https://www.twitter.com/'} target='_blank' className="text-[24px] text-black transition-opacity hover:opacity-70" aria-label="Twitter">
                                    <div className="icon-twitter"></div>
                                </Link>
                                <Link href={site.social.youtube ?? 'https://www.youtube.com/'} target='_blank' className="text-[24px] text-black transition-opacity hover:opacity-70" aria-label="YouTube">
                                    <div className="icon-youtube"></div>
                                </Link>
                            </div>
                        </div>

                        <div className="item min-w-0">
                            <div className="pb-5 text-[15px] font-bold uppercase tracking-[0.06em] text-heading">Información</div>
                            <div className="flex flex-col items-start gap-3 text-[14px] leading-[1.45]">
                                <Link className='hover:text-green-600 duration-300' href={'/pages/about'}>Conócenos</Link>
                                <Link className='hover:text-green-600 duration-300' href={'/pages/contact'}>Contáctanos</Link>
                                <Link className='hover:text-green-600 duration-300' href={'/pages/preguntas-frecuentes'}>Preguntas frecuentes</Link>
                            </div>
                        </div>

                        <div className="item min-w-0">
                            <div className="pb-5 text-[15px] font-bold uppercase tracking-[0.06em] text-heading">Categorías</div>
                            <div className="flex flex-col items-start gap-3 text-[14px] leading-[1.45]">
                                {footerCategories.map((categoryId) => (
                                    <Link
                                        key={categoryId}
                                        className='hover:text-green-600 duration-300'
                                        href={getCategoryUrl(categoryId)}
                                    >
                                        {getCategoryLabel(categoryId)}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="item min-w-0">
                            <div className="pb-5 text-[15px] font-bold uppercase tracking-[0.06em] text-heading">Atención al cliente</div>
                            <div className="flex flex-col items-start gap-3 text-[14px] leading-[1.45]">
                                <Link className='hover:text-green-600 duration-300' href={'/my-account'} prefetch={false}>Mi cuenta</Link>
                                <Link 
                                    className='hover:text-green-600 duration-300' 
                                    href={'/pages/terminos-y-condiciones#envios'}
                                >
                                    Envíos
                                </Link>
                                <Link className='hover:text-green-600 duration-300' href={'/pages/terminos-y-condiciones'}>Términos y condiciones</Link>
                                <Link className='hover:text-green-600 duration-300' href={'/pages/politica-de-privacidad'}>Política de privacidad</Link>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom mt-10 flex items-center justify-center border-t border-gray-200 py-6">
                        <div className="left flex items-center justify-center">
                            <div className="copyright text-center text-[15px] leading-[1.45] text-secondary max-sm:text-sm">
                                ©{currentYear} {site.name}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer
