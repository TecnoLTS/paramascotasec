'use client'

import React from 'react'

import type { PricingCalc, PricingMargins, PricingRules } from '@/lib/api/settings'

type PricingSettingsTab = 'margins' | 'calculations' | 'pricing-rules'

type PricingSettingsPanelProps = {
    activeTab: PricingSettingsTab
    marginSettings: PricingMargins
    calcSettings: PricingCalc
    pricingRules: PricingRules
    setMarginSettings: React.Dispatch<React.SetStateAction<PricingMargins>>
    setCalcSettings: React.Dispatch<React.SetStateAction<PricingCalc>>
    setPricingRules: React.Dispatch<React.SetStateAction<PricingRules>>
    onSaveMargins: () => Promise<void>
    onSaveCalculations: () => Promise<void>
    onSavePricingRules: () => Promise<void>
}

const toNumber = (value: unknown, fallback = 0, min = 0, max?: number) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return fallback
    if (parsed < min) return min
    if (typeof max === 'number' && parsed > max) return max
    return parsed
}

function PricingSettingsPanel({
    activeTab,
    marginSettings,
    calcSettings,
    pricingRules,
    setMarginSettings,
    setCalcSettings,
    setPricingRules,
    onSaveMargins,
    onSaveCalculations,
    onSavePricingRules,
}: PricingSettingsPanelProps) {
    if (activeTab === 'margins') {
        return (
            <div className="tab text-content w-full">
                <div className="heading5 pb-4">Márgenes y rentabilidad</div>
                <p className="text-secondary mb-6">Define objetivos de margen para tus precios recomendados.</p>
                <div className="p-6 rounded-xl border border-line bg-surface">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                            <label
                                className="text-secondary text-xs uppercase font-bold mb-2 block"
                                title="Margen usado como referencia para el precio sugerido. A mayor margen, sube el precio y la utilidad esperada."
                            >
                                Margen base (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                className="border border-line px-4 py-2 rounded-lg w-full"
                                value={marginSettings.baseMargin}
                                onChange={(e) => setMarginSettings((current) => ({
                                    ...current,
                                    baseMargin: toNumber(e.target.value, current.baseMargin),
                                }))}
                            />
                            <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Aumentar el margen base eleva el precio recomendado y la utilidad por venta.
                            </p>
                        </div>
                        <div className="group">
                            <label
                                className="text-secondary text-xs uppercase font-bold mb-2 block"
                                title="Piso de rentabilidad. Si el margen configurado es menor, el sistema no sugerirá precios por debajo de este valor."
                            >
                                Margen mínimo (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                className="border border-line px-4 py-2 rounded-lg w-full"
                                value={marginSettings.minMargin}
                                onChange={(e) => setMarginSettings((current) => ({
                                    ...current,
                                    minMargin: toNumber(e.target.value, current.minMargin),
                                }))}
                            />
                            <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Define el margen más bajo permitido; protege la utilidad aunque el precio competitivo sea menor.
                            </p>
                        </div>
                        <div className="group">
                            <label
                                className="text-secondary text-xs uppercase font-bold mb-2 block"
                                title="Meta principal de rentabilidad. El motor de precios intenta llegar a este margen."
                            >
                                Margen objetivo (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                className="border border-line px-4 py-2 rounded-lg w-full"
                                value={marginSettings.targetMargin}
                                onChange={(e) => setMarginSettings((current) => ({
                                    ...current,
                                    targetMargin: toNumber(e.target.value, current.targetMargin),
                                }))}
                            />
                            <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                A mayor margen objetivo, mayor precio sugerido para alcanzar la rentabilidad deseada.
                            </p>
                        </div>
                        <div className="group">
                            <label
                                className="text-secondary text-xs uppercase font-bold mb-2 block"
                                title="Reserva adicional para aplicar descuentos sin romper la rentabilidad."
                            >
                                Buffer promociones (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                className="border border-line px-4 py-2 rounded-lg w-full"
                                value={marginSettings.promoBuffer}
                                onChange={(e) => setMarginSettings((current) => ({
                                    ...current,
                                    promoBuffer: toNumber(e.target.value, current.promoBuffer),
                                }))}
                            />
                            <p className="text-secondary text-xs mt-2">Reserva margen extra para descuentos sin afectar rentabilidad.</p>
                            <p className="text-[11px] text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Un buffer más alto sube el precio base para absorber promociones sin perder margen.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="button-main py-2 px-6" onClick={onSaveMargins}>
                            Guardar Márgenes
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (activeTab === 'calculations') {
        return (
            <div className="tab text-content w-full">
                <div className="heading5 pb-4">Cálculos y redondeos</div>
                <p className="text-secondary mb-6">Ajusta cómo se calculan los precios finales.</p>
                <div className="p-6 rounded-xl border border-line bg-surface">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                            <label
                                className="text-secondary text-xs uppercase font-bold mb-2 block"
                                title="Define cómo se calcula el precio final y el impacto directo del margen."
                            >
                                Estrategia de precio
                            </label>
                            <select
                                className="border border-line px-4 py-2 rounded-lg w-full"
                                value={calcSettings.strategy}
                                onChange={(e) => {
                                    const nextStrategy = e.target.value as PricingCalc['strategy']
                                    setCalcSettings((current) => ({ ...current, strategy: nextStrategy }))
                                }}
                            >
                                <option
                                    value="cost_plus"
                                    title="Calcula precio sumando el margen al costo. Subir el margen aumenta el precio de forma directa."
                                >
                                    Costo + margen
                                </option>
                                <option
                                    value="target_margin"
                                    title="Ajusta el precio para alcanzar el margen objetivo sobre el precio de venta. A mayor margen, mayor PVP."
                                >
                                    Margen objetivo
                                </option>
                                <option
                                    value="competitive"
                                    title="Prioriza precio competitivo con el mercado; el margen puede reducirse para mantener ventas."
                                >
                                    Competitivo
                                </option>
                            </select>
                            <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Pasa el mouse sobre cada opción para ver cómo impacta el margen y el precio del producto.
                            </p>
                        </div>
                        <div className="group">
                            <label
                                className="text-secondary text-xs uppercase font-bold mb-2 block"
                                title="Define el salto de redondeo del precio final. Ej: 0,05 redondea a múltiplos de 5 centavos."
                            >
                                Redondeo ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="border border-line px-4 py-2 rounded-lg w-full"
                                value={calcSettings.rounding}
                                onChange={(e) => setCalcSettings((current) => ({
                                    ...current,
                                    rounding: toNumber(e.target.value, current.rounding),
                                }))}
                            />
                            <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Un redondeo mayor simplifica precios, pero puede subir o bajar el PVP final.
                            </p>
                        </div>
                        <div className="group">
                            <label
                                className="text-secondary text-xs uppercase font-bold mb-2 block"
                                title="Indica si el precio de venta mostrado al cliente incluye IVA."
                            >
                                Incluir IVA en PVP
                            </label>
                            <select
                                className="border border-line px-4 py-2 rounded-lg w-full"
                                value={calcSettings.includeVatInPvp ? 'yes' : 'no'}
                                onChange={(e) => setCalcSettings((current) => ({
                                    ...current,
                                    includeVatInPvp: e.target.value === 'yes',
                                }))}
                            >
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                            </select>
                            <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Si está en “Sí”, el PVP ya incluye IVA; si está en “No”, el IVA se suma aparte.
                            </p>
                        </div>
                        <div className="group">
                            <label
                                className="text-secondary text-xs uppercase font-bold mb-2 block"
                                title="Porcentaje extra para cubrir variaciones de costos logísticos."
                            >
                                Buffer de envío (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                className="border border-line px-4 py-2 rounded-lg w-full"
                                value={calcSettings.shippingBuffer}
                                onChange={(e) => setCalcSettings((current) => ({
                                    ...current,
                                    shippingBuffer: toNumber(e.target.value, current.shippingBuffer),
                                }))}
                            />
                            <p className="text-secondary text-xs mt-2">Cubre variaciones de costos logísticos.</p>
                            <p className="text-[11px] text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Un buffer más alto aumenta el precio para proteger el margen ante costos de envío variables.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="button-main py-2 px-6" onClick={onSaveCalculations}>
                            Guardar Cálculos
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="tab text-content w-full">
            <div className="heading5 pb-4">Reglas de precios</div>
            <p className="text-secondary mb-6">Define descuentos automáticos y limpieza de inventario.</p>
            <div className="p-6 rounded-xl border border-line bg-surface">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                        <label
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Cantidad mínima para activar el descuento por volumen."
                        >
                            Volumen mínimo (unidades)
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={pricingRules.bulkThreshold}
                            onChange={(e) => setPricingRules((current) => ({
                                ...current,
                                bulkThreshold: toNumber(e.target.value, current.bulkThreshold, 1),
                            }))}
                        />
                        <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Al subir el umbral, el descuento se activa en compras más grandes.
                        </p>
                    </div>
                    <div className="group">
                        <label
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Porcentaje que se descuenta cuando se cumple el volumen mínimo."
                        >
                            Descuento por volumen (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={pricingRules.bulkDiscount}
                            onChange={(e) => setPricingRules((current) => ({
                                ...current,
                                bulkDiscount: toNumber(e.target.value, current.bulkDiscount, 0, 90),
                            }))}
                        />
                        <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Descuentos altos reducen el precio unitario y pueden bajar el margen.
                        </p>
                    </div>
                    <div className="group">
                        <label
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Tiempo sin rotación tras el cual se activa liquidación."
                        >
                            Días para liquidación
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={pricingRules.clearanceThreshold}
                            onChange={(e) => setPricingRules((current) => ({
                                ...current,
                                clearanceThreshold: toNumber(e.target.value, current.clearanceThreshold, 1),
                            }))}
                        />
                        <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Menos días activan antes la liquidación para mover inventario.
                        </p>
                    </div>
                    <div className="group">
                        <label
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Porcentaje de descuento aplicado en productos en liquidación."
                        >
                            Descuento liquidación (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={pricingRules.clearanceDiscount}
                            onChange={(e) => setPricingRules((current) => ({
                                ...current,
                                clearanceDiscount: toNumber(e.target.value, current.clearanceDiscount, 0, 90),
                            }))}
                        />
                        <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Descuentos altos aceleran ventas pero reducen margen y utilidad.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button className="button-main py-2 px-6" onClick={onSavePricingRules}>
                        Guardar Reglas
                    </button>
                </div>
            </div>
        </div>
    )
}

export default React.memo(PricingSettingsPanel)
