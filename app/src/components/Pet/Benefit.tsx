import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface Props {
    props: string;
}

const Benefit: React.FC<Props> = ({ props }) => {
    const items = [
        {
            title: 'Servicio al cliente',
            description: 'Estamos disponibles para ayudarte y resolver tus dudas a través de nuestros canales oficiales.',
            icon: Icon.Headset,
            bgColor: 'bg-[#E3F2F2]',
            iconColor: 'text-[#1F3B3B]',
        },
        {
            title: 'Cambios y devoluciones',
            description: 'Consulta nuestra política completa en Términos y Condiciones.',
            icon: Icon.ArrowCounterClockwise,
            bgColor: 'bg-[#FFF4E5]',
            iconColor: 'text-[#FC5A04]',
        },
        {
            title: 'Garantía de productos',
            description: 'Nuestros productos cuentan con garantía por defectos de fabricación conforme a políticas.',
            icon: Icon.SealCheck,
            bgColor: 'bg-[#F0EEFF]',
            iconColor: 'text-[#8684D4]',
        },
        {
            title: 'Envíos y entregas',
            description: 'Envíos en zonas habilitadas con tiempos informados.',
            icon: Icon.Truck,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#3DAB25]',
        },
    ]

    return (
        <div className="bg-white">
            <div className="container">
                <div className={`benefit-block ${props}`}>
                    <div className="list-benefit grid items-start grid-cols-1 gap-6 sm:gap-4 lg:grid-cols-4 lg:gap-8">
                        {items.map((item) => {
                            const ItemIcon = item.icon
                            return (
                                <div
                                    key={item.title}
                                    className="group benefit-item flex items-start gap-4 rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:shadow-md lg:flex-col lg:items-center lg:justify-center lg:text-center lg:border-0 lg:bg-transparent lg:hover:shadow-none lg:p-0"
                                >
                                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${item.bgColor} transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 lg:h-20 lg:w-20 lg:rounded-2xl`}>
                                        <ItemIcon className={`h-7 w-7 ${item.iconColor} sm:h-8 sm:w-8 lg:h-12 lg:w-12`} weight="duotone" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="heading6 text-[#1F3B3B] text-[16px] leading-[22px] sm:text-[17px] sm:leading-[24px] lg:mt-5 lg:text-[18px] lg:leading-[26px]">
                                            {item.title}
                                        </div>
                                        <div className="caption1 mt-1 text-secondary text-[13px] leading-[20px] sm:mt-1.5 sm:text-[14px] sm:leading-[22px] lg:mt-2 lg:max-w-[280px]">
                                            {item.description}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Benefit
