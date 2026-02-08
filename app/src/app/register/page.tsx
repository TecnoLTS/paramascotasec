'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { register } from '@/lib/api/auth'

const Register = () => {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [documentType, setDocumentType] = useState('')
    const [documentNumber, setDocumentNumber] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 12) {
            setError('La contraseña debe tener al menos 12 caracteres')
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }
        if (!documentType || !documentNumber) {
            setError('Ingresa el tipo y número de identificación')
            return
        }

        setLoading(true)

        try {
            await register({ name, email, password, documentType, documentNumber, businessName })
            // Redirigir al login tras registro exitoso
            router.push('/login?registered=true')
        } catch (err: any) {
            setError(err.message || 'Error al registrarse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="Nuevos clientes ahorran 10% con el código GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Crear una cuenta' subHeading='Crear una cuenta' />
            </div>
            <div className="register-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Registrarse</div>
                            {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                            <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                                <div className="name">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        id="name"
                                        type="text"
                                        placeholder="Nombre completo *"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="email mt-5">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        id="username"
                                        type="email"
                                        placeholder="Correo electrónico *"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="document-type mt-5">
                                    <div className="select-block">
                                        <select
                                            className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                            id="documentType"
                                            value={documentType || 'default'}
                                            onChange={(e) => setDocumentType(e.target.value)}
                                            required
                                        >
                                            <option value="default" disabled>Tipo de identificación *</option>
                                            <option value="Cédula">Cédula</option>
                                            <option value="RUC">RUC</option>
                                            <option value="Pasaporte">Pasaporte</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="document-number mt-5">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        id="documentNumber"
                                        type="text"
                                        placeholder="Número de identificación *"
                                        required
                                        value={documentNumber}
                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                    />
                                </div>
                                <div className="business-name mt-5">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        id="businessName"
                                        type="text"
                                        placeholder="Razón social (opcional)"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                    />
                                </div>
                                <div className="pass mt-5">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        id="password"
                                        type="password"
                                        placeholder="Contraseña *"
                                        minLength={12}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="confirm-pass mt-5">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirmar contraseña *"
                                        minLength={12}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <div className='flex items-center mt-5'>
                                    <div className="block-input">
                                        <input
                                            type="checkbox"
                                            name='remember'
                                            id='remember'
                                            required
                                        />
                                        <Icon.CheckSquare size={20} weight='fill' className='icon-checkbox' />
                                    </div>
                                    <label htmlFor='remember' className="pl-2 cursor-pointer text-secondary2">Acepto los
                                        <Link href={'/pages/terminos-y-condiciones'} className='text-black hover:underline pl-1'>Términos y Condiciones</Link>
                                    </label>
                                </div>
                                <div className="block-button md:mt-7 mt-4">
                                    <button className="button-main" disabled={loading}>
                                        {loading ? 'Cargando...' : 'Registrarse'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">¿Ya tienes una cuenta?</div>
                                <div className="mt-2 text-secondary">Bienvenido de nuevo. Inicia sesión para acceder a tu experiencia personalizada, preferencias guardadas y más. ¡Estamos encantados de tenerte con nosotros de nuevo!</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/login'} className="button-main">Iniciar Sesión</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Register
