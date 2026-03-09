import React from 'react'

const ChooseUs = () => {
    const features = [
        {
            icon: 'icon-foot',
            title: 'Productos de alta calidad',
            description: 'Seleccionamos productos confiables y de excelente calidad para su bienestar y felicidad.',
        },
        {
            icon: 'icon-food',
            title: 'Te acompañamos',
            description: 'Estamos aquí para ayudarte a cuidar mejor en cada etapa.',
        },
        {
            icon: 'icon-comb',
            title: 'Elección pensada para cada mascota',
            description: 'Cada mascota es única. Te ayudamos a elegir lo más adecuado según sus necesidades.',
        },
    ]

    return (
        <div className="choose-us-block pt-14 md:pt-16 xl:pt-20">
            <div className="container">
                <div className="flex flex-col gap-8 sm:gap-9 md:flex-row md:items-center md:gap-8 lg:gap-10 xl:gap-12">
                    <div className="w-full md:w-[48%] xl:w-[45%]">
                        <picture className="block w-full">
                            <source media="(min-width: 1536px)" srcSet="/images/banner/choose-us-pet-2040x1884.jpg" />
                            <source media="(min-width: 1280px)" srcSet="/images/banner/choose-us-pet-1360x1256.jpg" />
                            <source media="(min-width: 1024px)" srcSet="/images/banner/choose-us-pet-1120x1034.jpg" />
                            <source media="(min-width: 640px)" srcSet="/images/banner/choose-us-pet-900x831.jpg" />
                            <img
                                src="/images/banner/choose-us-pet-640x591.jpg"
                                width={640}
                                height={591}
                                alt="Perro mirando un corazón de juguete"
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                                className="h-auto w-full rounded-2xl object-cover object-center max-md:h-[58vw] max-md:min-h-[220px] max-md:max-h-[320px]"
                            />
                        </picture>
                    </div>
                    <div className="content w-full md:w-[52%] xl:w-[55%] md:pt-1">
                        <div className="heading3 max-w-[680px]">Las mejores razones para elegirnos para tu tienda de mascotas</div>
                        <div className="heading6 mt-3 max-w-[680px] font-normal text-secondary">
                            Cuidamos a los animales como parte de la familia, ofreciendo productos confiables y una atención cercana en cada visita.
                        </div>
                        <div className="list-feature mt-6 md:mt-8 lg:mt-10">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className={`item flex items-start gap-3 sm:gap-5 ${index > 0 ? 'mt-4 md:mt-6 lg:mt-8' : ''}`}
                                >
                                    <div className="icon flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#D1D0F9] sm:h-[68px] sm:w-[68px]">
                                        <i className={`${feature.icon} text-[22px] sm:text-3xl`} />
                                    </div>
                                    <div className="text-content">
                                        <div className="heading6 leading-tight">{feature.title}</div>
                                        <div className="caption1 mt-1.5 text-secondary sm:mt-2">{feature.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChooseUs
