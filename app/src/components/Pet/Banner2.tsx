import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Banner2 = () => {
    return (
        <>
            <div className="banner-block md:mt-20 mt-10 relative max-xl:h-[400px] max-lg:h-[280px] max-md:h-[240px]">
                <div className="bg-img h-full w-full">
                    <Image
                        src={'/images/banner/4.jpg'}
                        width={3000}
                        height={2000}
                        alt='bg-img'
                        className='w-full h-full object-cover'
                    />
                </div>
                <div className="text-content w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4">
                    <div className="heading1 text-center">Haz feliz a tu mascota</div>
                    <div className="heading6 font-normal text-center mt-2">Ofrecemos servicios de calidad para mascotas</div>
                    <div className="button-block text-center mt-8">
                        <Link href={'/shop/breadcrumb1/'} className='button-main'>
                            Compra ahora
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Banner2
