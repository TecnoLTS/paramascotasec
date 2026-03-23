import type { AdminReportSection } from './types'

export const REPORT_SECTION_META: Record<AdminReportSection, { title: string; subtitle: string }> = {
  general: {
    title: 'Reporte general',
    subtitle: 'Resumen ejecutivo del negocio con ventas, utilidad, inventario y señales de operación.',
  },
  sales: {
    title: 'Reporte de ventas',
    subtitle: 'Comportamiento comercial, mix por categoría y ranking de productos vendidos.',
  },
  balance: {
    title: 'Balance general',
    subtitle: 'Lectura financiera de ingresos, IVA, costos, utilidad y margen operativo.',
  },
  inventory: {
    title: 'Reporte de inventario',
    subtitle: 'Capital inmovilizado, riesgos de stock y productos críticos para reposición.',
  },
  traceability: {
    title: 'Reporte de trazabilidad',
    subtitle: 'Soporte de cifras por pedido, producto y categoría para auditar resultados.',
  },
}
