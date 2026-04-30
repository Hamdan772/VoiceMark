import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getGroqApiKey } from '@/lib/env'
import { badRequest, extractProviderError } from '@/lib/http'

function fallbackResponse(reason: string) {
  return NextResponse.json({
    transcript: '',
    fallback: true,
    reason,
  })
}

export async function POST(req: NextRequest) {
  const groqKey = getGroqApiKey()

  if (!groqKey) {
    console.warn('[VoiceMark] GROQ_API_KEY missing. Using fallback transcript.')
    return fallbackResponse('missing_api_key')
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return badRequest('No audio file provided')
    }

    const client = new Groq({ apiKey: groqKey })

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      response_format: 'text',
      language: 'en',
      prompt:
        'Transcribe verbatim. Keep disfluencies and hesitation words such as um, uh, er, ah, uhm, and repeated words. Do not clean up grammar.',
    })

    return NextResponse.json({ transcript: transcription, fallback: false })
  } catch (err) {
    const { status, message } = extractProviderError(err)

    const reason =
      status === 401 || status === 403
        ? 'auth_or_network_denied'
        : status === 429
          ? 'rate_limited'
          : 'provider_unavailable'

    console.warn(
      `[VoiceMark] Whisper unavailable (${status ?? 'unknown'}): ${message ?? 'fallback active'}`,
    )
    return fallbackResponse(reason)
  }
}
