'use client'

import { Zap } from 'lucide-react'

interface SmartTakeawayProps {
  takeaway: string
}

export function SmartTakeaway({ takeaway }: SmartTakeawayProps) {
  return (
    <div
      className="rounded-2xl p-5 border flex items-start gap-3"
      style={{
        background: 'color-mix(in oklch, var(--success) 5%, transparent)',
        borderColor: 'color-mix(in oklch, var(--success) 18%, transparent)',
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
        style={{ background: 'color-mix(in oklch, var(--success) 12%, transparent)' }}
      >
        <Zap className="h-4 w-4" style={{ color: 'var(--success)' }} />
      </div>
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--success)' }}
        >
          Smart takeaway
        </p>
        <p className="text-sm text-foreground leading-relaxed">{takeaway}</p>
      </div>
    </div>
  )
}
