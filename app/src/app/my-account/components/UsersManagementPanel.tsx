'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import type { AdminUserSummary } from '../types'
import UserEditorModal from './UserEditorModal'

type UsersManagementPanelProps = {
    users: AdminUserSummary[];
    filteredUsers: AdminUserSummary[];
    loading: boolean;
    search: string;
    roleFilter: 'all' | 'clients' | 'admins';
    summary: {
        clients: number;
        admins: number;
        verified: number;
        withOrders: number;
        withAddress: number;
        withPhone: number;
        newLast30Days: number;
    };
    onSearchChange: (value: string) => void;
    onRoleFilterChange: (value: 'all' | 'clients' | 'admins') => void;
    getUserRoleBadge: (role?: string | null) => { label: string; className: string };
    formatMoney: (value: number) => string;
    formatDate: (value: string) => string;
    formatDateTime: (value: string) => string;
    currentUserId?: string | null;
    onUsersMutated: () => Promise<void> | void;
    onUnlockUser: (user: AdminUserSummary) => Promise<void> | void;
    showNotification: (text: string, type?: 'success' | 'error') => void;
}

const SUMMARY_CARDS: Array<{
    key: keyof UsersManagementPanelProps['summary'];
    label: string;
    className?: string;
}> = [
    { key: 'clients', label: 'Clientes' },
    { key: 'admins', label: 'Administradores' },
    { key: 'verified', label: 'Verificados' },
    { key: 'withOrders', label: 'Con pedidos' },
    { key: 'withAddress', label: 'Con dirección' },
    { key: 'withPhone', label: 'Con teléfono' },
    { key: 'newLast30Days', label: 'Nuevos (30 días)', className: 'col-span-2 xl:col-span-1' },
]

export default React.memo(function UsersManagementPanel({
    users,
    filteredUsers,
    loading,
    search,
    roleFilter,
    summary,
    onSearchChange,
    onRoleFilterChange,
    getUserRoleBadge,
    formatMoney,
    formatDate,
    formatDateTime,
    currentUserId,
    onUsersMutated,
    onUnlockUser,
    showNotification,
}: UsersManagementPanelProps) {
    const [isEditorOpen, setIsEditorOpen] = React.useState(false)
    const [editorMode, setEditorMode] = React.useState<'create' | 'edit'>('create')
    const [selectedUser, setSelectedUser] = React.useState<AdminUserSummary | null>(null)

    const openCreateModal = React.useCallback(() => {
        setEditorMode('create')
        setSelectedUser(null)
        setIsEditorOpen(true)
    }, [])

    const openEditModal = React.useCallback((adminUser: AdminUserSummary) => {
        setEditorMode('edit')
        setSelectedUser(adminUser)
        setIsEditorOpen(true)
    }, [])

    const isUserLocked = React.useCallback((adminUser: AdminUserSummary) => {
        const lockedUntil = String(adminUser.login_locked_until || '').trim()
        if (!lockedUntil) return false
        const lockDate = new Date(lockedUntil)
        return !Number.isNaN(lockDate.getTime()) && lockDate.getTime() > Date.now()
    }, [])

    return (
        <div className="tab text-content w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="heading5">Usuarios registrados</div>
                    <p className="text-secondary text-sm mt-1">
                        Consulta clientes y administradores con métricas de actividad y compras.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-bold text-secondary bg-surface px-4 py-2 rounded-lg border border-line">
                        Total: {users.length.toLocaleString('es-EC')}
                    </div>
                    <button
                        type="button"
                        className="button-main px-5 py-2"
                        onClick={openCreateModal}
                    >
                        Nuevo usuario
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-7 gap-3 mt-6">
                {SUMMARY_CARDS.map((card) => (
                    <div key={card.key} className={`p-4 bg-white rounded-xl border border-line shadow-sm ${card.className ?? ''}`}>
                        <div className="text-[10px] uppercase font-bold text-secondary mb-1">{card.label}</div>
                        <div className="heading6">{summary[card.key].toLocaleString('es-EC')}</div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 rounded-xl border border-line bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2">
                        <div className="text-[10px] uppercase font-bold text-secondary mb-1">Buscar usuario</div>
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Nombre, email, documento, teléfono o dirección"
                            className="w-full px-3 py-2 rounded-lg border border-line text-sm"
                        />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-secondary mb-1">Rol</div>
                        <select
                            value={roleFilter}
                            onChange={(event) => onRoleFilterChange(event.target.value as 'all' | 'clients' | 'admins')}
                            className="w-full px-3 py-2 rounded-lg border border-line text-sm bg-white"
                        >
                            <option value="all">Todos</option>
                            <option value="clients">Solo clientes</option>
                            <option value="admins">Solo administradores</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                {loading && users.length === 0 ? (
                    <div className="p-5 rounded-xl border border-line bg-surface text-secondary text-sm">
                        Cargando usuarios...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-5 rounded-xl border border-line bg-surface text-secondary text-sm">
                        No se encontraron usuarios con los filtros actuales.
                    </div>
                ) : (
                    <>
                        <div className="md:hidden flex flex-col gap-3">
                            {filteredUsers.map((adminUser) => {
                                const roleBadge = getUserRoleBadge(adminUser.role)
                                const ordersTotal = Number(adminUser.orders_total ?? 0)
                                const ordersCompleted = Number(adminUser.orders_completed ?? 0)
                                const totalSpent = Number(adminUser.total_spent ?? 0)
                                const failedAttempts = Number(adminUser.failed_login_attempts ?? 0)
                                const isLocked = isUserLocked(adminUser)

                                return (
                                    <div key={adminUser.id} className="p-4 bg-white rounded-xl border border-line shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-semibold">{adminUser.name || 'Sin nombre'}</div>
                                                <div className="text-xs text-secondary break-all">{adminUser.resolvedEmail || '-'}</div>
                                                {adminUser.resolvedCompany && (
                                                    <div className="text-[11px] text-secondary mt-1">
                                                        Empresa: {adminUser.resolvedCompany}
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${roleBadge.className}`}>
                                                {roleBadge.label}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                            <div>
                                                <div className="text-[10px] uppercase text-secondary font-bold mb-1">Registro</div>
                                                <div>{adminUser.created_at ? formatDate(adminUser.created_at) : '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-secondary font-bold mb-1">Verificación</div>
                                                <div>{adminUser.email_verified ? 'Verificado' : 'Pendiente'}</div>
                                                <div className={`mt-1 text-[11px] font-medium ${isLocked ? 'text-red-600' : 'text-secondary'}`}>
                                                    {isLocked
                                                        ? `Bloqueado hasta ${formatDateTime(adminUser.login_locked_until || '')}`
                                                        : failedAttempts > 0
                                                            ? `${failedAttempts} intentos fallidos`
                                                            : 'Sin bloqueo'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-secondary font-bold mb-1">Pedidos</div>
                                                <div>{ordersTotal.toLocaleString('es-EC')} ({ordersCompleted.toLocaleString('es-EC')} completados)</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-secondary font-bold mb-1">Facturado</div>
                                                <div>{formatMoney(totalSpent)}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-secondary">
                                            <strong className="font-semibold text-black">Contacto:</strong>{' '}
                                            {adminUser.resolvedPhone || 'Sin teléfono'}
                                        </div>
                                        <div className="mt-1 text-xs text-secondary">
                                            <strong className="font-semibold text-black">Dirección:</strong>{' '}
                                            {adminUser.resolvedAddressText || 'Sin dirección'}
                                        </div>
                                        <div className="mt-3 text-xs text-secondary">
                                            Última compra: {adminUser.last_order_at ? formatDateTime(adminUser.last_order_at) : 'Sin compras'}
                                        </div>
                                        <div className="mt-4 flex justify-end gap-2">
                                            {isLocked && (
                                                <button
                                                    type="button"
                                                    onClick={() => onUnlockUser(adminUser)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                                >
                                                    <Icon.LockOpen size={14} />
                                                    Desbloquear
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(adminUser)}
                                                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold hover:bg-surface"
                                            >
                                                <Icon.PencilSimple size={14} />
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="hidden md:block overflow-x-auto border border-line rounded-xl bg-white">
                            <table className="w-full min-w-[1280px]">
                                <thead className="bg-surface border-b border-line">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-[11px] uppercase font-bold text-secondary">Usuario</th>
                                        <th className="text-left px-4 py-3 text-[11px] uppercase font-bold text-secondary">Rol</th>
                                        <th className="text-left px-4 py-3 text-[11px] uppercase font-bold text-secondary">Registro</th>
                                        <th className="text-left px-4 py-3 text-[11px] uppercase font-bold text-secondary">Verificación</th>
                                        <th className="text-left px-4 py-3 text-[11px] uppercase font-bold text-secondary">Contacto</th>
                                        <th className="text-left px-4 py-3 text-[11px] uppercase font-bold text-secondary">Dirección</th>
                                        <th className="text-right px-4 py-3 text-[11px] uppercase font-bold text-secondary">Pedidos</th>
                                        <th className="text-right px-4 py-3 text-[11px] uppercase font-bold text-secondary">Facturado</th>
                                        <th className="text-left px-4 py-3 text-[11px] uppercase font-bold text-secondary">Última compra</th>
                                        <th className="text-right px-4 py-3 text-[11px] uppercase font-bold text-secondary">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {filteredUsers.map((adminUser) => {
                                        const roleBadge = getUserRoleBadge(adminUser.role)
                                        const ordersTotal = Number(adminUser.orders_total ?? 0)
                                        const ordersCompleted = Number(adminUser.orders_completed ?? 0)
                                        const totalSpent = Number(adminUser.total_spent ?? 0)
                                        const failedAttempts = Number(adminUser.failed_login_attempts ?? 0)
                                        const isLocked = isUserLocked(adminUser)

                                        return (
                                            <tr key={adminUser.id} className="hover:bg-surface/40">
                                                <td className="px-4 py-3 align-top">
                                                    <div className="font-semibold">{adminUser.name || 'Sin nombre'}</div>
                                                    <div className="text-xs text-secondary">{adminUser.resolvedEmail || '-'}</div>
                                                    {adminUser.resolvedCompany && (
                                                        <div className="text-[11px] text-secondary mt-1">
                                                            Empresa: {adminUser.resolvedCompany}
                                                        </div>
                                                    )}
                                                    {adminUser.document_number && (
                                                        <div className="text-[11px] text-secondary mt-1">
                                                            {adminUser.document_type ? `${adminUser.document_type.toUpperCase()}: ` : 'Documento: '}
                                                            {adminUser.document_number}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${roleBadge.className}`}>
                                                        {roleBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 align-top text-sm">
                                                    {adminUser.created_at ? formatDate(adminUser.created_at) : '-'}
                                                </td>
                                                <td className="px-4 py-3 align-top text-sm">
                                                    <div>{adminUser.email_verified ? 'Verificado' : 'Pendiente'}</div>
                                                    <div className={`mt-1 text-[11px] ${isLocked ? 'font-medium text-red-600' : 'text-secondary'}`}>
                                                        {isLocked
                                                            ? `Bloqueado hasta ${formatDateTime(adminUser.login_locked_until || '')}`
                                                            : failedAttempts > 0
                                                                ? `${failedAttempts} intentos fallidos`
                                                                : 'Sin bloqueo'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-top text-sm">
                                                    <div className="font-semibold">{adminUser.resolvedPhone || '-'}</div>
                                                </td>
                                                <td className="px-4 py-3 align-top text-sm">
                                                    <div className="max-w-[300px] truncate" title={adminUser.resolvedAddressText || '-'}>
                                                        {adminUser.resolvedAddressText || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-top text-sm text-right">
                                                    <div className="font-semibold">{ordersTotal.toLocaleString('es-EC')}</div>
                                                    <div className="text-xs text-secondary">{ordersCompleted.toLocaleString('es-EC')} completados</div>
                                                </td>
                                                <td className="px-4 py-3 align-top text-sm text-right font-semibold">
                                                    {formatMoney(totalSpent)}
                                                </td>
                                                <td className="px-4 py-3 align-top text-sm">
                                                    {adminUser.last_order_at ? formatDateTime(adminUser.last_order_at) : 'Sin compras'}
                                                </td>
                                                <td className="px-4 py-3 align-top text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                    {isLocked && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onUnlockUser(adminUser)}
                                                            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                                        >
                                                            <Icon.LockOpen size={14} />
                                                            Desbloquear
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(adminUser)}
                                                        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold hover:bg-surface"
                                                    >
                                                        <Icon.PencilSimple size={14} />
                                                        Editar
                                                    </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <UserEditorModal
                isOpen={isEditorOpen}
                mode={editorMode}
                user={selectedUser}
                currentUserId={currentUserId}
                onClose={() => setIsEditorOpen(false)}
                onSaved={onUsersMutated}
                showNotification={showNotification}
            />
        </div>
    )
})
