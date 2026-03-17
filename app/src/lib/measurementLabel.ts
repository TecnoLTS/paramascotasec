const normalizeDecimal = (value: string) => value.replace(',', '.')

export const normalizeMeasurementLabel = (value?: string | null) => {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''

  return trimmed
    .replace(/\s+/g, ' ')
    .replace(/(\d+(?:[.,]\d+)?)\s*(?:KGS?|KG|K)\b/gi, (_, amount: string) => `${normalizeDecimal(amount)}Kg`)
    .replace(/(\d+(?:[.,]\d+)?)\s*(?:GR|G)\b/gi, (_, amount: string) => `${normalizeDecimal(amount)}gr`)
    .replace(/(\d+(?:[.,]\d+)?)\s*(?:MLS?|ML)\b/gi, (_, amount: string) => `${normalizeDecimal(amount)}ml`)
    .trim()
}

export const normalizeMeasurementLabels = (values?: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      (values ?? [])
        .map((value) => normalizeMeasurementLabel(value))
        .filter(Boolean)
    )
  )
