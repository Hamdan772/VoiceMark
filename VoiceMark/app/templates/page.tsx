'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowLeft, Sparkles, Wand2 } from 'lucide-react'
import { FlowPath } from '@/components/flow-path'
import { TemplateGallery } from '@/components/template-gallery'
import { useSession } from '@/lib/session-context'
import { USE_CASE_MODES, getUseCaseMode } from '@/lib/use-case-modes'
import type { UseCaseMode } from '@/lib/types'

export default function TemplatesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { session, setSelectedScript } = useSession()

    const initialMode = searchParams.get('mode') ?? session.mode
    const modeId = USE_CASE_MODES.some((mode) => mode.id === initialMode)
        ? (initialMode as UseCaseMode)
        : 'interview-mode'
    const modeConfig = useMemo(() => getUseCaseMode(modeId), [modeId])

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

    const applyScript = () => {
        if (!script.trim()) return
        setSelectedScript({ script: script.trim(), name: title || 'Custom Script' })
        router.push('/studio')
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,106,90,0.10),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(255,190,160,0.10),transparent_34%)]" />
                <div className="motion-sheen" />
            </div>

            <header className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
                    <Link href="/studio" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to studio
                    </Link>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        {modeConfig.emoji}
                        {modeConfig.label}
                    </div>
                </div>
            </header>

            <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-12">
                <FlowPath
                    title="Setup sequence"
                    subtitle="Script selection comes after mode selection so the prompts stay relevant to the session."
                    activeIndex={1}
                    steps={[
                        { label: 'Choose a mode', href: '/modes', description: 'Set the speaking context.' },
                        { label: 'Pick a script', href: '/templates', description: 'Generate or browse scripts.' },
                        { label: 'Practice in studio', href: '/studio', description: 'Record and analyze your take.' },
                        { label: 'Coach mode', href: '/coach', description: 'Rehearse with live alignment.' },
                    ]}
                />

                <div className="mt-8 rounded-[28px] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Script setup</p>
                    <h1 className="mt-2 text-3xl font-display leading-tight text-foreground md:text-4xl">
                        Choose a script, then drop straight into practice.
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                        This page is the setup step between choosing a mode and opening the recording studio. Generate a script, use a template, or jump back to the studio when you are ready.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {[
                            'One task per page',
                            'Mode-aware scripts',
                            'Fast handoff to recording',
                        ].map((label) => (
                            <span key={label} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
                    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <WandSparkles className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Generate Script</h2>
                        </div>
                        <p className="mb-4 text-sm leading-6 text-muted-foreground">
                            Describe what you want to practice. I'll generate a script optimized for {modeConfig.label.toLowerCase()}.
                        </p>

                        <div className="space-y-4">
                            <textarea
                                value={useCase}
                                onChange={(e) => setUseCase(e.target.value)}
                                placeholder={`E.g., "Practice explaining a complex technical project in an interview setting" or "Generate a 60-second elevator pitch for my SaaS product"`}
                                className="h-36 w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />

                            <button
                                onClick={handleGenerateScript}
                                disabled={!useCase.trim() || isGenerating}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isGenerating ? 'Generating...' : 'Generate Script'}
                            </button>

                            {generatedScript && (
                                <div className="rounded-2xl border border-border/60 bg-background p-4">
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Generated script</p>
                                    <p className="max-h-56 overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-foreground">{generatedScript}</p>
                                    <button
                                        onClick={() => handleSelectTemplate(generatedScript)}
                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        <Mic2 className="h-4 w-4" />
                                        Use This Script
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Pre-built Templates</h2>
                        </div>
                        <p className="mb-4 text-sm leading-6 text-muted-foreground">
                            Or pick from ready-made scripts designed for {modeConfig.label.toLowerCase()}.
                        </p>
                        <TemplateGallery
                            onSelectTemplate={(script, name) => handleSelectTemplate(script, name)}
                        />
                    </div>
                </div>
            </section>
        </main>
    )
}
