'use client'

import React from 'react'

import { createAdminUser, updateAdminUser, type AdminManagedUserPayload, type AdminManagedUserRole } from '@/lib/api/users'

import type { AdminUserSummary } from '../types'

type UserEditorModalProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    user?: AdminUserSummary | null;
    currentUserId?: string | null;
    onClose: () => void;
    onSaved: () => Promise<void> | void;
    showNotification: (text: string, type?: 'success' | 'error') => void;
}

type UserEditorFormState = {
    name: string;
    email: string;
    role: AdminManagedUserRole;
    password: string;
    confirmPassword: string;
    emailVerified: boolean;
    documentType: string;
    documentNumber: string;
    businessName: string;
    phone: string;
}

const EMPTY_FORM: UserEditorFormState = {
    name: '',
    email: '',
    role: 'customer',
    password: '',
    confirmPassword: '',
    emailVerified: true,
    documentType: '',
    documentNumber: '',
    businessName: '',
    phone: '',
}

const DOCUMENT_TYPE_OPTIONS = [
    { value: '', label: 'Sin documento' },
    { value: 'cedula', label: 'Cédula' },
    { value: 'ruc', label: 'RUC' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'otro', label: 'Otro' },
]

const normalizeRole = (value?: string | null): AdminManagedUserRole => {
    return String(value || '').trim().toLowerCase() === 'admin' ? 'admin' : 'customer'
}

const extractPhone = (adminUser?: AdminUserSummary | null) => {
    const resolved = String(adminUser?.resolvedPhone || '').trim()
    if (resolved) return resolved

    const profileRaw = adminUser?.profile
    if (!profileRaw) return ''

    if (typeof profileRaw === 'object' && !Array.isArray(profileRaw)) {
        return String((profileRaw as Record<string, unknown>).phone || '').trim()
    }

    if (typeof profileRaw === 'string') {
        try {
            const parsed = JSON.parse(profileRaw)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return String((parsed as Record<string, unknown>).phone || '').trim()
            }
        } catch {}
    }

    return ''
}

const buildInitialForm = (adminUser?: AdminUserSummary | null): UserEditorFormState => {
    if (!adminUser) {
        return { ...EMPTY_FORM }
    }

    return {
        name: String(adminUser.name || '').trim(),
        email: String(adminUser.email || '').trim(),
        role: normalizeRole(adminUser.role),
        password: '',
        confirmPassword: '',
        emailVerified: Boolean(adminUser.email_verified),
        documentType: String(adminUser.document_type || '').trim(),
        documentNumber: String(adminUser.document_number || '').trim(),
        businessName: String(adminUser.business_name || adminUser.resolvedCompany || '').trim(),
        phone: extractPhone(adminUser),
    }
}

