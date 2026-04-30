'use client'

import type { AnalysisResult, UseCaseMode } from '@/lib/types'
import { ScoreRing } from './score-ring'
import { ReportCard } from './report-card'
import { TrendingUp, TrendingDown, Minus, RotateCcw, RefreshCw, Trophy } from 'lucide-react'

interface ComparisonViewProps {
  previous: AnalysisResult
  current: AnalysisResult
  onRetry: () => void
  onReset: () => void
  useCaseMode?: UseCaseMode
}

function DeltaBadge({ value, invert = false }: { value: number; invert?: boolean }) {
  const positive = invert ? value < 0 : value > 0
  const neutral = value === 0
  const color = neutral
    ? 'var(--muted-foreground)'
    : positive
      ? 'var(--success)'
      : 'var(--destructive)'
  const bg = neutral
    ? 'var(--muted)'
    : positive
      ? 'color-mix(in oklch, var(--success) 10%, transparent)'
      : 'color-mix(in oklch, var(--destructive) 10%, transparent)'
  const Icon = neutral ? Minus : positive ? TrendingUp : TrendingDown
  const label = neutral
    ? '—'
    : invert
      ? value < 0
        ? `−${Math.abs(value)}`
        : `+${value}`
      : value > 0
        ? `+${value}`
        : `${value}`

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{ color, background: bg }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

function MetricRow({
  label,
  prev,
  curr,
  invert = false,
}: {
  label: string
  prev: number
  curr: number
  invert?: boolean
}) {
  const delta = curr - prev
  const positive = invert ? delta < 0 : delta > 0
  const rowColor = delta === 0
    ? undefined
    : positive
      ? 'color-mix(in oklch, var(--success) 3%, transparent)'
      : 'color-mix(in oklch, var(--destructive) 3%, transparent)'

  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0 rounded-lg px-2 -mx-2"
      style={rowColor ? { background: rowColor } : undefined}
    >
      <span className="text-sm text-foreground font-medium">{label}</span>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-sm text-muted-foreground tabular-nums w-8 text-right">{prev}</span>
        <DeltaBadge value={delta} invert={invert} />
        <span
          className="text-sm font-bold tabular-nums w-8 text-right"
          style={{
            color: delta === 0
              ? undefined
              : positive
                ? 'var(--success)'
                : 'var(--destructive)',
          }}
        >
          {curr}
        </span>
      </div>
    </div>
  )
}

export function ComparisonView({ previous, current, onRetry, onReset, useCaseMode }: ComparisonViewProps) {
  const overallDiff = current.scores.overall - previous.scores.overall
  const fillerDiff = current.fillerWords.count - previous.fillerWords.count
  const improved = overallDiff > 0
  const dropped = overallDiff < 0

  const bannerColor = improved
    ? 'var(--success)'
    : dropped
      ? 'var(--destructive)'
      : 'var(--primary)'
  const bannerBg = improved
    ? 'color-mix(in oklch, var(--success) 7%, transparent)'
    : dropped
      ? 'color-mix(in oklch, var(--destructive) 7%, transparent)'
      : 'color-mix(in oklch, var(--primary) 6%, transparent)'
  const bannerBorder = improved
    ? 'color-mix(in oklch, var(--success) 25%, transparent)'
    : dropped
      ? 'color-mix(in oklch, var(--destructive) 22%, transparent)'
      : 'color-mix(in oklch, var(--primary) 18%, transparent)'

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 animate-fade-up">

      {/* ── Result banner ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 border flex items-start gap-4 motion-in"
        style={{ background: bannerBg, borderColor: bannerBorder, animationDelay: '30ms' }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${bannerColor} / 0.12` }}
        >
          <Trophy className="h-5 w-5" style={{ color: bannerColor }} />
        </div>
        <div>
          <p className="text-base font-bold mb-1" style={{ color: bannerColor }}>
            {improved
              ? `Score improved by ${overallDiff} point${overallDiff !== 1 ? 's' : ''}`
              : dropped
                ? `Score dropped ${Math.abs(overallDiff)} point${Math.abs(overallDiff) !== 1 ? 's' : ''} — keep going`
                : 'Same overall score — focus on the tip below'}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {fillerDiff < 0
              ? `You used ${Math.abs(fillerDiff)} fewer filler word${Math.abs(fillerDiff) !== 1 ? 's' : ''} — real progress.`
              : fillerDiff === 0
                ? 'Same filler count — try pausing instead of filling.'
                : `${fillerDiff} more filler word${fillerDiff !== 1 ? 's' : ''} this time — watch for "${Object.entries(current.fillerWords.breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'um'}".`}
          </p>
        </div>
      </div>

      {/* ── Score rings ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 motion-in lift-pro" style={{ animationDelay: '90ms' }}>
        <div className="grid grid-cols-3 gap-4 items-start mb-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Before</p>
            <ScoreRing score={previous.scores.overall} label="Overall" size={88} animate={false} />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 pt-6">
            <DeltaBadge value={overallDiff} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Change</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">After</p>
            <ScoreRing score={current.scores.overall} label="Overall" size={88} prev={previous.scores.overall} />
          </div>
        </div>

        {/* Metric table */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Metric</span>
            <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="w-8 text-right">Before</span>
              <span className="w-16 text-center">Change</span>
              <span className="w-8 text-right">After</span>
            </div>
          </div>
          <MetricRow label="Overall" prev={previous.scores.overall} curr={current.scores.overall} />
          <MetricRow label="Clarity" prev={previous.scores.clarity} curr={current.scores.clarity} />
          <MetricRow label="Confidence" prev={previous.scores.confidence} curr={current.scores.confidence} />
          <MetricRow label="Structure" prev={previous.scores.structure} curr={current.scores.structure} />
          <MetricRow label="Vocabulary" prev={previous.scores.vocabulary} curr={current.scores.vocabulary} />
          <MetricRow label="Filler words" prev={previous.fillerWords.count} curr={current.fillerWords.count} invert />
          <MetricRow label="Pace (WPM)" prev={previous.pace.wpm} curr={current.pace.wpm} />
        </div>
      </div>

      {/* ── New full report ─────────────────────────────────────────────── */}
      <ReportCard
        result={current}
        onRetry={onRetry}
        prevResult={previous}
        isComparison
        useCaseMode={useCaseMode}
      />

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex gap-3 motion-in" style={{ animationDelay: '210ms' }}>
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm border-2 transition-all duration-200 hover:bg-primary/5 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-sm border border-border text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw className="h-4 w-4" />
          Start fresh
        </button>
      </div>
    </div>
  )
}
