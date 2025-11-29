import React from 'react'
import Image from 'next/image'

const ChooseUs = () => {
    return (
        <>
            <div className="choose-us-block md:pt-20 pt-14">
                <div className="container flex max-lg:flex-col max-lg:gap-y-8 items-center justify-between">
                    <div className="bg-img lg:w-7/12 lg:pr-[45px] md:w-1/2 w-5/6">
                        <Image
                            src={'/images/banner/5.jpg'}
                            width={1200}
                            height={1200}
                            alt='bg-img'
                            priority={true}
                            className='w-full'
                        />
                    </div>
                    <div className="content lg:w-5/12 lg:pl-[45px]">
                        <div className="heading3">Las mejores razones para elegirnos para tu tienda de mascotas</div>
                        <div className="heading6 font-normal text-secondary mt-3">Ofrecemos el mejor cuidado para tus mascotas: experiencia y servicio excepcionales.</div>
                        <div className="list-feature lg:mt-10 mt-6">
                            <div className="item flex items-center gap-5">
                                <div className="icon bg-[#D1D0F9] rounded-full">
                                    <i className="icon-foot md:text-3xl text-2xl flex items-center justify-center md:w-[68px] md:h-[68px] w-14 h-14"></i>
                                </div>
                                <div className="text-content">
                                    <div className="heading6">Productos de alta calidad</div>
                                    <div className="caption1 text-secondary mt-2">Estamos comprometidos con ofrecer productos de la más alta calidad para tus mascotas.</div>
                                </div>
                            </div>
                            <div className="item flex items-center gap-5 lg:mt-8 mt-4">
                                <div className="icon bg-[#D1D0F9] rounded-full">
                                    <i className="icon-food md:text-3xl text-2xl flex items-center justify-center md:w-[68px] md:h-[68px] w-14 h-14"></i>
                                </div>
                                <div className="text-content">
                                    <div className="heading6">Equipo experto</div>
                                    <div className="caption1 text-secondary mt-2">Nuestro equipo apasionado garantiza el bienestar de tus compañeros peludos.</div>
                                </div>
                            </div>
                            <div className="item flex items-center gap-5 lg:mt-8 mt-4">
                                <div className="icon bg-[#D1D0F9] rounded-full">
                                    <i className="icon-comb md:text-3xl text-2xl flex items-center justify-center md:w-[68px] md:h-[68px] w-14 h-14"></i>
                                </div>
                                <div className="text-content">
                                    <div className="heading6">Atención personalizada</div>
                                    <div className="caption1 text-secondary mt-2">Entendemos que cada mascota es única y que sus necesidades pueden variar.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChooseUs
