'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModalCartContext } from '@/context/ModalCartContext'
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext'
import { useModalSearchContext } from '@/context/ModalSearchContext'
import CountdownTimeType from '@/type/CountdownType'
import { ProductType } from '@/type/ProductType'

const ModalCart = dynamic(() => import('@/components/Modal/ModalCart'), { ssr: false })
const ModalSearch = dynamic(() => import('@/components/Modal/ModalSearch'), { ssr: false })
const ModalQuickview = dynamic(() => import('@/components/Modal/ModalQuickview'), { ssr: false })
const RouteLoading = dynamic(() => import('@/components/Other/RouteLoading'), { ssr: false })

type ClientModalsProps = {
  serverTimeLeft: CountdownTimeType
  initialSuggestions: Array<Partial<ProductType>>
}

const ClientModals = ({ serverTimeLeft, initialSuggestions }: ClientModalsProps) => {
  const [mounted, setMounted] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [hasOpenedCart, setHasOpenedCart] = useState(false)
  const [hasOpenedSearch, setHasOpenedSearch] = useState(false)
  const [hasOpenedQuickview, setHasOpenedQuickview] = useState(false)
  const { isModalOpen: isCartOpen } = useModalCartContext()
  const { isModalOpen: isSearchOpen } = useModalSearchContext()
  const { selectedProduct } = useModalQuickviewContext()

  useEffect(() => {
    setMounted(true)
    setPortalTarget(document.body)
  }, [])

  useEffect(() => {
    if (isCartOpen) setHasOpenedCart(true)
  }, [isCartOpen])

  useEffect(() => {
    if (isSearchOpen) setHasOpenedSearch(true)
  }, [isSearchOpen])

  useEffect(() => {
    if (selectedProduct) setHasOpenedQuickview(true)
  }, [selectedProduct])

  if (!mounted || !portalTarget) return null

  return createPortal(
    <>
      <RouteLoading />
      {(isCartOpen || hasOpenedCart) ? (
        <ModalCart serverTimeLeft={serverTimeLeft} initialSuggestions={initialSuggestions} />
      ) : null}
      {(isSearchOpen || hasOpenedSearch) ? <ModalSearch /> : null}
      {(selectedProduct || hasOpenedQuickview) ? <ModalQuickview /> : null}
    </>,
    portalTarget
  )
}

export default ClientModals
