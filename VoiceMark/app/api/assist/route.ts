import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getGroqApiKey } from '@/lib/env'
import { badRequest, extractProviderError } from '@/lib/http'

export async function POST(req: NextRequest) {
    let payload: unknown
    try {
        payload = await req.json()
    } catch {
        return badRequest('Invalid JSON body')
    }

    const { question } = (payload ?? {}) as { question?: unknown }
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return badRequest('Question is required')
    }

    const groqKey = getGroqApiKey()
    if (!groqKey) {
        return NextResponse.json({ error: 'Missing GROQ_API_KEY' }, { status: 503 })
    }

    try {
        const client = new Groq({ apiKey: groqKey })

        const prompt = `You are the VoiceMark website assistant. Your job is to explain the website and how to navigate it.

    Primary purpose:
    - Help users find features, understand what each page does, and complete common tasks.

    Allowed pages and actions:
    - Home (/) with overview and "Start Analysis" button.
    - Record (/record) to record or paste a transcript and get analysis.
    - Coach (/coach) for live practice with a script.

    Rules:
    - Be concise and professional (1-4 sentences).
    - Prefer step-by-step guidance ("Go to X, then click Y").
    - If asked unrelated questions, say you only help with this website and offer a relevant next step.
    - Mention the exact place to click or page to visit.

    User question: ${question.trim()}`

        const chat = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 220,
        })

        const answer = chat.choices[0]?.message?.content?.trim()
        if (!answer) {
            return NextResponse.json({ error: 'No response from provider' }, { status: 502 })
        }

        return NextResponse.json({ answer })
    } catch (err) {
        const { status, message } = extractProviderError(err)
        return NextResponse.json(
            { error: message ?? 'Provider unavailable' },
            { status: status ?? 502 },
        )
    }
}
