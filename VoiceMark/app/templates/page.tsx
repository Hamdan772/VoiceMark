'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowLeft, Sparkles, Wand2 } from 'lucide-react'
import { FlowPath } from '@/components/flow-path'
<<<<<<< HEAD
import { TemplateGallery } from '@/components/template-gallery'
import { useSession } from '@/lib/session-context'
import { getUseCaseMode } from '@/lib/use-case-modes'
=======
import { useSession } from '@/lib/session-context'
import type { UseCaseMode } from '@/lib/types'
>>>>>>> 67de7a1e10aa22c98d1ee4b17356afb46ff19b6f

export default function TemplatesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { session, setSelectedScript } = useSession()

    const initialMode = searchParams.get('mode') ?? session.mode
    const modeConfig = useMemo(() => getUseCaseMode(initialMode), [initialMode])

    const [title, setTitle] = useState('Custom Script')
    const [topic, setTopic] = useState('Explain your topic in a calm, confident tone.')
    const [tone, setTone] = useState('Clear and warm')
    const [length, setLength] = useState('60-90 seconds')
    const [script, setScript] = useState('')

    const buildScript = () => {
        const generated = `Today I will share ${topic.toLowerCase()}\n\nFirst, I will outline the context in a ${tone.toLowerCase()} voice.\nThen I will cover the key points with clear transitions.\nFinally, I will close with one takeaway and a next step.\n\nTarget length: ${length}.`
        setScript(generated)
        setTitle('AI Draft')
    }

<<<<<<< HEAD
    const applyScript = () => {
        if (!script.trim()) return
        setSelectedScript({ script: script.trim(), name: title || 'Custom Script' })
        router.push('/record')
=======
    const { setSelectedScript } = useSession()

    const handleSelectTemplate = (script: string, name?: string) => {
        // Persist only within the session (in-memory)
        setSelectedScript({ script, name: name ?? 'Selected script' })
        router.push(`/studio?mode=${mode}`)
>>>>>>> 67de7a1e10aa22c98d1ee4b17356afb46ff19b6f
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,106,90,0.10),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(255,190,160,0.10),transparent_34%)]" />
                <div className="motion-sheen" />
            </div>

            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
<<<<<<< HEAD
                    <Link href="/modes" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
=======
                    <Link href="/studio" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
>>>>>>> 67de7a1e10aa22c98d1ee4b17356afb46ff19b6f
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        Script setup
                    </div>
                </div>
            </header>

            <section className="relative mx-auto w-full max-w-6xl px-5 py-10">
                <FlowPath
                    title="Setup sequence"
                    subtitle="Use AI or templates to create a script, then head into the studio to record."
                    activeIndex={1}
                    steps={[
<<<<<<< HEAD
                        { label: 'Choose a mode', href: '/modes', description: 'Pick the speaking context.' },
                        { label: 'Pick a script', href: '/templates', description: 'Generate or select a template.' },
                        { label: 'Practice in studio', href: '/record', description: 'Record, analyze, and retry.' },
                        { label: 'Coach mode', href: '/coach', description: 'Live rehearsal support.' },
=======
                        { label: 'Choose a mode', href: '/modes', description: 'Set the speaking context.' },
                        { label: 'Pick a script', href: '/templates', description: 'Generate or browse scripts.' },
                        { label: 'Practice in studio', href: '/studio', description: 'Record and analyze your take.' },
                        { label: 'Coach mode', href: '/coach', description: 'Rehearse with live alignment.' },
>>>>>>> 67de7a1e10aa22c98d1ee4b17356afb46ff19b6f
                    ]}
                />

                <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-border bg-card/70 p-6 motion-in">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Script builder</p>
                                <h1 className="mt-2 text-2xl font-display text-foreground">{modeConfig.emoji} {modeConfig.label}</h1>
                            </div>
                            <div className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                                {modeConfig.length}
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4">
                            <div className="grid gap-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Topic</label>
                                <input
                                    value={topic}
                                    onChange={(event) => setTopic(event.target.value)}
                                    className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                    placeholder="Describe your speaking topic"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tone</label>
                                    <input
                                        value={tone}
                                        onChange={(event) => setTone(event.target.value)}
                                        className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Length</label>
                                    <input
                                        value={length}
                                        onChange={(event) => setLength(event.target.value)}
                                        className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={buildScript}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity btn-press"
                            >
                                <Wand2 className="h-4 w-4" />
                                Generate Script
                            </button>

                            <div className="grid gap-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Script draft</label>
                                <textarea
                                    value={script}
                                    onChange={(event) => setScript(event.target.value)}
                                    rows={8}
                                    className="w-full rounded-3xl border border-border bg-background/80 px-4 py-4 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                                    placeholder="Your script will appear here."
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Ready to record</p>
                                    <p className="text-sm text-foreground">Save your script and head into the studio.</p>
                                </div>
                                <button
                                    onClick={applyScript}
                                    disabled={!script.trim()}
                                    className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 btn-press"
                                >
                                    Use this script
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-card/70 p-6 motion-in" style={{ animationDelay: '90ms' }}>
                        <TemplateGallery
<<<<<<< HEAD
                            onSelectTemplate={(selectedScript, selectedTitle) => {
                                setTitle(selectedTitle)
                                setScript(selectedScript)
                                setSelectedScript({ script: selectedScript, name: selectedTitle })
                            }}
=======
                            onSelectTemplate={(script, name) => handleSelectTemplate(script, name)}
>>>>>>> 67de7a1e10aa22c98d1ee4b17356afb46ff19b6f
                        />
                    </div>
                </div>
            </section>
        </main>
    )
}
