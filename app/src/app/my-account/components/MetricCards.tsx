'use client'

import type React from 'react'

type ReportCompactMetricProps = {
  label: string
  value: React.ReactNode
  tone?: string
}

export function ReportCompactMetric({ label, value, tone = 'text-black' }: ReportCompactMetricProps) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-surface px-2.5 py-2">
      <div className="text-[10px] uppercase font-bold leading-tight text-secondary">{label}</div>
      <div className={`mt-1 text-sm font-bold leading-tight tabular-nums break-words ${tone}`}>{value}</div>
    </div>
  )
}

type BusinessControlMetricProps = {
  label: string
  value: React.ReactNode
  caption: React.ReactNode
  tone?: string
}

export function BusinessControlMetric({ label, value, caption, tone = 'text-black' }: BusinessControlMetricProps) {
  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <div className="text-[10px] uppercase font-bold leading-tight text-secondary">{label}</div>
      <div className={`mt-1 text-lg font-bold leading-tight tabular-nums break-words ${tone}`}>{value}</div>
      <div className="mt-1 text-[11px] leading-snug text-secondary">{caption}</div>
    </div>
  )
}
