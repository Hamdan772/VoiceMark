'use client'

/*
  Report export disabled for privacy-first mode.
  Keeping a minimal disabled UI so callers can still render this component.
*/

import { Download } from 'lucide-react'

export function ReportExport() {
  return (
    <div className="relative">
      <button
        disabled
        title="Export disabled in privacy-first mode"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        Export (disabled)
      </button>
    </div>
  )
}
