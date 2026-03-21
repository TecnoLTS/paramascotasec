'use client'

import React, { useEffect, useMemo, useState } from 'react'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ProductType } from '@/type/ProductType'
import {
    hasProductSizeGuide,
    parseProductSizeGuideRows,
} from '@/lib/productSizeGuide'

interface Props {
    data: ProductType | null;
    isOpen: boolean;
    onClose: () => void;
}

const ModalSizeguide: React.FC<Props> = ({ data, isOpen, onClose }) => {
    const [activeSize, setActiveSize] = useState<string>('')

    const sizeGuideRows = useMemo(
        () => parseProductSizeGuideRows(String(data?.attributes?.sizeGuideRows || '')),
        [data?.attributes?.sizeGuideRows]
    )
    const sizeGuideNotes = String(data?.attributes?.sizeGuideNotes || '').trim()
    const availableSizes = React.useMemo(() => {
        const fromGuide = sizeGuideRows.map((row) => row.size).filter(Boolean)
        const fromProduct = Array.isArray(data?.sizes) ? data.sizes.filter(Boolean) : []
        return Array.from(new Set([...fromGuide, ...fromProduct]))
    }, [data, sizeGuideRows])

    useEffect(() => {
        if (!isOpen) return

        const nextActiveSize = sizeGuideRows[0]?.size || availableSizes[0] || ''
        setActiveSize(nextActiveSize)

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [availableSizes, isOpen, onClose, sizeGuideRows])

    const filteredRows = useMemo(() => {
        if (!activeSize) return sizeGuideRows
        const rows = sizeGuideRows.filter((row) => row.size === activeSize)
        return rows.length > 0 ? rows : sizeGuideRows
    }, [activeSize, sizeGuideRows])

    const hasGuide = hasProductSizeGuide(sizeGuideRows, sizeGuideNotes)

    return (
        <div className={`modal-sizeguide-block ${isOpen ? 'open' : ''}`} onClick={onClose} aria-hidden={!isOpen}>
            <div
                className={`modal-sizeguide-main md:p-10 p-6 rounded-[32px] ${isOpen ? 'open' : ''}`}
                onClick={(e) => { e.stopPropagation() }}
            >
                <button
                    type="button"
                    className="close-btn absolute right-5 top-5 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center duration-300 cursor-pointer hover:bg-primary"
                    onClick={onClose}
                    aria-label="Cerrar guía de tallas"
                >
                    <Icon.X size={18} weight="bold" />
                </button>

                <div className="heading3">Guía de tallas</div>
                <div className="text-secondary mt-2">
                    Consulta las medidas recomendadas para esta prenda antes de elegir una variante.
                </div>

                {availableSizes.length > 0 && (
                    <div className="mt-6">
                        <div className="heading6">Tallas disponibles</div>
                        <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                            {availableSizes.map((item, index) => (
                                <button
                                    type="button"
                                    className={`size-item min-w-12 h-12 px-4 flex items-center justify-center text-button rounded-full bg-white border border-line ${activeSize === item ? 'active' : ''}`}
                                    key={`${item}-${index}`}
                                    onClick={() => setActiveSize(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {hasGuide ? (
                    <>
                        {sizeGuideNotes && (
                            <div className="mt-6 rounded-2xl border border-line bg-surface px-5 py-4 text-secondary">
                                {sizeGuideNotes}
                            </div>
                        )}

                        {filteredRows.length > 0 && (
                            <div className="mt-6 overflow-x-auto">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Talla</th>
                                            <th>Cuello</th>
                                            <th>Pecho</th>
                                            <th>Largo</th>
                                            <th>Peso recomendado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.map((row, index) => (
                                            <tr key={`${row.size}-${index}`}>
                                                <td>{row.size || '-'}</td>
                                                <td>{row.neck || '-'}</td>
                                                <td>{row.chest || '-'}</td>
                                                <td>{row.length || '-'}</td>
                                                <td>{row.weight || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface px-5 py-6 text-secondary">
                        Este producto todavía no tiene una guía de tallas personalizada. Puedes elegir la talla desde la variante publicada.
                    </div>
                )}
            </div>
        </div>
    )
}

export default ModalSizeguide
