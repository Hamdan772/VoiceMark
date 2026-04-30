'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Mic2, ShieldCheck, RotateCcw } from 'lucide-react'
import { MicCalibration } from '@/components/mic-calibration'
import { FlowPath } from '@/components/flow-path'
import { useSession } from '@/lib/session-context'

export default function SettingsPage() {
    const { session, setAccentMode } = useSession()
    const [status, setStatus] = useState('')

    return (
        <main className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,106,90,0.10),transparent_36%),radial-gradient(circle_at_90%_0%,rgba(255,190,160,0.10),transparent_34%)]" />
                <div className="motion-sheen" />
            </div>

            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
                    <Link href="/studio" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to studio
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Settings
                    </div>
                </div>
            </header>

            <section className="relative mx-auto w-full max-w-5xl px-5 py-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <FlowPath
                            title="Support flow"
                            subtitle="Calibration is a support task, not part of the main practice loop."
                            activeIndex={2}
                            steps={[
                                { label: 'Choose a mode', href: '/modes', description: 'Set the speaking context.' },
                                { label: 'Pick a script', href: '/templates', description: 'Prepare your session text.' },
                                { label: 'Practice in studio', href: '/studio', description: 'Record and review.' },
                                { label: 'Calibration', href: '/settings', description: 'Check microphone quality.' },
                            ]}
                        />

                        <div className="rounded-3xl border border-border bg-card/70 p-6 motion-in">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <Mic2 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Microphone</p>
                                    <h1 className="text-2xl font-display text-foreground">Calibrate your setup</h1>
                                </div>
                            </div>

                            <div className="mt-6">
                                <MicCalibration
                                    onCalibrationStart={() => setStatus('Listening for background noise...')}
                                    onCalibrationComplete={(result) => setStatus(`Calibration: ${result.quality}`)}
                                />
                                {status && <p className="mt-3 text-xs text-muted-foreground">{status}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-border bg-card/70 p-6 motion-in" style={{ animationDelay: '90ms' }}>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Accent preference</p>
                            <h2 className="mt-2 text-xl font-display text-foreground">Set your coaching bias guard</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Accent preferences help keep feedback focused on clarity and structure, not identity.</p>

                            <div className="mt-5 grid gap-3">
                                {[
                                    { id: 'native', label: 'Native English' },
                                    { id: 'non-native', label: 'Non-native English' },
                                    { id: 'uk', label: 'English - UK' },
                                    { id: 'us', label: 'English - US' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setAccentMode(item.id)}
                                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors btn-press ${session.accentMode === item.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background/80 text-muted-foreground hover:bg-muted/60'}`}
                                    >
                                        <span>{item.label}</span>
                                        {session.accentMode === item.id && <span className="text-xs font-semibold text-primary">Selected</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">We never store raw audio. Transcription happens locally and only your text is analyzed.</div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h2 className="text-lg font-bold text-foreground mb-2">Keep the page focused</h2>
                            <p className="text-sm leading-6 text-muted-foreground">Calibration is the only setting that directly improves recording quality, so the page stays centered on that task.</p>
                            <Link href="/studio" className="mt-4 inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90">Back to studio</Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
