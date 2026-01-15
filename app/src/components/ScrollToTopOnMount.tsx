'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

type ScrollToTopOnMountProps = {
    behavior?: ScrollBehavior
}

export default function ScrollToTopOnMount({ behavior = 'auto' }: ScrollToTopOnMountProps) {
    const pathname = usePathname()

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior })
    }, [pathname, behavior])

    return null
}
