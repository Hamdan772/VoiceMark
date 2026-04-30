'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react'
import { useSession } from '@/lib/session-context'
import { USE_CASE_MODES } from '@/lib/use-case-modes'
import type { UseCaseMode } from '@/lib/types'

const ELABORATE_FEATURES = {
    'interview-mode': {
        description: 'Master structured answers with measurable impact for high-stakes interviews.',
        keyBenefits: [
            'STAR framework guidance (Situation, Task, Action, Result)',
            'Confidence & assertiveness scoring',
            'Answer structure analysis (opener, evidence, closer)',
            'Conciseness and relevance feedback',
        ],
        tips: [
            '👉 Keep answers under 60 seconds',
            '👉 Start with the impact or result',
            '👉 Use specific metrics and examples',
            '👉 Avoid filler words and hedging',
        ],
    },
    'speaking-coach': {
        description: 'Build clear, confident everyday speaking for professional and personal settings.',
        keyBenefits: [
            'Balanced clarity and confidence feedback',
            'Pace and pacing guidance (110–175 WPM)',
            'Natural tone and delivery scoring',
            'Day-to-day communication tips',
        ],
        tips: [
            '👉 Aim for 130–160 WPM for natural pace',
            '👉 Take pauses between ideas',
            '👉 Vary your tone and emphasis',
            '👉 Practice with different topics',
        ],
    },
    'debate-mode': {
        description: 'Sharpen your arguments with clarity, evidence, and assertive delivery.',
        keyBenefits: [
            'Argument clarity and structure scoring',
            'Evidence and data integration analysis',
            'Assertiveness without aggression feedback',
            'Rebuttal readiness tips',
        ],
        tips: [
            '👉 Lead with your strongest point',
            '👉 Back claims with evidence',
            '👉 Stay composed and direct',
            '👉 Anticipate counterarguments',
        ],
    },
}

export default function ModePage({ params }: { params: Promise<{ 'mode-id': string }> }) {
    const router = useRouter()
    const { 'mode-id': rawModeId } = use(params)
    const modeId = rawModeId as UseCaseMode
    const mode = USE_CASE_MODES.find((m) => m.id === modeId)
    const elaborate = ELABORATE_FEATURES[modeId as keyof typeof ELABORATE_FEATURES]

    if (!mode || !elaborate) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Mode not found</p>
                </div>
            </main>
        )
    }

    const { setMode } = useSession()

    const handleStart = () => {
        // store in ephemeral session state
        setMode(modeId)
        router.push(`/templates?mode=${modeId}`)
    }

    return (
        <main className="min-h-screen bg-background">
            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-5">
                    <Link href="/modes" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to modes
                    </Link>
                </div>
            </header>

            <section className="mx-auto w-full max-w-4xl px-5 py-12">
                {/* ── Hero ────────────────────────────────────────────────────────── */}
                <div className="mb-12">
                    <div className="text-5xl mb-4">{mode.emoji}</div>
                    <h1 className="text-4xl font-bold text-foreground mb-3">{mode.label}</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">{elaborate.description}</p>
                </div>

                {/* ── Key Benefits ────────────────────────────────────────────────── */}
                <div className="rounded-2xl border border-border bg-card p-8 mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        What You'll Get
                    </h2>
                    <ul className="grid gap-4 md:grid-cols-2">
                        {elaborate.keyBenefits.map((benefit) => (
                            <li key={benefit} className="flex gap-3">
                                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                                <span className="text-sm text-foreground">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Pro Tips ────────────────────────────────────────────────────── */}
                <div className="rounded-2xl border border-border bg-card p-8 mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-warning" />
                        Pro Tips
                    </h2>
                    <ul className="space-y-3">
                        {elaborate.tips.map((tip) => (
                            <li key={tip} className="text-sm text-foreground">{tip}</li>
                        ))}
                    </ul>
                </div>

                {/* ── CTA ─────────────────────────────────────────────────────────── */}
                <button
                    onClick={handleStart}
                    className="w-full rounded-xl bg-foreground text-background font-bold py-3.5 hover:opacity-90 transition-opacity text-lg"
                >
                    Start with {mode.label}
                </button>
            </section>
        </main>
    )
}
