'use client'

import Link from 'next/link'

export type FlowStep = {
  label: string
  href: string
  description: string
}

interface FlowPathProps {
  title: string
  subtitle: string
  steps: FlowStep[]
  activeIndex: number
}

export function FlowPath({ title, subtitle, steps, activeIndex }: FlowPathProps) {
  return (
    <div className="rounded-[28px] border border-border bg-card/70 p-5 backdrop-blur-sm motion-in">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = index === activeIndex
          const isComplete = index < activeIndex

          return (
            <Link
              key={step.href}
              href={step.href}
              className={`rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm ${isActive
                  ? 'border-primary bg-primary/6 text-foreground'
                  : isComplete
                    ? 'border-border bg-background/80 text-foreground'
                    : 'border-border/70 bg-card/70 text-muted-foreground'
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Step {index + 1}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-primary' : isComplete ? 'bg-success' : 'bg-muted-foreground/40'}`} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-inherit">{step.label}</h3>
              <p className="mt-1 text-xs leading-5 text-inherit opacity-80">{step.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}