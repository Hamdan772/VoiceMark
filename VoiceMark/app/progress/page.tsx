"use client"

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/studio" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to studio
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            Progress tracker
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-12">
        <div className="rounded-[28px] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Practice growth</p>
          <h1 className="mt-2 text-3xl font-display leading-tight text-foreground md:text-4xl">
            Progress tracking is disabled
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            In privacy-first mode VoiceMark does not persist practice history. Immediate feedback remains available in-session but no long-term storage is kept.
          </p>
        </div>
      </section>
    </main>
  )
}
