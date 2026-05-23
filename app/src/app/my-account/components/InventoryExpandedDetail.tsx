'use client'

type InventoryExpandedDetailProps = {
  label: string
  items: any[]
  stockKey: string
  extraLabel: string
  expirationKey?: string
  onClose: () => void
  onManage: () => void
}

export default function InventoryExpandedDetail({
  label,
  items,
  stockKey,
  extraLabel,
  expirationKey,
  onClose,
  onManage,
}: InventoryExpandedDetailProps) {
  return (
    <div className="mb-6 rounded-2xl border-2 border-black bg-white shadow-sm overflow-hidden animate-fadeIn">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-black text-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
          <span className="text-xs bg-white/20 rounded-full px-2.5 py-0.5">{items.length} producto{items.length === 1 ? '' : 's'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onManage}
            className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors"
          >
            Gestionar en inventario
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Cerrar detalle"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-[10px] uppercase font-bold text-secondary border-b border-line">
            <tr>
              <th className="px-5 py-3">Producto</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">{extraLabel}</th>
              {!expirationKey && (
                <th className="px-4 py-3 text-right">Ventas 30d</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item, index) => (
              <tr key={`${item.name}-${index}`} className="hover:bg-surface/50 transition-colors">
                <td className="px-5 py-3 font-semibold">{item.name}</td>
                <td className={`px-4 py-3 text-right font-bold ${
                  Number(item[stockKey] ?? 0) === 0 ? 'text-red' :
                  Number(item[stockKey] ?? 0) <= 2 ? 'text-orange-600' : 'text-amber-700'
                }`}>
                  {Number(item[stockKey] ?? 0).toLocaleString('es-EC')}
                </td>
                <td className="px-4 py-3 text-right text-secondary">
                  {expirationKey && item[expirationKey] !== null && item[expirationKey] !== undefined
                    ? `${Number(item[expirationKey]).toLocaleString('es-EC')} día(s)`
                    : !expirationKey && (item as any).estimated_days_left !== null && (item as any).estimated_days_left !== undefined
                      ? `${Number((item as any).estimated_days_left ?? 0).toLocaleString('es-EC')} día(s)`
                      : '—'}
                </td>
                {!expirationKey && (
                  <td className="px-4 py-3 text-right text-secondary">
                    {Number((item as any).units_sold_30d ?? 0) > 0
                      ? `${Number((item as any).units_sold_30d ?? 0).toLocaleString('es-EC')} uds`
                      : '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-line bg-surface text-xs text-secondary flex items-center justify-between">
        <span>Mostrando {items.length} de {items.length} producto{items.length === 1 ? '' : 's'}</span>
        <button
          type="button"
          onClick={onManage}
          className="font-semibold underline hover:text-black transition-colors"
        >
          Ver todos en inventario →
        </button>
      </div>
    </div>
  )
}
