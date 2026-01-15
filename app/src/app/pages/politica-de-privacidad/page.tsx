'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
    ShieldCheck, 
    Scroll, 
    UserCircle, 
    Lock, 
    Bell, 
    CheckSquare,
    IdentificationBadge,
    CreditCard
} from "@phosphor-icons/react/dist/ssr";

import MenuPet from '@/components/Header/Menu/MenuPet'
import Footer from '@/components/Footer/Footer'

const getSuffixByWidth = (w: number) => {
    if (w < 768) return 'mobile';
    return '1920'; 
}

const PrivacyPolicy = () => {
    const [suffix, setSuffix] = useState('1920');

    useEffect(() => {
        const updateSuffix = () => {
            setSuffix(getSuffixByWidth(window.innerWidth));
        };
        updateSuffix();
        window.addEventListener('resize', updateSuffix);
        return () => window.removeEventListener('resize', updateSuffix);
    }, []);

    return (
        <>
            <div id="header" className='relative w-full style-pet'>
                <MenuPet />
            </div>

            <main className='bg-[#F3F4F6] min-h-screen'>
                
                {/* --- BANNER INMERSIVO --- */}
                <section className="relative w-full h-[500px] overflow-hidden">
                    <Image
                        src={`/images/banner/33.jpg`}
                        //src={`/images/banner/about-banner-${suffix}.jpg`}
                        fill
                        priority
                        alt='Política de Privacidad'
                        className='object-cover' 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    <div className="container relative h-full flex flex-col justify-center z-10">
                        <div className="max-w-xl text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck size={32} className="text-orange-400" weight="fill" />
                                <span className="text-orange-400 font-bold tracking-wider uppercase text-sm">Legal</span>
                            </div>
                            <h1 className="heading2 text-white font-bold mb-4">Política de Privacidad</h1>
                            <p className="body1 text-white/90 text-lg">
                                En Para Mascotas EC, la transparencia es fundamental. Aquí te explicamos cómo protegemos tus datos.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="container py-16 md:py-24">
                    <div className="flex flex-col lg:flex-row gap-12">
                        
                        {/* --- COLUMNA IZQUIERDA (Visual & Sticky) --- */}
                        <aside className="lg:w-1/3 order-1">
                            <div className="sticky top-32 space-y-8">
                                {/* Tarjeta de Resumen */}
                                <div className="bg-white p-8 rounded-[30px] shadow-lg border border-gray-100">
                                    <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6">
                                         <Image 
                                            src={`/images/banner/34.jpg`}
                                            //src={`/images/banner/about-1-${suffix}.jpg`}
                                            fill
                                            alt="Privacidad"
                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <h3 className="heading4 font-bold mb-3">Tu privacidad, protegida.</h3>
                                    <p className="body2 text-secondary leading-relaxed">
                                        Para Mascotas EC respeta la privacidad de sus clientes y protege la información personal conforme a la legislación ecuatoriana vigente.
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* --- COLUMNA DERECHA (Contenido en Grid) --- */}
                        <div className="lg:w-2/3 order-2">
                            <div className="grid grid-cols-1 gap-6">

                                {/* 1. Información Recopilada */}
                                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                                            <Scroll size={28} weight="duotone" />
                                        </div>
                                        <div className="w-full">
                                            <h3 className="heading5 font-bold mb-4">1. Información recopilada</h3>
                                            <p className="body2 text-gray-600 mb-4">Recopilamos únicamente la información necesaria para:</p>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                                {['Procesar pedidos', 'Realizar entregas', 'Emitir facturación', 'Brindar atención al cliente'].map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Datos incluidos:</p>
                                            <p className="text-sm text-gray-600">Nombre, correo electrónico, número de contacto y dirección de entrega.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Uso de la Información */}
                                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                                            <IdentificationBadge size={28} weight="duotone" />
                                        </div>
                                        <div>
                                            <h3 className="heading5 font-bold mb-3">2. Uso de la información</h3>
                                            <p className="body2 text-secondary mb-4">
                                                La información personal será utilizada exclusivamente para los fines operativos y comerciales mencionados.
                                            </p>
                                            <div className="bg-orange-50/50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                                                <p className="text-sm text-gray-800 font-medium">
                                                    No vendemos ni compartimos datos personales con terceros, salvo cuando sea necesario para procesos de entrega, facturación o por requerimiento legal.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Grid para puntos más cortos (3 y 4) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 3. Derechos */}
                                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                                        <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center text-green-600 mb-4">
                                            <UserCircle size={24} weight="fill" />
                                        </div>
                                        <h3 className="heading5 font-bold mb-2">3. Derechos del cliente</h3>
                                        <p className="text-sm text-secondary leading-relaxed">
                                            El cliente puede solicitar la actualización, corrección o eliminación de sus datos personales a través de nuestros canales oficiales.
                                        </p>
                                    </div>

                                    {/* 4. Seguridad */}
                                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                                        <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center text-purple-600 mb-4">
                                            <Lock size={24} weight="fill" />
                                        </div>
                                        <h3 className="heading5 font-bold mb-2">4. Seguridad</h3>
                                        <p className="text-sm text-secondary leading-relaxed">
                                            Adoptamos medidas razonables para proteger la información personal y evitar accesos no autorizados.
                                        </p>
                                    </div>
                                </div>

                                {/* 5. Cambios */}
                                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="shrink-0 bg-yellow-50 p-3 rounded-full text-yellow-600">
                                        <Bell size={24} weight="fill" />
                                    </div>
                                    <div>
                                        <h3 className="heading5 font-bold">5. Cambios en la política</h3>
                                        <p className="text-sm text-secondary mt-1">
                                            Esta Política de Privacidad podrá ser actualizada en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación.
                                        </p>
                                    </div>
                                </div>

                                {/* 6. Aceptación (Dark Mode Visual) */}
                                <div className="bg-[#1A1A1A] text-white p-8 rounded-[24px] shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <CheckSquare size={120} weight="fill" />
                                    </div>
                                    <div className="relative z-10 flex gap-4">
                                        <div className="mt-1 shrink-0">
                                            <CheckSquare size={32} className="text-green-400" weight="fill" />
                                        </div>
                                        <div>
                                            <h3 className="heading4 font-bold mb-2 text-white">6. Aceptación</h3>
                                            <p className="text-white/80 leading-relaxed">
                                                Al utilizar nuestros servicios o realizar una compra, el cliente acepta esta Política de Privacidad.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default PrivacyPolicy