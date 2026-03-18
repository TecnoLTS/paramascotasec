import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

const ChooseUs = () => {
    const features = [
        {
            icon: Icon.PawPrint,
            title: 'Productos de alta calidad',
            description: 'Seleccionamos productos confiables y de excelente calidad para su bienestar y felicidad.',
            bgColor: 'bg-[#E3F2F2]',
            iconColor: 'text-[#1F3B3B]',
        },
        {
            icon: Icon.Heartbeat,
            title: 'Te acompañamos',
            description: 'Estamos aquí para ayudarte a cuidar mejor en cada etapa con asesoría experta.',
            bgColor: 'bg-[#FFF4E5]',
            iconColor: 'text-[#FC5A04]',
        },
        {
            icon: Icon.HandHeart,
            title: 'Elección pensada para cada mascota',
            description: 'Cada mascota es única. Te ayudamos a elegir lo más adecuado según sus necesidades individuales.',
            bgColor: 'bg-[#F0EEFF]',
            iconColor: 'text-[#8684D4]',
        },
    ]

    return (
        <div className="choose-us-block py-16 md:py-24 bg-white">
            <div className="container">
                <div className="flex flex-col lg:flex-row items-center gap-12 xl:gap-20">
                    <div className="w-full lg:w-1/2">
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#63CFDF]/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#8684D4]/10 rounded-full blur-3xl"></div>
                            <picture className="relative block w-full">
                                <source media="(min-width: 1536px)" srcSet="/images/banner/choose-us-pet-2040x1884.jpg" />
                                <source media="(min-width: 1280px)" srcSet="/images/banner/choose-us-pet-1360x1256.jpg" />
                                <source media="(min-width: 1024px)" srcSet="/images/banner/choose-us-pet-1120x1034.jpg" />
                                <source media="(min-width: 640px)" srcSet="/images/banner/choose-us-pet-900x831.jpg" />
                                <img
                                    src="/images/banner/choose-us-pet-640x591.jpg"
                                    alt="Perro mirando un corazón de juguete"
                                    loading="eager"
                                    className="h-auto w-full rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] object-cover transform transition duration-500 hover:rotate-1"
                                />
                            </picture>
                        </div>
                    </div>
                    <div className="content w-full lg:w-1/2">
                        <div className="inline-block px-4 py-1 rounded-full bg-[#1F3B3B]/5 text-[#1F3B3B] text-sm font-bold mb-4">
                            ¿Por qué elegirnos?
                        </div>
                        <h2 className="heading2 mb-6 text-[#1F3B3B]">
                            Las mejores razones para <span className="text-[#63CFDF]">elegirnos</span>
                        </h2>
                        <p className="body1 text-secondary mb-10 max-w-[600px]">
                            Cuidamos a los animales como parte de la familia, ofreciendo productos confiables
                            y una atención cercana que garantiza su bienestar integral.
                        </p>
                        <div className="list-feature space-y-6 md:space-y-8">
                            {features.map((feature, index) => {
                                const FeatureIcon = feature.icon
                                return (
                                    <div
                                        key={feature.title}
                                        className="group item flex items-start gap-5 p-4 rounded-2xl transition-all duration-300 hover:bg-surface hover:shadow-sm"
                                    >
                                        <div className={`icon flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-2xl ${feature.bgColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                            <FeatureIcon weight="duotone" className={`text-3xl sm:text-4xl ${feature.iconColor}`} />
                                        </div>
                                        <div className="text-content pt-1">
                                            <h4 className="heading6 text-[#1F3B3B] mb-2 group-hover:text-[#63CFDF] transition-colors">{feature.title}</h4>
                                            <p className="caption1 text-secondary leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChooseUs
