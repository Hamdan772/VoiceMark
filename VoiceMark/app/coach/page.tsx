'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Mic2, Pause, Play, RotateCcw, Sparkles, Type, X, Settings } from 'lucide-react'

import {
  buildPieces,
  createAlignmentSummary,
  getImprovementTips,
  trimAndNormalize,
} from '@/lib/coach'
import { Teleprompter } from '@/components/teleprompter'
import { FlowPath } from '@/components/flow-path'

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort?: () => void
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    isFinal: boolean
    0?: { transcript?: string }
  }>
  resultIndex: number
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function speechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null

  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null
}

export default function CoachPage() {
  const [targetText, setTargetText] = useState(
    'Today I will explain why this idea matters, walk through the process, and end with a clear next step.',
  )
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState('Paste a script, then start speaking.')
  const [error, setError] = useState<string | null>(null)
  const [showTeleprompter, setShowTeleprompter] = useState(false)
  const [sessionSeconds, setSessionSeconds] = useState(0)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const stopRequestedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const liveTranscript = trimAndNormalize(`${finalTranscript} ${interimTranscript}`)
  const normalizedTarget = trimAndNormalize(targetText)
  const hasScript = normalizedTarget.length > 0
  const liveWordCount = liveTranscript.split(/\s+/).filter(Boolean).length
  const alignment = useMemo(() => {
    const summary = createAlignmentSummary(normalizedTarget, liveTranscript)
    const pieces = buildPieces(normalizedTarget, liveTranscript)
    const tips = getImprovementTips(summary)

    return {
      summary,
      pieces,
      tips,
    }
  }, [normalizedTarget, liveTranscript])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isListening) {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
      return
    }

    timerRef.current = setInterval(() => {
      setSessionSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [isListening])

  useEffect(() => {
    if (!showTeleprompter) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowTeleprompter(false)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showTeleprompter])

  const stopListening = () => {
    stopRequestedRef.current = true
    recognitionRef.current?.stop()
    setIsListening(false)
    setStatus('Coaching paused.')
  }

  const startListening = async () => {
    setError(null)
    stopRequestedRef.current = false

    if (!hasScript) {
      setError('Add a script first so coach mode can align your spoken words.')
      setStatus('Add a script to begin coaching.')
      return
    }

    const Ctor = speechRecognitionCtor()
    if (!Ctor) {
      setError('Live speech recognition is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch {
      setError('Microphone access is required for coach mode.')
      return
    }

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const transcript = result?.[0]?.transcript?.trim() ?? ''
        if (!transcript) continue

        if (result.isFinal) {
          finalText += `${transcript} `
        } else {
          interimText += `${transcript} `
        }
      }

      if (finalText) {
        setFinalTranscript((current) => trimAndNormalize(`${current} ${finalText}`))
      }
      setInterimTranscript(trimAndNormalize(interimText))
      setStatus(interimText ? 'Listening and aligning...' : 'Listening...')
    }

    recognition.onerror = (event) => {
      if (stopRequestedRef.current && event.error === 'aborted') {
        stopRequestedRef.current = false
        return
      }

      const message = event.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Speech recognition stopped.'
      setError(message)
      setStatus(message)
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      recognitionRef.current = null
      if (stopRequestedRef.current) {
        stopRequestedRef.current = false
        return
      }

      setIsListening(false)
      setStatus('Microphone paused.')
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      setStatus('Listening for your script...')
    } catch {
      setError('Could not start live transcription in this browser.')
      setStatus('Ready to try again.')
      recognitionRef.current = null
    }
  }

  const resetSession = () => {
    stopRequestedRef.current = true
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    setFinalTranscript('')
    setInterimTranscript('')
    setError(null)
    setStatus('Paste a script, then start speaking.')
    setSessionSeconds(0)
  }

  const applyPreset = (text: string) => {
    setTargetText(text)
    setFinalTranscript('')
    setInterimTranscript('')
    setStatus('Preset loaded. Press start to practice.')
    setSessionSeconds(0)
  }

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(255,106,90,0.12),transparent_36%),radial-gradient(circle_at_85%_0%,rgba(255,190,160,0.12),transparent_36%),linear-gradient(to_bottom,color-mix(in_oklch,var(--background)_94%,white),var(--background))]">
      <div className="pointer-events-none absolute inset-0">
        <div className="motion-sheen" />
        <div className="absolute -left-24 top-24 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-accent/14 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ background: 'var(--primary)', color: 'white' }}>
              <Mic2 className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold leading-none tracking-tight text-foreground">VoiceMark</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">AI Speech Coach</p>
            </div>
          </Link>

            <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring btn-press"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <Link
              href="/record"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring btn-press"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to studio
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 lg:py-10">
        <section className="grid gap-4 rounded-[28px] border border-border bg-card/80 p-6 backdrop-blur lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ background: 'color-mix(in oklch, var(--primary) 5%, transparent)', color: 'var(--primary)', borderColor: 'color-mix(in oklch, var(--primary) 18%, transparent)' }}>
              <Sparkles className="h-3.5 w-3.5" />
              Coach mode
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
                Practice interview answers with a live script.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Paste the answer you want to rehearse, then speak naturally. VoiceMark keeps the script visible, marks matched words in green, and surfaces missing or extra words in red so you can tighten delivery.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Script first', 'Your text stays fixed on screen so you can rehearse confidently.'],
                ['Live alignment', 'Matched words fade green as recognition catches up.'],
                ['You stay in control', 'No auto-submit while you are still practicing.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-border bg-background/80 p-4">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5">
                <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]' : 'bg-muted-foreground/50'}`} />
                {status}
              </span>
              <span className="rounded-full border border-border bg-background/80 px-3 py-1.5">{alignment.summary.accuracy}% matched</span>
              <span className="rounded-full border border-border bg-background/80 px-3 py-1.5">{alignment.summary.targetCount} target words</span>
              <span className="rounded-full border border-border bg-background/80 px-3 py-1.5">{formatTimer(sessionSeconds)} session</span>
              <span className="rounded-full border border-border bg-background/80 px-3 py-1.5">{liveWordCount} spoken</span>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-background/90 p-5 shadow-sm lg:p-6">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Type className="h-4 w-4 text-muted-foreground" />
              Your script
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('Thanks for having me. I am excited about this role because it matches my background in product execution and cross-functional leadership. I have led teams that delivered measurable outcomes, and I can share specific examples as we go.')}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                Interview intro
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Here is the update: we shipped the new onboarding, cut time-to-value by 30%, and now have a clear plan for the next sprint. The risk is resourcing, and I will propose the fix in the next review.')}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                Status update
              </button>
              <button
                type="button"
                onClick={() => applyPreset('My position is clear: the data supports this approach, and the alternative increases risk. I will show the evidence, address objections, and end with the action we need to take now.')}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                Debate opener
              </button>
            </div>
            <textarea
              value={targetText}
              onChange={(event) => setTargetText(event.target.value)}
              rows={10}
              className="min-h-[220px] w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Paste the text you want to practice here..."
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!hasScript}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                style={{ background: isListening ? 'var(--destructive)' : 'var(--primary)' }}
              >
                {isListening ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isListening ? 'Pause coaching' : finalTranscript ? 'Resume coaching' : 'Start coaching'}
              </button>
              <button
                onClick={() => setShowTeleprompter(!showTeleprompter)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
              >
                📺 {showTeleprompter ? 'Hide' : 'Show'} teleprompter
              </button>
              <button
                onClick={resetSession}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={() => {
                  setFinalTranscript('')
                  setInterimTranscript('')
                  setStatus('Transcript cleared. Continue when ready.')
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
              >
                Clear transcript
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-card/60 px-4 py-3 text-xs leading-6 text-muted-foreground">
              Tip: shorter passages feel smoother in browser speech recognition. Start with one paragraph, then build up.
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border px-4 py-3 text-sm leading-relaxed" style={{ background: 'color-mix(in oklch, var(--destructive) 6%, transparent)', borderColor: 'color-mix(in oklch, var(--destructive) 20%, transparent)', color: 'var(--destructive)' }}>
            {error}
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
          <div className="rounded-[28px] border border-border bg-card/95 p-5 shadow-sm lg:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Alignment stage</p>

                <div className="mx-auto max-w-6xl px-5 pt-6">
                  <FlowPath
                    title="Rehearsal flow"
                    subtitle="Coach mode is the final practice lane: it stays separate from recording so the script-alignment experience can stay focused."
                    activeIndex={3}
                    steps={[
                      { label: 'Choose a mode', href: '/modes', description: 'Set the speaking context.' },
                      { label: 'Pick a script', href: '/templates', description: 'Load or generate text.' },
                      { label: 'Practice in studio', href: '/record', description: 'Record and compare.' },
                      { label: 'Coach mode', href: '/coach', description: 'Rehearse with live alignment.' },
                    ]}
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Matched words are green. Extra spoken words are red. Missing script words stay visible so you can spot the exact gap.</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                <span className="rounded-full border border-border bg-background px-3 py-1.5">{alignment.summary.matchedCount} matched</span>
                <span className="rounded-full border border-border bg-background px-3 py-1.5">{alignment.summary.inaccurateCount} inaccurate</span>
                <span className="rounded-full border border-border bg-background px-3 py-1.5">{alignment.summary.missingCount} missing</span>
                <span className="rounded-full border border-border bg-background px-3 py-1.5">{alignment.summary.extraCount} extra</span>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${alignment.summary.accuracy}%`, background: 'linear-gradient(90deg, var(--primary), color-mix(in oklch, var(--primary) 68%, white))' }}
              />
            </div>

            <div className="mt-5 rounded-[22px] border border-border bg-background p-4 md:p-5">
              {alignment.summary.targetCount === 0 ? (
                <p className="text-sm text-muted-foreground">Add a script above to begin practice.</p>
              ) : (
                <div className="flex flex-wrap gap-x-2 gap-y-3 text-[15px] leading-8 md:text-lg md:leading-8">
                  {alignment.pieces.map((piece) => {
                    if (piece.kind === 'matched') {
                      return (
                        <span
                          key={piece.key}
                          className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-emerald-700 ring-1 ring-emerald-500/20 transition-colors"
                        >
                          {piece.text}
                        </span>
                      )
                    }

                    if (piece.kind === 'inaccurate') {
                      return (
                        <span
                          key={piece.key}
                          title={`Expected: ${piece.expected}`}
                          className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-red-700 ring-1 ring-red-500/25 transition-colors"
                        >
                          {piece.text}
                        </span>
                      )
                    }

                    if (piece.kind === 'extra') {
                      return (
                        <span
                          key={piece.key}
                          className="rounded-full bg-red-500/8 px-2.5 py-0.5 text-red-600 ring-1 ring-red-500/20 transition-colors"
                        >
                          {piece.text}
                        </span>
                      )
                    }

                    return (
                      <span
                        key={piece.key}
                        className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-red-700/75 ring-1 ring-red-500/15 decoration-red-500/40 line-through"
                      >
                        {piece.text}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Heard so far</p>
                <span className="text-xs font-medium text-muted-foreground">Updates live</span>
              </div>
              <div className="mt-2 space-y-1.5 text-sm leading-7 text-foreground">
                <p className="whitespace-pre-wrap">{finalTranscript || 'Final words will stay here.'}</p>
                {interimTranscript && (
                  <p className="whitespace-pre-wrap text-muted-foreground italic">{interimTranscript}</p>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-border bg-card/95 p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Session controls</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Start when you are ready, pause when you want a break, and keep the script visible while you refine the delivery.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Target</p>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums text-foreground">{alignment.summary.targetCount}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Matched</p>
                  <p className="mt-2 text-2xl font-extrabold tabular-nums text-foreground">{alignment.summary.matchedCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-card/95 p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">How to improve</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The suggestions below update as you speak so you know what to fix next.
              </p>
              <div className="mt-4 space-y-2">
                {alignment.tips.map((tip) => (
                  <div key={tip} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground">
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-card/95 p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Status</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground" aria-live="polite">
                {status}
              </p>

              <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Live transcript</p>
                <p className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {liveTranscript || 'Your spoken words will appear here.'}
                </p>
              </div>

              <p className="mt-4 text-xs leading-6 text-muted-foreground">
                Browser support varies. If the microphone behaves oddly, pause and start again to reset the live recogniser.
              </p>
            </div>
          </aside>
        </section>
      </div>

      {/* Teleprompter Modal */}
      {showTeleprompter && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowTeleprompter(false)}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] rounded-2xl border border-primary/20 bg-card overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-background/70 backdrop-blur">
              <div>
                <p className="text-sm font-semibold text-foreground">Teleprompter</p>
                <p className="text-xs text-muted-foreground">Press Esc or click outside to close.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTeleprompter(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close teleprompter"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <Teleprompter
                scriptText={targetText}
                liveTranscript={liveTranscript}
                isActive={isListening}
              />
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 border-t border-border/60 bg-background/60 py-5 backdrop-blur">
        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <p>VoiceMark &middot; Coach mode keeps the script visible while you practice out loud.</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/about" className="hover:text-foreground">About</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}