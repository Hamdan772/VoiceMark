'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Volume2, Languages, ShieldCheck, RotateCcw } from 'lucide-react'
import { MicCalibration } from '@/components/mic-calibration'
import { FlowPath } from '@/components/flow-path'
import { useSession } from '@/lib/session-context'
import type { AudioCalibrationResult } from '@/lib/audio-calibration'

export default function SettingsPage() {
    const [calibrationResult, setCalibrationResult] = useState<AudioCalibrationResult | null>(null)
    const { session, setAccentMode } = useSession()

    const handleAccentChange = (nextAccent: string) => {
        setAccentMode(nextAccent)
    }

    return (
        <main className="min-h-screen bg-background">
            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-5">
                    <Link href="/studio" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <div className="text-sm font-semibold text-foreground">Settings & Calibration</div>
                </div>
            </header>

            <section className="mx-auto w-full max-w-4xl px-5 py-10">
                <div className="space-y-8">
                    <FlowPath
                        title="Support flow"
                        subtitle="Calibration is a support task, not part of the main practice loop, so it now sits on its own path."
                        activeIndex={2}
                        steps={[
                            { label: 'Choose a mode', href: '/modes', description: 'Set the speaking context.' },
                            { label: 'Pick a script', href: '/templates', description: 'Prepare your session text.' },
                            { label: 'Practice in studio', href: '/studio', description: 'Record and review.' },
                            { label: 'Calibration', href: '/settings', description: 'Check microphone quality.' },
                        ]}
                    />

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <RotateCcw className="h-5 w-5" />
                                Microphone Calibration
                            </h2>
                            <p className="text-sm text-muted-foreground mt-2">
                                Fine-tune your microphone for optimal voice detection and noise filtering.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-background/50 p-6">
                            <MicCalibration
                                onCalibrationComplete={(result) => setCalibrationResult(result)}
                            />

                            {calibrationResult && (
                                <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/30">
                                    <p className="text-sm font-semibold text-success">✓ Calibration Complete</p>
                                    <p className="text-xs text-success/80 mt-1">
                                        Noise level: {Math.round(calibrationResult.noiseLevel * 100)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Languages className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Language and accent</h2>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Adjust feedback for the way you speak. The goal is to avoid penalising accent variation and keep the feedback focused on clarity, structure, and pacing.
                        </p>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {[
                                { id: 'english-uk', label: 'English (UK)' },
                                { id: 'english-us', label: 'English (US)' },
                                { id: 'english-au', label: 'English (Australian)' },
                                { id: 'non-native', label: 'Non-native English speaker' },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleAccentChange(option.id)}
                                    className={`rounded-2xl border px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${session.accentMode === option.id ? 'border-primary bg-primary/5' : 'border-border bg-background/80'}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-foreground">{option.label}</p>
                                        {session.accentMode === option.id && <ShieldCheck className="h-4 w-4 text-primary" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm leading-6 text-foreground">
                            <div className="flex items-center gap-2 font-semibold text-success">
                                <Volume2 className="h-4 w-4" />
                                Accent-aware feedback is on
                            </div>
                            <p className="mt-1 text-success/90">
                                VoiceMark will focus on clarity, structure, and pacing instead of treating accent variation as a mistake.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-lg font-bold text-foreground mb-2">Keep the page focused</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Calibration is the only setting that directly improves recording quality, so the page now stays centered on that task.
                        </p>
                        <Link
                            href="/studio"
                            className="mt-4 inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                        >
                            Back to studio
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
