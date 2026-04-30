'use client'

import Link from 'next/link'
import { ArrowRight, Mic2, Sparkles, Lock, Shield, BookOpen, Zap } from 'lucide-react'

const FLOW_STEPS = [
  { number: '1', label: 'Choose Mode', icon: Zap, description: 'Pick your speaking context' },
  { number: '2', label: 'Build Script', icon: BookOpen, description: 'Generate or select one' },
  { number: '3', label: 'Record & Analyse', icon: Mic2, description: 'Get AI feedback' },
  { number: '4', label: 'Improve', icon: Sparkles, description: 'Retry and compare' },
]

const FEATURE_CARDS = [
  {
    title: 'Record & Analyse',
    description: 'Speak, get scored, read sentence-level AI feedback',
    icon: Mic2,
  },
  {
    title: 'Script Studio',
    description: 'Generate a script with AI or pick a template',
    icon: BookOpen,
  },
  {
    title: 'Live Coach',
    description: 'Rehearse against your script in real time with a teleprompter',
    icon: Sparkles,
  },
  {
    title: 'Full Privacy',
    description: 'Your audio never leaves your browser. Ever.',
    icon: Lock,
  },
]

const PRIVACY_FEATURES = [
  {
    title: 'Your audio stays on your device',
    description: 'We never receive your voice. Transcription happens in your browser using the Web Speech API.',
    icon: Mic2,
  },
  {
    title: 'Your transcript is used once',
    description: 'Your words are sent to the AI for analysis, then immediately discarded. We store nothing.',
    icon: Shield,
  },
  {
    title: 'No account means no profile',
    description: 'There is no user account, no history file, no data trail. Every session starts fresh.',
    icon: Lock,
  },
]

const WHO_ITS_FOR = [
  'Students preparing for oral exams',
  'Debaters and competitive speakers',
  'Anyone who wants to practice privately without their voice being stored',
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.08),transparent_40%),linear-gradient(to_bottom,var(--background),color-mix(in_oklch,var(--background)_94%,white))]" />

      {/* Sticky nav */}
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 -ml-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <Mic2 className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline text-lg font-semibold text-foreground">VoiceMark</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/studio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Studio</Link>
            <Link href="/coach" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Coach</Link>
            <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          </nav>

          <Link href="/mode" className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
            Start Practising
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Privacy badge - always visible */}
      <div className="fixed bottom-5 left-5 z-10 flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
        <Lock className="h-3 w-3" />
        Private session
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-success" />
            Privacy first
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
            The speaking coach<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">that forgets everything</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Practice your speech, get AI feedback, then it's gone. No account, no recordings saved, no trace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/mode" className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 font-semibold text-background hover:opacity-90 transition-opacity">
              Start Practising
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-semibold text-foreground hover:bg-muted/60 transition-colors">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Flow Steps */}
      <section className="relative mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-3xl border border-border bg-card/50 p-8 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">4-step flow</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground">Get started in 4 simple steps</h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FLOW_STEPS.map((step, idx) => (
              <Link key={idx} href={['', '/mode', '/script', '/studio', '/coach'][idx]} className="group rounded-2xl border border-border bg-background/80 p-6 hover:border-primary/50 hover:bg-background transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                    {step.number}
                  </div>
                  <step.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground">{step.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative mx-auto max-w-6xl px-5 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Features</p>
        <h2 className="mt-2 text-3xl font-bold text-foreground mb-8">Everything you need to practice</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURE_CARDS.map((feature, idx) => (
            <div key={idx} className="rounded-3xl border border-border bg-card/80 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Explainer - Hero-level section */}
      <section className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-background p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Why VoiceMark</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground mb-12">Built different. Built private.</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {PRIVACY_FEATURES.map((feature, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <feature.icon className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors">
              Read the full technical explanation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="relative mx-auto max-w-6xl px-5 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Who it's for</p>
        <h2 className="mt-2 text-3xl font-bold text-foreground mb-8">Perfect for</h2>

        <div className="space-y-4">
          {WHO_ITS_FOR.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card/50 p-6 flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-16 border-t border-border/40 bg-background/50">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <nav className="flex items-center gap-6">
              <Link href="/studio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Studio</Link>
              <Link href="/coach" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Coach</Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            </nav>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              No cookies. No tracking. No account. Just practice.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
