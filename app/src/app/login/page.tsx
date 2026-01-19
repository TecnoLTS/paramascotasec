'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuPet'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { login } from '@/lib/api/auth'

const Login = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    React.useEffect(() => {
        const query = new URLSearchParams(window.location.search)
        if (query.get('registered') === 'true') {
            setSuccess('¡Cuenta creada exitosamente! Por favor, inicia sesión.')
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const res = await login({ email, password })
            localStorage.setItem('authToken', res.token)
            localStorage.setItem('user', JSON.stringify(res.user))
            router.push('/my-account')
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="Nuevos clientes ahorran 10% con el código GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Iniciar Sesión' subHeading='Iniciar Sesión' />
            </div>
            <div className="login-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Inicia Sesión</div>
                            {success && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}
                            {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                            <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                                <div className="email ">
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
                                <div className="pass mt-5">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        id="password"
                                        type="password"
                                        placeholder="Contraseña *"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-5">
                                    <div className='flex items-center'>
                                        <div className="block-input">
                                            <input
                                                type="checkbox"
                                                name='remember'
                                                id='remember'
                                            />
                                            <Icon.CheckSquare size={20} weight='fill' className='icon-checkbox' />
                                        </div>
                                        <label htmlFor='remember' className="pl-2 cursor-pointer">Recuérdame</label>
                                    </div>
                                    <Link href={'/forgot-password'} className='font-semibold hover:underline'>¿Olvidaste tu contraseña?</Link>
                                </div>
                                <div className="block-button md:mt-7 mt-4">
                                    <button className="button-main" disabled={loading}>
                                        {loading ? 'Cargando...' : 'Ingresar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">Nuevo Cliente</div>
                                <div className="mt-2 text-secondary">¡Sé parte de nuestra familia! Únete hoy y desbloquea un mundo de beneficios exclusivos, ofertas y experiencias personalizadas.</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/register'} className="button-main">Regístrate</Link>
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

export default Login
