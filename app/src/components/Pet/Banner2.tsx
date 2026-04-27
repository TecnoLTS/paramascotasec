import React from 'react'
import Link from 'next/link'
import Image from '@/components/Common/AppImage'
import * as Icon from "@phosphor-icons/react/dist/ssr"

const Banner2 = () => {
    return (
        <div className="banner-block relative overflow-hidden bg-gradient-to-r from-[#4EBCCB] via-[#63CFDF] to-[#7EDFEE] py-12 md:py-16 lg:py-20">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-5%] opacity-10 rotate-12">
                <Icon.PawPrint size={240} weight="fill" color="white" />
            </div>
            <div className="absolute bottom-[-10%] right-[-5%] opacity-10 -rotate-12 outline-none">
                <Icon.Heart size={200} weight="fill" color="white" />
            </div>

            <div className="container relative z-[2]">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    {/* Image side */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-white/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative block w-full max-w-[500px] aspect-[1920/460] overflow-hidden rounded-3xl shadow-2xl transform transition duration-500 hover:scale-[1.02]">
                                <Image
                                    src="/images/banner/jornadas-de-adopcion-paramascotas-1920x460.webp"
                                    alt="Jornadas de adopción"
                                    fill
                                    sizes="(min-width: 1280px) 500px, (min-width: 1024px) 42vw, 90vw"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content side */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold tracking-wider uppercase">
                            Impacto Social
                        </div>
                        <h2 className="text-white font-bold leading-tight text-[32px] md:text-[44px] lg:text-[52px] mb-6 drop-shadow-md">
                            Jornadas de <span className="text-[#1F3B3B]">Adopción</span>
                        </h2>
                        <p className="text-white/90 text-[16px] md:text-[18px] lg:text-[20px] leading-relaxed max-w-[600px] mb-10 drop-shadow-sm font-medium">
                            Junto a fundaciones y rescatistas, ayudamos a que más mascotas encuentren un hogar.
                            <span className="block mt-2 font-bold text-white">¡Sé parte de una adopción que cambia vidas!</span>
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                href={'https://www.instagram.com/paramascotas_ec/'}
                                target="_blank"
                                className='group relative flex items-center justify-center px-8 py-4 bg-[#1F3B3B] text-white rounded-2xl font-bold transition-all duration-300 hover:bg-black hover:shadow-[0_8px_25px_rgba(31,59,59,0.4)] overflow-hidden'
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Visita nuestra red social
                                    <Icon.InstagramLogo size={22} weight="bold" className="group-hover:rotate-12 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner2
