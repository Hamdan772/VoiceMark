'use client'

import { useEffect, useState } from 'react'
import { VoiceRecorder } from '@/components/voice-recorder'
import { ReportCard } from '@/components/report-card'
import { ComparisonView } from '@/components/comparison-view'
import type { AnalysisResult, AppState, UseCaseMode } from '@/lib/types'
import { USE_CASE_MODES, getUseCaseMode } from '@/lib/use-case-modes'
import { Mic2, ArrowLeft, Sparkles, Settings } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FlowPath } from '@/components/flow-path'
import { useSession } from '@/lib/session-context'

export default function RecordPage() {
    const [appState, setAppState] = useState<AppState>({ phase: 'idle' })
    const [selectedTemplate, setSelectedTemplate] = useState<{ script: string; name: string } | null>(null)
    const [useCaseMode, setUseCaseMode] = useState<UseCaseMode>('interview-mode')
    const { session } = useSession()
    const searchParams = useSearchParams()

    useEffect(() => {
        const queryMode = searchParams.get('mode')
        if (queryMode && USE_CASE_MODES.some((mode) => mode.id === queryMode)) {
            setUseCaseMode(queryMode as UseCaseMode)
        } else if (session.mode) {
            setUseCaseMode(session.mode as UseCaseMode)
        }
    }, [searchParams, session.mode])

    useEffect(() => {
        if (session.selectedScript) {
            setSelectedTemplate(session.selectedScript)
        }
    }, [session.selectedScript])

    function handleResult(result: AnalysisResult) {
        if (appState.phase === 'retry') {
            setAppState({ phase: 'comparison', previous: appState.previous, current: result })
        } else {
            setAppState({ phase: 'report', result })
        }
    }

    function handleRetry() {
        if (appState.phase === 'report') {
            setAppState({ phase: 'retry', previous: appState.result })
        } else if (appState.phase === 'comparison') {
            setAppState({ phase: 'retry', previous: appState.current })
        }
    }

    function handleReset() {
        setAppState({ phase: 'idle' })
        setSelectedTemplate(null)
    }

    const isRetry = appState.phase === 'retry'
    const showBack = appState.phase !== 'idle'
    const modeConfig = getUseCaseMode(useCaseMode)

    return (
        <main className="relative min-h-screen flex flex-col overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,106,90,0.10),transparent_40%),radial-gradient(circle_at_88%_0%,rgba(255,190,160,0.10),transparent_36%)]" />
                <div className="motion-sheen" />
            </div>
            {/* ── Navbar ──────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 -ml-1">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105"
                            style={{ background: 'var(--primary)', color: 'white' }}
                        >
                            <Mic2 className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-base font-extrabold leading-none text-foreground tracking-tight">VoiceMark</p>
                            <p className="text-[10px] text-muted-foreground leading-none mt-1 font-bold uppercase tracking-widest">
                                AI Speech Coach
                            </p>
                        </div>
                    </Link>

                    {showBack && (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/coach"
                                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full px-4 py-2 hover:bg-secondary"
                            >
                                <Sparkles className="h-4 w-4" />
                                Coach mode
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full px-4 py-2 hover:bg-secondary"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Settings</span>
                            </Link>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full px-4 py-2 hover:bg-secondary"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Start over
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="relative flex-1 w-full max-w-5xl mx-auto px-5 py-10 flex flex-col gap-12">
                {/* ── Initial Record View ─────────────────────────────────────── */}
                {appState.phase === 'idle' && (
                    <section className="flex flex-col items-center gap-10">
                        {session.accentMode === 'non-native' && (
                            <div className="w-full max-w-3xl rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm leading-6 text-foreground">
                                <span className="font-semibold text-success">Accent-aware feedback is on.</span> Your accent will not affect your score.
                            </div>
                        )}

                        <FlowPath
                            title="Studio flow"
                            subtitle="This page is for doing the recording work after setup is finished."
                            activeIndex={2}
                            steps={[
                                { label: 'Choose a mode', href: '/modes', description: 'Pick the speaking context.' },
                                { label: 'Pick a script', href: '/templates', description: 'Prepare the prompt or template.' },
                                { label: 'Practice in studio', href: '/record', description: 'Record, analyze, and retry.' },
                                { label: 'Coach mode', href: '/coach', description: 'Live rehearsal support.' },
                            ]}
                        />

                        <div className="text-center space-y-3 mt-8 max-w-2xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Practice studio</p>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Record, review, and retry without extra setup clutter.</h1>
                            <p className="text-muted-foreground">
                                Use the dedicated pages to choose a mode and script first, then come here when you are ready to record.
                            </p>
                        </div>

                        <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
                            <Link
                                href="/modes"
                                className="rounded-2xl border border-border bg-card/70 p-5 text-left transition-colors hover:bg-muted/60"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 1</p>
                                <h2 className="mt-2 text-lg font-semibold text-foreground">Choose a mode</h2>
                                <p className="mt-2 text-sm text-muted-foreground">Pick the speaking context that will shape your feedback.</p>
                            </Link>
                            <Link
                                href={`/templates?mode=${useCaseMode}`}
                                className="rounded-2xl border border-border bg-card/70 p-5 text-left transition-colors hover:bg-muted/60"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 2</p>
                                <h2 className="mt-2 text-lg font-semibold text-foreground">Choose a script</h2>
                                <p className="mt-2 text-sm text-muted-foreground">Browse a template or generate a new prompt with AI.</p>
                            </Link>
                            <Link
                                href="/coach"
                                className="rounded-2xl border border-border bg-card/70 p-5 text-left transition-colors hover:bg-muted/60"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Optional</p>
                                <h2 className="mt-2 text-lg font-semibold text-foreground">Switch to coach mode</h2>
                                <p className="mt-2 text-sm text-muted-foreground">Use live alignment when you want to rehearse a script.</p>
                            </Link>
                        </div>

                        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card/70 p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mode</p>
                            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{modeConfig.emoji} {modeConfig.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{modeConfig.description}</p>
                                </div>
                                <Link
                                    href="/modes"
                                    className="inline-flex items-center justify-center rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/40"
                                >
                                    Change mode
                                </Link>
                            </div>
                        </div>

                        {/* Voice Recorder */}
                        <div className="w-full max-w-xl mx-auto">
                            {selectedTemplate && (
                                <div
                                    className="mb-6 rounded-lg border p-4"
                                    style={{
                                        background: 'color-mix(in oklch, var(--success) 6%, transparent)',
                                        borderColor: 'color-mix(in oklch, var(--success) 20%, transparent)',
                                    }}
                                >
                                    <p className="text-sm font-semibold text-foreground mb-2">
                                        Template: {selectedTemplate.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-3">{selectedTemplate.script}</p>
                                    <button
                                        onClick={() => setSelectedTemplate(null)}
                                        className="text-xs font-semibold text-muted-foreground hover:text-foreground underline"
                                    >
                                        Clear template
                                    </button>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link
                                            href="/templates"
                                            className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60"
                                        >
                                            Pick a different script
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60"
                                        >
                                            Mic calibration
                                        </Link>
                                    </div>
                                </div>
                            )}
                            <VoiceRecorder
                                onResult={handleResult}
                                isRetry={false}
                                initialScript={selectedTemplate?.script}
                                useCaseMode={useCaseMode}
                                persona={session.persona}
                                accentMode={session.accentMode}
                            />
                        </div>
                    </section>
                )}

                {/* ── Retry ───────────────────────────────────────────────────── */}
                {isRetry && (
                    <section className="flex flex-col items-center gap-6">
                        <div
                            className="w-full max-w-2xl rounded-2xl border p-5"
                            style={{
                                background: 'color-mix(in oklch, var(--primary) 4%, transparent)',
                                borderColor: 'color-mix(in oklch, var(--primary) 18%, transparent)',
                            }}
                        >
                            <p className="text-sm font-bold text-foreground mb-1.5">Apply the tip and go again</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Put the coaching tip into practice, then submit your revised version below.
                                We&apos;ll show a side-by-side comparison of every metric so you can see exactly what improved.
                            </p>
                        </div>
                        <VoiceRecorder 
                            onResult={handleResult} 
                            isRetry 
                            useCaseMode={useCaseMode}
                            persona={session.persona}
                            accentMode={session.accentMode}
                        />
                    </section>
                )}

                {/* ── Report ──────────────────────────────────────────────────── */}
                {appState.phase === 'report' && (
                    <ReportCard
                        result={appState.result}
                        onRetry={handleRetry}
                        useCaseMode={useCaseMode}
                    />
                )}

                {/* ── Comparison ──────────────────────────────────────────────── */}
                {appState.phase === 'comparison' && (
                    <ComparisonView
                        previous={appState.previous}
                        current={appState.current}
                        onRetry={handleRetry}
                        onReset={handleReset}
                        useCaseMode={useCaseMode}
                    />
                )}
            </div>

            <footer className="border-t border-border py-5 mt-auto">
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                    <p>VoiceMark &middot; No audio stored, ever. &middot; Transcription powered by Groq Whisper</p>
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
