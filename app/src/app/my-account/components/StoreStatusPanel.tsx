'use client'

import React from 'react'

import type { StoreStatusSettings } from '@/lib/api/settings'

type StoreStatusPanelProps = {
    storeStatus: StoreStatusSettings
    storeStatusLoading: boolean
    storeStatusSaving: boolean
    defaultPauseMessage: string
    formatDateTime: (value: string, options?: Intl.DateTimeFormatOptions) => string
    setStoreStatus: React.Dispatch<React.SetStateAction<StoreStatusSettings>>
    onSaveStoreStatus: (nextSalesEnabled?: boolean) => Promise<void>
}

function StoreStatusPanel({
    storeStatus,
    storeStatusLoading,
    storeStatusSaving,
    defaultPauseMessage,
    formatDateTime,
    setStoreStatus,
    onSaveStoreStatus,
}: StoreStatusPanelProps) {
    return (
        <div className="tab text-content w-full">
            <div className="heading5 pb-4">Ventas en línea</div>
            <p className="text-secondary mb-6">Activa o detén la tienda para mantenimiento o fallas operativas.</p>
            <div className="p-6 rounded-xl border border-line bg-surface">
                {storeStatusLoading ? (
                    <div className="text-sm text-secondary">Cargando estado de ventas...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-lg border ${storeStatus.salesEnabled ? 'bg-white border-success/30' : 'bg-red/5 border-red/30'}`}>
                                <div className="text-xs uppercase font-bold text-secondary">Estado actual</div>
                                <div className={`heading5 mt-1 ${storeStatus.salesEnabled ? 'text-success' : 'text-red'}`}>
                                    {storeStatus.salesEnabled ? 'Ventas activas' : 'Ventas apagadas'}
                                </div>
                                <p className="text-xs text-secondary mt-2">
                                    {storeStatus.salesEnabled
                                        ? 'Los clientes pueden cotizar y pagar pedidos.'
                                        : 'La tienda bloquea cotizaciones y compras nuevas.'}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-white border border-line">
                                <div className="text-xs uppercase font-bold text-secondary">Última actualización</div>
                                <div className="text-sm font-semibold mt-1">
                                    {storeStatus.updatedAt ? formatDateTime(storeStatus.updatedAt) : 'Sin registro'}
                                </div>
                                <p className="text-xs text-secondary mt-2">
                                    Usuario: {storeStatus.updatedBy || 'Sin registro'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="text-secondary text-xs uppercase font-bold mb-2 block">
                                Mensaje cuando las ventas estén apagadas
                            </label>
                            <textarea
                                className="border border-line rounded-lg px-4 py-3 w-full min-h-[120px]"
                                value={storeStatus.message}
                                onChange={(e) => setStoreStatus((prev) => ({ ...prev, message: e.target.value }))}
                                placeholder={defaultPauseMessage}
                                disabled={storeStatusSaving}
                            />
                            <p className="text-[11px] text-secondary mt-2">
                                Este texto se devuelve al cliente cuando intenta comprar con la tienda detenida.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                className={`py-2 px-6 rounded-lg font-semibold ${storeStatus.salesEnabled ? 'bg-red text-white' : 'bg-success text-white'}`}
                                onClick={() => onSaveStoreStatus(!storeStatus.salesEnabled)}
                                disabled={storeStatusSaving}
                            >
                                {storeStatusSaving
                                    ? 'Guardando...'
                                    : storeStatus.salesEnabled
                                        ? 'Apagar ventas ahora'
                                        : 'Reactivar ventas'}
                            </button>
                            <button
                                className="py-2 px-6 rounded-lg font-semibold border border-line bg-white hover:bg-surface"
                                onClick={() => onSaveStoreStatus()}
                                disabled={storeStatusSaving}
                            >
                                Guardar mensaje
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default React.memo(StoreStatusPanel)
