'use client'

import { useMemo, useState } from 'react'
import { Sparkles, X } from 'lucide-react'

type ChatMessage = {
    role: 'user' | 'assistant'
    content: string
}

const STARTER_QUESTIONS = [
    'How do I start an analysis?',
    'Where can I practice with coach mode?',
    'What happens after I record?',
]

export function AskAIWidget() {
    const [open, setOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const canSend = input.trim().length > 0 && !isLoading

    const lastAssistant = useMemo(
        () => [...messages].reverse().find((msg) => msg.role === 'assistant'),
        [messages],
    )

    const sendMessage = async (question: string) => {
        const trimmed = question.trim()
        if (!trimmed) return

        setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
        setIsLoading(true)

        try {
            const res = await fetch('/api/assist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: trimmed }),
            })

            const data = (await res.json()) as { answer?: string; error?: string }

            if (!res.ok || !data.answer) {
                throw new Error(data.error || 'Unable to answer right now.')
            }

            setMessages((prev) => [...prev, { role: 'assistant', content: data.answer as string }])
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to answer right now.'
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Sorry, I couldn't answer that. ${message}` },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const next = input
        setInput('')
        await sendMessage(next)
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Ask AI about VoiceMark"
            >
                <Sparkles className="h-4 w-4 text-primary" />
                Ask AI
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative w-full max-w-lg rounded-3xl border border-border bg-background p-6 shadow-2xl mx-4 sm:mx-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">VoiceMark assistant</p>
                                <p className="text-xs text-muted-foreground">Ask about navigation, features, and next steps.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Close assistant"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {messages.length === 0 && (
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {STARTER_QUESTIONS.map((question) => (
                                        <button
                                            key={question}
                                            type="button"
                                            onClick={() => sendMessage(question)}
                                            className="rounded-2xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="max-h-64 overflow-y-auto rounded-2xl border border-border bg-card/60 p-3 space-y-3" data-lenis-prevent>
                                {messages.map((msg, index) => (
                                    <div
                                        key={`${msg.role}-${index}`}
                                        className={
                                            msg.role === 'user'
                                                ? 'ml-auto w-fit max-w-[85%] rounded-2xl bg-foreground px-3 py-2 text-xs text-background'
                                                : 'mr-auto w-fit max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-xs text-foreground'
                                        }
                                    >
                                        {msg.content}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="mr-auto w-fit max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-xs text-foreground">
                                        Thinking...
                                    </div>
                                )}

                                {!isLoading && messages.length === 0 && lastAssistant && (
                                    <div className="mr-auto w-fit max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-xs text-foreground">
                                        {lastAssistant.content}
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
                            <input
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Ask about VoiceMark..."
                                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
