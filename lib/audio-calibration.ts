/**
 * Audio calibration utilities for microphone quality assessment
 * Detects background noise levels and provides audio quality metrics
 */

export interface AudioCalibrationResult {
  noiseLevel: number // 0-1, where 1 is very loud background noise
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  recommendation: string
  isReady: boolean
}

/**
 * Analyzes audio stream for background noise levels
 * @param audioContext - Web Audio API context
 * @param durationMs - Duration to sample (default 1000ms)
 * @returns Promise resolving to calibration result
 */
export async function calibrateMicrophone(
  audioContext: AudioContext,
  stream: MediaStream,
  durationMs: number = 1000,
): Promise<AudioCalibrationResult> {
  return new Promise((resolve, reject) => {
    try {
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048

      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const samples: number[] = []
      const startTime = Date.now()
      const sampleInterval = 50 // Sample every 50ms

      const sampleAudio = () => {
        if (Date.now() - startTime > durationMs) {
          // Analysis complete
          analyser.disconnect()
          source.disconnect()

          const result = calculateNoiseMetrics(samples)
          resolve(result)
          return
        }

        analyser.getByteFrequencyData(dataArray)

        // Calculate RMS energy (simple loudness estimate)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i]
        }
        const rms = Math.sqrt(sum / dataArray.length)
        // Normalize to 0-1
        const normalized = Math.min(1, rms / 255)
        samples.push(normalized)

        setTimeout(sampleAudio, sampleInterval)
      }

      sampleAudio()
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Analyzes collected audio samples to determine noise level
 */
function calculateNoiseMetrics(samples: number[]): AudioCalibrationResult {
  if (samples.length === 0) {
    return {
      noiseLevel: 0,
      quality: 'fair',
      recommendation: 'Could not analyze audio. Please try again.',
      isReady: false,
    }
  }

  // Calculate average and standard deviation
  const average = samples.reduce((a, b) => a + b, 0) / samples.length
  const variance = samples.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / samples.length
  const stdDev = Math.sqrt(variance)

  // Noise level is estimated as the average energy
  // Typical quiet room: 0.03-0.08
  // Normal office: 0.08-0.15
  // Loud environment: 0.15+
  const noiseLevel = Math.min(1, average)

  let quality: 'excellent' | 'good' | 'fair' | 'poor'
  let recommendation = ''
  let isReady = true

  if (noiseLevel < 0.08) {
    quality = 'excellent'
    recommendation = 'Perfect! Your microphone is in a very quiet environment. Ready to record.'
  } else if (noiseLevel < 0.15) {
    quality = 'good'
    recommendation = 'Good audio quality. You can proceed with recording.'
  } else if (noiseLevel < 0.25) {
    quality = 'fair'
    recommendation = 'Some background noise detected. Try minimizing it or moving to a quieter location for best results.'
    isReady = true
  } else {
    quality = 'poor'
    recommendation = 'High background noise detected. Please move to a quieter location or reduce ambient sounds (fans, traffic, etc.).'
    isReady = false
  }

  return {
    noiseLevel,
    quality,
    recommendation,
    isReady,
  }
}

/**
 * Check if browser supports Web Audio API
 */
export function isAudioAPISupported(): boolean {
  if (typeof window === 'undefined') return false
  const audioContext = (window as any).AudioContext || (window as any).webkitAudioContext
  return !!audioContext && !!navigator.mediaDevices?.getUserMedia
}

/**
 * Create a visual representation of noise level (0-100 scale)
 */
export function getNoiseVisualValue(noiseLevel: number): number {
  return Math.round(Math.min(100, noiseLevel * 500))
}

/**
 * Get color recommendation based on noise level
 */
export function getNoiseColor(noiseLevel: number): string {
  if (noiseLevel < 0.08) return 'var(--success)' // Green
  if (noiseLevel < 0.15) return 'var(--primary)' // Blue
  if (noiseLevel < 0.25) return 'var(--warning)' // Orange
  return 'var(--destructive)' // Red
}
