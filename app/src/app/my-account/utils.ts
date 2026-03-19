export const ADMIN_PRODUCTS_ENDPOINT = '/api/products?scope=admin'
export const DEFAULT_STORE_PAUSE_MESSAGE = 'Tienda temporalmente en mantenimiento. Intenta más tarde.'
export const RETRYABLE_PANEL_ERROR_PATTERN = /(502|503|504|bad gateway|gateway timeout|service unavailable|failed to fetch|networkerror|tiempo de espera agotado)/i

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const withTransientRetry = async <T,>(
    operation: () => Promise<T>,
    retries = 2,
    baseDelayMs = 450
): Promise<T> => {
    let lastError: unknown

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await operation()
        } catch (error) {
            lastError = error
            const message = String((error as any)?.message || '')
            const canRetry = RETRYABLE_PANEL_ERROR_PATTERN.test(message)

            if (!canRetry || attempt === retries) {
                throw error
            }

            await delay(baseDelayMs * (attempt + 1))
        }
    }

    throw lastError
}

export const getCurrentMonthKey = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${now.getFullYear()}-${month}`
}

export const formatMonthKeyLabel = (monthKey: string) => {
    const match = monthKey.match(/^(\d{4})-(0[1-9]|1[0-2])$/)
    if (!match) return monthKey

    const year = Number(match[1])
    const month = Number(match[2])

    return new Date(year, month - 1, 1).toLocaleDateString('es-EC', {
        month: 'long',
        year: 'numeric'
    })
}
