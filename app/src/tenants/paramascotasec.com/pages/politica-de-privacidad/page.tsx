'use client'

import React, { useState, useEffect } from 'react'
import Image from '@/components/Common/AppImage'
import {
    ShieldCheck,
    Scroll,
    UserCircle,
    Lock,
    Bell,
    CheckSquare,
    IdentificationBadge
} from "@phosphor-icons/react/dist/ssr";

import MenuPet from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'

const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState('intro');

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

    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            setTimeout(() => {
                performSmoothScroll(id);
            }, 600);
        }
    }, []);

    const menuItems = [
        { id: 'intro', label: 'Introducción', icon: ShieldCheck },
        { id: 'info', label: '1. Información recopilada', icon: Scroll },
        { id: 'uso', label: '2. Uso de la información', icon: IdentificationBadge },
        { id: 'derechos', label: '3. Derechos del cliente', icon: UserCircle },
        { id: 'seguridad', label: '4. Seguridad', icon: Lock },
        { id: 'cambios', label: '5. Cambios en la política', icon: Bell },
        { id: 'aceptacion', label: '6. Aceptación', icon: CheckSquare },
    ];

    return (
        <>
            <div id="header" className='sticky top-0 z-50 bg-white w-full style-pet shadow-sm transition-all duration-300'>
                <MenuPet />
            </div>

            <main className='bg-[#F8F8F8] min-h-screen'>
                <section className="relative h-[300px] md:h-[500px] flex items-center justify-center overflow-hidden">
                    <Image
                        src={'/images/banner/33.jpg'}
                        fill
                        priority
                        alt='Política de Privacidad'
                        className='object-cover brightness-[0.6]'
                    />
                    <div className="container relative z-10 text-center">
                        <h1 className="heading2 text-white font-bold mb-2">Política de privacidad</h1>
                        <p className="body1 text-white/90 text-lg">Para Mascotas EC</p>
                    </div>
                </section>

                <div className="container py-16 md:py-24">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <aside className="lg:w-1/4">
                            <div
                                className="sticky bg-white p-6 rounded-[20px] shadow-lg border border-gray-100 transition-all duration-300"
                                style={{ top: '200px' }}
                            >
                                <h3 className="heading5 font-bold mb-6 text-black">
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
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        <div className="lg:w-3/4">
                            <div className="bg-white p-8 md:p-12 rounded-[30px] shadow-sm border border-gray-100 space-y-10 text-[15px] md:text-base text-secondary [&>section]:scroll-mt-[320px]">
                                <section id="intro" className="border-b border-gray-100 pb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">Tu privacidad protegida</h2>
                                    <p className="leading-relaxed">
                                        En Para Mascotas EC, la transparencia es fundamental. Aquí te explicamos cómo protegemos tus datos y para qué utilizamos la información personal que nos compartes.
                                    </p>
                                </section>

                                <section id="info">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-blue-50 p-2 rounded-lg"><Scroll size={24} className="text-blue-600" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">1. Información recopilada</h3>
                                    </div>
                                    <p className="mb-4">Recopilamos únicamente la información necesaria para:</p>
                                    <ul className="list-disc list-outside ml-4 space-y-2 marker:text-blue-400">
                                        <li>Procesar pedidos.</li>
                                        <li>Realizar entregas.</li>
                                        <li>Emitir facturación.</li>
                                        <li>Brindar atención al cliente.</li>
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-4">Datos incluidos: nombre, correo electrónico, número de contacto y dirección de entrega.</p>
                                </section>

                                <section id="uso">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-orange-50 p-2 rounded-lg"><IdentificationBadge size={24} className="text-orange-600" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">2. Uso de la información</h3>
                                    </div>
                                    <p>La información personal será utilizada exclusivamente para los fines operativos y comerciales mencionados.</p>
                                    <div className="mt-4 rounded-lg bg-orange-50/50 p-4 text-sm text-gray-800 font-medium">
                                        No vendemos ni compartimos datos personales con terceros, salvo cuando sea necesario para procesos de entrega, facturación o por requerimiento legal.
                                    </div>
                                </section>

                                <section id="derechos">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-green-50 p-2 rounded-lg"><UserCircle size={24} className="text-green-600" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">3. Derechos del cliente</h3>
                                    </div>
                                    <p>El cliente puede solicitar la actualización, corrección o eliminación de sus datos personales a través de nuestros canales oficiales.</p>
                                </section>

                                <section id="seguridad">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-purple-50 p-2 rounded-lg"><Lock size={24} className="text-purple-600" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">4. Seguridad</h3>
                                    </div>
                                    <p>Adoptamos medidas razonables para proteger la información personal y evitar accesos no autorizados.</p>
                                </section>

                                <section id="cambios">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-yellow-50 p-2 rounded-lg"><Bell size={24} className="text-yellow-600" /></div>
                                        <h3 className="text-xl md:text-2xl font-bold text-black">5. Cambios en la política</h3>
                                    </div>
                                    <p>Esta Política de Privacidad podrá ser actualizada en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación.</p>
                                </section>

                                <section id="aceptacion" className="bg-black text-white p-6 rounded-2xl text-center">
                                    <h3 className="text-lg md:text-xl font-bold mb-2">6. Aceptación</h3>
                                    <p className="text-white/80">Al utilizar nuestros servicios o realizar una compra, el cliente acepta esta Política de Privacidad.</p>
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

export default PrivacyPolicy
