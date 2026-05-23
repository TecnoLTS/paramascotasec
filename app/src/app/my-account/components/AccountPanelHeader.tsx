'use client'

import Link from 'next/link'
import Image from '@/components/Common/AppImage'
import { SignOut } from '@phosphor-icons/react/dist/ssr'

type AccountPanelHeaderProps = {
  user: { name?: string; email?: string; role?: 'customer' | 'admin' }
  onLogout: () => void
}

export default function AccountPanelHeader({ user, onLogout }: AccountPanelHeaderProps) {
  return (
    <header className="sticky top-0 z-[90] border-b border-line bg-white/95 backdrop-blur">
      <div className="flex min-h-[58px] w-full items-center justify-between gap-3 px-3 sm:px-4 lg:px-6 2xl:px-8">
        <Link href="/" className="flex items-center gap-3 min-w-0" aria-label="Ir al inicio">
          <Image
            src="/images/brand/LogoVerde150.svg"
            width={150}
            height={64}
            alt="ParaMascotasEC"
            priority
            className="h-10 w-auto shrink-0"
          />
          <div className="hidden min-w-0 border-l border-line pl-3 sm:block">
            <div className="text-[10px] font-bold uppercase leading-tight text-secondary">Panel privado</div>
            <div className="truncate text-sm font-bold leading-tight text-black">
              {user.role === 'admin' ? 'Administración' : 'Mi cuenta'}
            </div>
          </div>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <div className="hidden min-w-0 text-right md:block">
            <div className="truncate text-sm font-bold leading-tight text-black">{user.name || 'Usuario'}</div>
            <div className="truncate text-xs leading-tight text-secondary">{user.email || ''}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-xs font-bold text-black transition-colors hover:border-black hover:bg-white"
          >
            <SignOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
