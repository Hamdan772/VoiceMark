'use client'

interface TrendGraphProps {
  metric?: 'overall' | 'clarity' | 'structure' | 'vocabulary' | 'confidence' | 'fillers' | 'wpm'
  title?: string
}

// Trend tracking has been disabled in privacy-first mode. Render a lightweight
// placeholder so callers can still render the component without pulling in
// removed storage utilities.
export function TrendGraph({ metric = 'overall', title }: TrendGraphProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-4 text-center text-muted-foreground text-sm">
      Trend tracking is disabled in privacy-first mode.
    </div>
  )
}
