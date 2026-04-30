'use client'

import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background">
            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <Shield className="h-3.5 w-3.5" />
                        Privacy
                    </div>
                </div>
            </header>

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10">
                <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Privacy first, by design.</h1>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        VoiceMark is built for practice. We minimize data exposure so you can focus on improving your delivery.
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground">
                        Your voice is not stored
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold text-foreground">Audio handling</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Audio is processed to generate a transcript and coaching signals, then discarded. VoiceMark does not keep
                            raw audio recordings after analysis.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold text-foreground">Transcript usage</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Transcripts are used to compute feedback metrics. If third-party providers are used for analysis, only the
                            transcript is sent and no audio is retained by VoiceMark.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold text-foreground">Your control</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            You can stop recording at any time. VoiceMark does not require account creation to get feedback.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold text-foreground">Updates</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            If privacy practices change, this page will be updated with clear, simple language before new features are
                            rolled out.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}
