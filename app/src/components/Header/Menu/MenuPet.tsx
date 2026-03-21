'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import useLoginPopup from '@/store/useLoginPopup';
import useShopDepartmentPopup from '@/store/useShopDepartmentPopup';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useCart } from '@/context/CartContext';
import { getCategoryLabel, getCategoryUrl } from '@/data/petCategoryCards'
import { useSite } from '@/context/SiteContext'
import { buildProductSearchIndex, filterProductsBySearch, sanitizeProductSearchQuery } from '@/lib/productSearch'
import { ProductType } from '@/type/ProductType'

type MenuPetProps = {
    props?: string;
    searchProducts?: ProductType[];
};

const MenuPet: React.FC<MenuPetProps> = ({ props, searchProducts = [] }) => {
    const site = useSite()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { openLoginPopup, handleLoginPopup } = useLoginPopup()
    const { openShopDepartmentPopup, handleShopDepartmentPopup } = useShopDepartmentPopup()
    const { openMenuMobile, handleMenuMobile } = useMenuMobile()
    const [openSubNavMobile, setOpenSubNavMobile] = useState<number | null>(null)
    const { openModalCart } = useModalCartContext()
    const { cartState } = useCart()

    const [searchKeyword, setSearchKeyword] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const router = useRouter()
    const [hasMounted, setHasMounted] = useState(false)
    const searchContainerRef = useRef<HTMLDivElement>(null)
    const minAutocompleteQueryLength = 2

    const handleSearch = (value: string) => {
        const trimmedValue = sanitizeProductSearchQuery(value)

        if (pathname.startsWith('/shop/')) {
            const nextParams = new URLSearchParams(searchParams.toString())

            if (trimmedValue) {
                nextParams.set('query', trimmedValue)
            } else {
                nextParams.delete('query')
            }

            const nextQuery = nextParams.toString()
            router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname)
            setSearchKeyword(trimmedValue)
            return
        }

        if (!trimmedValue) {
            return
        }

        router.push(`/search-result?query=${encodeURIComponent(trimmedValue)}`)
        setSearchKeyword('')
    }

    const handleOpenSubNavMobile = (index: number) => {
        setOpenSubNavMobile(openSubNavMobile === index ? null : index)
    }

    const [fixedHeader, setFixedHeader] = useState(false)
    const headerRef = useRef<HTMLDivElement>(null)
    const topNavRef = useRef<HTMLDivElement>(null)
    const [headerHeight, setHeaderHeight] = useState(0)
    const [stickyHeight, setStickyHeight] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setFixedHeader(window.scrollY > 16)
        };

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const updateHeaderHeight = () => {
            const nextHeaderHeight = headerRef.current?.offsetHeight ?? 0
            const nextTopNavHeight = topNavRef.current?.offsetHeight ?? 0
            setHeaderHeight(nextHeaderHeight)
            setStickyHeight(nextHeaderHeight + nextTopNavHeight)
        }

        updateHeaderHeight()
        window.addEventListener('resize', updateHeaderHeight)

        return () => {
            window.removeEventListener('resize', updateHeaderHeight)
        }
    }, [])

    useEffect(() => {
        setHasMounted(true)
    }, [])

    useEffect(() => {
        if (pathname.startsWith('/shop/')) {
            setSearchKeyword(searchParams.get('query') ?? '')
        }
    }, [pathname, searchParams])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!searchContainerRef.current?.contains(event.target as Node)) {
                setIsSearchFocused(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleGenderClick = (gender: string) => {
        router.push(`/shop/breadcrumb1?gender=${gender}`);
    };

    const handleCategoryClick = (category: string, gender?: string) => {
        const options = gender ? { gender } : undefined
        router.push(getCategoryUrl(category, options));
    };

    const handleSuggestionSelect = (product: ProductType) => {
        setSearchKeyword(product.name)
        setIsSearchFocused(false)
        router.push(`/product/default?id=${product.id}`)
    }

    type CategoryLink = {
        id: string
        gender?: string
        labelOverride?: string
    }

    type MegaNavLink = {
        label: string
        href: string
    }

    type MegaMenuLink = CategoryLink | MegaNavLink
    type MegaMenuSection = {
        title: string
        links?: MegaMenuLink[]
    }

    const isCategoryLink = (link: MegaMenuLink): link is CategoryLink =>
        (link as CategoryLink).id !== undefined

    const categoriesSections: Array<{ title: string; links: CategoryLink[] }> =
        site.menu.categorySections

    const serviceLinks: MegaNavLink[] = site.menu.serviceLinks

    // Ya no se usa companyLinks en el render, pero lo dejo por si acaso lo necesitas luego
    const companyLinks: MegaNavLink[] = site.menu.companyLinks

    const renderMegaMenu = (
        sections: MegaMenuSection[],
        banner: { title: string; subtitle: string; image: string }
    ) =>
    (
        <div className="mega-menu absolute top-[44px] left-0 bg-white w-screen">
            <div className="container">
                <div className="flex justify-between py-8 gap-8">
                    <div className="nav-link basis-3/4 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {sections.map((section) => (
                            <div className="nav-item" key={section.title}>
                                <div className="text-button-uppercase pb-2">{section.title}</div>
                                <ul>
                                    {section.links?.map((link) => (
                                        <li key={isCategoryLink(link) ? `${link.id}-${link.gender ?? 'none'}` : link.label}>
                                            {isCategoryLink(link) ? (
                                                <div
                                                    onClick={() => handleCategoryClick(link.id, link.gender)}
                                                    className="link text-secondary duration-300 cursor-pointer"
                                                >
                                                    {link.labelOverride ?? getCategoryLabel(link.id)}
                                                </div>
                                            ) : (
                                                <Link
                                                    href={link.href}
                                                    className="link text-secondary duration-300 hover:text-black"
                                                >
                                                    {link.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="banner-ads-block pl-2.5 basis-1/4 min-w-[220px]">
                        <div
                            className={`banner-ads-item bg-linear rounded-2xl relative overflow-hidden cursor-pointer ${banner.image === '/images/collection/14.jpg' || banner.image === '/images/collection/15.jpg' || banner.image === '/images/collection/conocenos_paramascotas.jpg'
                                    ? 'min-h-[220px]'
                                    : ''
                                }`}
                            onClick={() => router.push('/shop/breadcrumb1')}
                        >
                            <div className="text-content py-14 pl-8 relative z-[1]">
                                <div className="heading6 mt-2">{banner.title}</div>
                                <div className="body1 mt-3 text-secondary">
                                    {banner.subtitle}
                                </div>
                            </div>
                            <Image
                                src={banner.image}
                                width={1000}
                                height={800}
                                alt='banner'
                                className='absolute left-0 top-0 w-full h-full object-cover'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderMobileLinkItems = (links: MegaMenuLink[]) => (
        <>
            {links.map((link) => (
                <li
                    key={isCategoryLink(link) ? `${link.id}-${link.gender ?? 'none'}` : link.label}
                    className="pb-2"
                >
                    {isCategoryLink(link) ? (
                        <div
                            onClick={() => handleCategoryClick(link.id, link.gender)}
                            className="nav-item-mobile text-secondary duration-300 cursor-pointer"
                        >
                            {link.labelOverride ?? getCategoryLabel(link.id)}
                        </div>
                    ) : (
                        <Link
                            href={link.href}
                            className="nav-item-mobile text-secondary duration-300"
                        >
                            {link.label}
                        </Link>
                    )}
                </li>
            ))}
        </>
    )

    const categoryBanner = site.menu.banner

    const servicesBanner = site.menu.servicesBanner ?? {
        title: ' ',
        subtitle: ' ',
        image: '/images/collection/15.jpg',
    }

    const departmentLinks = site.menu.departmentLinks ?? []
    const normalizedSearchKeyword = sanitizeProductSearchQuery(searchKeyword)
    const shouldShowSearchPanel =
        isSearchFocused &&
        normalizedSearchKeyword.length >= minAutocompleteQueryLength &&
        searchProducts.length > 0
    const productSearchIndex = searchProducts.length > 0
        ? buildProductSearchIndex(searchProducts)
        : new Map<string, string>()
    const searchSuggestions = shouldShowSearchPanel
        ? filterProductsBySearch(searchProducts, normalizedSearchKeyword, productSearchIndex).slice(0, 6)
        : []

    const normalizeImageSrc = (src: string) => {
        if (!src) return src
        if (src.startsWith('http://localhost:8080') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            return src.replace('http://localhost:8080', site.apiBaseUrl)
        }
        return src
    }

    const getSuggestionImage = (product: ProductType) => {
        const firstThumb = Array.isArray(product.thumbImage) ? product.thumbImage[0] : ''
        const firstImage = Array.isArray(product.images) ? product.images[0] : ''
        const imageValue = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url ?? ''
        return normalizeImageSrc(firstThumb || imageValue || '/images/placeholder.jpg')
    }

    return (
        <>
            {fixedHeader && <div aria-hidden="true" className="pet-header-spacer" style={{ height: stickyHeight }} />}

            <div
                ref={headerRef}
                className={`header-menu style-eight ${props ?? ''} ${fixedHeader ? ' fixed' : 'relative'} bg-white w-full md:h-[90px] h-[64px]`}
            >

                <div className="container mx-auto h-full">
                    <div className="header-main flex items-center justify-between h-full">
                        <div className="menu-mobile-icon lg:hidden flex items-center" onClick={handleMenuMobile}>
                            <i className="icon-category text-2xl"></i>
                        </div>
                        <Link href={'/'} className='flex items-center'>
                            <div className="relative h-[55px] w-[126px] md:h-[80px] md:w-[184px]">
                                <Image
                                    src={site.logo.src}
                                    alt={site.logo.alt}
                                    fill
                                    priority
                                    loading="eager"
                                    className="object-contain"
                                    sizes="(min-width: 1024px) 184px, 126px"
                                />
                            </div>
                        </Link>
                        <div className="form-search w-[54%] pl-8 flex items-center h-[42px] max-lg:hidden">
                            <div ref={searchContainerRef} className='relative w-full'>
                                <div className='group flex h-full min-h-[42px] w-full items-center overflow-hidden rounded-[22px] border border-[rgba(0,127,155,0.18)] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-[var(--blue)] focus-within:shadow-[0_16px_32px_rgba(0,127,155,0.14)]'>
                                    <input
                                        type="text"
                                        className="search-input h-full w-full border-none bg-transparent px-6 text-[16px] text-black outline-none placeholder:text-[rgba(15,23,42,0.48)]"
                                        placeholder="Buscar por marca, producto, categoría o SKU"
                                        value={searchKeyword}
                                        onFocus={() => {
                                            if (searchProducts.length > 0) {
                                                setIsSearchFocused(true)
                                            }
                                        }}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setIsSearchFocused(false)
                                                return
                                            }

                                            if (e.key === 'Enter') {
                                                setIsSearchFocused(false)
                                                handleSearch(searchKeyword)
                                            }
                                        }}
                                    />
                                    <button
                                        className="search-button mr-2 flex h-[30px] min-w-[30px] items-center justify-center rounded-full bg-[var(--blue)] px-0 text-white transition-all duration-300 hover:bg-[var(--bluesecondary)]"
                                        onClick={() => {
                                            setIsSearchFocused(false)
                                            handleSearch(searchKeyword)
                                        }}
                                    >
                                        <Icon.MagnifyingGlass size={22} weight='bold' className='duration-300' />
                                    </button>
                                </div>

                                {shouldShowSearchPanel && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-[140] overflow-hidden rounded-[24px] border border-[rgba(0,127,155,0.12)] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
                                        {searchSuggestions.length > 0 ? (
                                            <>
                                                <div className="border-b border-line px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">
                                                    Resultados rápidos
                                                </div>
                                                <div className="max-h-[420px] overflow-y-auto">
                                                    {searchSuggestions.map((product) => {
                                                        const imageSrc = getSuggestionImage(product)
                                                        const price = Number(product.priceMin ?? product.price ?? 0)

                                                        return (
                                                            <button
                                                                key={product.id}
                                                                type="button"
                                                                className="flex w-full items-center gap-4 border-b border-line px-4 py-3 text-left duration-200 last:border-b-0 hover:bg-surface"
                                                                onMouseDown={(event) => event.preventDefault()}
                                                                onClick={() => handleSuggestionSelect(product)}
                                                            >
                                                                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
                                                                    <Image
                                                                        src={imageSrc}
                                                                        alt={product.name}
                                                                        fill
                                                                        unoptimized
                                                                        className="object-contain"
                                                                    />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="truncate text-[14px] font-semibold text-black">
                                                                        {product.name}
                                                                    </div>
                                                                    <div className="mt-1 truncate text-[12px] text-secondary">
                                                                        {[product.brand, product.category].filter(Boolean).join(' · ')}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-[13px] font-semibold text-[var(--blue)]">
                                                                        ${price.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </div>
                                                                    <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-secondary">
                                                                        Ver
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center justify-between bg-surface px-5 py-3 text-left text-[13px] font-semibold text-[var(--blue)] duration-200 hover:text-black"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => {
                                                        setIsSearchFocused(false)
                                                        handleSearch(searchKeyword)
                                                    }}
                                                >
                                                    <span>Ver todos los resultados</span>
                                                    <Icon.ArrowRight size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="px-5 py-4 text-sm text-secondary">
                                                No encontramos productos para esa búsqueda.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="right flex gap-12">
                            <div className="list-action flex items-center gap-6">
                                <div className="user-icon relative flex items-center flex-col justify-center cursor-pointer">
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

            <div
                ref={topNavRef}
                className={`top-nav-menu relative bg-white h-[44px] max-lg:hidden ${fixedHeader ? 'fixed' : ''}`}
                style={fixedHeader ? { top: headerHeight } : undefined}
            >
                <div className="container h-full">
                    <div className="top-nav-menu-main flex items-center justify-center h-full">
                        <div className="left flex items-center justify-center h-full w-full">
                            <div className="menu-department-block relative h-full">

                                <div
                                    className={`sub-menu-department absolute top-[44px] left-0 right-0 h-max bg-white rounded-b-2xl ${openShopDepartmentPopup ? 'open' : ''}`}
                                >
                                    {departmentLinks.map((link, index) => (
                                        <div className="item block" key={`${link.href}-${index}`}>
                                            <Link
                                                href={link.href}
                                                className={`caption1 py-4 px-5 whitespace-nowrap block ${index < departmentLinks.length - 1 ? 'border-b border-line' : ''}`}
                                            >
                                                {link.label}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="menu-main style-eight h-full max-lg:hidden">
                                <ul className='flex items-center gap-8 h-full'>
                                    <li className='h-full'>
                                        <Link
                                            href="/"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center gap-1 ${hasMounted && pathname === '/' ? 'active' : ''}`}
                                        >
                                            Inicio
                                        </Link>
                                    </li>
                                    <li className='h-full'>
                                        <Link href="/shop/breadcrumb1" className={`text-button-uppercase duration-300 h-full flex items-center justify-center gap-1 ${hasMounted && pathname === '/shop/breadcrumb1' ? 'active' : ''}`}>
                                            Tienda
                                        </Link>
                                        {renderMegaMenu(
                                            categoriesSections,
                                            categoryBanner
                                        )}
                                    </li>
                                    <li className='h-full'>
                                        <Link href="#!" className='text-button-uppercase duration-300 h-full flex items-center justify-center'>
                                            Servicios
                                        </Link>
                                        {renderMegaMenu(
                                            [{ title: 'Servicios', links: serviceLinks }],
                                            servicesBanner
                                        )}
                                    </li>

                                    <li className='h-full '>
                                        <Link
                                            href="/pages/about"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${hasMounted && pathname === '/pages/about' ? 'active' : ''}`}
                                        >
                                            Conócenos
                                        </Link>
                                    </li>

                                    <li className='h-full'>
                                        <Link
                                            href="/pages/contact"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${hasMounted && pathname === '/pages/contact' ? 'active' : ''}`}
                                        >
                                            Contacto
                                        </Link>
                                    </li>

                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div
                id="menu-mobile"
                className={`${openMenuMobile ? 'open' : ''}`}
                onClick={handleMenuMobile}
            >
                <div
                    className="menu-container bg-white h-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="container h-full">
                        <div className="menu-main h-full overflow-hidden relative">
                            <div className="heading py-2 relative flex items-center justify-center">
                                <div
                                    className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                                    onClick={handleMenuMobile}
                                >
                                    <Icon.X size={14} />
                                </div>
                                <Link href={'/'} className='logo text-3xl font-semibold text-center'>
                                    <div className="relative mx-auto h-14 w-[160px]">
                                        <Image
                                            src={site.logo.mobileSrc ?? site.logo.src}
                                            alt={`${site.name} logo`}
                                            fill
                                            className="object-contain"
                                            priority
                                            sizes="160px"
                                        />
                                    </div>
                                </Link>
                            </div>
                            <div className="form-search relative mt-2">
                                <Icon.MagnifyingGlass
                                    size={20}
                                    className='absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer'
                                    onClick={() => handleSearch(searchKeyword)}
                                />
                                <input
                                    type="text"
                                    placeholder='Buscar por marca, producto, categoría o SKU'
                                    className=' h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4'
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                                />
                            </div>
                            <div className="list-nav mt-6">
                                <ul>

                                    {/* INICIO */}
                                    <li className="mt-5">
                                        <Link
                                            href="/"
                                            className={`text-xl font-semibold flex items-center justify-between ${hasMounted && pathname === '/' ? 'active' : ''}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <Icon.House size={20} />
                                                Inicio
                                            </span>
                                        </Link>
                                    </li>

                                    {/* CATEGORÍAS */}
                                    <li
                                        className={`${openSubNavMobile === 1 ? 'open' : ''} mt-5`}
                                        onClick={() => handleOpenSubNavMobile(1)}
                                    >
                                        <a href="#!" className="text-xl font-semibold flex items-center justify-between">
                                            <span className="flex items-center gap-3">
                                                <Icon.Folder size={20} />
                                                Categorías
                                            </span>
                                            <Icon.CaretRight size={20} />
                                        </a>

                                        <div className="sub-nav-mobile absolute inset-0 bg-white z-10">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(1)}
                                            >
                                                <Icon.CaretLeft size={20} />
                                                Atrás
                                            </div>

                                            <div className="list-nav-item w-full pt-3 pb-6 space-y-6">
                                                {categoriesSections.map((section) => (
                                                    <div className="nav-item" key={section.title}>
                                                        <div className="text-button-uppercase pb-1">{section.title}</div>
                                                        <ul>
                                                            {renderMobileLinkItems(section.links ?? [])}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </li>

                                    {/* SERVICIOS */}
                                    <li
                                        className={`${openSubNavMobile === 2 ? 'open' : ''} mt-5`}
                                        onClick={() => handleOpenSubNavMobile(2)}
                                    >
                                        <a href="#!" className="text-xl font-semibold flex items-center justify-between">
                                            <span className="flex items-center gap-3">
                                                <Icon.Wrench size={20} />
                                                Servicios
                                            </span>
                                            <Icon.CaretRight size={20} />
                                        </a>

                                        <div className="sub-nav-mobile absolute inset-0 bg-white z-10">
                                            <div
                                                className="back-btn flex items-center gap-3"
                                                onClick={() => handleOpenSubNavMobile(2)}
                                            >
                                                <Icon.CaretLeft size={20} />
                                                Atrás
                                            </div>

                                            <div className="list-nav-item w-full pt-3 pb-6">
                                                <ul className="space-y-4">
                                                    {serviceLinks.map((link) => (
                                                        <li key={link.label}>
                                                            <Link
                                                                href={link.href}
                                                                className="nav-item-mobile flex items-center gap-3"
                                                            >
                                                                <Icon.ArrowRight size={16} />
                                                                {link.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                        </div>
                                    </li>

                                    {/* --- CAMBIO AQUÍ: CONÓCENOS MÓVIL --- */}
                                    <li className="mt-5">
                                        <Link
                                            href="/pages/about"
                                            className={`text-xl font-semibold flex items-center justify-between ${hasMounted && pathname === '/pages/about' ? 'active' : ''}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <Icon.Star size={20} />
                                                Conócenos
                                            </span>
                                        </Link>
                                    </li>
                                    {/* ------------------------------------ */}

                                    {/* CONTACTO */}
                                    <li className="mt-5">
                                        <Link
                                            href="/pages/contact"
                                            className={`text-xl font-semibold flex items-center justify-between ${hasMounted && pathname === '/pages/contact' ? 'active' : ''}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <Icon.EnvelopeSimple size={20} />
                                                Contacto
                                            </span>
                                        </Link>
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
