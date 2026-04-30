'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Sparkles, UserRound, Trophy, Radio, Mic2 } from 'lucide-react'
import { USE_CASE_MODES } from '@/lib/use-case-modes'
import { FlowPath } from '@/components/flow-path'
import { useSession } from '@/lib/session-context'

export default function ModesPage() {
    const router = useRouter()
    const { session, setMode, setPersona } = useSession()

    const handleSelect = (modeId: string) => {
        setMode(modeId)
    }

    const handlePersona = (nextPersona: string) => {
        setPersona(nextPersona)
    }

    return (
        <main className="min-h-screen bg-background">
            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
                    <Link href="/studio" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        Use-case modes
                    </div>
                </div>
            </header>

            <section className="mx-auto w-full max-w-6xl px-5 py-10">
                <FlowPath
                    title="Setup sequence"
                    subtitle="Mode is the first decision. It shapes the script suggestions and feedback tone that follow."
                    activeIndex={0}
                    steps={[
                        { label: 'Choose a mode', href: '/modes', description: 'Interview, speaking coach, or debate.' },
                        { label: 'Pick a script', href: '/templates', description: 'Templates and AI generation.' },
                        { label: 'Practice in studio', href: '/record', description: 'Record, analyze, and compare.' },
                        { label: 'Coach mode', href: '/coach', description: 'Live script alignment and rehearsal.' },
                    ]}
                />

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {USE_CASE_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => handleSelect(mode.id)}
                          className={`rounded-3xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${session.mode === mode.id ? 'border-primary ring-2 ring-primary/10' : 'border-border'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mode</p>
                                    <h2 className="mt-2 text-xl font-bold text-foreground">
                                        <span className="mr-2">{mode.emoji}</span>
                                        {mode.label}
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground">{mode.description}</p>
                                </div>
                                <div className="rounded-2xl border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                                    Focused
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Special features</p>
                                <div className="mt-3 space-y-2">
                                    {mode.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-2 text-sm text-foreground">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                                                        <div className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold">
                                                            <span className="text-muted-foreground">Selected for the next script step</span>
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-foreground">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                                                Choose
                                                            </span>
                                                        </div>
                                                </button>
                    ))}
                </div>

                                <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <UserRound className="h-5 w-5 text-primary" />
                                        <h2 className="text-lg font-bold text-foreground">Speaking persona</h2>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Personas change the tone of feedback for the same recording. They are feedback styles, not identity labels.
                                    </p>
                                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                                        {[
                                            { id: 'student', label: 'Student', icon: Mic2, copy: 'Clear, balanced coaching.' },
                                            { id: 'debater', label: 'Debater', icon: Trophy, copy: 'Sharper structure and conviction.' },
                                            { id: 'ted-speaker', label: 'TED Speaker', icon: Radio, copy: 'Pausing and emotional arc.' },
                                            { id: 'news-anchor', label: 'News Anchor', icon: Sparkles, copy: 'Polished delivery and pace.' },
                                        ].map((item) => {
                                            const Icon = item.icon
                                            const active = session.persona === item.id
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handlePersona(item.id)}
                                                    className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-primary bg-primary/5' : 'border-border bg-background/80'}`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Icon className="h-4 w-4 text-primary" />
                                                        {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                                    </div>
                                                    <p className="mt-3 text-sm font-semibold text-foreground">{item.label}</p>
                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.copy}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Next step</p>
                                        <p className="mt-1 text-sm text-foreground">
                                            {session.mode ? 'Continue to script setup with your selected mode.' : 'Select a mode to continue.'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!session.mode}
                                        onClick={() => session.mode && router.push(`/templates?mode=${session.mode}`)}
                                        className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Continue to script
                                    </button>
                                </div>
            </section>
        </main>
    )
}
