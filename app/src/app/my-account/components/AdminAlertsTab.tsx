'use client'

import { Info, Warning, WarningCircle } from '@phosphor-icons/react/dist/ssr'

type AlertSeverity = 'critical' | 'warning' | 'info'

type StrategicAlert = {
    type: AlertSeverity
    message: string
    action: string
}

type InventoryHealth = {
    out_of_stock?: number
    low_stock?: number
    expiring_products?: number
    expired_products?: number
}

type AdminAlertsTabProps = {
    currentDateLabel: string
    alertsSeverityFilter: 'all' | AlertSeverity
    setAlertsSeverityFilter: (value: 'all' | AlertSeverity) => void
    strategicAlertsCount: number
    strategicAlertSummary: Record<AlertSeverity, number>
    filteredStrategicAlerts: StrategicAlert[]
    alertSeverityLabels: Record<AlertSeverity, string>
    inventoryHealth?: InventoryHealth
    onNavigateToInventory: () => void
    onAlertAction: (alert: StrategicAlert) => void
}

const alertIcons = {
    critical: WarningCircle,
    warning: Warning,
    info: Info,
} as const

export default function AdminAlertsTab({
    currentDateLabel,
    alertsSeverityFilter,
    setAlertsSeverityFilter,
    strategicAlertsCount,
    strategicAlertSummary,
    filteredStrategicAlerts,
    alertSeverityLabels,
    inventoryHealth,
    onNavigateToInventory,
    onAlertAction,
}: AdminAlertsTabProps) {
    return (
        <div className="tab !block overflow-hidden">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-3xl font-semibold text-black">Alertas y salud operativa</h2>
                    <p className="mt-2 text-sm text-secondary">
                        Riesgos activos, inventario sensible y acciones prioritarias para el d&iacute;a.
                    </p>
                </div>
                <div className="inline-flex h-fit items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-500 shadow-sm">
                    {currentDateLabel}
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
                <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm lg:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
                        Panorama actual
                    </span>
                    <div className="mt-3 flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-4xl font-semibold text-orange-700">{strategicAlertsCount}</h3>
                            <p className="mt-2 text-sm text-orange-700">
                                alertas priorizadas para revisar hoy
                            </p>
                        </div>
                        <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange-500 shadow-sm">
                            Operativo
                        </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
                        <span className="rounded-full bg-red-100 px-3 py-2 text-red-600">
                            Cr&iacute;ticas: {strategicAlertSummary.critical}
                        </span>
                        <span className="rounded-full bg-amber-100 px-3 py-2 text-amber-700">
                            Avisos: {strategicAlertSummary.warning}
                        </span>
                        <span className="rounded-full bg-sky-100 px-3 py-2 text-sky-700">
                            Informativas: {strategicAlertSummary.info}
                        </span>
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                        Inventario cr&iacute;tico
                    </span>
                    <div className="mt-4 space-y-3 text-sm text-secondary">
                        <div className="flex items-center justify-between">
                            <span>Sin stock</span>
                            <strong className="text-red">{inventoryHealth?.out_of_stock ?? 0}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Bajo stock</span>
                            <strong className="text-orange">{inventoryHealth?.low_stock ?? 0}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Por vencer</span>
                            <strong className="text-yellow">{inventoryHealth?.expiring_products ?? 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                        Acci&oacute;n r&aacute;pida
                    </span>
                    <p className="mt-4 text-sm text-secondary">
                        Revisa inventario, productos vencidos y alertas que requieren ajuste manual.
                    </p>
                    <button
                        type="button"
                        className="mt-5 inline-flex items-center justify-center rounded-full border border-main bg-main px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                        onClick={onNavigateToInventory}
                    >
                        Ir a inventario
                    </button>
                </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
                {(['all', 'critical', 'warning', 'info'] as const).map((severity) => {
                    const isActive = alertsSeverityFilter === severity
                    const label =
                        severity === 'all'
                            ? 'Todas'
                            : alertSeverityLabels[severity as AlertSeverity]

                    return (
                        <button
                            key={severity}
                            type="button"
                            onClick={() => setAlertsSeverityFilter(severity)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                isActive
                                    ? 'border-main bg-main text-white'
                                    : 'border-gray-200 bg-white text-secondary hover:border-main hover:text-main'
                            }`}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredStrategicAlerts.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-secondary xl:col-span-2">
                        No hay alertas para este filtro.
                    </div>
                ) : (
                    filteredStrategicAlerts.map((alert, index) => {
                        const AlertIcon = alertIcons[alert.type]
                        const styleMap = {
                            critical: 'border-red-200 bg-red-50 text-red',
                            warning: 'border-orange-200 bg-orange-50 text-orange',
                            info: 'border-sky-200 bg-sky-50 text-sky-700',
                        } as const

                        return (
                            <div
                                key={`${alert.type}-${alert.action}-${index}`}
                                className={`rounded-3xl border p-6 shadow-sm ${styleMap[alert.type]}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-white/80 p-3">
                                        <AlertIcon size={24} weight="duotone" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
                                                {alertSeverityLabels[alert.type]}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-gray-700">{alert.message}</p>
                                        <button
                                            type="button"
                                            className="mt-4 inline-flex items-center justify-center rounded-full border border-current px-4 py-2 text-sm font-semibold transition hover:bg-white/80"
                                            onClick={() => onAlertAction(alert)}
                                        >
                                            {alert.action}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
