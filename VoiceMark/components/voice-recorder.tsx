'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Mic,
  Square,
  Loader2,
  Settings,
  X,
} from 'lucide-react'
import type { AnalysisResult, UseCaseMode } from '@/lib/types'
import type { AudioCalibrationResult } from '@/lib/audio-calibration'
import { MicCalibration } from '@/components/mic-calibration'

interface VoiceRecorderProps {
  onResult: (result: AnalysisResult) => void
  isRetry?: boolean
  initialScript?: string
  useCaseMode?: UseCaseMode
  persona?: string
  accentMode?: string | null
  maxDurationSeconds?: number
  challengeLabel?: string
}

type RecordingState = 'idle' | 'calibrating' | 'recording' | 'transcribing' | 'analyzing'

export function VoiceRecorder({
  onResult,
  isRetry = false,
  initialScript,
  useCaseMode,
  persona,
  accentMode,
  maxDurationSeconds,
  challengeLabel,
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [calibrationResult, setCalibrationResult] = useState<AudioCalibrationResult | null>(null)
  const [showCalibration, setShowCalibration] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const limitTimerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const speechRecognitionRef = useRef<any>(null)
  const speechTranscriptRef = useRef('')

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (limitTimerRef.current) clearTimeout(limitTimerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      speechRecognitionRef.current?.stop?.()
    }
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const analyze = useCallback(
    async (transcript: string, durationSeconds: number) => {
      setRecordingState('analyzing')
      setError(null)
      const trimmed = transcript.trim()
      if (trimmed.split(/\s+/).filter(Boolean).length < 5) {
        setRecordingState('idle')
        setError('Please provide at least 5 words to analyze.')
        return
      }
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: trimmed,
            durationSeconds,
            useCaseMode,
            persona: persona || 'student',
            accentMode: accentMode || 'native'
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const result: AnalysisResult = await res.json()
        setRecordingState('idle')
        onResult(result)
      } catch (err) {
        setRecordingState('idle')
        setError('Analysis failed — please check your connection and try again.')
      }
    },
    [onResult, useCaseMode, persona, accentMode],
  )

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (limitTimerRef.current) clearTimeout(limitTimerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setRecordingState('transcribing')
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    audioChunksRef.current = []
    speechTranscriptRef.current = ''
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
    } catch {
      setError('Microphone access denied. Allow microphone permissions in your browser, then try again.')
      return
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognitionCtor) {
      const recognition = new SpeechRecognitionCtor()
      recognition.lang = 'en-US'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event: any) => {
        let finalText = ''
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          const text = result?.[0]?.transcript ?? ''
          if (result?.isFinal && text) finalText += `${text} `
        }
        if (finalText) speechTranscriptRef.current += finalText
      }

      recognition.onend = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          try {
            recognition.start()
          } catch {
            // No-op: some browsers throw if restarted too quickly.
          }
        }
      }

      try {
        recognition.start()
        speechRecognitionRef.current = recognition
      } catch {
        speechRecognitionRef.current = null
      }
    }

    const mimeType =
      ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'].find((m) =>
        MediaRecorder.isTypeSupported(m),
      ) ?? ''
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      speechRecognitionRef.current?.stop?.()
      const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' })
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setRecordingState('transcribing')
      try {
        const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
        const file = new File([blob], `recording.${ext}`, { type: mimeType || 'audio/webm' })
        const fd = new FormData()
        fd.append('audio', file)
        const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const message =
            typeof data?.error === 'string' && data.error.length > 0
              ? data.error
              : 'Transcription failed'
          throw new Error(message)
        }

        const apiTranscript = typeof data?.transcript === 'string' ? data.transcript.trim() : ''
        const browserTranscript = speechTranscriptRef.current.trim()
        const transcript = data?.fallback === true && browserTranscript ? browserTranscript : (apiTranscript || browserTranscript)

        if (!transcript.trim()) {
          setRecordingState('idle')
          setError('No speech detected. Please speak clearly and try again.')
          return
        }
        await analyze(transcript, duration)
      } catch (err) {
        setRecordingState('idle')
        const message = err instanceof Error && err.message ? err.message : 'Transcription failed. Please try recording again.'
        setError(message)
      }
    }
    recorder.start(250)
    setRecordingState('recording')
    setElapsed(0)
    startTimeRef.current = Date.now()
    if (limitTimerRef.current) clearTimeout(limitTimerRef.current)
    if (maxDurationSeconds && maxDurationSeconds > 0) {
      limitTimerRef.current = setTimeout(() => {
        stopRecording()
      }, maxDurationSeconds * 1000)
    }
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }, [analyze, maxDurationSeconds, stopRecording])

  const isRecording = recordingState === 'recording'
  const isTranscribing = recordingState === 'transcribing'
  const isAnalyzing = recordingState === 'analyzing'
  const isBusy = isTranscribing || isAnalyzing

  const statusMap: Record<RecordingState, { label: string; tone: string }> = {
    idle: { label: 'Ready', tone: 'bg-muted text-muted-foreground' },
    calibrating: { label: 'Calibrating', tone: 'bg-secondary text-foreground' },
    recording: { label: 'AI is listening', tone: 'bg-destructive/10 text-destructive' },
    transcribing: { label: 'Transcribing', tone: 'bg-primary/10 text-primary' },
    analyzing: { label: 'Analyzing', tone: 'bg-primary/10 text-primary' },
  }
  const status = statusMap[recordingState]
  const remainingSeconds = maxDurationSeconds ? Math.max(0, maxDurationSeconds - elapsed) : null

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto">

      {/* ── Microphone Primary Card ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card/70 overflow-hidden lift-pro motion-in" style={{ animationDelay: '120ms' }}>
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Mic className="h-4 w-4" />
              {isRetry ? 'Record Your Improved Version' : 'Record Your Speech'}
              <span className="text-[10px] font-normal bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                Whisper
              </span>
              {calibrationResult && (
                <span className="text-[10px] font-semibold bg-secondary text-foreground px-2 py-0.5 rounded-full">
                  Mic: {calibrationResult.quality}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${status.tone}`}>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                {status.label}
                {(isRecording || isTranscribing || isAnalyzing) && (
                  <span className="dot-ellipsis" aria-hidden="true"></span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setShowCalibration(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Microphone settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Tap to start, speak clearly for 30-90 seconds, then tap again to stop.
          </p>
        </div>

        {isBusy && (
          <div className="h-0.5 w-full overflow-hidden" style={{ background: 'var(--muted)' }}>
            <div
              className="h-full"
              style={{
                width: '40%',
                background: 'var(--primary)',
                animation: 'progress-slide 1.2s ease-in-out infinite',
              }}
            />
          </div>
        )}

        <div className="px-5 pb-6 pt-5 flex flex-col items-center gap-5 animate-fade-in">
          {isBusy ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-semibold text-foreground">
                {isTranscribing ? 'Transcribing with Whisper...' : 'Analyzing with AI...'}
              </p>
              <p className="text-xs text-muted-foreground">This takes 5-15 seconds</p>
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center float-soft" style={{ height: 120, width: 120 }}>
                {isRecording && (
                  <>
                    <span
                      className="absolute inline-flex rounded-full animate-ping opacity-20"
                      style={{ height: 120, width: 120, background: 'var(--destructive)' }}
                    />
                    <span
                      className="absolute inline-flex rounded-full animate-ping opacity-25"
                      style={{ height: 84, width: 84, background: 'var(--destructive)', animationDelay: '0.4s' }}
                    />
                  </>
                )}
                {isRecording && (
                  <div className="absolute -top-10 flex items-end gap-1.5 waveform" aria-hidden="true">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <span key={idx} className="waveform-bar" style={{ animationDelay: `${idx * 0.12}s` }} />
                    ))}
                  </div>
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                  className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring hover:scale-110 hover:rotate-3 active:scale-95"
                  style={{
                    background: isRecording ? 'var(--destructive)' : 'var(--primary)',
                  }}
                >
                  {isRecording ? (
                    <Square className="h-6 w-6 fill-white text-white" />
                  ) : (
                    <Mic className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>

              {isRecording ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-mono font-bold tabular-nums text-foreground">
                    {formatTime(elapsed)}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: 'var(--destructive)' }}
                  >
                    <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--destructive)' }} />
                    AI is listening...
                  </span>
                  {remainingSeconds !== null && (
                    <span className="text-xs text-muted-foreground">
                      {challengeLabel ? `${challengeLabel} · ` : ''}{remainingSeconds}s left
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  Ready when you are
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl border px-4 py-3 text-sm leading-relaxed flex items-start gap-2 animate-fade-in motion-in"
          style={{
            background: 'color-mix(in oklch, var(--destructive) 6%, transparent)',
            borderColor: 'color-mix(in oklch, var(--destructive) 22%, transparent)',
            color: 'var(--destructive)',
          }}
        >
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {showCalibration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCalibration(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Microphone calibration</p>
                <p className="text-xs text-muted-foreground">Tune your mic before recording.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCalibration(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close microphone settings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <MicCalibration
              onCalibrationComplete={(result) => {
                setCalibrationResult(result)
                setRecordingState('idle')
              }}
              onCalibrationStart={() => setRecordingState('calibrating')}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress-slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}
