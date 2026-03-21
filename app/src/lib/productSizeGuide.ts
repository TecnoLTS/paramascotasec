export type ProductSizeGuideRow = {
  size: string
  neck: string
  chest: string
  length: string
  weight: string
}

const isNonEmpty = (value?: string | null) => (value ?? '').trim().length > 0

export const createEmptyProductSizeGuideRow = (): ProductSizeGuideRow => ({
  size: '',
  neck: '',
  chest: '',
  length: '',
  weight: '',
})

export const parseProductSizeGuideRows = (value?: string | null): ProductSizeGuideRow[] => {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((row) => ({
        size: String(row?.size ?? row?.label ?? '').trim(),
        neck: String(row?.neck ?? '').trim(),
        chest: String(row?.chest ?? row?.bust ?? '').trim(),
        length: String(row?.length ?? row?.back ?? '').trim(),
        weight: String(row?.weight ?? row?.recommendedWeight ?? '').trim(),
      }))
      .filter((row) => Object.values(row).some(isNonEmpty))
  } catch {
    return []
  }
}

export const serializeProductSizeGuideRows = (rows: ProductSizeGuideRow[]) =>
  JSON.stringify(
    rows
      .map((row) => ({
        size: String(row.size ?? '').trim(),
        neck: String(row.neck ?? '').trim(),
        chest: String(row.chest ?? '').trim(),
        length: String(row.length ?? '').trim(),
        weight: String(row.weight ?? '').trim(),
      }))
      .filter((row) => Object.values(row).some(isNonEmpty))
  )

export const hasProductSizeGuide = (rows: ProductSizeGuideRow[], notes?: string | null) =>
  rows.length > 0 || isNonEmpty(notes)