export default function UserEditorModal({
    isOpen,
    mode,
    user,
    currentUserId,
    onClose,
    onSaved,
    showNotification,
}: UserEditorModalProps) {
    const [form, setForm] = React.useState<UserEditorFormState>(EMPTY_FORM)
    const [error, setError] = React.useState<string | null>(null)
    const [submitting, setSubmitting] = React.useState(false)
    const modalBodyRef = React.useRef<HTMLDivElement | null>(null)
    const emailInputRef = React.useRef<HTMLInputElement | null>(null)

    React.useEffect(() => {
        if (!isOpen) return
        setForm(buildInitialForm(user))
        setError(null)
        setSubmitting(false)
    }, [isOpen, user, mode])

    const isEditingSelf = Boolean(user?.id && currentUserId && user.id === currentUserId)
    const emailFieldError = React.useMemo(() => {
        if (!error) return null
        return /(correo|email)/i.test(error) ? error : null
    }, [error])

    const handleFieldChange = React.useCallback(<K extends keyof UserEditorFormState>(field: K, value: UserEditorFormState[K]) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))
    }, [])

    const handleSubmit = React.useCallback(async () => {
        const name = form.name.trim()
        const email = form.email.trim().toLowerCase()
        const password = form.password.trim()
        const confirmPassword = form.confirmPassword.trim()
        const documentType = form.documentType.trim()
        const documentNumber = form.documentNumber.trim()

        if (name.length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Correo electrónico inválido.')
            return
        }

        if (mode === 'create' && password.length < 12) {
            setError('La contraseña debe tener al menos 12 caracteres.')
            return
        }

        if (password && password.length < 12) {
            setError('La contraseña debe tener al menos 12 caracteres.')
            return
        }

        if ((mode === 'create' || password) && password !== confirmPassword) {
            setError('La confirmación de contraseña no coincide.')
            return
        }

        if ((documentType && !documentNumber) || (!documentType && documentNumber)) {
            setError('Tipo y número de documento deben completarse juntos.')
            return
        }

        const payload: AdminManagedUserPayload = {
            name,
            email,
            role: isEditingSelf ? 'admin' : form.role,
            emailVerified: form.emailVerified,
            documentType: documentType || undefined,
            documentNumber: documentNumber || undefined,
            businessName: form.businessName.trim() || undefined,
            phone: form.phone.trim() || undefined,
        }

        if (password) {
            payload.password = password
        }

        setSubmitting(true)
        setError(null)

        try {
            if (mode === 'create') {
                await createAdminUser(payload)
                showNotification('Usuario registrado correctamente.')
            } else if (user?.id) {
                await updateAdminUser(user.id, payload)
                showNotification('Usuario actualizado correctamente.')
            }

            await onSaved()
            onClose()
        } catch (submitError) {
            const message = String((submitError as Error)?.message || 'No se pudo guardar el usuario.')
            setError(message)
            modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })

            if (/(correo|email)/i.test(message)) {
                window.setTimeout(() => {
                    emailInputRef.current?.focus()
                    emailInputRef.current?.select()
                }, 0)
            } else {
                showNotification(message, 'error')
            }
        } finally {
            setSubmitting(false)
        }
    }, [form, isEditingSelf, mode, onClose, onSaved, showNotification, user?.id])

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
                    <div>
                        <div className="heading5">{mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</div>
                        <p className="mt-1 text-sm text-secondary">
                            {mode === 'create'
                                ? 'Crea usuarios internos o clientes y asigna su rol desde el panel.'
                                : 'Actualiza rol, verificación y datos de contacto del usuario.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="rounded-full border border-line px-3 py-2 text-sm font-semibold hover:bg-surface"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>

                <div ref={modalBodyRef} className="max-h-[85vh] overflow-y-auto px-5 py-5">
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-line bg-surface/40 p-5">
                            <div className="text-xs font-bold uppercase text-secondary">Identidad y acceso</div>
                            <div className="mt-4 grid grid-cols-1 gap-4">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase text-secondary">Nombre</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(event) => handleFieldChange('name', event.target.value)}
                                        placeholder="Ej: María Pérez"
                                        className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition-all focus:border-black"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase text-secondary">Correo electrónico</label>
                                    <input
                                        ref={emailInputRef}
                                        type="email"
                                        value={form.email}
                                        onChange={(event) => handleFieldChange('email', event.target.value)}
                                        placeholder="usuario@empresa.com"
                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:border-black ${emailFieldError ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500' : 'border-line'}`}
                                    />
                                    {emailFieldError && (
                                        <p className="mt-2 text-xs font-medium text-red-600">
                                            {emailFieldError}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase text-secondary">Rol</label>
                                        <select
                                            value={form.role}
                                            onChange={(event) => handleFieldChange('role', event.target.value as AdminManagedUserRole)}
                                            disabled={isEditingSelf}
                                            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-all focus:border-black disabled:bg-surface disabled:text-secondary"
                                        >
                                            <option value="customer">Cliente</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                        {isEditingSelf && (
                                            <p className="mt-2 text-xs text-secondary">
                                                Tu rol actual se protege aquí para evitar bloquear el acceso administrativo.
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={form.emailVerified}
                                                onChange={(event) => handleFieldChange('emailVerified', event.target.checked)}
                                                className="h-4 w-4 rounded border-line"
                                            />
                                            <span>Correo verificado</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase text-secondary">
                                            {mode === 'create' ? 'Contraseña' : 'Nueva contraseña'}
                                        </label>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(event) => handleFieldChange('password', event.target.value)}
                                            placeholder="Mínimo 12 caracteres"
                                            className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition-all focus:border-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase text-secondary">Confirmación</label>
                                        <input
                                            type="password"
                                            value={form.confirmPassword}
                                            onChange={(event) => handleFieldChange('confirmPassword', event.target.value)}
                                            placeholder="Repite la contraseña"
                                            className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition-all focus:border-black"
                                        />
                                    </div>
                                </div>
                                {mode === 'edit' && (
                                    <p className="text-xs text-secondary">
                                        Si no quieres cambiar la contraseña, deja ambos campos vacíos.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-line bg-surface/40 p-5">
                            <div className="text-xs font-bold uppercase text-secondary">Datos operativos</div>
                            <div className="mt-4 grid grid-cols-1 gap-4">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase text-secondary">Teléfono</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(event) => handleFieldChange('phone', event.target.value)}
                                        placeholder="Ej: 0991234567"
                                        className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition-all focus:border-black"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase text-secondary">Empresa o razón social</label>
                                    <input
                                        type="text"
                                        value={form.businessName}
                                        onChange={(event) => handleFieldChange('businessName', event.target.value)}
                                        placeholder="Opcional"
                                        className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition-all focus:border-black"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase text-secondary">Tipo de documento</label>
                                        <select
                                            value={form.documentType}
                                            onChange={(event) => handleFieldChange('documentType', event.target.value)}
                                            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-all focus:border-black"
                                        >
                                            {DOCUMENT_TYPE_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase text-secondary">Número de documento</label>
                                        <input
                                            type="text"
                                            value={form.documentNumber}
                                            onChange={(event) => handleFieldChange('documentNumber', event.target.value)}
                                            placeholder="Opcional"
                                            className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none transition-all focus:border-black"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-line bg-white px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-line px-6 py-3 text-sm font-semibold hover:bg-surface"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? 'Guardando...' : mode === 'create' ? 'Registrar usuario' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    )
}
