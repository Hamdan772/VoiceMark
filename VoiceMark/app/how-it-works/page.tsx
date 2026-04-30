'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Mic2, Sparkles, AlertTriangle } from 'lucide-react'

const PIPELINE = [
  'Browser microphone captures your speech',
  'Speech recognition (built-in) or Groq Whisper transcribes audio',
  'Groq Llama receives the transcript with your mode + persona context (text-only)',
  'AI scores on clarity, structure, vocabulary, confidence',
  'Report card displayed with specific coaching tip and takeaway',
  'Retry loop lets you practice again without re-setup',
]

const MEASURES = [
  'Clarity (filler words, sentence structure)',
  'Structure (opening, body, close, transitions)',
  'Vocabulary (lexical diversity and precision)',
  'Confidence (hedging phrases, declarative language)',
  'Pace (words per minute relative to ideal range)',
]

const NOT_DOES = [
  'Store, record, or transmit raw audio files',
  'Identify who you are or profile your identity',
  'Share your practice data with third parties',
  'Present scores as a final assessment or judgment',
  'Analyse or judge your accent or pronunciation alone',
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(255,106,90,0.10),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(255,190,160,0.10),transparent_32%),linear-gradient(to_bottom,var(--background),color-mix(in_oklch,var(--background)_96%,white))]">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            How this AI works
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-12">
        <div className="rounded-[28px] border border-border bg-card/70 p-6 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Transparency page</p>
          <h1 className="mt-2 text-3xl font-display leading-tight text-foreground md:text-4xl">
            How VoiceMark turns speech into feedback.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            This page explains what happens after you press record, what the AI evaluates, what it does not do, and why accent-aware feedback matters.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/70 p-6">
            <div className="flex items-center gap-2">
              <Mic2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Pipeline</h2>
            </div>
            <ol className="mt-4 space-y-3">
              {PIPELINE.map((item, index) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-border bg-background/80 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</span>
                  <span className="text-sm leading-6 text-foreground">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">What the AI measures</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {MEASURES.map((item) => (
                <li key={item} className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-6 text-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-success" />
              <h2 className="text-lg font-semibold text-foreground">What it does not do</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {NOT_DOES.map((item) => (
                <li key={item} className="flex gap-2 rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-6 text-foreground">
                  <span className="mt-1 text-error-foreground"><AlertTriangle className="h-4 w-4 text-warning" /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-semibold text-foreground">Bias and fairness</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">Accent-aware feedback</p>
                <p>When you select "Non-native English speaker" in settings, VoiceMark excludes accent and pronunciation from scoring. Feedback focuses only on pacing, clarity of ideas, structure, and vocabulary range. This removes phonetic bias that disproportionately affects non-native and regionally accented speakers.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Personas shape tone, not bias</p>
                <p>Selecting a persona (Student, Debater, TED Speaker, News Anchor) changes the feedback style and emphasis, not the scoring rubric. All speakers are evaluated on the same four dimensions: clarity, structure, vocabulary, and confidence. Personas help you practise for different contexts.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Known limitations</p>
                <p>VoiceMark is a practice tool, not an assessment. Its scores reflect coaching feedback, not final judgments. The AI can miss context-dependent excellence, struggle with non-standard grammar that conveys meaning, or overlook cultural speaking norms. Use multiple inputs (peers, recordings, rubrics) for holistic evaluation.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">No data collection</p>
                <p>VoiceMark processes transcripts in-memory for the duration of your session only. Nothing is stored long-term, sent to analytics, or used to train models — your practice resets when you close the tab.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
