'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Warning, X } from '@phosphor-icons/react/dist/ssr'

type NotificationOverlayProps = {
  message: { text: string; type: 'success' | 'error' } | null
  onClose: () => void
}

export default function NotificationOverlay({ message, onClose }: NotificationOverlayProps) {
  if (!message) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${message.type === 'success' ? 'bg-white border-success text-success' : 'bg-white border-red text-red'}`}
      >
        <div className="flex items-start gap-3">
          {message.type === 'success' ? (
            <CheckCircle size={24} weight="fill" />
          ) : (
            <Warning size={24} weight="fill" />
          )}
          <div className="flex-1">
            <div className="text-base font-semibold">
              {message.type === 'success' ? 'Listo' : 'Atención'}
            </div>
            <div className="mt-1 text-sm text-[#111827]">{message.text}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-line text-sm font-semibold hover:bg-surface"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
