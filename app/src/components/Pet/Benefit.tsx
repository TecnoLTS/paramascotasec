import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface Props {
    props: string;
}

const Benefit: React.FC<Props> = ({ props }) => {
    return (
        <>
            <div className="container">
                <div className={`benefit-block ${props}`}>
                    <div className="list-benefit grid items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="benefit-item flex flex-col items-center justify-center text-center px-2 sm:px-4">
                            <Icon.Headset className="text-[#1f3b3b] lg:h-16 lg:w-16 sm:h-12 sm:w-12 h-10 w-10" weight="duotone" />
                            <div className="heading6 text-center mt-4 text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px]">Servicio al cliente</div>
                            <div className="caption1 text-secondary text-center mt-2 text-[13px] leading-[20px] sm:text-[14px] sm:leading-[22px] max-w-[320px]">Estamos disponibles para ayudarte y resolver tus dudas a través de nuestros canales oficiales.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center text-center px-2 sm:px-4">
                            <Icon.ArrowCounterClockwise className="text-[#1f3b3b] lg:h-16 lg:w-16 sm:h-12 sm:w-12 h-10 w-10" weight="duotone" />
                            <div className="heading6 text-center mt-4 text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px]">Cambios y devoluciones</div>
                            <div className="caption1 text-secondary text-center mt-2 text-[13px] leading-[20px] sm:text-[14px] sm:leading-[22px] max-w-[320px]">Aceptamos cambios o devoluciones dentro de los 5 días hábiles posteriores a la entrega, conforme a nuestras políticas vigentes.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center text-center px-2 sm:px-4">
                            <Icon.SealCheck className="text-[#1f3b3b] lg:h-16 lg:w-16 sm:h-12 sm:w-12 h-10 w-10" weight="duotone" />
                            <div className="heading6 text-center mt-4 text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px]">Garantía de productos</div>
                            <div className="caption1 text-secondary text-center mt-2 text-[13px] leading-[20px] sm:text-[14px] sm:leading-[22px] max-w-[320px]">Nuestros productos cuentan con garantía por defectos de fabricación, conforme a nuestras políticas.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center text-center px-2 sm:px-4">
                            <Icon.Truck className="text-[#1f3b3b] lg:h-16 lg:w-16 sm:h-12 sm:w-12 h-10 w-10" weight="duotone" />
                            <div className="heading6 text-center mt-4 text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px]">Envíos y entregas</div>
                            <div className="caption1 text-secondary text-center mt-2 text-[13px] leading-[20px] sm:text-[14px] sm:leading-[22px] max-w-[320px]">Realizamos envíos a zonas habilitadas dentro de Ecuador. Los costos y tiempos de entrega se informan antes de confirmar tu pedido.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Benefit
