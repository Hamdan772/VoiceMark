'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import { ScoreRing, scoreColor } from './score-ring'
import { HighlightedTranscript } from './highlighted-transcript'
import { ToneInsights } from './tone-insights'
import { SmartTakeaway } from './smart-takeaway'
import type { AnalysisResult, UseCaseMode } from '@/lib/types'
import { getUseCaseMode } from '@/lib/use-case-modes'
// trend tracking and report export removed for privacy-first design
import {
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gauge,
  BookOpen,
  Repeat2,
  MessageCircle,
} from 'lucide-react'

interface ReportCardProps {
  result: AnalysisResult
  onRetry: () => void
  prevResult?: AnalysisResult
  isComparison?: boolean
  useCaseMode?: UseCaseMode
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function estimatePronunciation(result: AnalysisResult) {
  const fillerRate = result.transcript.trim().split(/\s+/).filter(Boolean).length > 0
    ? result.fillerWords.count / result.transcript.trim().split(/\s+/).filter(Boolean).length
    : 0
  const paceBonus = result.pace.label === 'good' ? 6 : -4
  const fillerPenalty = fillerRate > 0.08 ? -6 : fillerRate > 0.04 ? -3 : 0
  return clampScore(result.scores.clarity * 0.6 + result.scores.confidence * 0.3 + 10 + paceBonus + fillerPenalty)
}

function buildSessionSummary(result: AnalysisResult) {
  const notes: string[] = []
  const fillerRate = result.transcript.trim().split(/\s+/).filter(Boolean).length > 0
    ? Math.round((result.fillerWords.count / result.transcript.trim().split(/\s+/).filter(Boolean).length) * 100)
    : 0

  notes.push(
    result.scores.clarity >= 75
      ? 'You spoke clearly and kept your message easy to follow.'
      : 'Your clarity dropped in longer sentences — tighten the phrasing.'
  )

  if (result.fillerWords.count > 0) {
    notes.push(`Filler words appeared ${result.fillerWords.count} times (${fillerRate}% of your words).`)
  } else {
    notes.push('No filler words detected — strong control and pacing.')
  }

  notes.push(
    result.pace.label === 'good'
      ? `Your pace was ideal at ${result.pace.wpm} WPM.`
      : `Your pace needs adjustment (${result.pace.wpm} WPM).`
  )

  return notes
}

// ── Metric bar ────────────────────────────────────────────────────────────────
function MetricBar({
  label,
  score,
  prev,
  weight,
  delayMs = 0,
}: {
  label: string
  score: number
  prev?: number
  weight?: string
  delayMs?: number
}) {
  const color = scoreColor(score)
  const diff = prev !== undefined ? score - prev : null
  const fillStyle = {
    '--target': `${score}%`,
    background: color,
    animationDelay: `${delayMs}ms`,
  } as CSSProperties

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {weight && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {weight}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {diff !== null && diff !== 0 && (
            <span
              className="text-[10px] font-bold"
              style={{ color: diff > 0 ? 'var(--success)' : 'var(--destructive)' }}
            >
              {diff > 0 ? `+${diff}` : diff}
            </span>
          )}
          <span className="text-xs font-bold tabular-nums w-7 text-right" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div
          className="h-full rounded-full metric-fill"
          style={fillStyle}
        />
      </div>
    </div>
  )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  border,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
  bg: string
  border: string
}) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-2 lift-pro"
      style={{ background: bg, borderColor: border }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
      </div>
      <p className="text-2xl font-bold tabular-nums leading-none" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-[11px] leading-snug" style={{ color: `${color}` }}>{sub}</p>}
    </div>
  )
}

// ── Pace config ───────────────────────────────────────────────────────────────
const PACE = {
  'too slow': {
    color: 'var(--destructive)',
    bg: 'color-mix(in oklch, var(--destructive) 7%, transparent)',
    border: 'color-mix(in oklch, var(--destructive) 22%, transparent)',
    label: 'Too slow',
    hint: 'Target 130–160 WPM',
  },
  good: {
    color: 'var(--success)',
    bg: 'color-mix(in oklch, var(--success) 7%, transparent)',
    border: 'color-mix(in oklch, var(--success) 22%, transparent)',
    label: 'Ideal pace',
    hint: '110–175 WPM',
  },
  'too fast': {
    color: 'var(--warning)',
    bg: 'color-mix(in oklch, var(--warning) 7%, transparent)',
    border: 'color-mix(in oklch, var(--warning) 22%, transparent)',
    label: 'Too fast',
    hint: 'Slow to 130–160 WPM',
  },
}

