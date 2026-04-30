/**
 * Error handling utilities for VoiceMark
 */

export interface VoiceMarkError {
  code: string
  message: string
  userMessage: string
  recovery?: string
  retryable: boolean
}

export const ErrorCodes = {
  // Permission errors
  MIC_PERMISSION_DENIED: 'MIC_PERMISSION_DENIED',
  MIC_NOT_FOUND: 'MIC_NOT_FOUND',
  CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',

  // API errors
  GROQ_RATE_LIMITED: 'GROQ_RATE_LIMITED',
  GROQ_API_ERROR: 'GROQ_API_ERROR',
  GROQ_TIMEOUT: 'GROQ_TIMEOUT',
  WHISPER_API_ERROR: 'WHISPER_API_ERROR',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  NO_INTERNET: 'NO_INTERNET',

  // Audio errors
  SPEECH_RECOGNITION_NOT_SUPPORTED: 'SPEECH_RECOGNITION_NOT_SUPPORTED',
  AUDIO_PROCESSING_ERROR: 'AUDIO_PROCESSING_ERROR',
  NO_AUDIO_DETECTED: 'NO_AUDIO_DETECTED',

  // Validation errors
  INVALID_TRANSCRIPT: 'INVALID_TRANSCRIPT',
  TRANSCRIPT_TOO_SHORT: 'TRANSCRIPT_TOO_SHORT',
  TRANSCRIPT_TOO_LONG: 'TRANSCRIPT_TOO_LONG',

  // Browser support
  BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED',
  STORAGE_NOT_AVAILABLE: 'STORAGE_NOT_AVAILABLE',
}

const errorMap: Record<string, VoiceMarkError> = {
  [ErrorCodes.MIC_PERMISSION_DENIED]: {
    code: ErrorCodes.MIC_PERMISSION_DENIED,
    message: 'Microphone access denied',
    userMessage: 'We need microphone access to record your speech. Please allow microphone access in your browser settings and try again.',
    recovery: 'Check your browser permissions and allow VoiceMark to use your microphone.',
    retryable: true,
  },

  [ErrorCodes.MIC_NOT_FOUND]: {
    code: ErrorCodes.MIC_NOT_FOUND,
    message: 'No microphone found',
    userMessage: 'We could not find a microphone on your device. Please connect a microphone and try again.',
    recovery: 'Connect a microphone to your computer and refresh the page.',
    retryable: true,
  },

  [ErrorCodes.GROQ_RATE_LIMITED]: {
    code: ErrorCodes.GROQ_RATE_LIMITED,
    message: 'API rate limit exceeded',
    userMessage: 'Our speech coaching service is experiencing high demand. Using offline analysis instead, which still provides valuable feedback.',
    recovery: 'Try again in a few moments. Offline analysis is available now.',
    retryable: true,
  },

  [ErrorCodes.GROQ_TIMEOUT]: {
    code: ErrorCodes.GROQ_TIMEOUT,
    message: 'Analysis service timeout',
    userMessage: 'The AI analysis is taking longer than expected. We\'ll use our offline analysis which is still very effective.',
    recovery: 'Results are ready using our offline analysis.',
    retryable: true,
  },

  [ErrorCodes.GROQ_API_ERROR]: {
    code: ErrorCodes.GROQ_API_ERROR,
    message: 'AI analysis failed',
    userMessage: 'The AI analysis encountered an error. We\'ll provide analysis using our built-in rules instead.',
    recovery: 'Your results are ready with our standard analysis.',
    retryable: true,
  },

  [ErrorCodes.NETWORK_ERROR]: {
    code: ErrorCodes.NETWORK_ERROR,
    message: 'Network connection error',
    userMessage: 'Please check your internet connection and try again. We can provide offline analysis if needed.',
    recovery: 'Check your internet connection and try again.',
    retryable: true,
  },

  [ErrorCodes.NO_AUDIO_DETECTED]: {
    code: ErrorCodes.NO_AUDIO_DETECTED,
    message: 'No audio detected',
    userMessage: 'We didn\'t detect any speech in your recording. Please speak clearly and try again.',
    recovery: 'Make sure your microphone is working and speak clearly during recording.',
    retryable: true,
  },

  [ErrorCodes.TRANSCRIPT_TOO_SHORT]: {
    code: ErrorCodes.TRANSCRIPT_TOO_SHORT,
    message: 'Transcript too short',
    userMessage: 'Please provide at least 5 words to analyze. Speak for at least 10-15 seconds.',
    recovery: 'Record a longer speech sample (at least 30 seconds recommended).',
    retryable: true,
  },

  [ErrorCodes.SPEECH_RECOGNITION_NOT_SUPPORTED]: {
    code: ErrorCodes.SPEECH_RECOGNITION_NOT_SUPPORTED,
    message: 'Speech recognition not supported',
    userMessage: 'Your browser doesn\'t support speech recognition. Please try Chrome, Edge, or Safari.',
    recovery: 'Use a supported browser (Chrome, Edge, Safari, or Firefox).',
    retryable: false,
  },

  [ErrorCodes.BROWSER_NOT_SUPPORTED]: {
    code: ErrorCodes.BROWSER_NOT_SUPPORTED,
    message: 'Browser not supported',
    userMessage: 'VoiceMark works best on modern browsers. Please update your browser.',
    recovery: 'Update to the latest version of your browser.',
    retryable: false,
  },

  [ErrorCodes.STORAGE_NOT_AVAILABLE]: {
    code: ErrorCodes.STORAGE_NOT_AVAILABLE,
    message: 'Local storage not available',
    userMessage: 'Your browser\'s storage is disabled. Enable cookies/storage to save your recordings.',
    recovery: 'Enable local storage in your browser settings.',
    retryable: true,
  },
}

