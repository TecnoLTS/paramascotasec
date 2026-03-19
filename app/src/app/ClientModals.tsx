'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ModalCart from '@/components/Modal/ModalCart'
import ModalSearch from '@/components/Modal/ModalSearch'
import ModalQuickview from '@/components/Modal/ModalQuickview'
import RouteLoading from '@/components/Other/RouteLoading'
import CountdownTimeType from '@/type/CountdownType'

type ClientModalsProps = {
  serverTimeLeft: CountdownTimeType
}

const ClientModals = ({ serverTimeLeft }: ClientModalsProps) => {
  const [mounted, setMounted] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    setPortalTarget(document.body)
  }, [])

  if (!mounted || !portalTarget) return null

  return createPortal(
    <>
      <RouteLoading />
      <ModalCart serverTimeLeft={serverTimeLeft} />
      <ModalSearch />
      <ModalQuickview />
    </>,
    portalTarget
  )
}

export default ClientModals
