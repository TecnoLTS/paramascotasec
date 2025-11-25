'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname } from 'next/navigation';
import Product from '@/components/Product/Product';
import productData from '@/data/Product.json'
import useLoginPopup from '@/store/useLoginPopup';
import useShopDepartmentPopup from '@/store/useShopDepartmentPopup';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useModalSearchContext } from '@/context/ModalSearchContext';
import { useCart } from '@/context/CartContext';

const MenuPet = () => {
    const pathname = usePathname()
    const { openLoginPopup, handleLoginPopup } = useLoginPopup()
    const { openShopDepartmentPopup, handleShopDepartmentPopup } = useShopDepartmentPopup()
    const { openMenuMobile, handleMenuMobile } = useMenuMobile()
    const [openSubNavMobile, setOpenSubNavMobile] = useState<number | null>(null)
    const { openModalCart } = useModalCartContext()
    const { cartState } = useCart()
    const { openModalWishlist } = useModalWishlistContext()
    const { openModalSearch } = useModalSearchContext()

    const [searchKeyword, setSearchKeyword] = useState('');
    const router = useRouter()

    const handleSearch = (value: string) => {
        router.push(`/search-result?query=${value}`)
        setSearchKeyword('')
    }

    const handleOpenSubNavMobile = (index: number) => {
        setOpenSubNavMobile(openSubNavMobile === index ? null : index)
    }

    const [fixedHeader, setFixedHeader] = useState(false)
    const lastScrollPosition = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const shouldFix = scrollPosition > 0 && scrollPosition < lastScrollPosition.current;
            setFixedHeader(shouldFix);
            lastScrollPosition.current = scrollPosition;
        };

        // Gắn sự kiện cuộn khi component được mount
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Hủy sự kiện khi component bị unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleGenderClick = (gender: string) => {
        router.push(`/shop/breadcrumb1?gender=${gender}`);
    };

    const handleCategoryClick = (category: string) => {
        router.push(`/shop/breadcrumb1?category=${category}`);
    };

    const handleTypeClick = (type: string) => {
        router.push(`/shop/breadcrumb1?type=${type}`);
    };

    return (
        <>
            <div className={`header-menu style-eight ${fixedHeader ? ' fixed' : 'relative'} bg-surface w-full md:h-[90px] h-[64px]`}>
                <div className="container mx-auto h-full">
                    <div className="header-main flex items-center justify-between h-full">
                        <div className="menu-mobile-icon lg:hidden flex items-center" onClick={handleMenuMobile}>
                            <i className="icon-category text-2xl"></i>
                        </div>
                        <Link href={'/'} className='flex items-center'>
                            <div className="heading4">Anvogue</div>
                        </Link>
                        <div className="form-search w-[54%] pl-8 flex items-center h-[48px] max-lg:hidden">
                            <div className='w-full flex items-center h-full border border-[#2f4f4f] shadow-sm overflow-hidden'>
                                <input
                                    type="text"
                                    className="search-input h-full px-4 w-full border-none focus:outline-none focus:ring-2 focus:ring-[#2f4f4f]/60 placeholder:text-secondary"
                                    placeholder="¿Qué estás buscando hoy?"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                                />
                                <button
                                    className="search-button h-full px-4 flex items-center justify-center bg-[#2f4f4f] text-white duration-300 hover:bg-[#1f3b3b]"
                                    onClick={() => {
                                        handleSearch(searchKeyword)
                                    }}
                                >
                                    <Icon.MagnifyingGlass size={22} weight='bold' className='duration-300' />
                                </button>
                            </div>
                        </div>
                        <div className="right flex gap-12">
                            <div className="list-action flex items-center gap-6">
                                <div className="user-icon flex items-center flex-col justify-center cursor-pointer">
                                    <Icon.User size={26} color='black' onClick={handleLoginPopup} />
                                    <div className="caption1" onClick={handleLoginPopup}>Mi cuenta</div>
                                    <div
                                        className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm 
                                            ${openLoginPopup ? 'open' : ''}`}
                                    >
                                        <Link href={'/login'} className="button-main w-full text-center">Iniciar sesión</Link>
                                        <div className="text-secondary text-center mt-3 pb-4">¿No tienes una cuenta?
                                            <Link href={'/register'} className='text-black pl-1 hover:underline'>Regístrate</Link>
                                        </div>
                                        <Link href={'/my-account'} className="button-main bg-white text-black border border-black w-full text-center">Panel</Link>
                                        <div className="bottom mt-4 pt-4 border-t border-line"></div>
                                        <Link href={'#!'} className='body1 hover:underline'>Soporte</Link>
                                    </div>
                                </div>
                                <div className="cart-icon flex flex-col items-center relative cursor-pointer" onClick={openModalCart}>
                                    <Icon.ShoppingCartSimple size={26} color='black' />
                                    <div className="caption1">Carrito</div>
                                    <span className="quantity cart-quantity absolute -right-3 -top-3 text-base text-[#2f4f4f] font-semibold">
                                        {cartState.cartArray.reduce((sum, item) => sum + (item.quantity ?? 0), 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="top-nav-menu relative bg-white h-[44px] max-lg:hidden z-10">
                <div className="container h-full">
                    <div className="top-nav-menu-main flex items-center justify-between h-full">
                        <div className="left flex items-center h-full">
                            <div className="menu-department-block relative h-full">
                                
                                <div
                                    className={`sub-menu-department absolute top-[44px] left-0 right-0 h-max bg-white rounded-b-2xl ${openShopDepartmentPopup ? 'open' : ''}`}
                                >
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 border-b border-line whitespace-nowrap block'>Comida para perros</Link>
                                    </div>
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 border-b border-line whitespace-nowrap block'>Ropa para perros</Link>
                                    </div>
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 border-b border-line whitespace-nowrap block'>Juguetes para perros</Link>
                                    </div>
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 border-b border-line whitespace-nowrap block'>Accesorios para perros</Link>
                                    </div>
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 border-b border-line whitespace-nowrap block'>Comida para gatos</Link>
                                    </div>
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 border-b border-line whitespace-nowrap block'>Ropa para gatos</Link>
                                    </div>
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 border-b border-line whitespace-nowrap block'>Juguetes para gatos</Link>
                                    </div>
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 border-b border-line whitespace-nowrap block'>Accesorios para gatos</Link>
                                    </div>
                                    <div className="item block">
                                        <Link href={'/shop/breadcrumb-img'} className='caption1 py-4 px-5 whitespace-nowrap block'>Servicios para mascotas</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="menu-main style-eight h-full pl-12 max-lg:hidden">
                                <ul className='flex items-center gap-8 h-full'>
                                    <li className='h-full relative'>
                                        <Link
                                            href="/"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center gap-1 
                                            ${pathname.includes('/homepages/') ? 'active' : ''}`}
                                        >
                                            Inicio
                                        </Link>
                                        {/*
                                        <div className="sub-menu absolute py-3 px-5 -left-10 w-max grid grid-cols-4 gap-5 bg-white rounded-b-xl">
                                            <ul>
                                                <li>
                                                    <Link href="/" className='text-secondary duration-300'>
                                                        Inicio Moda 1
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="/homepages/fashion2"
                                                        className={`text-secondary duration-300 ${pathname === '/homepages/fashion2' ? 'active' : ''}`}
                                                    >
                                                        Inicio Moda 2
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="/homepages/fashion3"
                                                        className={`text-secondary duration-300 ${pathname === '/homepages/fashion3' ? 'active' : ''}`}
                                                    >
                                                        Inicio Moda 3
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/fashion4" className='text-secondary duration-300'>
                                                        Inicio Moda 4
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/fashion5" className='text-secondary duration-300'>
                                                        Inicio Moda 5
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/fashion6" className='text-secondary duration-300'>
                                                        Inicio Moda 6
                                                    </Link>
                                                </li>
                                            </ul>
                                            <ul>
                                                <li>
                                                    <Link
                                                        href="/homepages/fashion7"
                                                        className={`text-secondary duration-300 ${pathname === '/homepages/fashion7' ? 'active' : ''}`}
                                                    >
                                                        Inicio Moda 7
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/fashion8" className={`text-secondary duration-300 ${pathname === '/homepages/fashion8' ? 'active' : ''}`}>
                                                        Inicio Moda 8
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/fashion9" className={`text-secondary duration-300 ${pathname === '/homepages/fashion9' ? 'active' : ''}`}>
                                                        Inicio Moda 9
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/fashion10" className={`text-secondary duration-300 ${pathname === '/homepages/fashion10' ? 'active' : ''}`}>
                                                        Inicio Moda 10
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/fashion11" className={`text-secondary duration-300 ${pathname === '/homepages/fashion11' ? 'active' : ''}`}>
                                                        Inicio Moda 11
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/underwear" className='text-secondary duration-300'>
                                                        Inicio Ropa interior
                                                    </Link>
                                                </li>
                                            </ul>
                                            <ul>
                                                <li>
                                                    <Link href="/homepages/cosmetic1" className='text-secondary duration-300'>
                                                        Inicio Cosmética 1
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/cosmetic2" className='text-secondary duration-300'>
                                                        Inicio Cosmética 2
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/cosmetic3" className={`text-secondary duration-300 ${pathname === '/homepages/cosmetic3' ? 'active' : ''}`}>
                                                        Inicio Cosmética 3
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/pet" className='text-secondary duration-300 active'>
                                                        Inicio Mascotas
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/jewelry" className='text-secondary duration-300'>
                                                        Inicio Joyería
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/furniture" className='text-secondary duration-300'>
                                                        Inicio Muebles
                                                    </Link>
                                                </li>
                                            </ul>
                                            <ul>
                                                <li>
                                                    <Link href="/homepages/watch" className='text-secondary duration-300'>
                                                        Inicio Relojes
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/toys" className='text-secondary duration-300'>
                                                        Inicio Juguetes
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href="/homepages/yoga"
                                                        className={`text-secondary duration-300 ${pathname === '/homepages/yoga' ? 'active' : ''}`}>
                                                        Inicio Yoga
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/organic" className={`text-secondary duration-300 ${pathname === '/homepages/organic' ? 'active' : ''}`}>
                                                        Inicio Orgánico
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/homepages/marketplace" className='text-secondary duration-300'>
                                                        Inicio Marketplace
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                        */}
                                    </li>
                                    <li className='h-full'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Características
                                        </Link>
                                        <div className="mega-menu absolute top-[44px] left-0 bg-white w-screen">
                                            <div className="container">
                                                <div className="flex justify-between py-8">
                                                    <div className="nav-link basis-2/3 grid grid-cols-4 gap-y-8">
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Ofertas y descuentos</div>
                                                            <ul>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleCategoryClick('pet')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Desde 50% de descuento
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('bed')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Cama para mascotas
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('pet')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Ofertas para mascotas
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('food')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Comida para mascotas
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleCategoryClick('pet')}
                                                                        className={`link text-secondary duration-300 cursor-pointer view-all-btn`}
                                                                    >
                                                                        Ver todo
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Perros</div>
                                                            <ul>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('food')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Comida para perros
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('outfit')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Ropa para perros
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('bed')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Cama para perros
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('pet')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Ofertas para perros
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleCategoryClick('pet')}
                                                                        className={`link text-secondary duration-300 view-all-btn`}
                                                                    >
                                                                        Ver todo
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Gatos</div>
                                                            <ul>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('ring')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Anillo para gatos
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('food')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Comida para gatos
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('bed')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Cama para gatos
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('pet')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Ofertas para gatos
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                    onClick={() => handleCategoryClick('pet')}
                                                                        className={`link text-secondary duration-300 view-all-btn`}
                                                                    >
                                                                        Ver todo
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Producto nuevo</div>
                                                            <ul>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('pet')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Ofertas para mascotas
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('bed')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Cama para mascotas
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('food')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Comida para mascotas
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleTypeClick('outfit')}
                                                                        className={`link text-secondary duration-300 cursor-pointer`}
                                                                    >
                                                                        Ropa para mascotas
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div
                                                                        onClick={() => handleCategoryClick('cosmetic')}
                                                                        className={`link text-secondary duration-300 view-all-btn`}
                                                                    >
                                                                        Ver todo
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="banner-ads-block pl-2.5 basis-1/3">
                                                        <div className="banner-ads-item bg-linear rounded-2xl relative overflow-hidden cursor-pointer" onClick={() => handleCategoryClick('pet')}>
                                                            <div className="text-content py-14 pl-8 relative z-[1]">
                                                                <div className="text-button-uppercase text-white bg-red px-2 py-0.5 inline-block rounded-sm">Ahorra $10</div>
                                                                <div className="heading6 mt-2">20% de descuento <br />Colección para mascotas</div>
                                                                <div className="body1 mt-3 text-secondary">
                                                                    Desde <span className='text-red'>$59.99</span>
                                                                </div>
                                                                <div className="button-main mt-5">Comprar ahora</div>
                                                            </div>
                                                            <Image
                                                                src={'/images/other/bg-feature-pet.png'}
                                                                width={1000}
                                                                height={800}
                                                                alt='bg-img'
                                                                className='absolute left-0 top-0 w-full h-full object-cover'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className='h-full'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Tienda
                                        </Link>
                                        <div className="mega-menu absolute top-[44px] left-0 bg-white w-screen">
                                            <div className="container">
                                                <div className="flex justify-between py-8">
                                                    <div className="nav-link basis-2/3 flex justify-between pr-12">
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Funciones de tienda</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb-img'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/breadcrumb-img' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda Breadcrumb IMG
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb1'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/breadcrumb1' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda Breadcrumb 1
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb2'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/breadcrumb2' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda Breadcrumb 2
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/collection'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/collection' ? 'active' : ''}`}
                                                                    >
                                                                        Colección de tienda
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Funciones de tienda</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-canvas'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/filter-canvas' ? 'active' : ''}`}
                                                                    >
                                                                        Filtro lateral
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-options'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/filter-options' ? 'active' : ''}`}
                                                                    >
                                                                        Opciones de filtro
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-dropdown'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/filter-dropdown' ? 'active' : ''}`}
                                                                    >
                                                                        Filtro desplegable
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/sidebar-list'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/sidebar-list' ? 'active' : ''}`}
                                                                    >
                                                                        Lista con barra lateral
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Tienda Layout</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda por defecto
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default-grid'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default-grid' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda cuadrícula
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default-list'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default-list' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda lista
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/fullwidth'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/fullwidth' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda ancho completo
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/square'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/square' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda cuadrada
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/checkout'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/checkout' ? 'active' : ''}`}
                                                                    >
                                                                        Pago
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/checkout2'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/checkout2' ? 'active' : ''}`}
                                                                    >
                                                                        Pago estilo 2
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Páginas de producto</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/wishlist'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/wishlist' ? 'active' : ''}`}
                                                                    >
                                                                        Lista de deseos
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/search-result'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/search-result' ? 'active' : ''}`}
                                                                    >
                                                                        Resultados de búsqueda
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/cart'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/cart' ? 'active' : ''}`}
                                                                    >
                                                                        Carrito de compras
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/login'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/login' ? 'active' : ''}`}
                                                                    >
                                                                        Iniciar sesión/Registrarse
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/forgot-password'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/forgot-password' ? 'active' : ''}`}
                                                                    >
                                                                        Olvidé la contraseña
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/order-tracking'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/order-tracking' ? 'active' : ''}`}
                                                                    >
                                                                        Seguimiento de pedido
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/my-account'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/my-account' ? 'active' : ''}`}
                                                                    >
                                                                        Mi cuenta
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="recent-product pl-2.5 basis-1/3">
                                                        <div className="text-button-uppercase pb-2">Productos recientes</div>
                                                        <div className="list-product hide-product-sold  grid grid-cols-2 gap-5 mt-3">
                                                            {productData.filter(item => item.action === 'add to cart' && item.category === 'pet').slice(0, 2).map((prd, index) => (
                                                                <Product key={index} data={prd} type='grid' style='style-1' />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className='h-full'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Productos
                                        </Link>
                                        <div className="mega-menu absolute top-[44px] left-0 bg-white w-screen">
                                            <div className="container">
                                                <div className="flex justify-between py-8">
                                                    <div className="nav-link basis-2/3 flex justify-between xl:pr-14 pr-5">
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Características de productos</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/default'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/default' ? 'active' : ''}`}
                                                                    >
                                                                        Productos por defecto
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/sale'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/sale' ? 'active' : ''}`}
                                                                    >
                                                                        Productos en oferta
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/countdown-timer'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/countdown-timer' ? 'active' : ''}`}
                                                                    >
                                                                        Productos con temporizador
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/grouped'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/grouped' ? 'active' : ''}`}
                                                                    >
                                                                        Productos agrupados
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/bought-together'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/bought-together' ? 'active' : ''}`}
                                                                    >
                                                                        Frecuentemente comprados juntos
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/out-of-stock'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/out-of-stock' ? 'active' : ''}`}
                                                                    >
                                                                        Productos agotados
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/variable'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/variable' ? 'active' : ''}`}
                                                                    >
                                                                        Productos variables
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Características de productos</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/external'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/external' ? 'active' : ''}`}
                                                                    >
                                                                        Productos externos
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/on-sale'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/on-sale' ? 'active' : ''}`}
                                                                    >
                                                                        Productos en oferta
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/discount'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/discount' ? 'active' : ''}`}
                                                                    >
                                                                        Productos con descuento
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/sidebar'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/sidebar' ? 'active' : ''}`}
                                                                    >
                                                                        Productos con barra lateral
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/fixed-price'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/fixed-price' ? 'active' : ''}`}
                                                                    >
                                                                        Productos precio fijo
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-2">Diseños de producto</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/thumbnail-left'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/product/thumbnail-left' ? 'active' : ''}`}
                                                                    >
                                                                        Miniaturas a la izquierda
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/thumbnail-bottom'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/product/thumbnail-bottom' ? 'active' : ''}`}
                                                                    >
                                                                        Miniaturas abajo
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/one-scrolling'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/product/one-scrolling' ? 'active' : ''}`}
                                                                    >
                                                                        Rejilla 1 con desplazamiento
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/two-scrolling'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/product/two-scrolling' ? 'active' : ''}`}
                                                                    >
                                                                        Rejilla 2 con desplazamiento
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/combined-one'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/product/combined-one' ? 'active' : ''}`}
                                                                    >
                                                                        Productos combinados 1
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/combined-two'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/product/combined-two' ? 'active' : ''}`}
                                                                    >
                                                                        Productos combinados 2
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="recent-product pl-2.5 basis-1/3">
                                                        <div className="text-button-uppercase pb-2">Productos recientes</div>
                                                        <div className="list-product hide-product-sold  grid grid-cols-2 gap-5 mt-3">
                                                            {productData.filter(item => item.action === 'add to cart' && item.category === 'pet').slice(0, 2).map((prd, index) => (
                                                                <Product key={index} data={prd} type='grid' style='style-1' />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className='h-full relative'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Blog
                                        </Link>
                                        <div className="sub-menu py-3 px-5 -left-10 absolute bg-white rounded-b-xl">
                                            <ul className='w-full'>
                                                <li>
                                                    <Link href="/blog/default" className={`text-secondary duration-300 ${pathname === '/blog/default' ? 'active' : ''}`}>
                                                        Blog estándar
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/blog/list" className={`text-secondary duration-300 ${pathname === '/blog/list' ? 'active' : ''}`}>
                                                        Lista de blog
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/blog/grid" className={`text-secondary duration-300 ${pathname === '/blog/grid' ? 'active' : ''}`}>
                                                        Rejilla de blog
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/blog/detail1" className={`text-secondary duration-300 ${pathname === '/blog/detail1' ? 'active' : ''}`}>
                                                        Detalle de blog 1
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/blog/detail2" className={`text-secondary duration-300 ${pathname === '/blog/detail2' ? 'active' : ''}`}>
                                                        Detalle de blog 2
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li className='h-full relative'>
                                        <Link href="#!" className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes('/pages') ? 'active' : ''}`}>
                                            Páginas
                                        </Link>
                                        <div className="sub-menu py-3 px-5 -left-10 absolute bg-white rounded-b-xl">
                                            <ul className='w-full'>
                                                <li>
                                                    <Link href="/pages/about" className={`text-secondary duration-300 ${pathname === '/pages/about' ? 'active' : ''}`}>
                                                        Nosotros
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/pages/contact" className={`text-secondary duration-300 ${pathname === '/pages/contact' ? 'active' : ''}`}>
                                                        Contacto
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/pages/store-list" className={`text-secondary duration-300 ${pathname === '/pages/store-list' ? 'active' : ''}`}>
                                                        Lista de tiendas
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/pages/page-not-found" className={`text-secondary duration-300 ${pathname === '/pages/page-not-found' ? 'active' : ''}`}>
                                                        404
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/pages/faqs" className={`text-secondary duration-300 ${pathname === '/pages/faqs' ? 'active' : ''}`}>
                                                        Preguntas
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/pages/coming-soon" className={`text-secondary duration-300 ${pathname === '/pages/coming-soon' ? 'active' : ''}`}>
                                                        Proximamente
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link href="/pages/customer-feedbacks" className={`text-secondary duration-300 ${pathname === '/pages/customer-feedbacks' ? 'active' : ''}`}>
                                                        Opiniones de clientes
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="menu-mobile" className={`${openMenuMobile ? 'open' : ''}`}>
                <div className="menu-container bg-white h-full">
                    <div className="container h-full">
                        <div className="menu-main h-full overflow-hidden">
                            <div className="heading py-2 relative flex items-center justify-center">
                                <div
                                    className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center"
                                    onClick={handleMenuMobile}
                                >
                                    <Icon.X size={14} />
                                </div>
                                <Link href={'/'} className='logo text-3xl font-semibold text-center'>Anvogue</Link>
                            </div>
                            <div className="form-search relative mt-2">
                                <Icon.MagnifyingGlass size={20} className='absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer' />
                                <input type="text" placeholder='¿Qué estás buscando?' className=' h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4' />
                            </div>
                            <div className="list-nav mt-6">
                                <ul>
                                    <li
                                        className={`${openSubNavMobile === 1 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(1)}
                                    >
                                        <a href={'#!'} className={`text-xl font-semibold flex items-center justify-between`}>Demo
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(1)}
                                            >
                                                <Icon.CaretLeft />
                                                Atrás
                                            </div>
                                            <div className="list-nav-item w-full grid grid-cols-2 pt-2 pb-6">
                                                <ul>
                                                    <li>
                                                        <Link href="/" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/' ? 'active' : ''}`}>
                                                            Inicio Moda 1
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion2" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion2' ? 'active' : ''}`}>
                                                            Inicio Moda 2
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion3" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion3' ? 'active' : ''}`}>
                                                            Inicio Moda 3
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion4" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion4' ? 'active' : ''}`}>
                                                            Inicio Moda 4
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion5" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion5' ? 'active' : ''}`}>
                                                            Inicio Moda 5
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion6" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion6' ? 'active' : ''}`}>
                                                            Inicio Moda 6
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion7" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion7' ? 'active' : ''}`}>
                                                            Inicio Moda 7
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion8" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion8' ? 'active' : ''}`}>
                                                            Inicio Moda 8
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion9" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion9' ? 'active' : ''}`}>
                                                            Inicio Moda 9
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion10" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion10' ? 'active' : ''}`}>
                                                            Inicio Moda 10
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/fashion11" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/fashion11' ? 'active' : ''}`}>
                                                            Inicio Moda 11
                                                        </Link>
                                                    </li>
                                                </ul>
                                                <ul>
                                                    <li>
                                                        <Link href="/homepages/underwear" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/underwear' ? 'active' : ''}`}>
                                                            Inicio Ropa interior
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/cosmetic1" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/cosmetic1' ? 'active' : ''}`}>
                                                            Inicio Cosmética 1
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/cosmetic2" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/cosmetic2' ? 'active' : ''}`}>
                                                            Inicio Cosmética 2
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/cosmetic3" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/cosmetic3' ? 'active' : ''}`}>
                                                            Inicio Cosmética 3
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/pet" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/pet' ? 'active' : ''}`}>
                                                            Inicio Mascotas
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/jewelry" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/jewelry' ? 'active' : ''}`}>
                                                            Inicio Joyería
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/furniture" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/furniture' ? 'active' : ''}`}>
                                                            Inicio Muebles
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/watch" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/watch' ? 'active' : ''}`}>
                                                            Inicio Relojes
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/toys" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/toys' ? 'active' : ''}`}>
                                                            Inicio Juguetes
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/yoga" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/yoga' ? 'active' : ''}`}>
                                                            Inicio Yoga
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/organic" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/organic' ? 'active' : ''}`}>
                                                            Inicio Orgánico
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/homepages/marketplace" className={`nav-item-mobile text-secondary duration-300 ${pathname === '/homepages/marketplace' ? 'active' : ''}`}>
                                                            Inicio Marketplace
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                    <li
                                        className={`${openSubNavMobile === 2 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(2)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Características
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(2)}
                                            >
                                                <Icon.CaretLeft />
                                                Atrás
                                            </div>
                                            <div className="list-nav-item w-full pt-3 pb-12">
                                                <div className="nav-link grid grid-cols-2 gap-5 gap-y-6">
                                                    <div className="nav-item">
                                                        <div className="text-button-uppercase pb-1">Ofertas y descuentos</div>
                                                        <ul>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleCategoryClick('pet')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Desde 50% de descuento
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('bed')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Cama para mascotas
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('pet')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Ofertas para mascotas
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('food')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Comida para mascotas
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleCategoryClick('pet')}
                                                                    className={`link text-secondary duration-300 cursor-pointer view-all-btn`}
                                                                >
                                                                    Ver todo
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="nav-item">
                                                        <div className="text-button-uppercase pb-1">Perros</div>
                                                        <ul>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('food')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Comida para perros
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('outfit')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Ropa para perros
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('bed')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Cama para perros
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('pet')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Ofertas para perros
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleCategoryClick('pet')}
                                                                    className={`link text-secondary duration-300 view-all-btn`}
                                                                >
                                                                    Ver todo
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="nav-item">
                                                        <div className="text-button-uppercase pb-1">Gatos</div>
                                                        <ul>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('ring')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Anillo para gatos
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('food')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Comida para gatos
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('bed')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Cama para gatos
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('pet')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Ofertas para gatos
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleCategoryClick('pet')}
                                                                    className={`link text-secondary duration-300 view-all-btn`}
                                                                >
                                                                    Ver todo
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="nav-item">
                                                        <div className="text-button-uppercase pb-1">Producto nuevo</div>
                                                        <ul>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('pet')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Ofertas para mascotas
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('bed')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Cama para mascotas
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('food')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Comida para mascotas
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleTypeClick('outfit')}
                                                                    className={`link text-secondary duration-300 cursor-pointer`}
                                                                >
                                                                    Ropa para mascotas
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div
                                                                    onClick={() => handleCategoryClick('cosmetic')}
                                                                    className={`link text-secondary duration-300 view-all-btn`}
                                                                >
                                                                    Ver todo
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="banner-ads-block grid sm:grid-cols-2 items-center gap-6 pt-6">
                                                    <div className="banner-ads-item bg-linear rounded-2xl relative overflow-hidden" onClick={() => handleCategoryClick('pet')}>
                                                        <div className="text-content py-14 pl-8 relative z-[1]">
                                                            <div className="text-button-uppercase text-white bg-red px-2 py-0.5 inline-block rounded-sm">Ahorra $10</div>
                                                            <div className="heading6 mt-2">20% de descuento <br />Colección para mascotas</div>
                                                            <div className="body1 mt-2 text-secondary">
                                                                Desde <span className='text-red'>$59.99</span>
                                                            </div>
                                                            <div className="button-main mt-4">Comprar ahora</div>
                                                        </div>
                                                        <Image
                                                            src={'/images/other/bg-feature-pet.png'}
                                                            width={1000}
                                                            height={800}
                                                            alt='bg-img'
                                                            className='absolute left-0 top-0 w-full h-full object-cover'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li
                                        className={`${openSubNavMobile === 3 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(3)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Tienda
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(3)}
                                            >
                                                <Icon.CaretLeft />
                                                Atrás
                                            </div>
                                            <div className="list-nav-item w-full pt-3 pb-12">
                                                <div className="">
                                                    <div className="nav-link grid grid-cols-2 gap-5 gap-y-6 justify-between">
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Funciones de tienda</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb-img'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/breadcrumb-img' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda Breadcrumb IMG
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb1'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/breadcrumb1' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda Breadcrumb 1
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/breadcrumb2'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/breadcrumb2' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda Breadcrumb 2
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/collection'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/collection' ? 'active' : ''}`}
                                                                    >
                                                                        Colección de tienda
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Funciones de tienda</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-canvas'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/filter-canvas' ? 'active' : ''}`}
                                                                    >
                                                                        Filtro lateral
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-options'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/filter-options' ? 'active' : ''}`}
                                                                    >
                                                                        Opciones de filtro
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/filter-dropdown'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/filter-dropdown' ? 'active' : ''}`}
                                                                    >
                                                                        Filtro desplegable
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/sidebar-list'}
                                                                        className={`text-secondary duration-300 ${pathname === '/shop/sidebar-list' ? 'active' : ''}`}
                                                                    >
                                                                        Lista con barra lateral
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Tienda Layout</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda por defecto
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default-grid'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default-grid' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda cuadrícula
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/default-list'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/default-list' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda lista
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/fullwidth'}
                                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname === '/shop/fullwidth' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda ancho completo
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/shop/square'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/shop/square' ? 'active' : ''}`}
                                                                    >
                                                                        Tienda cuadrada
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Páginas de producto</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/wishlist'}
                                                                        className={`text-secondary duration-300 ${pathname === '/wishlist' ? 'active' : ''}`}
                                                                    >
                                                                        Lista de deseos
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/search-result'}
                                                                        className={`text-secondary duration-300 ${pathname === '/search-result' ? 'active' : ''}`}
                                                                    >
                                                                        Resultados de búsqueda
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/cart'}
                                                                        className={`text-secondary duration-300 ${pathname === '/cart' ? 'active' : ''}`}
                                                                    >
                                                                        Carrito de compras
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/login'}
                                                                        className={`text-secondary duration-300 ${pathname === '/login' ? 'active' : ''}`}
                                                                    >
                                                                        Iniciar sesión/Registrarse
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/forgot-password'}
                                                                        className={`text-secondary duration-300 ${pathname === '/forgot-password' ? 'active' : ''}`}
                                                                    >
                                                                        Olvidé la contraseña
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/order-tracking'}
                                                                        className={`text-secondary duration-300 ${pathname === '/order-tracking' ? 'active' : ''}`}
                                                                    >
                                                                        Seguimiento de pedido
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/my-account'}
                                                                        className={`text-secondary duration-300 ${pathname === '/my-account' ? 'active' : ''}`}
                                                                    >
                                                                        Mi cuenta
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="recent-product pt-3">
                                                        <div className="text-button-uppercase pb-1">Productos recientes</div>
                                                        <div className="list-product hide-product-sold  grid grid-cols-2 gap-5 mt-3">
                                                            {productData.filter(item => item.action === 'add to cart' && item.category === 'pet').slice(0, 2).map((prd, index) => (
                                                                <Product key={index} data={prd} type='grid' style='style-1' />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li
                                        className={`${openSubNavMobile === 4 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(4)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Product
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(4)}
                                            >
                                                <Icon.CaretLeft />
                                                Atrás
                                            </div>
                                            <div className="list-nav-item w-full pt-3 pb-12">
                                                <div className="">
                                                    <div className="nav-link grid grid-cols-2 gap-5 gap-y-6 justify-between">
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Características de productos</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/default'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/default' ? 'active' : ''}`}
                                                                    >
                                                                        Productos por defecto
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/sale'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/sale' ? 'active' : ''}`}
                                                                    >
                                                                        Productos en oferta
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/countdown-timer'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/countdown-timer' ? 'active' : ''}`}
                                                                    >
                                                                        Productos con temporizador
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/grouped'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/grouped' ? 'active' : ''}`}
                                                                    >
                                                                        Productos agrupados
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/bought-together'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/bought-together' ? 'active' : ''}`}
                                                                    >
                                                                        Frecuentemente comprados juntos
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/out-of-stock'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/out-of-stock' ? 'active' : ''}`}
                                                                    >
                                                                        Productos agotados
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/variable'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/variable' ? 'active' : ''}`}
                                                                    >
                                                                        Productos variables
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item">
                                                            <div className="text-button-uppercase pb-1">Características de productos</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/external'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/external' ? 'active' : ''}`}
                                                                    >
                                                                        Productos externos
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/on-sale'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/on-sale' ? 'active' : ''}`}
                                                                    >
                                                                        Productos en oferta
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/discount'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/discount' ? 'active' : ''}`}
                                                                    >
                                                                        Productos con descuento
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/sidebar'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/sidebar' ? 'active' : ''}`}
                                                                    >
                                                                        Productos con barra lateral
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/fixed-price'}
                                                                        className={`text-secondary duration-300 ${pathname === '/product/fixed-price' ? 'active' : ''}`}
                                                                    >
                                                                        Productos precio fijo
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="nav-item col-span-2">
                                                            <div className="text-button-uppercase pb-1">Diseños de producto</div>
                                                            <ul>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/thumbnail-left'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/product/thumbnail-left' ? 'active' : ''}`}
                                                                    >
                                                                        Miniaturas a la izquierda
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/thumbnail-bottom'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/product/thumbnail-bottom' ? 'active' : ''}`}
                                                                    >
                                                                        Miniaturas abajo
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/one-scrolling'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/product/one-scrolling' ? 'active' : ''}`}
                                                                    >
                                                                        Rejilla 1 con desplazamiento
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/two-scrolling'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/product/two-scrolling' ? 'active' : ''}`}
                                                                    >
                                                                        Rejilla 2 con desplazamiento
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/combined-one'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/product/combined-one' ? 'active' : ''}`}
                                                                    >
                                                                        Productos combinados 1
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={'/product/combined-two'}
                                                                        className={`link text-secondary duration-300 ${pathname === '/product/combined-two' ? 'active' : ''}`}
                                                                    >
                                                                        Productos combinados 2
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="recent-product pt-4">
                                                        <div className="text-button-uppercase pb-1">Productos recientes</div>
                                                        <div className="list-product hide-product-sold  grid grid-cols-2 gap-5 mt-3">
                                                            {productData.filter(item => item.action === 'add to cart' && item.category === 'pet').slice(0, 2).map((prd, index) => (
                                                                <Product key={index} data={prd} type='grid' style='style-1' />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li
                                        className={`${openSubNavMobile === 5 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(5)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Blog
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(5)}
                                            >
                                                <Icon.CaretLeft />
                                                Atrás
                                            </div>
                                            <div className="list-nav-item w-full pt-2 pb-6">
                                                <ul className='w-full'>
                                                    <li>
                                                        <Link href="/blog/default" className={`text-secondary duration-300 ${pathname === '/blog/default' ? 'active' : ''}`}>
                                                            Blog estándar
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blog/list" className={`text-secondary duration-300 ${pathname === '/blog/list' ? 'active' : ''}`}>
                                                            Lista de blog
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blog/grid" className={`text-secondary duration-300 ${pathname === '/blog/grid' ? 'active' : ''}`}>
                                                            Rejilla de blog
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blog/detail1" className={`text-secondary duration-300 ${pathname === '/blog/detail1' ? 'active' : ''}`}>
                                                            Detalle de blog 1
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/blog/detail2" className={`text-secondary duration-300 ${pathname === '/blog/detail2' ? 'active' : ''}`}>
                                                            Detalle de blog 2
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                    <li
                                        className={`${openSubNavMobile === 6 ? 'open' : ''}`}
                                        onClick={() => handleOpenSubNavMobile(6)}
                                    >
                                        <a href={'#!'} className='text-xl font-semibold flex items-center justify-between mt-5'>Páginas
                                            <span className='text-right'>
                                                <Icon.CaretRight size={20} />
                                            </span>
                                        </a>
                                        <div className="sub-nav-mobile">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(6)}
                                            >
                                                <Icon.CaretLeft />
                                                Atrás
                                            </div>
                                            <div className="list-nav-item w-full pt-2 pb-6">
                                                <ul className='w-full'>
                                                    <li>
                                                        <Link href="/pages/about" className={`text-secondary duration-300 ${pathname === '/pages/about' ? 'active' : ''}`}>
                                                            About Us
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/contact" className={`text-secondary duration-300 ${pathname === '/pages/contact' ? 'active' : ''}`}>
                                                            Contact Us
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/store-list" className={`text-secondary duration-300 ${pathname === '/pages/store-list' ? 'active' : ''}`}>
                                                            Lista de tiendas
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/page-not-found" className={`text-secondary duration-300 ${pathname === '/pages/page-not-found' ? 'active' : ''}`}>
                                                            404
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/faqs" className={`text-secondary duration-300 ${pathname === '/pages/faqs' ? 'active' : ''}`}>
                                                            Preguntas frecuentes
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/coming-soon" className={`text-secondary duration-300 ${pathname === '/pages/coming-soon' ? 'active' : ''}`}>
                                                            Próximamente
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/pages/customer-feedbacks" className={`text-secondary duration-300 ${pathname === '/pages/customer-feedbacks' ? 'active' : ''}`}>
                                                            Opiniones de clientes
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MenuPet
