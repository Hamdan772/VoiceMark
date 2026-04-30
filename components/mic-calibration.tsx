'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Radio, Zap } from 'lucide-react'
import type { AudioCalibrationResult } from '@/lib/audio-calibration'
import { calibrateMicrophone, isAudioAPISupported, getNoiseVisualValue, getNoiseColor } from '@/lib/audio-calibration'

interface MicCalibrationProps {
  onCalibrationComplete: (result: AudioCalibrationResult) => void
  onCalibrationStart?: () => void
}

export function MicCalibration({ onCalibrationComplete, onCalibrationStart }: MicCalibrationProps) {
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [result, setResult] = useState<AudioCalibrationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  useEffect(() => {
    // Initialize audio context on component mount
    if (typeof window !== 'undefined' && isAudioAPISupported()) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(ctx)
    }
  }, [])

  const startCalibration = async () => {
    setError(null)
    setIsCalibrating(true)
    onCalibrationStart?.()

    try {
      if (!audioContext) {
        throw new Error('Audio API not supported')
      }

      // Resume audio context if suspended (required in some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Run calibration for 2 seconds
      const calibrationResult = await calibrateMicrophone(audioContext, stream, 2000)

      setResult(calibrationResult)
      onCalibrationComplete(calibrationResult)

      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop())
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone access to calibrate.'
          : err instanceof Error
            ? err.message
            : 'Calibration failed. Please try again.'
      setError(message)
      setIsCalibrating(false)
    }
  }

  const getIcon = () => {
    if (!result) return null
    switch (result.quality) {
      case 'excellent':
      case 'good':
        return <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--success)' }} />
      case 'fair':
        return <AlertTriangle className="h-5 w-5" style={{ color: 'var(--warning)' }} />
      case 'poor':
        return <AlertTriangle className="h-5 w-5" style={{ color: 'var(--destructive)' }} />
    }
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <Radio className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-sm">Microphone Calibration</h3>
      </div>

      {!result ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Test your microphone to detect background noise. This helps ensure clear audio for coaching feedback.
          </p>

          {error && (
            <div className="rounded bg-destructive/10 border border-destructive/30 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            onClick={startCalibration}
            disabled={isCalibrating || !audioContext}
            className="w-full px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCalibrating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-current animate-pulse" />
                Listening (2s)...
              </span>
            ) : (
              'Start Calibration'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-sm font-semibold capitalize">{result.quality} Audio</span>
          </div>

          {/* Noise level visualization */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Background Noise</span>
              <span className="text-xs font-mono text-muted-foreground">
                {Math.round(result.noiseLevel * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${getNoiseVisualValue(result.noiseLevel)}%`,
                  backgroundColor: getNoiseColor(result.noiseLevel),
                }}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{result.recommendation}</p>

          {result.isReady && (
            <div className="flex items-center gap-2 rounded bg-success/10 border border-success/30 p-2">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              <span className="text-xs text-success font-medium">Ready to record</span>
            </div>
          )}

          <button
            onClick={() => {
              setResult(null)
              setError(null)
            }}
            className="w-full px-3 py-2 rounded border border-border/50 text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
          >
            Recalibrate
          </button>
        </div>
      )}
    </div>
  )
}