/**
 * Parse error to VoiceMarkError
 */
export function parseError(error: unknown): VoiceMarkError {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.name === 'NotAllowedError') {
      return errorMap[ErrorCodes.MIC_PERMISSION_DENIED]
    }
    if (error.name === 'NotFoundError') {
      return errorMap[ErrorCodes.MIC_NOT_FOUND]
    }
    if (error.message.includes('rate')) {
      return errorMap[ErrorCodes.GROQ_RATE_LIMITED]
    }
    if (error.message.includes('timeout')) {
      return errorMap[ErrorCodes.GROQ_TIMEOUT]
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
  }
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(code: string): string {
  return errorMap[code]?.userMessage || 'An error occurred. Please try again.'
}

/**
 * Create error recovery suggestions
 */
export function getErrorRecoverySuggestions(code: string): string[] {
  const error = errorMap[code]
  if (!error) return []

  const suggestions: string[] = []

  if (error.recovery) {
    suggestions.push(error.recovery)
  }

  // Add generic suggestions based on error type
  if (code.includes('MIC')) {
    suggestions.push('Check that your microphone is properly connected')
    suggestions.push('Try reloading the page')
  }

  if (code.includes('API') || code.includes('GROQ')) {
    suggestions.push('Try again in a few moments')
    suggestions.push('Use the offline analysis in the meantime')
  }

  if (code.includes('NETWORK')) {
    suggestions.push('Check your internet connection')
    suggestions.push('Try again when your connection is stable')
  }

  return suggestions
}

/**
 * Check if browser has required APIs
 */
export function checkBrowserSupport(): { supported: boolean; issues: string[] } {
  const issues: string[] = []

  if (typeof window === 'undefined') {
    return { supported: false, issues: ['Not running in browser environment'] }
  }

  // Check for AudioContext
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    issues.push('Web Audio API not supported')
  }

  // Check for MediaDevices
  if (!navigator.mediaDevices?.getUserMedia) {
    issues.push('Microphone access not supported')
  }

  // Check for SpeechRecognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) {
    issues.push('Speech Recognition not supported')
  }

  // Check for localStorage
  // Local storage is intentionally not required in privacy-first mode.
  // Skip write tests to avoid creating persistent data or triggering storage errors.

  return {
    supported: issues.length === 0,
    issues,
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Validate transcript
 */
export function validateTranscript(transcript: string): {
  valid: boolean
  error?: VoiceMarkError
} {
  if (!transcript || transcript.trim().length === 0) {
    return {
      valid: false,
      error: errorMap[ErrorCodes.NO_AUDIO_DETECTED],
    }
  }

  const words = transcript.trim().split(/\s+/).filter(Boolean)

  if (words.length < 5) {
    return {
      valid: false,
      error: errorMap[ErrorCodes.TRANSCRIPT_TOO_SHORT],
    }
  }

  if (words.length > 10000) {
    return {
      valid: false,
      error: errorMap[ErrorCodes.TRANSCRIPT_TOO_LONG],
    }
  }

  return { valid: true }
}
