export const formatMoney = (value: unknown) => {
  const num = Number(value ?? 0)
  return `$${num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDateEcuador = (
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil', ...options })
}

export const formatDateTimeEcuador = (
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', ...options })
}

export const getLocalSalePaymentMethodLabel = (method?: string) => {
  switch ((method || '').toLowerCase()) {
    case 'cash':
      return 'Efectivo'
    case 'card':
      return 'Tarjeta'
    case 'transfer':
      return 'Transferencia'
    case 'mixed':
      return 'Mixto'
    default:
      return 'Otro'
  }
}
