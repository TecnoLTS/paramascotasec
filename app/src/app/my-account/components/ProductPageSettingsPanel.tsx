'use client'

import React from 'react'

import type { ProductPageSettings } from '@/lib/api/settings'

type ProductPageSettingsPanelProps = {
    settings: ProductPageSettings;
    onChange: (settings: ProductPageSettings) => void;
    onSave: () => Promise<void> | void;
}

export default React.memo(function ProductPageSettingsPanel({
    settings,
    onChange,
    onSave,
}: ProductPageSettingsPanelProps) {
    return (
        <div className="tab text-content w-full">
            <div className="heading5 pb-4">Ficha de producto (común)</div>
            <p className="text-secondary mb-6">Configura textos que se muestran en todas las fichas.</p>
            <div className="p-6 rounded-xl border border-line bg-surface">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">Entrega estimada</label>
                        <input
                            className="border border-line rounded-lg px-4 py-2 w-full"
                            value={settings.deliveryEstimate}
                            onChange={(event) => onChange({ ...settings, deliveryEstimate: event.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">Personas viendo</label>
                        <input
                            type="number"
                            min="0"
                            className="border border-line rounded-lg px-4 py-2 w-full"
                            value={settings.viewerCount}
                            onChange={(event) => onChange({ ...settings, viewerCount: Number(event.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">Envío gratis desde ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="border border-line rounded-lg px-4 py-2 w-full"
                            value={settings.freeShippingThreshold}
                            onChange={(event) => onChange({ ...settings, freeShippingThreshold: Number(event.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">Horario de soporte</label>
                        <input
                            className="border border-line rounded-lg px-4 py-2 w-full"
                            value={settings.supportHours}
                            onChange={(event) => onChange({ ...settings, supportHours: event.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-secondary text-xs uppercase font-bold mb-2 block">Días de devolución</label>
                        <input
                            type="number"
                            min="0"
                            className="border border-line rounded-lg px-4 py-2 w-full"
                            value={settings.returnDays}
                            onChange={(event) => onChange({ ...settings, returnDays: Number(event.target.value) })}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button className="button-main py-2 px-6" onClick={onSave}>
                        Guardar configuración
                    </button>
                </div>
            </div>
        </div>
    )
})
