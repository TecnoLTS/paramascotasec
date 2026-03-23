'use client'

import type { ElementType } from 'react'
import Image from '@/components/Common/AppImage'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import { PRODUCT_REFERENCE_SECTIONS, type ProductReferenceKey } from '@/lib/productReferenceData'
import type { AdminMenuGroupKey, AdminReportSection } from '../types'
import PanelNavButton from './PanelNavButton'

type SidebarUser = {
    role?: string;
    name?: string;
    email?: string;
}

type AccountSidebarProps = {
    user: SidebarUser;
    activeTab?: string;
    adminReportSection: AdminReportSection;
    adminMenuExpanded: Record<AdminMenuGroupKey, boolean>;
    focusedReferenceCatalogKey?: ProductReferenceKey | null;
    onToggleAdminMenuGroup: (groupKey: AdminMenuGroupKey) => void;
    onOpenAdminReportSection: (section: AdminReportSection) => void;
    onNavigateToPanelTab: (tab: string) => void;
    onNavigateToReferenceCatalog: (key: ProductReferenceKey | null) => void;
    onLogout: () => void;
    strategicAlertsCount: number;
    strategicCriticalCount: number;
}

export default function AccountSidebar({
    user,
    activeTab,
    adminReportSection,
    adminMenuExpanded,
    focusedReferenceCatalogKey = null,
    onToggleAdminMenuGroup,
    onOpenAdminReportSection,
    onNavigateToPanelTab,
    onNavigateToReferenceCatalog,
    onLogout,
    strategicAlertsCount,
    strategicCriticalCount,
}: AccountSidebarProps) {
    return (
        <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
            <div className="heading flex flex-col items-center justify-center">
                <div className="avatar">
                    <Image
                        src={'/images/avatar/1.png'}
                        width={300}
                        height={300}
                        alt='Foto de perfil'
                        priority
                        loading="eager"
                        className='md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full'
                    />
                </div>
                <div className="name heading6 mt-4 text-center">{user.name}</div>
                <div className="mail heading6 font-normal normal-case text-secondary text-center mt-1 break-all">{user.email}</div>
            </div>
            <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
                {user.role === 'admin' ? (
                    <div className="space-y-3">

                        <div className="rounded-xl border border-line overflow-hidden bg-white">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface duration-300"
                                onClick={() => onToggleAdminMenuGroup('reporting')}
                            >
                                <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-wide text-secondary">
                                    <Icon.ChartPieSlice size={16} />
                                    <span>Reportes</span>
                                </div>
                                <Icon.CaretDown size={14} className={`duration-300 ${adminMenuExpanded.reporting ? 'rotate-180' : ''}`} />
                            </button>
                            {adminMenuExpanded.reporting && (
                                <div className="pb-2 px-2 space-y-1.5">
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'reports' && adminReportSection === 'general'} onClick={() => onOpenAdminReportSection('general')}>
                                        <Icon.ChartPieSlice size={18} />
                                        <strong className="heading6">General</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'reports' && adminReportSection === 'sales'} onClick={() => onOpenAdminReportSection('sales')}>
                                        <Icon.ChartLineUp size={18} />
                                        <strong className="heading6">Ventas</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'reports' && adminReportSection === 'balance'} onClick={() => onOpenAdminReportSection('balance')}>
                                        <Icon.Bank size={18} />
                                        <strong className="heading6">Balance General</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'reports' && adminReportSection === 'inventory'} onClick={() => onOpenAdminReportSection('inventory')}>
                                        <Icon.Archive size={18} />
                                        <strong className="heading6">Inventario</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'reports' && adminReportSection === 'traceability'} onClick={() => onOpenAdminReportSection('traceability')}>
                                        <Icon.Files size={18} />
                                        <strong className="heading6">Trazabilidad</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'sales-ranking'} onClick={() => onNavigateToPanelTab('sales-ranking')}>
                                        <Icon.Trophy size={18} />
                                        <strong className="heading6">Ranking Productos</strong>
                                    </PanelNavButton>
                                </div>
                            )}
                        </div>

                        
                        <div className="rounded-xl border border-line overflow-hidden bg-white">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface duration-300"
                                onClick={() => onToggleAdminMenuGroup('monitoring')}
                            >
                                <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-wide text-secondary">
                                    <Icon.ChartBar size={16} />
                                    <span>Monitoreo</span>
                                </div>
                                <Icon.CaretDown size={14} className={`duration-300 ${adminMenuExpanded.monitoring ? 'rotate-180' : ''}`} />
                            </button>
                            {adminMenuExpanded.monitoring && (
                                <div className="pb-2 px-2 space-y-1.5">
                                    <PanelNavButton
                                        className="item flex items-center justify-between gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface"
                                        isActive={activeTab === 'alerts'}
                                        onClick={() => onNavigateToPanelTab('alerts')}
                                        trailing={strategicAlertsCount > 0 ? (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${strategicCriticalCount > 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {strategicAlertsCount}
                                            </span>
                                        ) : undefined}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon.Bell size={18} />
                                            <strong className="heading6">Alertas</strong>
                                        </span>
                                    </PanelNavButton>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-line overflow-hidden bg-white">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface duration-300"
                                onClick={() => onToggleAdminMenuGroup('catalog')}
                            >
                                <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-wide text-secondary">
                                    <Icon.Package size={16} />
                                    <span>Catálogo</span>
                                </div>
                                <Icon.CaretDown size={14} className={`duration-300 ${adminMenuExpanded.catalog ? 'rotate-180' : ''}`} />
                            </button>
                            {adminMenuExpanded.catalog && (
                                <div className="pb-2 px-2 space-y-1.5">
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'products'} onClick={() => onNavigateToPanelTab('products')}>
                                        <Icon.ShoppingBag size={18} />
                                        <strong className="heading6">Productos</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'inventory'} onClick={() => onNavigateToPanelTab('inventory')}>
                                        <Icon.Archive size={18} />
                                        <strong className="heading6">Inventario</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'catalogs' && !focusedReferenceCatalogKey} onClick={() => onNavigateToReferenceCatalog(null)}>
                                        <Icon.Rows size={18} />
                                        <strong className="heading6">Catálogos operativos</strong>
                                    </PanelNavButton>
                                    <div className="mt-1 rounded-lg border border-dashed border-line/70 bg-surface/60 p-2 space-y-1">
                                        {PRODUCT_REFERENCE_SECTIONS.map((section) => {
                                            const ItemIcon = Icon[section.menuIcon] as ElementType
                                            return (
                                                <PanelNavButton
                                                    key={`reference-catalog-${section.key}`}
                                                    className="item flex items-center gap-3 w-full px-4 py-2 rounded-lg cursor-pointer duration-300 hover:bg-white"
                                                    isActive={activeTab === 'catalogs' && focusedReferenceCatalogKey === section.key}
                                                    onClick={() => onNavigateToReferenceCatalog(section.key)}
                                                >
                                                    <ItemIcon size={16} />
                                                    <strong className="heading7">{section.title}</strong>
                                                </PanelNavButton>
                                            )
                                        })}
                                    </div>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'users'} onClick={() => onNavigateToPanelTab('users')}>
                                        <Icon.Users size={18} />
                                        <strong className="heading6">Usuarios</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'product-page'} onClick={() => onNavigateToPanelTab('product-page')}>
                                        <Icon.NotePencil size={18} />
                                        <strong className="heading6">Ficha de producto</strong>
                                    </PanelNavButton>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-line overflow-hidden bg-white">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface duration-300"
                                onClick={() => onToggleAdminMenuGroup('operations')}
                            >
                                <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-wide text-secondary">
                                    <Icon.Truck size={16} />
                                    <span>Operación</span>
                                </div>
                                <Icon.CaretDown size={14} className={`duration-300 ${adminMenuExpanded.operations ? 'rotate-180' : ''}`} />
                            </button>
                            {adminMenuExpanded.operations && (
                                <div className="pb-2 px-2 space-y-1.5">
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'store-status'} onClick={() => onNavigateToPanelTab('store-status')}>
                                        <Icon.Power size={18} />
                                        <strong className="heading6">Ventas</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'local-sales'} onClick={() => onNavigateToPanelTab('local-sales')}>
                                        <Icon.Storefront size={18} />
                                        <strong className="heading6">Venta en local</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'admin-orders'} onClick={() => onNavigateToPanelTab('admin-orders')}>
                                        <Icon.ListChecks size={18} />
                                        <strong className="heading6">Pedidos</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'shipments'} onClick={() => onNavigateToPanelTab('shipments')}>
                                        <Icon.Truck size={18} />
                                        <strong className="heading6">Envíos</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'balances'} onClick={() => onNavigateToPanelTab('balances')}>
                                        <Icon.Briefcase size={18} />
                                        <strong className="heading6">Balances</strong>
                                    </PanelNavButton>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-line overflow-hidden bg-white">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface duration-300"
                                onClick={() => onToggleAdminMenuGroup('finance')}
                            >
                                <div className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-wide text-secondary">
                                    <Icon.CurrencyDollar size={16} />
                                    <span>Precios y finanzas</span>
                                </div>
                                <Icon.CaretDown size={14} className={`duration-300 ${adminMenuExpanded.finance ? 'rotate-180' : ''}`} />
                            </button>
                            {adminMenuExpanded.finance && (
                                <div className="pb-2 px-2 space-y-1.5">
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'prices'} onClick={() => onNavigateToPanelTab('prices')}>
                                        <Icon.CurrencyDollar size={18} />
                                        <strong className="heading6">Precios</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'taxes'} onClick={() => onNavigateToPanelTab('taxes')}>
                                        <Icon.Percent size={18} />
                                        <strong className="heading6">Impuestos</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'margins'} onClick={() => onNavigateToPanelTab('margins')}>
                                        <Icon.TrendUp size={18} />
                                        <strong className="heading6">Márgenes</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'calculations'} onClick={() => onNavigateToPanelTab('calculations')}>
                                        <Icon.Calculator size={18} />
                                        <strong className="heading6">Cálculos</strong>
                                    </PanelNavButton>
                                    <PanelNavButton className="item flex items-center gap-3 w-full px-4 py-2.5 rounded-lg cursor-pointer duration-300 hover:bg-surface" isActive={activeTab === 'pricing-rules'} onClick={() => onNavigateToPanelTab('pricing-rules')}>
                                        <Icon.SlidersHorizontal size={18} />
                                        <strong className="heading6">Reglas de precio</strong>
                                    </PanelNavButton>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <PanelNavButton className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white" isActive={activeTab === 'dashboard'} onClick={() => onNavigateToPanelTab('dashboard')}>
                            <Icon.HouseLine size={20} />
                            <strong className="heading6">Panel de Control</strong>
                        </PanelNavButton>
                        <PanelNavButton className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5" isActive={activeTab === 'orders'} onClick={() => onNavigateToPanelTab('orders')}>
                            <Icon.Package size={20} />
                            <strong className="heading6">Historial de Pedidos</strong>
                        </PanelNavButton>
                        <PanelNavButton className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5" isActive={activeTab === 'address'} onClick={() => onNavigateToPanelTab('address')}>
                            <Icon.Tag size={20} />
                            <strong className="heading6">Mis Direcciones</strong>
                        </PanelNavButton>
                        <PanelNavButton className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5" isActive={activeTab === 'setting'} onClick={() => onNavigateToPanelTab('setting')}>
                            <Icon.GearSix size={20} />
                            <strong className="heading6">Configuración</strong>
                        </PanelNavButton>
                    </>
                )}
                <button onClick={onLogout} className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 text-left border-none bg-transparent">
                    <Icon.SignOut size={20} />
                    <strong className="heading6">Cerrar Sesión</strong>
                </button>
            </div>
        </div>
    )
}
