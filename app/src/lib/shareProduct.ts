type ShareProduct = {
  name?: string | null
  description?: string | null
}

type ShareResult = {
  ok: boolean
  method: 'share' | 'clipboard' | 'none'
}

export const shareProduct = async (
  product: ShareProduct,
  urlOverride?: string
): Promise<ShareResult> => {
  const url = urlOverride || (typeof window !== 'undefined' ? window.location.href : '')
  const title = product?.name?.trim() || 'Producto'
  const text = product?.description?.trim() || 'Mira este producto'

  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({ title, text, url })
      return { ok: true, method: 'share' }
    } catch {
      // Fall through to clipboard
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && url) {
    try {
      await navigator.clipboard.writeText(url)
      return { ok: true, method: 'clipboard' }
    } catch {
      return { ok: false, method: 'none' }
    }
  }

  return { ok: false, method: 'none' }
}
