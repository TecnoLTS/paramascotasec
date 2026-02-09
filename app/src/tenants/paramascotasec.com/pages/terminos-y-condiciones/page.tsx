'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    Truck,
    ArrowsLeftRight,
    Bank,
    ShieldCheck,
    Info,
    CaretRight,
    Tag,
    Gavel,
    HandCoins,
    Desktop
} from "@phosphor-icons/react/dist/ssr";

// --- IMPORTS DE ESTRUCTURA ---
import MenuPet from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'
// -----------------------------

const TermsConditions = () => {
    const [activeSection, setActiveSection] = useState('intro');

    // --- CONFIGURACIÓN DEL SCROLL ---
    // Mantenemos 320px que fue lo que funcionó para tu header alto
    const OFFSET_HEADER = 320; 

    const performSmoothScroll = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yCoordinate = element.getBoundingClientRect().top + window.scrollY;
            const y = yCoordinate - OFFSET_HEADER;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    // 1. EFECTO PARA CORREGIR EL SALTO INICIAL
    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            setTimeout(() => {
                performSmoothScroll(id);
            }, 600);
        }
    }, []);

    const menuItems = [
        { id: 'intro', label: 'Introducción', icon: Info },
        { id: 'uso', label: '1. Uso del sitio', icon: Desktop },
        { id: 'precios', label: '2. Precios y disponibilidad', icon: Tag },
        { id: 'pagos', label: '3. Pedidos y pagos', icon: Bank },
        { id: 'envios', label: '4. Envíos y entregas', icon: Truck },
        { id: 'cambios', label: '5. Cambios y devoluciones', icon: ArrowsLeftRight },
        { id: 'reembolsos', label: '6. Reembolsos', icon: HandCoins },
        { id: 'garantia', label: '7. Garantía', icon: ShieldCheck },
        { id: 'legal', label: '8-10. Legal y aceptación', icon: Gavel },
    ];

    return (
        <>
            {/* Header Sticky */}
            <div id="header" className='sticky top-0 z-50 bg-white w-full style-pet shadow-sm transition-all duration-300'>
                <MenuPet />
            </div>

            <main className='bg-[#F8F8F8] min-h-screen'>

                {/* --- BANNER HEADER --- */}
                <section className="relative h-[300px] md:h-[500px] flex items-center justify-center overflow-hidden">
                    <Image
                        src={'/images/banner/32.jpg'}
                        fill
                        priority
                        alt='Términos y Condiciones Para Mascotas EC'
                        className='object-cover brightness-[0.6]'
                    />
                    <div className="container relative z-10 text-center">
                        <h1 className="heading2 text-white font-bold mb-2">Términos y condiciones</h1>
                        <p className="body1 text-white/90 text-lg">Para Mascotas EC</p>
                    </div>
                </section>

                {/* --- CONTENIDO PRINCIPAL --- */}
                <div className="container py-16 md:py-24">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* --- BARRA LATERAL --- */}
                        <aside className="lg:w-1/4">
                            <div 
                                className="sticky bg-white p-6 rounded-[20px] shadow-lg border border-gray-100 transition-all duration-300"
                                style={{ top: '200px' }} 
                            >
                                <h3 className="heading5 font-bold mb-6 text-black pl-2 border-l-4 border-orange-500">
                                    Tabla de contenidos
                                </h3>
                                <nav className="space-y-1">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => performSmoothScroll(item.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left group ${activeSection === item.id
                                                ? 'bg-black text-white shadow-md'
                                                : 'hover:bg-gray-50 text-secondary'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={20} weight={activeSection === item.id ? "fill" : "regular"} className={activeSection !== item.id ? "text-orange-500" : ""} />
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </div>
                                            {activeSection === item.id && <CaretRight size={16} />}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* --- TEXTO LEGAL --- */}
                        <div className="lg:w-3/4">
                            <div className="bg-white p-8 md:p-12 rounded-[30px] shadow-sm border border-gray-100 space-y-10 text-[15px] md:text-base text-secondary [&>section]:scroll-mt-[320px]">

                                {/* Introducción */}
                                <section id="intro" className="border-b border-gray-100 pb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">Bienvenido a Para Mascotas EC</h2>
                                    <p className="leading-relaxed">
                                        El presente documento establece los términos y condiciones aplicables al uso del sitio web, así como a las compras y pedidos realizados en Para Mascotas EC, ya sea en tienda física o a través de canales digitales. Al navegar por el sitio, confirmar un pedido o concretar una compra, el cliente declara haber leído, comprendido y aceptado estos Términos y Condiciones.
                                    </p>
                                </section>

                                {/* 1. Uso del sitio */}
                                <section id="uso">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gray-100 p-2 rounded-lg"><Desktop size={24} className="text-gray-700" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">1. Uso del sitio y alcance</h3>
                                    </div>
                                    <div className="space-y-3 pl-2 md:pl-12">
                                        <p>El sitio web tiene como finalidad informar y permitir la realización de pedidos de productos para el cuidado, bienestar y alimentación de mascotas.</p>
                                        <ul className="list-disc list-outside ml-4 space-y-2 marker:text-orange-400">
                                            <li>Los servicios están disponibles únicamente para personas con capacidad legal para contratar.</li>
                                            <li>Para Mascotas EC se reserva el derecho de modificar, actualizar o suspender el contenido sin previo aviso.</li>
                                        </ul>
                                    </div>
                                </section>

                                {/* 2. Precios */}
                                <section id="precios">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gray-100 p-2 rounded-lg"><Tag size={24} className="text-gray-700" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">2. Precios y disponibilidad</h3>
                                    </div>
                                    <div className="space-y-3 pl-2 md:pl-12">
                                        <p>Todos los precios se expresan en <strong>dólares estadounidenses (USD)</strong> e incluyen los impuestos aplicables, salvo que se indique lo contrario.</p>
                                        <p>La disponibilidad de los productos está sujeta a stock. En caso de no contar con un producto solicitado, se informará al cliente para coordinar un cambio o la cancelación del pedido.</p>
                                    </div>
                                </section>

                                {/* 3. Pedidos y Pagos */}
                                <section id="pagos" className="bg-orange-50/50 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-orange-100 p-2 rounded-lg"><Bank size={24} className="text-orange-600" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">3. Pedidos y formas de pago</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <p>Los pedidos pueden realizarse a través del sitio web, redes sociales o canales de contacto oficiales.</p>
                                        
                                        <div>
                                            <p className="font-semibold mb-2">Actualmente, los pagos se realizan mediante:</p>
                                            <div className="flex gap-3 flex-wrap">
                                                <span className="px-4 py-2 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-800 shadow-sm">Transferencia Bancaria</span>
                                                <span className="px-4 py-2 bg-white border border-orange-200 rounded-lg text-sm font-bold text-orange-800 shadow-sm">Efectivo (Coordinado)</span>
                                            </div>
                                        </div>

                                        <p>El pedido se considerará confirmado una vez validado el pago correspondiente.</p>
                                        
                                        <p className="text-xs italic text-gray-500 mt-2">
                                            Nota: Para Mascotas EC no se hace responsable por pagos realizados a cuentas no oficiales o fuera de los canales autorizados.
                                        </p>
                                    </div>
                                </section>

                                {/* 4. Envíos */}
                                <section id="envios">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gray-100 p-2 rounded-lg"><Truck size={24} className="text-gray-700" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">4. Envíos y entregas</h3>
                                    </div>
                                    <div className="space-y-3 pl-2 md:pl-12">
                                        <p>Realizamos envíos a las zonas habilitadas. El costo, modalidad y tiempo estimado de entrega serán informados antes de confirmar el pedido.</p>
                                        <ul className="list-disc list-outside ml-4 space-y-2 marker:text-gray-400">
                                            <li>Los pedidos se procesan en días laborables.</li>
                                            <li>Los tiempos de entrega pueden variar según ubicación, disponibilidad del producto y condiciones externas.</li>
                                            <li><strong>Opción de Retiro:</strong> También podrá existir la opción de retiro en tienda sin costo, previa coordinación.</li>
                                        </ul>
                                    </div>
                                </section>

                                {/* 5. Cambios */}
                                <section id="cambios">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gray-100 p-2 rounded-lg"><ArrowsLeftRight size={24} className="text-gray-700" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">5. Cambios y devoluciones</h3>
                                    </div>
                                    <div className="pl-2 md:pl-12 space-y-6">
                                        
                                        {/* Condiciones */}
                                        <div>
                                            <p className="mb-3 font-medium text-black">Se aceptan cambios o devoluciones dentro de los <strong>5 días hábiles</strong> posteriores a la entrega, siempre que el producto:</p>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {['No haya sido usado', 'Se encuentre en perfecto estado', 'Conserve su empaque original y etiquetas', 'Sea aprobado tras revisión'].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm bg-green-50 text-green-800 px-3 py-2 rounded-lg">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Excepciones */}
                                        <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                                            <p className="font-bold text-red-700 mb-2">Por razones de higiene y seguridad, NO se aceptan cambios ni devoluciones de:</p>
                                            <ul className="list-disc list-inside text-red-600/80 space-y-1 ml-2">
                                                <li>Alimentos para mascotas.</li>
                                                <li>Medicamentos.</li>
                                                <li>Productos de higiene, cuidado o consumo.</li>
                                            </ul>
                                            <p className="text-xs mt-3 text-red-500 font-medium">*Salvo que presenten defectos de fabricación comprobables.</p>
                                        </div>

                                        <p className="border-l-4 border-gray-300 pl-3 py-1">
                                            Los reclamos por productos defectuosos o errores en el pedido deberán realizarse dentro de las <strong>48 horas posteriores a la recepción</strong>, adjuntando evidencia.
                                        </p>
                                    </div>
                                </section>

                                {/* 6. Reembolsos */}
                                <section id="reembolsos">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gray-100 p-2 rounded-lg"><HandCoins size={24} className="text-gray-700" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">6. Reembolsos</h3>
                                    </div>
                                    <div className="space-y-3 pl-2 md:pl-12">
                                        <p>No se realizan devoluciones de dinero de forma general.</p>
                                        <ul className="list-disc list-outside ml-4 space-y-2 marker:text-gray-400">
                                            <li>Las devoluciones aprobadas se gestionarán mediante <strong>cambio de producto de igual valor</strong> o <strong>crédito en tienda</strong>.</li>
                                            <li>El reembolso en dinero aplicará únicamente cuando el error sea atribuible a Para Mascotas EC (producto incorrecto, defectuoso o indisponibilidad confirmada) o cuando así lo establezca la Ley de Defensa del Consumidor.</li>
                                        </ul>
                                        <p className="mt-2 text-gray-500">Los costos de envío no son reembolsables, salvo error imputable a la tienda.</p>
                                    </div>
                                </section>

                                {/* 7. Garantía */}
                                <section id="garantia">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gray-100 p-2 rounded-lg"><ShieldCheck size={24} className="text-gray-700" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">7. Garantía de productos</h3>
                                    </div>
                                    <div className="space-y-3 pl-2 md:pl-12">
                                        <p>La garantía aplica desde la fecha de facturación y cubre exclusivamente defectos de fabricación. <strong>Para hacerla válida es indispensable presentar la factura original.</strong></p>
                                        <p>El producto no debe presentar signos de mal uso, golpes, humedad, manipulación indebida ni desgaste normal.</p>
                                        <p className="text-sm bg-blue-50 text-blue-800 p-3 rounded-lg">
                                            La evaluación del producto podrá ser realizada por Para Mascotas EC o por el proveedor o fabricante, según corresponda. La garantía no implica devolución de dinero automática.
                                        </p>
                                    </div>
                                </section>

                                <hr className="border-gray-200" />

                                {/* 8-10. Legal */}
                                <section id="legal" className="space-y-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-gray-100 p-2 rounded-lg"><Gavel size={24} className="text-gray-700" /></div>
                                        <h3 className="text-lg md:text-xl font-bold text-black">8. Modificaciones</h3>
                                        </div>
                                        <p className="pl-12">Para Mascotas EC se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación.</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-black mb-2 pl-12">9. Jurisdicción</h3>
                                        <p className="pl-12">Estos Términos y Condiciones se rigen por la legislación vigente de la <strong>República del Ecuador</strong>. Cualquier controversia será resuelta ante las autoridades competentes del territorio ecuatoriano.</p>
                                    </div>
                                    <div className="bg-black text-white p-6 rounded-2xl text-center">
                                        <h3 className="text-lg md:text-xl font-bold mb-2">10. Aceptación</h3>
                                        <p className="text-white/80">Al confirmar un pedido o realizar una compra por cualquiera de nuestros canales, el cliente declara conocer y aceptar los presentes Términos y Condiciones.</p>
                                    </div>
                                </section>

                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </>
    )
}

export default TermsConditions
