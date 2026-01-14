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
                        <div className="heading6 font-normal text-secondary mt-3">Cuidamos a los animales como parte de la familia, ofreciendo productos confiables y una atención cercana en cada visita.</div>
                        <div className="list-feature lg:mt-10 mt-6">
                            
                            {/* Ítem 1 */}
                            <div className="item flex items-center gap-5">
                                {/* CORRECCIÓN AQUÍ: Clases movidas al padre y flex-shrink-0 agregado */}
                                <div className="icon bg-[#D1D0F9] rounded-full flex-shrink-0 flex items-center justify-center md:w-[68px] md:h-[68px] w-14 h-14">
                                    <i className="icon-foot md:text-3xl text-2xl"></i>
                                </div>
                                <div className="text-content">
                                    <div className="heading6">Productos de alta calidad</div>
                                    <div className="caption1 text-secondary mt-2">Seleccionamos productos confiables y de excelente calidad para su bienestar y felicidad.</div>
                                </div>
                            </div>

                            {/* Ítem 2 */}
                            <div className="item flex items-center gap-5 lg:mt-8 mt-4">
                                {/* CORRECCIÓN AQUÍ */}
                                <div className="icon bg-[#D1D0F9] rounded-full flex-shrink-0 flex items-center justify-center md:w-[68px] md:h-[68px] w-14 h-14">
                                    <i className="icon-food md:text-3xl text-2xl"></i>
                                </div>
                                <div className="text-content">
                                    <div className="heading6">Te acompañamos</div>
                                    <div className="caption1 text-secondary mt-2">Estamos aquí para ayudarte a cuidar mejor en cada etapa.</div>
                                </div>
                            </div>

                            {/* Ítem 3 */}
                            <div className="item flex items-center gap-5 lg:mt-8 mt-4">
                                {/* CORRECCIÓN AQUÍ */}
                                <div className="icon bg-[#D1D0F9] rounded-full flex-shrink-0 flex items-center justify-center md:w-[68px] md:h-[68px] w-14 h-14">
                                    <i className="icon-comb md:text-3xl text-2xl"></i>
                                </div>
                                <div className="text-content">
                                    <div className="heading6">Elección pensada para cada mascota</div>
                                    <div className="caption1 text-secondary mt-2">Cada mascota es única. Te ayudamos a elegir lo más adecuado según sus necesidades.</div>
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