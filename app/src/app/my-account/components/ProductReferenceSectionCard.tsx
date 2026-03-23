'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import type { ProductReferenceSection } from '@/lib/productReferenceData'

type ProductReferenceSectionCardProps = {
    section: ProductReferenceSection;
    values: string[];
    saving?: boolean;
    focused?: boolean;
    onChangeValues: (nextValues: string[]) => void;
}

const normalizeComparable = (value?: string | null) =>
    String(value || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase('es-EC')

export default React.memo(function ProductReferenceSectionCard({
    section,
    values,
    saving = false,
    focused = false,
    onChangeValues,
}: ProductReferenceSectionCardProps) {
    const ItemIcon = Icon[section.menuIcon]
    const [draftValue, setDraftValue] = React.useState('')
    const [searchValue, setSearchValue] = React.useState('')
    const [errorMessage, setErrorMessage] = React.useState('')
    const [editingValue, setEditingValue] = React.useState<string | null>(null)
    const [editingDraft, setEditingDraft] = React.useState('')
    const [page, setPage] = React.useState(1)

    const normalizedDraft = React.useMemo(() => normalizeComparable(draftValue), [draftValue])
    const normalizedSearch = React.useMemo(() => normalizeComparable(searchValue), [searchValue])
    const sortedValues = React.useMemo(
        () => [...values].sort((a, b) => a.localeCompare(b, 'es-EC', { sensitivity: 'base' })),
        [values]
    )
    const exactDraftMatch = React.useMemo(
        () => sortedValues.find((value) => normalizeComparable(value) === normalizedDraft) || '',
        [normalizedDraft, sortedValues]
    )
    const filteredValues = React.useMemo(() => {
        if (!normalizedSearch) return sortedValues
        return sortedValues.filter((value) => normalizeComparable(value).includes(normalizedSearch))
    }, [normalizedSearch, sortedValues])
    const pageSize = 8
    const totalPages = Math.max(1, Math.ceil(filteredValues.length / pageSize))
    const currentPage = Math.min(page, totalPages)
    const paginatedValues = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredValues.slice(start, start + pageSize)
    }, [currentPage, filteredValues])

    const addValue = React.useCallback(() => {
        const nextValue = draftValue.replace(/\s+/g, ' ').trim()
        if (!nextValue) {
            setErrorMessage(`Escribe una ${section.itemLabel} antes de agregar.`)
            return
        }
        if (exactDraftMatch) {
            setErrorMessage(`La ${section.itemLabel} "${exactDraftMatch}" ya está registrada.`)
            return
        }
        onChangeValues([...values, nextValue])
        setDraftValue('')
        setErrorMessage('')
    }, [draftValue, exactDraftMatch, onChangeValues, section.itemLabel, values])

    const removeValue = React.useCallback((value: string) => {
        onChangeValues(values.filter((item) => item !== value))
        if (editingValue === value) {
            setEditingValue(null)
            setEditingDraft('')
        }
    }, [editingValue, onChangeValues, values])

    const startEdit = React.useCallback((value: string) => {
        setEditingValue(value)
        setEditingDraft(value)
        setErrorMessage('')
    }, [])

    const saveEdit = React.useCallback(() => {
        if (!editingValue) return
        const nextValue = editingDraft.replace(/\s+/g, ' ').trim()
        if (!nextValue) {
            setErrorMessage(`La ${section.itemLabel} no puede quedar vacía.`)
            return
        }
        const duplicate = values.some((value) => value !== editingValue && normalizeComparable(value) === normalizeComparable(nextValue))
        if (duplicate) {
            setErrorMessage(`La ${section.itemLabel} "${nextValue}" ya existe.`)
            return
        }
        onChangeValues(values.map((value) => (value === editingValue ? nextValue : value)))
        setEditingValue(null)
        setEditingDraft('')
        setErrorMessage('')
    }, [editingDraft, editingValue, onChangeValues, section.itemLabel, values])

    React.useEffect(() => {
        if (!draftValue && !editingDraft) {
            setErrorMessage('')
        }
    }, [draftValue, editingDraft])

    React.useEffect(() => {
        setPage(1)
    }, [searchValue, section.key])

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
                        <p className="text-secondary text-xs mt-1 max-w-xl">{section.description}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1 rounded-full bg-surface text-xs font-bold text-secondary shrink-0">
                        {values.length} opciones
                    </div>
                    <div className="px-3 py-1 rounded-full bg-surface text-xs font-bold text-secondary shrink-0">
                        {filteredValues.length} visibles
                    </div>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
                <div>
                    <div className="rounded-2xl border border-line bg-surface/50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="w-full md:max-w-sm">
                                <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">
                                    Buscar {section.itemLabel}
                                </label>
                                <div className="relative">
                                    <Icon.MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        className="border border-line rounded-xl pl-10 pr-4 py-3 w-full outline-none transition-all focus:border-black bg-white"
                                        value={searchValue}
                                        placeholder={`Buscar ${section.itemLabel} registrada`}
                                        onChange={(event) => setSearchValue(event.target.value)}
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-secondary">
                                Mostrando {paginatedValues.length} de {filteredValues.length} resultados
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-line overflow-hidden">
                        <div className="grid grid-cols-[minmax(0,1fr)_110px] sm:grid-cols-[minmax(0,1fr)_132px] bg-surface/70 px-4 py-3 text-[11px] uppercase font-bold text-secondary tracking-wide">
                            <div>{section.title}</div>
                            <div className="text-right">Acciones</div>
                        </div>
                        <div className="divide-y divide-line max-h-[460px] overflow-y-auto">
                            {filteredValues.length > 0 ? paginatedValues.map((value) => {
                    const isEditing = editingValue === value
                    return (
                                <div key={`${section.key}-${value}`} className="grid grid-cols-[minmax(0,1fr)_110px] sm:grid-cols-[minmax(0,1fr)_132px] items-center gap-3 px-4 py-3 bg-white">
                            {isEditing ? (
                                    <div className="col-span-2 flex flex-col lg:flex-row gap-2">
                                    <input
                                        className="border border-line rounded-xl px-3 py-2.5 w-full outline-none transition-all focus:border-black"
                                        value={editingDraft}
                                        onChange={(event) => setEditingDraft(event.target.value)}
                                        disabled={saving}
                                    />
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            type="button"
                                            className="px-3 py-2.5 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-60"
                                            onClick={saveEdit}
                                            disabled={saving}
                                        >
                                            Guardar
                                        </button>
                                        <button
                                            type="button"
                                            className="px-3 py-2.5 rounded-xl border border-line text-sm font-semibold disabled:opacity-60"
                                            onClick={() => {
                                                setEditingValue(null)
                                                setEditingDraft('')
                                                setErrorMessage('')
                                            }}
                                            disabled={saving}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                    </div>
                            ) : (
                                    <>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-sm break-words">{value}</div>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 shrink-0">
                                        <button
                                            type="button"
                                            className="w-9 h-9 rounded-lg border border-line bg-white hover:border-black transition-all flex items-center justify-center disabled:opacity-60"
                                            onClick={() => startEdit(value)}
                                            disabled={saving}
                                            aria-label={`Editar ${value}`}
                                        >
                                            <Icon.PencilSimple size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="w-9 h-9 rounded-lg border border-line bg-white hover:border-red-500 hover:text-red-600 transition-all flex items-center justify-center disabled:opacity-60"
                                            onClick={() => removeValue(value)}
                                            disabled={saving}
                                            aria-label={`Eliminar ${value}`}
                                        >
                                            <Icon.Trash size={16} />
                                        </button>
                                    </div>
                                    </>
                            )}
                        </div>
                    )
                            }) : (
                                <div className="px-4 py-8 text-sm text-secondary bg-white">
                                    {values.length === 0
                                        ? `Aún no hay ${section.itemLabel}s registradas.`
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

                <div className="rounded-2xl border border-line bg-surface/50 p-4 h-fit">
                    <div className="text-sm font-semibold">Registrar nueva {section.itemLabel}</div>
                    <p className="text-secondary text-xs mt-1">
                        Verifica primero si ya existe usando la búsqueda del catálogo.
                    </p>
                    <div className="mt-4">
                        <label className="text-secondary text-[11px] uppercase font-bold mb-2 block">
                            Nueva {section.itemLabel}
                        </label>
                        <input
                            className={`border rounded-xl px-4 py-3.5 w-full outline-none transition-all bg-white ${
                                errorMessage ? 'border-red focus:border-red' : 'border-line focus:border-black'
                            }`}
                            value={draftValue}
                            placeholder={section.placeholder}
                            onChange={(event) => setDraftValue(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    addValue()
                                }
                            }}
                            disabled={saving}
                        />
                    </div>
                    <div className="mt-3 min-h-[20px]">
                        {errorMessage ? (
                            <p className="text-xs text-red">{errorMessage}</p>
                        ) : exactDraftMatch ? (
                            <p className="text-xs text-orange-700">Ya existe una coincidencia exacta: {exactDraftMatch}</p>
                        ) : (
                            <p className="text-xs text-secondary">No se agregan duplicados exactos, incluso si cambian mayúsculas o espacios.</p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="mt-4 w-full px-4 py-3.5 rounded-xl bg-black text-white font-semibold hover:bg-primary transition-all disabled:opacity-60"
                        onClick={addValue}
                        disabled={saving || !draftValue.trim() || Boolean(exactDraftMatch)}
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    )
})
