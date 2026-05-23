'use client'

import type { BillingRidePdf } from '../types'

type BillingRidesPanelProps = {
  rides: BillingRidePdf[]
  loading: boolean
  reissueAccessKey: string | null
  onReload: () => void
  onOpenPdf: (accessKey: string) => void
  onCancelAndReissue: (ride: BillingRidePdf) => void
  formatMoney: (value: unknown) => string
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string
  formatDateTime: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string
}

export default function BillingRidesPanel({
  rides,
  loading,
  reissueAccessKey,
  onReload,
  onOpenPdf,
  onCancelAndReissue,
  formatMoney,
  formatDate,
  formatDateTime,
}: BillingRidesPanelProps) {
  return (
    <div className="tab text-content w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <div className="heading4">Facturas PDF enviadas</div>
          <p className="text-secondary text-sm mt-1">RIDE generados por Facturador en <span className="font-semibold text-black">storage/pdf/rides</span>.</p>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-line bg-white text-sm font-semibold hover:bg-surface disabled:opacity-60"
          onClick={onReload}
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-surface text-[11px] uppercase text-secondary">
            <tr>
              <th className="px-3 py-2 text-left">Factura</th>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Correo</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">SRI</th>
              <th className="px-3 py-2 text-left">PDF</th>
              <th className="px-3 py-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rides.map((ride) => {
              const sequential = [ride.establishment_code, ride.emission_point, ride.sequential].filter(Boolean).join('-') || ride.source_reference || ride.access_key
              const status = String(ride.sri_status || '').toUpperCase()
              const canReissue = ['RECIBIDA', 'EN PROCESAMIENTO', 'PENDING', 'UNKNOWN', 'DEVUELTA', 'NO AUTORIZADO'].includes(status) && !ride.replacement_access_key
              const isReissuing = reissueAccessKey === String(ride.access_key || '').replace(/\D/g, '')
              const canOpenPdf = Boolean(ride.pdf_exists || ride.pdf_can_generate)
              return (
                <tr key={ride.access_key} className="hover:bg-surface/50">
                  <td className="px-3 py-2">
                    <div className="font-semibold">{sequential}</div>
                    <div className="text-[11px] text-secondary break-all">{ride.access_key}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">{ride.customer_name || '-'}</div>
                    <div className="text-[11px] text-secondary">{ride.customer_identification || '-'}</div>
                  </td>
                  <td className="px-3 py-2 text-secondary">{ride.customer_email || 'Sin correo'}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatMoney(ride.total ?? 0)}</td>
                  <td className="px-3 py-2">
                    <div>{ride.issue_date ? formatDate(ride.issue_date) : '-'}</div>
                    <div className="text-[11px] text-secondary">{ride.pdf_modified_at ? `PDF ${formatDateTime(ride.pdf_modified_at)}` : 'Sin archivo generado'}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${status === 'AUTORIZADO' ? 'bg-emerald-100 text-emerald-700' : status === 'ANULADA_LOCAL' ? 'bg-zinc-100 text-zinc-700' : 'bg-surface text-secondary'}`}>
                      {ride.sri_status || '-'}
                    </span>
                    {ride.replacement_access_key && (
                      <div className="mt-1 text-[11px] text-secondary break-all">Reemplazada por {ride.replacement_access_key}</div>
                    )}
                    {ride.replaced_access_key && (
                      <div className="mt-1 text-[11px] text-secondary break-all">Reemite {ride.replaced_access_key}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${ride.pdf_exists ? 'bg-emerald-100 text-emerald-700' : ride.pdf_can_generate ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                      {ride.pdf_exists ? 'Disponible' : ride.pdf_can_generate ? 'Generable' : 'No generado'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {canReissue && (
                      <button
                        type="button"
                        className="mr-2 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                        onClick={() => onCancelAndReissue(ride)}
                        disabled={isReissuing || loading}
                      >
                        {isReissuing ? 'Reemitiendo...' : 'Anular y reemitir'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold hover:bg-surface disabled:opacity-50"
                      onClick={() => onOpenPdf(ride.access_key)}
                      disabled={!canOpenPdf}
                    >
                      Abrir PDF
                    </button>
                  </td>
                </tr>
              )
            })}
            {!loading && rides.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-secondary">
                  No hay RIDE PDF generados todavía.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-secondary">
                  Cargando facturas PDF...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
