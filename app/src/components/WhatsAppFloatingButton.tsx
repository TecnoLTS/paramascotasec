'use client'

import Link from 'next/link'
import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import { useSite } from '@/context/SiteContext'

const DEFAULT_WHATSAPP_MESSAGE = 'Hola, quiero informacion sobre sus productos.'

const normalizeWhatsappNumber = (value: string) => value.replace(/\D/g, '')

export default function WhatsAppFloatingButton() {
  const site = useSite()
  const whatsappNumber = normalizeWhatsappNumber(site.contact.whatsappNumber)

  if (!whatsappNumber) return null

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chatear por WhatsApp con ${site.shortName}`}
      className="fixed bottom-5 right-5 z-[120] flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_35px_rgba(37,211,102,0.28)] transition-all hover:translate-y-[-1px] hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(255,255,255,0.32)]">
        <WhatsappLogo size={24} weight="fill" className="text-[#25D366]" />
      </span>
    </Link>
  )
}
