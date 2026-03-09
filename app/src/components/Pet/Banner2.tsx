import React from 'react'
import Link from 'next/link'

const Banner2 = () => {
    return (
        <>
            <div className="banner-block relative overflow-hidden bg-[#63CFDF] aspect-[474/280] xs:aspect-[767/320] md:aspect-[1023/360] lg:aspect-[1279/420] xl:aspect-[1920/460] min-[1920px]:aspect-[2560/460] min-[2560px]:aspect-[3840/460]">
                <div className="absolute inset-0 z-0">
                    <picture className="block w-full h-full">
                        <source
                            media="(min-width: 2560px)"
                            srcSet="/images/banner/jornadas-de-adopcion-paramascotas-3840x460.jpg 3840w"
                            sizes="100vw"
                        />
                        <source
                            media="(min-width: 1920px)"
                            srcSet="/images/banner/jornadas-de-adopcion-paramascotas-2560x460.jpg 2560w"
                            sizes="100vw"
                        />
                        <source
                            media="(min-width: 1280px)"
                            srcSet="/images/banner/jornadas-de-adopcion-paramascotas-1920x460.jpg 1920w"
                            sizes="100vw"
                        />
                        <source
                            media="(min-width: 1024px)"
                            srcSet="/images/banner/jornadas-de-adopcion-paramascotas-1279x420.jpg 1279w"
                            sizes="100vw"
                        />
                        <source
                            media="(min-width: 768px)"
                            srcSet="/images/banner/jornadas-de-adopcion-paramascotas-1023x360.jpg 1023w"
                            sizes="100vw"
                        />
                        <source
                            media="(min-width: 475px)"
                            srcSet="/images/banner/jornadas-de-adopcion-paramascotas-767x320.jpg 767w"
                            sizes="100vw"
                        />
                        <img
                            src="/images/banner/jornadas-de-adopcion-paramascotas-474x280.jpg"
                            srcSet="/images/banner/jornadas-de-adopcion-paramascotas-474x280.jpg 474w"
                            sizes="100vw"
                            alt="Jornadas de adopción"
                            className="block w-full h-full object-contain object-center"
                            loading="lazy"
                            decoding="async"
                        />
                    </picture>
                </div>
                <div className="banner2-content absolute inset-0 z-[2] flex items-center justify-center px-4 sm:px-6">
                    <div className="w-full max-w-[980px]">
                        <h2 className="text-center text-white font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] text-[20px] leading-[26px] xs:text-[24px] xs:leading-[30px] md:text-[34px] md:leading-[40px] lg:text-[40px] lg:leading-[46px]">
                            Jornadas de Adopción
                        </h2>
                        <p className="font-normal text-center mt-2 xs:mt-3 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)] text-[14px] leading-[21px] xs:text-[15px] xs:leading-[23px] md:text-[20px] md:leading-[30px]">
                            Junto a fundaciones y rescatistas, ayudamos a que más mascotas encuentren un hogar. Síguenos en redes y sé parte de una adopción que cambia vidas.
                        </p>
                        <div className="button-block text-center mt-3 xs:mt-4 md:mt-8">
                            <Link href={'https://www.instagram.com/paramascotas_ec/'} target="_blank" className='button-main'>
                                Visita nuestra red social
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Banner2
