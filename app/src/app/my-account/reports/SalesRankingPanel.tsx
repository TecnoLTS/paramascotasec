'use client'

type SalesRankingPanelProps = Record<string, any>

export default function SalesRankingPanel({
  currentDateLabel,
  effectiveReportData,
  formatMoney,
  openSalesProductDetail,
  productSalesRanking,
  salesRankingFinancial,
  salesRankingMonth,
  salesRankingRows,
  salesRankingTotals,
  salesRankingView,
  selectReportMonth,
  selectedRankingMonthLabel,
  setSalesRankingView,
  totalUnitsSold,
}: SalesRankingPanelProps) {
  return (
    <div className="tab text-content w-full">
      <div className="flex items-center justify-between pb-6">
        <div>
          <div className="heading5">Ranking de productos vendidos</div>
          <p className="text-secondary text-xs mt-1">
            Orden completo por desempeño comercial: unidades vendidas, ventas netas, utilidad bruta y margen bruto.
          </p>
        </div>
        <div className="text-sm font-bold text-secondary bg-surface px-4 py-2 rounded-lg border border-line">
          {currentDateLabel}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-line shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <div className="heading6">Resumen y orden comercial</div>
            <p className="text-secondary text-xs mt-1">
              Vista activa: {salesRankingView === 'daily' ? 'hoy' : salesRankingView === 'month' ? `mes (${selectedRankingMonthLabel})` : 'histórico total'} con ventas completadas o entregadas.
            </p>
            <p className="text-secondary text-xs mt-1">
              Haz clic en el nombre del producto para ver su detalle ({salesRankingView === 'daily' ? 'hoy' : salesRankingView === 'month' ? 'mes' : 'histórico'} e histórico).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            {salesRankingView !== 'daily' && (
              <label className="flex flex-col gap-1 text-[10px] uppercase font-bold text-secondary">
                Mes a consultar
                <input
                  type="month"
                  value={salesRankingMonth}
                  onChange={(event) => selectReportMonth(event.target.value)}
                  className="px-3 py-1.5 text-sm font-semibold rounded-md border border-line bg-white text-black focus:border-black outline-none"
                />
              </label>
            )}
            <div className="flex bg-surface p-1 rounded-lg border border-line w-fit">
              <button type="button" onClick={() => setSalesRankingView('daily')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${salesRankingView === 'daily' ? 'bg-black text-white shadow-md' : 'text-secondary hover:text-black'}`}>
                Día
              </button>
              <button type="button" onClick={() => setSalesRankingView('month')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${salesRankingView === 'month' ? 'bg-black text-white shadow-md' : 'text-secondary hover:text-black'}`}>
                Mes
              </button>
              <button type="button" onClick={() => setSalesRankingView('historical')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${salesRankingView === 'historical' ? 'bg-black text-white shadow-md' : 'text-secondary hover:text-black'}`}>
                Histórico total
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Periodo activo</div>
            <div className="text-sm font-semibold">
              {salesRankingView === 'daily'
                ? `${productSalesRanking?.rangePeriod?.start || '-'} → ${productSalesRanking?.rangePeriod?.end || '-'}`
                : salesRankingView === 'month'
                  ? `${productSalesRanking?.period?.start || '-'} → ${productSalesRanking?.period?.end || '-'}`
                  : `${productSalesRanking?.historicalPeriod?.start || '-'} → ${productSalesRanking?.historicalPeriod?.end || '-'}`
              }
            </div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Pedidos vendidos</div>
            <div className="text-lg font-bold">{Number((effectiveReportData?.sales as any)?.orders_count ?? salesRankingFinancial?.orders_count ?? 0).toLocaleString('es-EC')}</div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Unidades vendidas</div>
            <div className="text-lg font-bold">{Number(totalUnitsSold ?? salesRankingTotals?.units_sold ?? 0).toLocaleString('es-EC')}</div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Ventas brutas</div>
            <div className="text-lg font-bold">{formatMoney(Number((effectiveReportData?.sales as any)?.gross ?? salesRankingFinancial?.gross ?? 0))}</div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Ventas netas</div>
            <div className="text-lg font-bold">{formatMoney(Number((effectiveReportData?.sales as any)?.net ?? salesRankingFinancial?.net ?? salesRankingTotals?.net_revenue ?? 0))}</div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">IVA cobrado</div>
            <div className="text-lg font-bold">{formatMoney(Number((effectiveReportData?.sales as any)?.vat ?? salesRankingFinancial?.vat ?? 0))}</div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Envío cobrado</div>
            <div className="text-lg font-bold">{formatMoney(Number((effectiveReportData?.sales as any)?.shipping ?? salesRankingFinancial?.shipping ?? 0))}</div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Costo de venta</div>
            <div className="text-lg font-bold">{formatMoney(Number((effectiveReportData?.sales as any)?.cost ?? salesRankingFinancial?.cost ?? 0))}</div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Utilidad bruta</div>
            <div className={`text-lg font-bold ${(Number((effectiveReportData?.sales as any)?.profit ?? salesRankingFinancial?.profit ?? 0) >= 0) ? 'text-success' : 'text-red'}`}>
              {formatMoney(Number((effectiveReportData?.sales as any)?.profit ?? salesRankingFinancial?.profit ?? 0))}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-line bg-surface">
            <div className="text-[10px] uppercase font-bold text-secondary">Margen bruto</div>
            <div className="text-lg font-bold">{(() => {
              const effNet = Number((effectiveReportData?.sales as any)?.net ?? 0)
              const effProfit = Number((effectiveReportData?.sales as any)?.profit ?? 0)
              const effMargin = effNet > 0 ? (effProfit / effNet) * 100 : 0
              const margin = Number(salesRankingFinancial?.margin ?? 0)
              if (margin !== 0 && effMargin === 0) return margin.toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
              return effMargin.toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            })()}%</div>
          </div>
        </div>

        <div className="overflow-x-auto border border-line rounded-xl">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-surface text-[10px] uppercase font-bold text-secondary border-b border-line">
              <tr>
                <th className="px-4 py-3 text-right">#</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Pedidos ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                <th className="px-4 py-3 text-right">Unidades vendidas ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                <th className="px-4 py-3 text-right">Ventas brutas ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                <th className="px-4 py-3 text-right">Ventas netas ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                <th className="px-4 py-3 text-right">IVA cobrado ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                <th className="px-4 py-3 text-right">Envío cobrado ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                <th className="px-4 py-3 text-right">Costo de venta ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                <th className="px-4 py-3 text-right">Utilidad bruta ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
                <th className="px-4 py-3 text-right">Margen bruto ({salesRankingView === 'month' ? 'Mes' : 'Histórico'})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {salesRankingRows.map((item: any, index: number) => (
                <tr key={`${item.product_id}-${index}`} className="hover:bg-surface/40">
                  <td className="px-4 py-3 text-right font-semibold text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    <button type="button" className="text-left hover:underline" onClick={() => openSalesProductDetail(item)}>
                      {item.product_name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{item.category || 'Sin categoría'}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.orders_count}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">{item.units_sold}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatMoney(item.gross_revenue)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatMoney(item.net_revenue)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatMoney(item.vat_amount)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatMoney(item.shipping_amount)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatMoney(item.cost)}</td>
                  <td className={`px-4 py-3 text-sm text-right font-semibold ${(Number(item.profit ?? 0) >= 0) ? 'text-success' : 'text-red'}`}>
                    {formatMoney(item.profit)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {Number(item.margin ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  </td>
                </tr>
              ))}
              {salesRankingRows.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-6 text-center text-secondary text-sm">
                    No hay datos de ventas para construir el ranking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
