import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import {
  runFallbackAnalysis,
  countFillers,
  detectHedging,
  detectRepetition,
  lexicalRichness,
  sentenceStats,
  estimateWPM,
  classifyPace,
  pickTip,
  analyzeTone,
} from '@/lib/analysis'
import type { AnalysisResult, UseCaseMode } from '@/lib/types'
import { getUseCaseMode } from '@/lib/use-case-modes'
import { getGroqApiKey } from '@/lib/env'
import { badRequest, extractProviderError } from '@/lib/http'

// Helper to validate transcript upfront
function validateTranscript(transcript: string): { valid: boolean; errorMessage?: string } {
  if (!transcript?.trim()) {
    return { valid: false, errorMessage: 'No transcript provided' }
  }
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  if (words.length < 5) {
    return { valid: false, errorMessage: 'Transcript too short (minimum 5 words)' }
  }
  return { valid: true }
}

export async function POST(req: NextRequest) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const { transcript, durationSeconds, persona, accentMode } = (payload ?? {}) as {
    transcript?: unknown
    durationSeconds?: unknown
    useCaseMode?: unknown
    persona?: unknown
    accentMode?: unknown
  }

  const safeMode = (typeof (payload as any)?.useCaseMode === 'string'
    ? (payload as any).useCaseMode
    : null) as UseCaseMode | null

  const useCaseMode: UseCaseMode = ['speaking-coach', 'interview-mode', 'debate-mode'].includes(safeMode ?? '')
    ? (safeMode as UseCaseMode)
    : 'interview-mode'
  const modeConfig = getUseCaseMode(useCaseMode)

  // Extract persona and accent settings
  const safePersona = (typeof persona === 'string' && ['student', 'debater', 'ted-speaker', 'news-anchor'].includes(persona))
    ? persona
    : 'student'
  const safeAccentMode = (typeof accentMode === 'string' && ['native', 'non-native'].includes(accentMode))
    ? accentMode
    : 'native'

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return badRequest('No transcript provided')
  }

  const duration =
    typeof durationSeconds === 'number' && durationSeconds > 0 ? durationSeconds : 30

  // Validate transcript
  const validation = validateTranscript(transcript)
  if (!validation.valid) {
    return badRequest(validation.errorMessage || 'Invalid transcript')
  }

  // Always compute local metrics — deterministic, no API dependency
  const fillerData = countFillers(transcript)
  const hedging = detectHedging(transcript)
  const repetition = detectRepetition(transcript)
  const lex = lexicalRichness(transcript)
  const stats = sentenceStats(transcript)
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const wpm = estimateWPM(words.length, duration)
  const pace: AnalysisResult['pace'] = { wpm, label: classifyPace(wpm) }
  const topFiller =
    Object.entries(fillerData.breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const toneAnalysis = analyzeTone(transcript, words.length, fillerData.count)

  const groqKey = getGroqApiKey()
  if (groqKey) {
    try {
      const client = new Groq({ apiKey: groqKey })

      const fillerBreakdownStr =
        fillerData.count > 0
          ? Object.entries(fillerData.breakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([w, c]) => `"${w}" ×${c}`)
            .join(', ')
          : 'none'

      // Persona-specific instructions
      const personaInstructions: Record<string, string> = {
        'student': 'Frame feedback to help a student build foundational speaking confidence.',
        'debater': 'Emphasise argumentation clarity, counter-argument handling, and persuasiveness.',
        'ted-speaker': 'Focus on storytelling impact, audience engagement, and memorable delivery.',
        'news-anchor': 'Prioritise clarity, professionalism, credibility, and concise pacing.'
      }

      const prompt = `You are a professional speech coach analyzing a spoken transcript.
    USE-CASE MODE: ${modeConfig.label}. ${modeConfig.promptHint}
    SPEAKER PERSONA: ${safePersona}. ${personaInstructions[safePersona]}
${safeAccentMode === 'non-native' ? '\n    ACCENT-AWARE MODE: This speaker has marked their accent as non-native English. Do NOT penalise pronunciation, phonetic differences, or accent-specific features. Focus only on clarity of delivery, pacing, structure, and vocabulary range. Accent differences are not flaws.' : ''}

    Your job is to score the speaker on four dimensions and provide one specific, actionable coaching tip.

COMPUTED METRICS (use these exactly — do not recalculate):
- Filler words: ${fillerData.count}${fillerData.count > 0 ? ` [${fillerBreakdownStr}]` : ''}
- Hedging phrases: ${hedging.length > 0 ? hedging.join(', ') : 'none'}
- Repeated content words: ${repetition.length > 0 ? repetition.map(({ word, count }) => `"${word}" ×${count}`).join(', ') : 'none'}
- Speaking pace: ${wpm} WPM (${pace.label === 'good' ? 'ideal' : pace.label})
- Word count: ${words.length} | Duration: ${duration}s
- Sentence count: ${stats.count} | Avg words/sentence: ${stats.avgWords}
- Lexical diversity: ${Math.round(lex.typeTokenRatio * 100)}%

SCORING RUBRIC:
- clarity (0–100): Penalise filler words heavily (${fillerData.count} found at ${words.length > 0 ? Math.round((fillerData.count / words.length) * 100) : 0}% of words). Long run-on sentences (avg ${stats.avgWords} words) hurt clarity. 0 fillers + clear sentences = 90+. Heavy fillers = 30–50.
- structure (0–100): Reward clear opening/body/close, use of transitions, examples. ${stats.count} sentences detected. No structure = 20–35, partial = 50–70, full with transitions = 80+.
- vocabulary (0–100): Lexical diversity is ${Math.round(lex.typeTokenRatio * 100)}%. Low diversity = 40–55, good = 60–75, rich + precise = 80+.
- confidence (0–100): ${hedging.length} hedging phrase${hedging.length !== 1 ? 's' : ''} found. 0 hedges + declarative language = 85+. Heavy hedging = 40–55.
- overall: MUST equal exactly round(clarity×0.30 + structure×0.25 + vocabulary×0.20 + confidence×0.25).

TIP: Write a single specific coaching tip targeting the speaker's biggest weakness. Be direct and practical. Reference specific numbers from the metrics above. 1–3 sentences maximum.

Return ONLY valid JSON — no markdown, no explanation:
{
  "scores": { "clarity": <int>, "structure": <int>, "vocabulary": <int>, "confidence": <int>, "overall": <int> },
  "tip": "<coaching tip>"
}

TRANSCRIPT (${duration}s, ${words.length} words):
"""
${transcript.slice(0, 4000)}
"""`

      const chat = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 512,
      })

      const raw = chat.choices[0]?.message?.content?.trim() ?? ''
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()

      const parsed = JSON.parse(cleaned)

      if (
        !parsed?.scores ||
        typeof parsed.scores.clarity !== 'number' ||
        typeof parsed.scores.overall !== 'number'
      ) {
        throw new Error('Invalid AI response shape')
      }

      const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)))

      // Generate smart takeaway
      let takeaway: string | undefined
      try {
        const takeawayPrompt = `You are a professional speech coach. Based on this transcript analysis, write a 2-sentence executive summary that captures the speaker's biggest strength and one key improvement area. Be direct, specific, and actionable.

KEY METRICS:
- Overall score: ${clamp(parsed.scores.overall)}/100
- Clarity: ${clamp(parsed.scores.clarity)}/100 (${fillerData.count} fillers found)
- Structure: ${clamp(parsed.scores.structure)}/100
- Vocabulary diversity: ${Math.round(lex.typeTokenRatio * 100)}%
- Confidence: ${clamp(parsed.scores.confidence)}/100 (${hedging.length} hedging phrases)
- Pace: ${wpm} WPM (${pace.label})

TRANSCRIPT (first 1500 chars):
"${transcript.slice(0, 1500)}"

Write ONLY the 2-sentence takeaway. No labels, no extra text. Example: "You opened strong with specific examples, but rushed through the conclusion. Slow down on key points and pause for 2 seconds to let ideas land."`

        const takeawayChat = await client.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: takeawayPrompt }],
          temperature: 0.5,
          max_tokens: 150,
        })

        takeaway = takeawayChat.choices[0]?.message?.content?.trim() ?? undefined
      } catch (err) {
        console.warn('[VoiceMark] Takeaway generation failed, proceeding without it')
      }

      const result: AnalysisResult = {
        scores: {
          clarity: clamp(parsed.scores.clarity),
          structure: clamp(parsed.scores.structure),
          vocabulary: clamp(parsed.scores.vocabulary),
          confidence: clamp(parsed.scores.confidence),
          overall: clamp(parsed.scores.overall),
        },
        fillerWords: fillerData,
        pace,
        tone: toneAnalysis,
        tip: typeof parsed.tip === 'string' && parsed.tip.length > 10
          ? parsed.tip
          : pickTip(
            { clarity: clamp(parsed.scores.clarity), structure: clamp(parsed.scores.structure), vocabulary: clamp(parsed.scores.vocabulary), confidence: clamp(parsed.scores.confidence), overall: clamp(parsed.scores.overall) },
            pace, fillerData.count, topFiller, hedging, words.length, repetition
          ),
        takeaway,
        hedgingPhrases: hedging,
        repetition,
        lexicalRichness: lex,
        sentenceStats: stats,
        transcript,
        durationSeconds: duration,
        aiEnhanced: true,
      }

      return NextResponse.json(result)
    } catch (err) {
      const { status, message } = extractProviderError(err)
      console.warn(
        `[VoiceMark] Groq analysis unavailable (${status ?? 'unknown'}): ${message ?? 'fallback active'}`,
      )
    }
  }

  return NextResponse.json(runFallbackAnalysis(transcript, duration))
}
