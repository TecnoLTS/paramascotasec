'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Loading from '@/components/Other/Loading'

const MIN_VISIBLE_MS = 250

const RouteLoading = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const startTimeRef = useRef(0)

  useEffect(() => {
    const startLoading = () => {
      startTimeRef.current = Date.now()
      setIsLoading(true)
    }

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target as Element | null
      const anchor = target?.closest('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const rawHref = anchor.getAttribute('href')
      if (!rawHref || rawHref.startsWith('#')) return

      const url = new URL(rawHref, window.location.href)
      if (url.origin !== window.location.origin) return

      const nextPath = `${url.pathname}${url.search}`
      const currentPath = `${window.location.pathname}${window.location.search}`
      if (nextPath === currentPath) return

      startLoading()
    }

    const handlePopState = () => {
      startLoading()
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) return

    const elapsed = Date.now() - startTimeRef.current
    const delay = Math.max(MIN_VISIBLE_MS - elapsed, 0)
    const timer = window.setTimeout(() => setIsLoading(false), delay)

    return () => window.clearTimeout(timer)
  }, [pathname, searchParams, isLoading])

  if (!isLoading) return null
  return <Loading />
}

export default RouteLoading
