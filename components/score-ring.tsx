'use client'

import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  label: string
  size?: number
  strokeWidth?: number
  prev?: number
  animate?: boolean
}

export function scoreColor(score: number): string {
  if (score >= 75) return 'var(--success)'
  if (score >= 50) return 'var(--warning)'
  return 'var(--destructive)'
}

export function scoreGrade(score: number): string {
  if (score >= 88) return 'Excellent'
  if (score >= 72) return 'Good'
  if (score >= 55) return 'Fair'
  if (score >= 35) return 'Needs work'
  return 'Poor'
}

export function ScoreRing({
  score,
  label,
  size = 100,
  strokeWidth = 8,
  prev,
  animate = true,
}: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score)

  useEffect(() => {
    if (!animate) { setDisplayed(score); return }
    const start = performance.now()
    const duration = 1000
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(score * eased))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score, animate])

  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (displayed / 100) * circumference
  const diff = prev !== undefined ? score - prev : null
  const color = scoreColor(score)
  const trackColor = 'var(--muted)'

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={trackColor} strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-2xl font-bold tabular-nums leading-none" style={{ color }}>
            {displayed}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground leading-none uppercase tracking-wide">
            {scoreGrade(score)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {diff !== null && diff !== 0 && (
          <span
            className="text-[11px] font-bold"
            style={{ color: diff > 0 ? 'var(--success)' : 'var(--destructive)' }}
          >
            {diff > 0 ? `+${diff}` : `${diff}`}
          </span>
        )}
      </div>
    </div>
  )
}
