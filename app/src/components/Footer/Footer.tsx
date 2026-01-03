import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr";

const Footer = () => {
    return (
        <>
            <div id="footer" className='footer'>
                <div className="footer-main bg-surface">
                    <div className="container">
                        <div className="content-footer py-[60px] flex justify-between flex-wrap gap-y-8">
                            <div className="company-infor basis-1/4 max-lg:basis-full pr-7">
                                <Link href={'/'} className="logo">
                                    <div className="logo-image relative w-[150px] h-[50px]">
                                        <Image
                                            src={'/images/brand/LogoVerde150.svg'}
                                            alt={'ParaMascotasEC'}
                                            fill
                                            className="object-contain"
                                            sizes="150px"
                                        />
                                    </div>
                                </Link>
                                <div className='flex gap-3 mt-3'>
                                    <div className="flex flex-col ">
                                        <span className="text-button">Correo:</span>
                                        <span className="text-button mt-3">Teléfono:</span>
                                    </div>
                                    <div className="flex flex-col ">
                                        <span className=''>info@paramascotasec.com</span>
                                        <span className='mt-3'>+593 (099) 278-21-xx</span>
                                    </div>
                                </div>
                            </div>
                            <div className="right-content flex flex-wrap gap-y-8 basis-3/4 max-lg:basis-full">
                                <div className="list-nav flex justify-between basis-2/3 max-md:basis-full gap-4">
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Información</div>
                                        <Link className='caption1 has-line-before duration-300 w-fit' href={'/pages/contact'}>Contáctanos</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'#!'}>Carreras</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/my-account'}>Mi cuenta</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/order-tracking'}>Pedidos y devoluciones</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/pages/faqs'}>Preguntas frecuentes</Link>
                                    </div>
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Categorías</div>
                                        <Link className='caption1 has-line-before duration-300 w-fit' href={'/shop/breadcrumb1'}>Todas</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1?category=descuentos'}>Ofertas</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1?category=perros&gender=dog'}>Perros</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1?category=gatos&gender=cat'}>Gatos</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1?category=juguetes'}>Juguetes</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1?category=camas'}>Camas</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1?category=accesorios'}>Accesorios</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1?category=comederos'}>Comederos</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/shop/breadcrumb1?category=cuidado'}>Cuidado</Link>
                                    </div>
                                    <div className="item flex flex-col basis-1/3 ">
                                        <div className="text-button-uppercase pb-3">Atención al cliente</div>
                                        <Link className='caption1 has-line-before duration-300 w-fit' href={'/pages/faqs'}>Preguntas sobre pedidos</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/pages/faqs'}>Envíos</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/pages/faqs'}>Política de privacidad</Link>
                                        <Link className='caption1 has-line-before duration-300 w-fit pt-2' href={'/order-tracking'}>Devoluciones y reembolsos</Link>
                                    </div>
                                </div>
                                <div className="newsletter basis-1/3 pl-7 max-md:basis-full max-md:pl-0">
                                    <div className="text-button-uppercase">Boletín</div>
                                    <div className="caption1 mt-3">Suscríbete y obtén un 10% de descuento en tu primera compra</div>
                                    <div className="input-block w-full h-[52px] mt-4">
                                        <form className='w-full h-full relative' action="post">
                                            <input type="email" placeholder='Ingresa tu correo' className='caption1 w-full h-full pl-4 pr-14 rounded-xl border border-line' required />
                                            <button className='w-[44px] h-[44px] bg-[var(--blue)] flex items-center justify-center rounded-xl absolute top-1 right-1'>
                                                <Icon.ArrowRight size={24} color='#fff' />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="list-social flex items-center gap-6 mt-4">
                                        <Link href={'https://www.facebook.com/'} target='_blank'>
                                            <div className="icon-facebook text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.instagram.com/'} target='_blank'>
                                            <div className="icon-instagram text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.twitter.com/'} target='_blank'>
                                            <div className="icon-twitter text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.youtube.com/'} target='_blank'>
                                            <div className="icon-youtube text-2xl text-black"></div>
                                        </Link>
                                        <Link href={'https://www.pinterest.com/'} target='_blank'>
                                            <div className="icon-pinterest text-2xl text-black"></div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer-bottom py-3 flex items-center justify-between gap-5 max-lg:justify-center max-lg:flex-col border-t border-line">
                            <div className="left flex items-center gap-8">
                                <div className="copyright caption1 text-secondary">©2026 ParaMascorasEC</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Footer
