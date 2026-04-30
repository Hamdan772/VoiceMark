"use client"

import Link from 'next/link'
import { FlowPath } from '@/components/flow-path'
import { WandSparkles, Search } from 'lucide-react'
import { TemplateGallery } from '@/components/template-gallery'
import { useSession } from '@/lib/session-context'
import { useState } from 'react'

export default function ScriptPage() {
	const { session, setSelectedScript } = useSession()
	const [prompt, setPrompt] = useState('')
	const [isGenerating, setIsGenerating] = useState(false)
	const [generated, setGenerated] = useState<string | null>(null)

	const handleGenerate = async () => {
		if (!prompt.trim()) return
		setIsGenerating(true)
		try {
			const res = await fetch('/api/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, mode: session.mode }) })
			const data = await res.json()
			setGenerated(data.response || '')
		} catch (err) {
			console.error(err)
		} finally {
			setIsGenerating(false)
		}
	}

	const useScript = (script: string, name?: string) => {
		setSelectedScript({ script, name: name ?? 'Selected script' })
		// navigate to studio
		location.href = `/studio?mode=${session.mode}`
	}

	return (
		<main className="min-h-screen bg-background">
			<section className="mx-auto w-full max-w-6xl px-5 py-10">
				<FlowPath
					title="Script setup"
					subtitle="Generate or pick a template, then go to the studio to practice."
					activeIndex={1}
					steps={[
						{ label: 'Choose a mode', href: '/modes', description: 'Set the speaking context.' },
						{ label: 'Pick a script', href: '/script', description: 'Generate or browse scripts.' },
						{ label: 'Practice in studio', href: '/studio', description: 'Record and analyze your take.' },
						{ label: 'Coach mode', href: '/coach', description: 'Rehearse with live alignment.' },
					]}
				/>

				<div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
					<div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
						<div className="mb-4 flex items-center gap-2">
							<WandSparkles className="h-5 w-5 text-primary" />
							<h2 className="text-lg font-bold">AI generate</h2>
						</div>
						<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-40 p-4 rounded-2xl border border-border bg-background text-sm" placeholder="Describe the script you want (tone, duration, audience)" />
						<div className="mt-3 flex gap-3">
							<button onClick={handleGenerate} className="rounded-full bg-foreground px-5 py-2 text-sm text-background">{isGenerating ? 'Generating…' : 'Generate'}</button>
							<Link href="/studio" className="rounded-full border border-border px-5 py-2 text-sm">Skip and go to studio</Link>
						</div>
						{generated && (
							<div className="mt-4 rounded-2xl border border-border p-4 bg-background">
								<pre className="whitespace-pre-wrap text-sm">{generated}</pre>
								<div className="mt-3 flex gap-2">
									<button onClick={() => useScript(generated, 'AI Generated')} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Use script</button>
								</div>
							</div>
						)}
					</div>

					<div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
						<div className="mb-4 flex items-center gap-2">
							<Search className="h-5 w-5 text-primary" />
							<h2 className="text-lg font-bold">Templates</h2>
						</div>
						<p className="text-sm text-muted-foreground mb-4">Pick a ready-made script tailored to your selected mode.</p>
						<TemplateGallery onSelectTemplate={(s, n) => useScript(s, n)} />
					</div>
				</div>
			</section>
		</main>
	)
}
