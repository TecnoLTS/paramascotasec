'use client'

import React from 'react'

type InlineSpinnerProps = {
    size?: number
    className?: string
}

const InlineSpinner = ({ size = 18, className = '' }: InlineSpinnerProps) => {
    return (
        <span
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
            aria-hidden="true"
        >
            <span className="h-full w-full animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
    )
}

export default InlineSpinner
