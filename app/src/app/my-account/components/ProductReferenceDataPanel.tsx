'use client'

import React from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr"

import {
    createProductReferenceKeyRecord,
    PRODUCT_REFERENCE_SECTIONS,
    PRODUCT_SYSTEM_REFERENCE_GROUPS,
    type ProductReferenceData,
    type ProductReferenceKey,
} from '@/lib/productReferenceData'

type ProductReferenceDataPanelProps = {
    data: ProductReferenceData;
    loading?: boolean;
    saving?: boolean;
    focusKey?: ProductReferenceKey | null;
    onChange: (next: ProductReferenceData) => void;
    onSave: () => Promise<void> | void;
}

export default React.memo(function ProductReferenceDataPanel({
    data,
    loading = false,
    saving = false,
    focusKey = null,
    onChange,
    onSave,
}: ProductReferenceDataPanelProps) {
    const sectionRefs = React.useRef<Record<ProductReferenceKey, HTMLDivElement | null>>(
        createProductReferenceKeyRecord(() => null),
    )
    const [draftValues, setDraftValues] = React.useState<Record<ProductReferenceKey, string>>(() =>
        createProductReferenceKeyRecord(() => ''),
    )

    const setDraftValue = React.useCallback((key: ProductReferenceKey, value: string) => {
        setDraftValues((prev) => ({ ...prev, [key]: value }))
    }, [])

    const addValue = React.useCallback((key: ProductReferenceKey) => {
        const nextValue = String(draftValues[key] || '').replace(/\s+/g, ' ').trim()
        if (!nextValue) return

        const currentValues = Array.isArray(data[key]) ? data[key] : []
        const exists = currentValues.some((value) => value.localeCompare(nextValue, 'es-EC', { sensitivity: 'accent' }) === 0)
            || currentValues.some((value) => value.toLocaleLowerCase('es-EC') === nextValue.toLocaleLowerCase('es-EC'))
        if (exists) {
            setDraftValue(key, '')
            return
        }

        onChange({
            ...data,
            [key]: [...currentValues, nextValue],
        })
        setDraftValue(key, '')
    }, [data, draftValues, onChange, setDraftValue])

    const removeValue = React.useCallback((key: ProductReferenceKey, value: string) => {
        onChange({
            ...data,
            [key]: (data[key] || []).filter((item) => item !== value),
        })
    }, [data, onChange])

    React.useEffect(() => {
        if (!focusKey) return
        const node = sectionRefs.current[focusKey]
        if (!node) return
        node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, [focusKey, loading])

    return (
        <div className="tab text-content w-full">
            <div className="heading5 pb-4">Catálogos operativos del producto</div>
            <p className="text-secondary mb-6">
                Convierte campos repetitivos del editor en opciones seleccionables. Si falta una marca, proveedor, talla
                o material, regístralo aquí y luego aparecerá como select en el alta de productos.
            </p>

            <div className="p-5 rounded-xl border border-line bg-surface mb-6">
                <div className="text-sm font-semibold mb-3">Taxonomía fija del sistema</div>
                <p className="text-secondary text-xs mb-4">
                    Categoría pública, tipo de producto y mascota se mantienen controlados para no romper filtros,
                    colecciones y reglas de catálogo. Lo editable aquí son las listas operativas que antes estaban libres.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRODUCT_SYSTEM_REFERENCE_GROUPS.map((group) => (
                        <div key={group.title} className="rounded-xl border border-line bg-white p-4">
                            <div className="text-xs uppercase font-bold text-secondary mb-2">{group.title}</div>
                            <p className="text-secondary text-xs mb-3">{group.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {group.values.map((value) => (
                                    <span key={value} className="px-3 py-1.5 rounded-full bg-surface text-sm font-semibold">
                                        {value}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 rounded-xl border border-line bg-white">
                {loading ? (
                    <div className="py-12 text-center text-secondary">Cargando catálogos...</div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {PRODUCT_REFERENCE_SECTIONS.map((section) => (
                            <div
                                key={section.key}
                                ref={(node) => { sectionRefs.current[section.key] = node }}
                                className={`rounded-xl border p-5 transition-all ${
                                    focusKey === section.key
                                        ? 'border-black bg-blue-50/40 ring-1 ring-black/10'
                                        : 'border-line bg-surface'
                                }`}
                            >
                                <div className="mb-4">
                                    <div className="text-sm font-semibold">{section.title}</div>
                                    <p className="text-secondary text-xs mt-1">{section.description}</p>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        className="border border-line rounded-lg px-4 py-3 w-full outline-none transition-all focus:border-black"
                                        value={draftValues[section.key]}
                                        placeholder={section.placeholder}
                                        onChange={(event) => setDraftValue(section.key, event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault()
                                                addValue(section.key)
                                            }
                                        }}
                                        disabled={saving}
                                    />
                                    <button
                                        type="button"
                                        className="px-4 py-3 rounded-lg border border-black font-semibold hover:bg-black hover:text-white transition-all disabled:opacity-60"
                                        onClick={() => addValue(section.key)}
                                        disabled={saving}
                                    >
                                        Agregar
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {(data[section.key] || []).length > 0 ? (
                                        (data[section.key] || []).map((value) => (
                                            <span
                                                key={`${section.key}-${value}`}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-line text-sm"
                                            >
                                                <span>{value}</span>
                                                <button
                                                    type="button"
                                                    className="text-secondary hover:text-red transition-colors"
                                                    onClick={() => removeValue(section.key, value)}
                                                    disabled={saving}
                                                    aria-label={`Quitar ${value}`}
                                                >
                                                    <Icon.X size={14} />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <div className="text-xs text-secondary">Aun no hay opciones registradas.</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button className="button-main py-2 px-6 disabled:opacity-60" onClick={onSave} disabled={saving || loading}>
                        {saving ? 'Guardando...' : 'Guardar catálogos'}
                    </button>
                </div>
            </div>
        </div>
    )
})