export function ReportCard({
  result,
  onRetry,
  prevResult,
  isComparison = false,
  useCaseMode = 'interview-mode',
}: ReportCardProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [showTrends, setShowTrends] = useState(false)
  const pronunciationScore = estimatePronunciation(result)
  const modeConfig = getUseCaseMode(useCaseMode)
  const summaryLines = buildSessionSummary(result)

  // Save recording to history on mount
  useEffect(() => {
    // Recording is only saved in memory during the session
    // When the tab closes, it disappears completely
  }, [result, useCaseMode])

  const words = result.transcript.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const pace = PACE[result.pace.label]

  const mins = Math.floor(result.durationSeconds / 60)
  const secs = result.durationSeconds % 60
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  const fillerRate =
    wordCount > 0 ? Math.round((result.fillerWords.count / wordCount) * 100) : 0

  const topFillers = Object.entries(result.fillerWords.breakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const fillerColor =
    result.fillerWords.count === 0
      ? 'var(--success)'
      : result.fillerWords.count <= 3
        ? 'var(--warning)'
        : 'var(--destructive)'
  const fillerBg =
    result.fillerWords.count === 0
      ? 'color-mix(in oklch, var(--success) 7%, transparent)'
      : result.fillerWords.count <= 3
        ? 'color-mix(in oklch, var(--warning) 7%, transparent)'
        : 'color-mix(in oklch, var(--destructive) 7%, transparent)'
  const fillerBorder =
    result.fillerWords.count === 0
      ? 'color-mix(in oklch, var(--success) 22%, transparent)'
      : result.fillerWords.count <= 3
        ? 'color-mix(in oklch, var(--warning) 22%, transparent)'
        : 'color-mix(in oklch, var(--destructive) 22%, transparent)'

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 animate-fade-up">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-5 sm:p-6 motion-in"
        style={{
          background: 'color-mix(in oklch, var(--primary) 4%, transparent)',
          borderColor: 'color-mix(in oklch, var(--primary) 18%, transparent)',
          animationDelay: '30ms',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <ScoreRing
            score={result.scores.overall}
            label="Overall"
            size={120}
            strokeWidth={10}
            prev={prevResult?.scores.overall}
          />
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-foreground">
                {isComparison ? 'Revised Attempt' : 'Your Report'}
              </h2>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                {modeConfig.label}
              </span>
              {result.aiEnhanced ? (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
                    color: 'var(--primary)',
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  AI scored
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                  Rule-based
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {durationStr} &middot; {wordCount.toLocaleString()} words &middot; {result.pace.wpm} WPM &middot; {result.sentenceStats.count} sentences
            </p>
            <div className="flex flex-col gap-2.5">
              <MetricBar label="Clarity" score={result.scores.clarity} prev={prevResult?.scores.clarity} weight="30%" delayMs={60} />
              <MetricBar label="Confidence" score={result.scores.confidence} prev={prevResult?.scores.confidence} weight="25%" delayMs={120} />
              <MetricBar label="Structure" score={result.scores.structure} prev={prevResult?.scores.structure} weight="25%" delayMs={180} />
              <MetricBar label="Vocabulary" score={result.scores.vocabulary} prev={prevResult?.scores.vocabulary} weight="20%" delayMs={240} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Session summary ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 motion-in" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Session summary</p>
            <p className="text-sm font-semibold text-foreground">Not stored</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{modeConfig.label}</span>
        </div>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          {summaryLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      {/* ── Feedback snapshot ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 motion-in" style={{ animationDelay: '70ms' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Feedback snapshot</p>
            <p className="text-sm font-semibold text-foreground">Pronunciation, clarity, and confidence</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            icon={Gauge}
            label="Pronunciation"
            value={`${pronunciationScore}`}
            sub="Estimated from delivery signals"
            color={scoreColor(pronunciationScore)}
            bg="color-mix(in oklch, var(--primary) 4%, transparent)"
            border="color-mix(in oklch, var(--primary) 16%, transparent)"
          />
          <StatTile
            icon={CheckCircle2}
            label="Clarity"
            value={`${result.scores.clarity}`}
            sub="Sentence focus + filler control"
            color={scoreColor(result.scores.clarity)}
            bg="color-mix(in oklch, var(--success) 6%, transparent)"
            border="color-mix(in oklch, var(--success) 18%, transparent)"
          />
          <StatTile
            icon={TrendingUp}
            label="Confidence"
            value={`${result.scores.confidence}`}
            sub="Hedging + assertiveness"
            color={scoreColor(result.scores.confidence)}
            bg="color-mix(in oklch, var(--warning) 6%, transparent)"
            border="color-mix(in oklch, var(--warning) 18%, transparent)"
          />
        </div>
      </div>


      {/* ── Filler + Pace ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 motion-in" style={{ animationDelay: '90ms' }}>
        <StatTile
          icon={MessageCircle}
          label="Filler words"
          value={result.fillerWords.count}
          sub={
            result.fillerWords.count === 0
              ? 'Clean delivery!'
              : `${fillerRate}% of words spoken`
          }
          color={fillerColor}
          bg={fillerBg}
          border={fillerBorder}
        />
        <StatTile
          icon={Gauge}
          label="Pace"
          value={`${result.pace.wpm}`}
          sub={`WPM — ${pace.label.toLowerCase()}`}
          color={pace.color}
          bg={pace.bg}
          border={pace.border}
        />
      </div>

      {/* ── Filler breakdown ──────────────────────────────────────────────── */}
      {topFillers.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 motion-in lift-pro" style={{ animationDelay: '130ms' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Filler word breakdown
          </p>
          <div className="flex flex-col gap-2">
            {topFillers.map(([word, count]) => {
              const pct = wordCount > 0 ? (count / wordCount) * 100 : 0
              return (
                <div key={word} className="flex items-center gap-3">
                  <span
                    className="text-xs font-semibold min-w-[80px] shrink-0"
                    style={{ color: 'var(--destructive)' }}
                  >
                    &ldquo;{word}&rdquo;
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                    <div
                      className="h-full rounded-full metric-fill-fast"
                      style={{
                        '--target': `${Math.min(100, pct * 20)}%`,
                        background: 'color-mix(in oklch, var(--destructive) 70%, transparent)',
                        animationDelay: `${120 + count * 40}ms`,
                      } as CSSProperties}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">
                    {count}×
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Insights row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 motion-in" style={{ animationDelay: '170ms' }}>
        {/* Lexical richness */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Word Variety
            </span>
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p
            className="text-2xl font-bold tabular-nums leading-none"
            style={{ color: scoreColor(result.lexicalRichness.uniqueRatio) }}
          >
            {result.lexicalRichness.uniqueRatio}
            <span className="text-sm font-normal text-muted-foreground ml-1">/100</span>
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {Math.round(result.lexicalRichness.typeTokenRatio * 100)}% unique words
            {result.lexicalRichness.uniqueRatio >= 70
              ? ' — rich vocabulary'
              : result.lexicalRichness.uniqueRatio >= 50
                ? ' — average range'
                : ' — try varied words'}
          </p>
        </div>

        {/* Sentence stats */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Sentence length
            </span>
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p
            className="text-2xl font-bold tabular-nums leading-none"
            style={{ color: result.sentenceStats.avgWords > 30 ? 'var(--destructive)' : result.sentenceStats.avgWords > 20 ? 'var(--warning)' : 'var(--success)' }}
          >
            {result.sentenceStats.avgWords}
            <span className="text-sm font-normal text-muted-foreground ml-1">avg words</span>
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {result.sentenceStats.count} sentences &middot; longest: {result.sentenceStats.longestSentence}w
            {result.sentenceStats.avgWords > 25 ? ' — try shorter sentences' : ''}
          </p>
        </div>
      </div>

      {/* ── Tone Analysis ─────────────────────────────────────────────────── */}
      {result.tone && (
        <div className="motion-in" style={{ animationDelay: '210ms' }}>
          <ToneInsights tone={result.tone} />
        </div>
      )}

      {/* ── Hedging phrases ───────────────────────────────────────────────── */}
      {result.hedgingPhrases.length > 0 && (
        <div
          className="rounded-2xl border p-4 motion-in"
          style={{
            background: 'color-mix(in oklch, var(--warning) 5%, transparent)',
            borderColor: 'color-mix(in oklch, var(--warning) 22%, transparent)',
            animationDelay: '220ms',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--warning)' }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--warning)' }}>
              Weak language — {result.hedgingPhrases.length} hedging phrase{result.hedgingPhrases.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {result.hedgingPhrases.map((phrase, i) => (
              <span
                key={i}
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: 'color-mix(in oklch, var(--warning) 12%, transparent)', color: 'var(--warning)' }}
              >
                &ldquo;{phrase}&rdquo;
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Hedging signals uncertainty. Replace &ldquo;I think this might work&rdquo; with &ldquo;This works because…&rdquo;. Direct declarative statements build credibility.
          </p>
        </div>
      )}

      {/* ── Repetition ────────────────────────────────────────────────────── */}
      {result.repetition.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 motion-in lift-pro" style={{ animationDelay: '260ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <Repeat2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overused words
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.repetition.map(({ word, count }) => (
              <div
                key={word}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5"
              >
                <span className="text-xs font-semibold text-foreground">{word}</span>
                <span className="text-[10px] text-muted-foreground font-medium">&times;{count}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2.5 leading-relaxed">
            Repeated content words reduce perceived vocabulary range. Find synonyms for these before your next take.
          </p>
        </div>
      )}

      {/* ── Coaching tip ──────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 border flex items-start gap-3 motion-in"
        style={{
          background: 'color-mix(in oklch, var(--primary) 5%, transparent)',
          borderColor: 'color-mix(in oklch, var(--primary) 18%, transparent)',
          animationDelay: '290ms',
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
          style={{ background: 'color-mix(in oklch, var(--primary) 12%, transparent)' }}
        >
          <TrendingUp className="h-4 w-4" style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--primary)' }}
          >
            Coaching tip
          </p>
          <p className="text-sm text-foreground leading-relaxed">{result.tip}</p>
        </div>
      </div>

      {/* ── Smart Takeaway ────────────────────────────────────────────────── */}
      {result.takeaway && (
        <div className="motion-in" style={{ animationDelay: '320ms' }}>
          <SmartTakeaway takeaway={result.takeaway} />
        </div>
      )}

      {/* ── Pace detail ───────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-4 motion-in"
        style={{ background: pace.bg, borderColor: pace.border }}
      >
        <div className="flex items-center gap-2 mb-3">
          {result.pace.label === 'good' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: pace.color }} />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: pace.color }} />
          )}
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: pace.color }}>
            Pace analysis — {result.pace.wpm} WPM
          </p>
        </div>
        <div className="relative h-4 rounded-full overflow-hidden mb-2" style={{ background: 'var(--muted)' }}>
          {/* Ideal zone marker */}
          <div
            className="absolute h-full opacity-20"
            style={{
              left: `${(110 / 300) * 100}%`,
              width: `${((175 - 110) / 300) * 100}%`,
              background: 'var(--success)',
            }}
          />
          {/* Current position */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-card shadow"
            style={{
              left: `${Math.min(95, (result.pace.wpm / 300) * 100)}%`,
              background: pace.color,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span className="font-medium" style={{ color: 'var(--success)' }}>110–175 ideal</span>
          <span>300 WPM</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">{pace.hint}</p>
      </div>

      {/* Trends removed — no long-term history in privacy-first design */}

      {/* ── Transcript ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden motion-in lift-pro" style={{ animationDelay: '340ms' }}>
        <button
          onClick={() => setShowTranscript((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
          aria-expanded={showTranscript}
        >
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            View transcript
            {result.fillerWords.count > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                — {result.fillerWords.count} filler{result.fillerWords.count !== 1 ? 's' : ''} highlighted
              </span>
            )}
          </span>
          {showTranscript ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {showTranscript && (
          <div className="border-t border-border px-5 pb-5 pt-4 animate-fade-in">
            {result.fillerWords.count > 0 && (
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <mark className="filler-highlight text-xs">like this</mark>
                <span className="text-xs text-muted-foreground">= filler word detected</span>
              </div>
            )}
            <HighlightedTranscript
              transcript={result.transcript}
              fillerInstances={result.fillerWords.instances}
            />
          </div>
        )}
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {!isComparison && (
        <div className="flex flex-col sm:flex-row gap-3 motion-in" style={{ animationDelay: '400ms' }}>
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 font-semibold text-sm transition-all duration-200 border-2 hover:bg-primary/5 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-in"
            style={{
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Apply the tip &amp; try again
          </button>
          {/* Report export disabled in privacy-first mode */}
        </div>
      )}
    </div>
  )
}
