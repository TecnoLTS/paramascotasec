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
        },
        {
            title: 'Cambios y devoluciones',
            description: 'Aceptamos cambios o devoluciones dentro de los 5 días hábiles posteriores a la entrega, conforme a nuestras políticas vigentes.',
            icon: Icon.ArrowCounterClockwise,
        },
        {
            title: 'Garantía de productos',
            description: 'Nuestros productos cuentan con garantía por defectos de fabricación, conforme a nuestras políticas.',
            icon: Icon.SealCheck,
        },
        {
            title: 'Envíos y entregas',
            description: 'Realizamos envíos a zonas habilitadas dentro de Ecuador. Los costos y tiempos de entrega se informan antes de confirmar tu pedido.',
            icon: Icon.Truck,
        },
    ]

    return (
        <>
            <div className="container">
                <div className={`benefit-block ${props}`}>
                    <div className="list-benefit grid items-start grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-8">
                        {items.map((item) => {
                            const ItemIcon = item.icon
                            return (
                                <div
                                    key={item.title}
                                    className="benefit-item flex items-start gap-3 rounded-2xl border border-line bg-white px-3 py-3 sm:px-4 sm:py-4 lg:flex-col lg:items-center lg:justify-center lg:gap-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-2 lg:py-0"
                                >
                                    <ItemIcon className="h-9 w-9 flex-shrink-0 text-[#1f3b3b] sm:h-10 sm:w-10 lg:h-16 lg:w-16" weight="duotone" />
                                    <div className="min-w-0">
                                        <div className="heading6 text-left text-[16px] leading-[22px] sm:text-[17px] sm:leading-[24px] lg:mt-4 lg:text-center lg:text-[18px] lg:leading-[26px]">
                                            {item.title}
                                        </div>
                                        <div className="caption1 mt-1 text-left text-[13px] leading-[20px] text-secondary sm:mt-1.5 sm:text-[14px] sm:leading-[22px] lg:mt-2 lg:max-w-[320px] lg:text-center">
                                            {item.description}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Benefit
