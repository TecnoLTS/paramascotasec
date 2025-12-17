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
                            <div className="heading6 text-center mt-5">Servicio al cliente 24/7</div>
                            <div className="caption1 text-secondary text-center mt-3">Estamos aquí para ayudarte con cualquier duda o inquietud, las 24 horas del día.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <Icon.ArrowCounterClockwise className="text-[#1f3b3b] lg:h-16 lg:w-16 h-12 w-12" weight="duotone" />
                            <div className="heading6 text-center mt-5">Devolución en 14 días</div>
                            <div className="caption1 text-secondary text-center mt-3">Si no estás satisfecho con tu compra, devuélvela en 14 días para un reembolso.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <Icon.SealCheck className="text-[#1f3b3b] lg:h-16 lg:w-16 h-12 w-12" weight="duotone" />
                            <div className="heading6 text-center mt-5">Nuestra garantía</div>
                            <div className="caption1 text-secondary text-center mt-3">Respaldamos nuestros productos y servicios y garantizamos tu satisfacción.</div>
                        </div>
                        <div className="benefit-item flex flex-col items-center justify-center">
                            <Icon.Truck className="text-[#1f3b3b] lg:h-16 lg:w-16 h-12 w-12" weight="duotone" />
                            <div className="heading6 text-center mt-5">Envíos a todo el mundo</div>
                            <div className="caption1 text-secondary text-center mt-3">Enviamos nuestros productos a nivel mundial, haciéndolos accesibles en cualquier lugar.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Benefit
