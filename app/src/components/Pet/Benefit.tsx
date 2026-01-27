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
                    <div className="list-benefit grid items-start lg:grid-cols-4 grid-cols-2 gap-[30px]">
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <Icon.Headset className="text-[#1f3b3b] lg:h-16 lg:w-16 h-12 w-12" weight="duotone" />
                            <div className="heading6 text-center mt-5">Servicio al cliente</div>
                            <div className="caption1 text-secondary text-center mt-3">Estamos disponibles para ayudarte y resolver tus dudas a través de nuestros canales oficiales.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <Icon.ArrowCounterClockwise className="text-[#1f3b3b] lg:h-16 lg:w-16 h-12 w-12" weight="duotone" />
                            <div className="heading6 text-center mt-5">Cambios y devoluciones</div>
                            <div className="caption1 text-secondary text-center mt-3">Aceptamos cambios o devoluciones dentro de los 5 días hábiles posteriores a la entrega, conforme a nuestras políticas vigentes.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <Icon.SealCheck className="text-[#1f3b3b] lg:h-16 lg:w-16 h-12 w-12" weight="duotone" />
                            <div className="heading6 text-center mt-5">Garantía de productos</div>
                            <div className="caption1 text-secondary text-center mt-3">Nuestros productos cuentan con garantía por defectos de fabricación, conforme a nuestras políticas.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <Icon.Truck className="text-[#1f3b3b] lg:h-16 lg:w-16 h-12 w-12" weight="duotone" />
                            <div className="heading6 text-center mt-5">Envíos y entregas</div>
                            <div className="caption1 text-secondary text-center mt-3">Realizamos envíos a zonas habilitadas dentro de Ecuador. Los costos y tiempos de entrega se informan antes de confirmar tu pedido.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Benefit
