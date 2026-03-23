'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import {
    createEmptyProductSupplierReference,
    createProductSupplierReferenceId,
    getSupplierSearchText,
    normalizeProductSupplierRecord,
    type ProductReferenceSection,
    type ProductSupplierReference,
} from '@/lib/productReferenceData'

type SupplierReferenceSectionCardProps = {
    section: ProductReferenceSection;
    values: ProductSupplierReference[];
    saving?: boolean;
    focused?: boolean;
    onChangeValues: (nextValues: ProductSupplierReference[]) => void;
}

const normalizeComparable = (value?: string | null) =>
    String(value || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase('es-EC')

const normalizeDocumentComparable = (value?: string | null) =>
    String(value || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleUpperCase('es-EC')
        .replace(/[^A-Z0-9]+/g, '')

const isValidEmail = (value: string) => {
    if (!value) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const pageSize = 8

export default React.memo(function SupplierReferenceSectionCard({
    section,
    values,
    saving = false,
    focused = false,
    onChangeValues,
}: SupplierReferenceSectionCardProps) {
    const ItemIcon = Icon[section.menuIcon]
    const [searchValue, setSearchValue] = React.useState('')
    const [formState, setFormState] = React.useState<ProductSupplierReference>(createEmptyProductSupplierReference())
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [errorMessage, setErrorMessage] = React.useState('')
    const [page, setPage] = React.useState(1)

    const normalizedSearch = React.useMemo(() => normalizeComparable(searchValue), [searchValue])
    const sortedValues = React.useMemo(
        () => [...values].sort((left, right) => left.name.localeCompare(right.name, 'es-EC', { sensitivity: 'base' })),
        [values]
    )
    const filteredValues = React.useMemo(() => {
        if (!normalizedSearch) return sortedValues
        return sortedValues.filter((supplier) => normalizeComparable(getSupplierSearchText(supplier)).includes(normalizedSearch))
    }, [normalizedSearch, sortedValues])
    const totalPages = Math.max(1, Math.ceil(filteredValues.length / pageSize))
    const currentPage = Math.min(page, totalPages)
    const paginatedValues = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredValues.slice(start, start + pageSize)
    }, [currentPage, filteredValues])

    const supplierWithSameName = React.useMemo(() => {
        const name = normalizeComparable(formState.name)
        if (!name) return null
        return values.find((supplier) => supplier.id !== editingId && normalizeComparable(supplier.name) === name) || null
    }, [editingId, formState.name, values])

    const supplierWithSameDocument = React.useMemo(() => {
        const document = normalizeDocumentComparable(formState.document)
        if (!document) return null
        return values.find((supplier) => supplier.id !== editingId && normalizeDocumentComparable(supplier.document) === document) || null
    }, [editingId, formState.document, values])

    const resetForm = React.useCallback(() => {
        setFormState(createEmptyProductSupplierReference())
        setEditingId(null)
        setErrorMessage('')
    }, [])

    const validateForm = React.useCallback(() => {
        const name = String(formState.name || '').replace(/\s+/g, ' ').trim()
        const document = String(formState.document || '').replace(/\s+/g, ' ').trim()
        const email = String(formState.email || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('es-EC')

        if (!name || name.length < 2) {
            return 'El proveedor debe tener al menos 2 caracteres.'
        }
        if (!document || normalizeDocumentComparable(document).length < 6) {
            return 'El RUC o documento del proveedor es obligatorio y debe verse completo.'
        }
        if (!isValidEmail(email)) {
            return 'El correo del proveedor no tiene un formato válido.'
        }
        if (supplierWithSameName) {
            return `Ya existe un proveedor registrado como "${supplierWithSameName.name}".`
        }
        if (supplierWithSameDocument) {
            return `El documento ${supplierWithSameDocument.document} ya está asociado a ${supplierWithSameDocument.name}.`
        }
        return ''
    }, [formState.document, formState.email, formState.name, supplierWithSameDocument, supplierWithSameName])

    const saveSupplier = React.useCallback(() => {
        const validationError = validateForm()
        if (validationError) {
            setErrorMessage(validationError)
            return
        }

        const normalizedSupplier = normalizeProductSupplierRecord({
            ...formState,
            id: editingId || formState.id || createProductSupplierReferenceId(formState.name, formState.document),
        })

        if (!normalizedSupplier) {
            setErrorMessage('No se pudo normalizar el proveedor.')
            return
        }

        const nextValues = editingId
            ? values.map((supplier) => (supplier.id === editingId ? normalizedSupplier : supplier))
            : [...values, normalizedSupplier]

        onChangeValues(nextValues)
        resetForm()
    }, [editingId, formState, onChangeValues, resetForm, validateForm, values])

    const removeSupplier = React.useCallback((supplierId: string) => {
        onChangeValues(values.filter((supplier) => supplier.id !== supplierId))
        if (editingId === supplierId) {
            resetForm()
        }
    }, [editingId, onChangeValues, resetForm, values])

    const startEdit = React.useCallback((supplier: ProductSupplierReference) => {
        setFormState(supplier)
        setEditingId(supplier.id)
        setErrorMessage('')
    }, [])

    React.useEffect(() => {
        setPage(1)
    }, [searchValue])

    React.useEffect(() => {
        if (currentPage !== page) {
            setPage(currentPage)
        }
    }, [currentPage, page])

    return (
        <div className={`rounded-2xl border p-5 transition-all shadow-sm ${
            focused
                ? 'border-primary bg-white ring-2 ring-primary/15 shadow-md'
                : 'border-line bg-white'
        }`}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ItemIcon size={22} />
                    </div>
                    <div>
                        <div className="text-lg font-semibold leading-tight">{section.title}</div>
                        <p className="text-secondary text-xs mt-1 max-w-2xl">{section.description}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="px-3 py-2 rounded-xl bg-surface text-xs">
                        <div className="uppercase font-bold text-secondary">Registros</div>
                        <div className="text-lg font-bold mt-1">{values.length}</div>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-surface text-xs">
                        <div className="uppercase font-bold text-secondary">Con RUC</div>
                        <div className="text-lg font-bold mt-1">{values.filter((supplier) => supplier.document).length}</div>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-surface text-xs">
                        <div className="uppercase font-bold text-secondary">Con correo</div>
                        <div className="text-lg font-bold mt-1">{values.filter((supplier) => supplier.email).length}</div>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-surface text-xs">
                        <div className="uppercase font-bold text-secondary">Con teléfono</div>
                        <div className="text-lg font-bold mt-1">{values.filter((supplier) => supplier.phone).length}</div>
                    </div>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 2xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-5">
                <div className="rounded-2xl border border-line bg-surface/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold">{editingId ? 'Editar proveedor' : 'Registrar proveedor'}</div>
                            <p className="text-secondary text-xs mt-1">
                                El proveedor queda listo para compras, documento asociado y contacto operativo.
                            </p>
                        </div>
                        {editingId && (
                            <button
                                type="button"
                                className="px-3 py-2 rounded-lg border border-line text-sm font-semibold"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Cancelar edición
                            </button>
                        )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                            <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">Nombre comercial del proveedor</label>
                            <input
                                className="border border-line rounded-xl px-4 py-3 w-full outline-none transition-all focus:border-black bg-white"
                                value={formState.name}
                                placeholder="Ej: Fabripet"
                                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">RUC o documento</label>
                            <input
                                className="border border-line rounded-xl px-4 py-3 w-full outline-none transition-all focus:border-black bg-white"
                                value={formState.document}
                                placeholder="Ej: 1790012345001"
                                onChange={(event) => setFormState((prev) => ({ ...prev, document: event.target.value }))}
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">Correo</label>
                            <input
                                type="email"
                                className="border border-line rounded-xl px-4 py-3 w-full outline-none transition-all focus:border-black bg-white"
                                value={formState.email}
                                placeholder="compras@proveedor.com"
                                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">Teléfono</label>
                            <input
                                className="border border-line rounded-xl px-4 py-3 w-full outline-none transition-all focus:border-black bg-white"
                                value={formState.phone}
                                placeholder="0999999999"
                                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">Contacto</label>
                            <input
                                className="border border-line rounded-xl px-4 py-3 w-full outline-none transition-all focus:border-black bg-white"
                                value={formState.contactName}
                                placeholder="Nombre del contacto"
                                onChange={(event) => setFormState((prev) => ({ ...prev, contactName: event.target.value }))}
                                disabled={saving}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">Dirección</label>
                            <input
                                className="border border-line rounded-xl px-4 py-3 w-full outline-none transition-all focus:border-black bg-white"
                                value={formState.address}
                                placeholder="Ej: Av. Principal y Calle 10"
                                onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
                                disabled={saving}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">Notas</label>
                            <textarea
                                className="border border-line rounded-xl px-4 py-3 w-full outline-none transition-all min-h-[92px] focus:border-black bg-white"
                                value={formState.notes}
                                placeholder="Observaciones operativas del proveedor"
                                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="mt-3 min-h-[20px]">
                        {errorMessage ? (
                            <p className="text-xs text-red">{errorMessage}</p>
                        ) : supplierWithSameDocument ? (
                            <p className="text-xs text-orange-700">Ese documento ya está asociado a {supplierWithSameDocument.name}.</p>
                        ) : supplierWithSameName ? (
                            <p className="text-xs text-orange-700">Ya existe un proveedor con ese nombre.</p>
                        ) : (
                            <p className="text-xs text-secondary">Nombre y RUC/documento deben ser únicos. El documento se usará automáticamente en compras.</p>
                        )}
                    </div>

                    <button
                        type="button"
                        className="mt-4 w-full px-4 py-3.5 rounded-xl bg-black text-white font-semibold hover:bg-primary transition-all disabled:opacity-60"
                        onClick={saveSupplier}
                        disabled={saving}
                    >
                        {editingId ? 'Guardar proveedor' : 'Registrar proveedor'}
                    </button>
                </div>

                <div>
                    <div className="rounded-2xl border border-line bg-surface/50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="w-full md:max-w-md">
                                <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">
                                    Buscar proveedor
                                </label>
                                <div className="relative">
                                    <Icon.MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        className="border border-line rounded-xl pl-10 pr-4 py-3 w-full outline-none transition-all focus:border-black bg-white"
                                        value={searchValue}
                                        placeholder="Busca por nombre, RUC, correo, teléfono o contacto"
                                        onChange={(event) => setSearchValue(event.target.value)}
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-secondary">
                                Mostrando {paginatedValues.length} de {filteredValues.length} proveedores
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-line overflow-hidden">
                        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_96px] md:grid-cols-[minmax(0,1.2fr)_180px_minmax(0,1fr)_120px] bg-surface/70 px-4 py-3 text-[11px] uppercase font-bold text-secondary tracking-wide">
                            <div>Proveedor</div>
                            <div className="hidden md:block">Documento</div>
                            <div>Contacto</div>
                            <div className="text-right">Acciones</div>
                        </div>
                        <div className="divide-y divide-line max-h-[560px] overflow-y-auto">
                            {filteredValues.length > 0 ? paginatedValues.map((supplier) => (
                                <div
                                    key={supplier.id}
                                    className={`grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_96px] md:grid-cols-[minmax(0,1.2fr)_180px_minmax(0,1fr)_120px] items-center gap-3 px-4 py-3 bg-white ${
                                        editingId === supplier.id ? 'ring-1 ring-primary/15 bg-primary/5' : ''
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm break-words">{supplier.name}</div>
                                        <div className="text-xs text-secondary mt-1 break-words">{supplier.address || supplier.notes || 'Sin dirección registrada'}</div>
                                    </div>
                                    <div className="hidden md:block min-w-0">
                                        <div className="text-sm font-medium break-words">{supplier.document || 'Sin documento'}</div>
                                        <div className="text-xs text-secondary mt-1 break-words">{supplier.contactName || 'Sin contacto'}</div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm break-words">{supplier.email || 'Sin correo'}</div>
                                        <div className="text-xs text-secondary mt-1 break-words">{supplier.phone || 'Sin teléfono'}</div>
                                        <div className="md:hidden text-xs text-secondary mt-1 break-words">{supplier.document || 'Sin documento'}</div>
                                    </div>
                                    <div className="flex items-center justify-end gap-1 shrink-0">
                                        <button
                                            type="button"
                                            className="w-9 h-9 rounded-lg border border-line bg-white hover:border-black transition-all flex items-center justify-center disabled:opacity-60"
                                            onClick={() => startEdit(supplier)}
                                            disabled={saving}
                                            aria-label={`Editar ${supplier.name}`}
                                        >
                                            <Icon.PencilSimple size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="w-9 h-9 rounded-lg border border-line bg-white hover:border-red-500 hover:text-red-600 transition-all flex items-center justify-center disabled:opacity-60"
                                            onClick={() => removeSupplier(supplier.id)}
                                            disabled={saving}
                                            aria-label={`Eliminar ${supplier.name}`}
                                        >
                                            <Icon.Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-4 py-8 text-sm text-secondary bg-white">
                                    {values.length === 0
                                        ? 'Aún no hay proveedores registrados.'
                                        : 'No hay coincidencias con la búsqueda actual.'}
                                </div>
                            )}
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="text-xs text-secondary">
                                Página {currentPage} de {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="px-3 py-2 rounded-lg border border-line text-sm font-semibold disabled:opacity-50"
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage <= 1}
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-2 rounded-lg border border-line text-sm font-semibold disabled:opacity-50"
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage >= totalPages}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
})
