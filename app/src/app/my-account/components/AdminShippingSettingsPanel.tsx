'use client'

import React from 'react'

export type AdminShippingRates = {
    delivery: number;
    pickup: number;
    taxRate: number;
    storeAddress: string;
    storeLatitude: number;
    storeLongitude: number;
    freeShippingRadiusKm: number;
    shippingKmFlatRateLimit: number;
    shippingPerKmRate: number;
    mapSessionLookupLimit: number;
    mapMinSearchChars: number;
    mapLookupCooldownSeconds: number;
}

type AdminShippingSettingsPanelProps = {
    shippingRates: AdminShippingRates;
    shippingLoading: boolean;
    shippingSaving: boolean;
    onChange: (next: AdminShippingRates) => void;
    onSave: () => void;
    title?: string;
    description?: string;
}

export default React.memo(function AdminShippingSettingsPanel({
    shippingRates,
    shippingLoading,
    shippingSaving,
    onChange,
    onSave,
    title = 'Configuración de envíos y mapa',
    description = 'Administra costos, tarifa por km, radio gratis, dirección base del local y límites de uso del mapa.',
}: AdminShippingSettingsPanelProps) {
    return (
        <div className="p-6 rounded-xl border border-line bg-surface">
            <div className="mb-5">
                <h6 className="heading6">{title}</h6>
                <p className="text-secondary text-sm mt-1">{description}</p>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                        <label
                            htmlFor="shippingDelivery"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Se suma al total del pedido cuando el cliente elige envío a domicilio fuera del radio gratis."
                        >
                            Envío a domicilio ($)
                        </label>
                        <input
                            id="shippingDelivery"
                            type="number"
                            step="0.01"
                            min="0"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.delivery}
                            onChange={(e) => onChange({ ...shippingRates, delivery: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                        <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Este valor se cobra cuando la ubicación del cliente supera el radio gratis.
                        </p>
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingPickup"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Costo aplicado cuando el cliente recoge en tienda."
                        >
                            Retiro en tienda ($)
                        </label>
                        <input
                            id="shippingPickup"
                            type="number"
                            step="0.01"
                            min="0"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.pickup}
                            onChange={(e) => onChange({ ...shippingRates, pickup: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                        <p className="text-[11px] text-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Define el cargo por retiro en tienda; 0 significa retiro gratuito.
                        </p>
                    </div>
                    <div className="md:col-span-2 group">
                        <label
                            htmlFor="shippingStoreAddress"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Dirección base del local usada para medir el radio de envío gratis."
                        >
                            Dirección base del local
                        </label>
                        <input
                            id="shippingStoreAddress"
                            type="text"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.storeAddress}
                            onChange={(e) => onChange({ ...shippingRates, storeAddress: e.target.value })}
                            disabled={shippingLoading || shippingSaving}
                        />
                        <p className="text-secondary text-xs mt-2">Se usa como origen para calcular si el cliente recibe envío gratis hasta el radio configurado.</p>
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingStoreLatitude"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Latitud del local comercial."
                        >
                            Latitud del local
                        </label>
                        <input
                            id="shippingStoreLatitude"
                            type="number"
                            step="0.000001"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.storeLatitude}
                            onChange={(e) => onChange({ ...shippingRates, storeLatitude: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingStoreLongitude"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Longitud del local comercial."
                        >
                            Longitud del local
                        </label>
                        <input
                            id="shippingStoreLongitude"
                            type="number"
                            step="0.000001"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.storeLongitude}
                            onChange={(e) => onChange({ ...shippingRates, storeLongitude: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingFreeRadius"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Radio en kilómetros dentro del cual el envío a domicilio será gratis."
                        >
                            Radio gratis (km)
                        </label>
                        <input
                            id="shippingFreeRadius"
                            type="number"
                            step="0.1"
                            min="0"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.freeShippingRadiusKm}
                            onChange={(e) => onChange({ ...shippingRates, freeShippingRadiusKm: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                        <p className="text-secondary text-xs mt-2">Si el cliente está dentro de este radio, el envío base pasa a $0 antes de impuestos.</p>
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingKmFlatRateLimit"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Kilómetros hasta donde se aplica la tarifa plana. Más allá se suma el recargo por km."
                        >
                            Límite tarifa plana (km)
                        </label>
                        <input
                            id="shippingKmFlatRateLimit"
                            type="number"
                            step="0.1"
                            min="0"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.shippingKmFlatRateLimit}
                            onChange={(e) => onChange({ ...shippingRates, shippingKmFlatRateLimit: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                        <p className="text-secondary text-xs mt-2">Desde {shippingRates.freeShippingRadiusKm} km hasta este valor se cobra la tarifa plana.</p>
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingPerKmRate"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Recargo adicional por cada kilómetro más allá del límite de tarifa plana."
                        >
                            Recargo por km adicional ($)
                        </label>
                        <input
                            id="shippingPerKmRate"
                            type="number"
                            step="0.01"
                            min="0"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.shippingPerKmRate}
                            onChange={(e) => onChange({ ...shippingRates, shippingPerKmRate: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                        <p className="text-secondary text-xs mt-2">Se suma por cada km que exceda el límite de tarifa plana.</p>
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingMapSessionLimit"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Número máximo de consultas de mapa permitidas por sesión de cliente."
                        >
                            Límite mapa por sesión
                        </label>
                        <input
                            id="shippingMapSessionLimit"
                            type="number"
                            step="1"
                            min="1"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.mapSessionLookupLimit}
                            onChange={(e) => onChange({ ...shippingRates, mapSessionLookupLimit: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingMapMinSearchChars"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Cantidad mínima de caracteres antes de permitir una búsqueda manual en el mapa."
                        >
                            Mínimo caracteres búsqueda
                        </label>
                        <input
                            id="shippingMapMinSearchChars"
                            type="number"
                            step="1"
                            min="3"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.mapMinSearchChars}
                            onChange={(e) => onChange({ ...shippingRates, mapMinSearchChars: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                    </div>
                    <div className="group">
                        <label
                            htmlFor="shippingMapCooldown"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Segundos de espera entre una consulta de mapa y la siguiente."
                        >
                            Enfriamiento entre consultas (s)
                        </label>
                        <input
                            id="shippingMapCooldown"
                            type="number"
                            step="1"
                            min="0"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.mapLookupCooldownSeconds}
                            onChange={(e) => onChange({ ...shippingRates, mapLookupCooldownSeconds: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                    </div>
                    <div className="md:col-span-2 group">
                        <label
                            htmlFor="shippingTaxRate"
                            className="text-secondary text-xs uppercase font-bold mb-2 block"
                            title="Porcentaje de IVA que se suma al costo de envío."
                        >
                            IVA aplicado al envío (%)
                        </label>
                        <input
                            id="shippingTaxRate"
                            type="number"
                            step="0.1"
                            min="0"
                            className="border border-line px-4 py-2 rounded-lg w-full"
                            value={shippingRates.taxRate}
                            onChange={(e) => onChange({ ...shippingRates, taxRate: Number(e.target.value) })}
                            disabled={shippingLoading || shippingSaving}
                        />
                        <p className="text-secondary text-xs mt-2">Se suma al envío para cubrir impuestos. Ej: 15% incrementa el costo final.</p>
                    </div>
                </div>
                <button
                    className="button-main py-2 px-6"
                    onClick={onSave}
                    disabled={shippingLoading || shippingSaving}
                >
                    {shippingSaving ? 'Guardando...' : 'Guardar Envío'}
                </button>
            </div>
        </div>
    )
})
