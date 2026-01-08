'use client'

import { useEffect, useState } from 'react'
import ModalCart from '@/components/Modal/ModalCart'
import ModalWishlist from '@/components/Modal/ModalWishlist'
import ModalSearch from '@/components/Modal/ModalSearch'
import ModalQuickview from '@/components/Modal/ModalQuickview'
import ModalCompare from '@/components/Modal/ModalCompare'
import RouteLoading from '@/components/Other/RouteLoading'
import CountdownTimeType from '@/type/CountdownType'

type ClientModalsProps = {
  serverTimeLeft: CountdownTimeType
}

const ClientModals = ({ serverTimeLeft }: ClientModalsProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <RouteLoading />
      <ModalCart serverTimeLeft={serverTimeLeft} />
      <ModalWishlist />
      <ModalSearch />
      <ModalQuickview />
      <ModalCompare />
    </>
  )
}

export default ClientModals
