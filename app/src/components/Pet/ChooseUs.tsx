import React from 'react'
import Image from '@/components/Common/AppImage'
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

    const renderFeatures = (compact = false) => (
        <div className={compact ? "list-feature space-y-4" : "list-feature space-y-6 md:space-y-8"}>
            {features.map((feature) => {
                const FeatureIcon = feature.icon
                return (
                    <div
                        key={feature.title}
                        className={`group item flex items-start ${compact ? 'gap-3 p-2.5' : 'gap-5 p-4'} rounded-2xl transition-all duration-300 hover:bg-surface hover:shadow-sm`}
                    >
                        <div className={`icon flex ${compact ? 'h-12 w-12' : 'h-14 w-14 sm:h-16 sm:w-16'} flex-shrink-0 items-center justify-center rounded-2xl ${feature.bgColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                            <FeatureIcon weight="duotone" className={`${compact ? 'text-[28px]' : 'text-3xl sm:text-4xl'} ${feature.iconColor}`} />
                        </div>
                        <div className="text-content pt-1 min-w-0">
                            <h3 className={`mb-2 text-[#1F3B3B] transition-colors group-hover:text-[#1F3B3B] ${compact ? 'text-lg leading-6 font-semibold' : 'text-[22px] leading-[30px] font-semibold'}`}>{feature.title}</h3>
                            <p className={`caption1 text-secondary leading-relaxed ${compact ? 'text-[13px]' : ''}`}>{feature.description}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )

    return (
        <div className="choose-us-block py-16 md:py-24 bg-white">
            <div className="container">
                <div className="lg:hidden">
                    <div className="mb-8 sm:mb-10">
                        <h2 className="heading2 mb-5 text-[#0a7b8f] text-[32px] leading-[1.08] sm:text-[38px] sm:leading-[1.06]">
                            Las mejores razones para elegirnos
                        </h2>
                        <p className="body1 text-secondary max-w-[600px] text-[14px] leading-7 sm:text-base">
                            Cuidamos a los animales como parte de la familia, ofreciendo productos confiables
                            y una atención cercana que garantiza su bienestar integral.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="float-right w-[38vw] min-w-[128px] max-w-[170px] sm:w-[220px] sm:max-w-[220px] ml-4 sm:ml-6 mb-4 sm:mb-6">
                            <div className="relative">
                                <div className="absolute -top-3 -left-3 w-14 h-14 bg-[#63CFDF]/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-[#8684D4]/10 rounded-full blur-3xl"></div>
                                <div className="relative block w-full aspect-[5/6] sm:aspect-[4/5] overflow-hidden rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                                    <Image
                                        src="/images/banner/choose-us-pet-2040x1884.webp"
                                        alt="Perro mirando un corazón de juguete"
                                        fill
                                        sizes="(min-width: 640px) 220px, 38vw"
                                        className="object-cover transform transition duration-500 hover:rotate-1"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="min-w-0">
                            {renderFeatures(true)}
                        </div>
                        <div className="clear-both" />
                    </div>
                </div>

                <div className="hidden lg:grid lg:grid-cols-2 items-start gap-12 xl:gap-20">
                    <div className="w-full self-center">
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#63CFDF]/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#8684D4]/10 rounded-full blur-3xl"></div>
                            <div className="relative block w-full aspect-[2040/1884] overflow-hidden rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                                <Image
                                    src="/images/banner/choose-us-pet-2040x1884.webp"
                                    alt="Perro mirando un corazón de juguete"
                                    fill
                                    sizes="(min-width: 1280px) 620px, (min-width: 1024px) 46vw, 50vw"
                                    className="object-cover transform transition duration-500 hover:rotate-1"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="content min-w-0">
                        <h2 className="heading2 mb-6 text-[#0a7b8f]">
                            Las mejores razones para elegirnos
                        </h2>
                        <p className="body1 text-secondary mb-10 max-w-[600px]">
                            Cuidamos a los animales como parte de la familia, ofreciendo productos confiables
                            y una atención cercana que garantiza su bienestar integral.
                        </p>
                        {renderFeatures(false)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChooseUs
