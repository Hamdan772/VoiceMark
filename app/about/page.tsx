'use client'

import Link from 'next/link'
import { ArrowLeft, Mic2, Sparkles } from 'lucide-react'

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background">
            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <Mic2 className="h-3.5 w-3.5" />
                        About
                    </div>
                </div>
            </header>

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10">
                <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">VoiceMark is your speaking gym.</h1>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        We built VoiceMark to help people practice with clarity, confidence, and structure. The goal is simple:
                        make practice feel intentional, measurable, and encouraging.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold text-foreground">What it does</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Record your voice, receive instant coaching signals, and iterate quickly. VoiceMark blends structured
                            scoring with practical tips to help you improve fast.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold text-foreground">Who it is for</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Interview prep, presentations, leadership updates, and everyday communication. If you speak for a living,
                            VoiceMark helps you speak with intent.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold text-foreground">Why it feels human</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Pick a mode that matches your context. You get direct feedback that stays focused on the goal.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Our promise
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            VoiceMark keeps the experience lightweight and privacy-aware, so you can practice often without friction.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}
