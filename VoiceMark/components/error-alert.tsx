'use client'

import { AlertTriangle, CheckCircle2, Info, RotateCcw } from 'lucide-react'

interface ErrorAlertProps {
  error: string | null
  suggestions?: string[]
  onDismiss?: () => void
  onRetry?: () => void
  retryable?: boolean
}

const errorTypeMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  permission: { icon: AlertTriangle, color: 'var(--destructive)', bg: 'color-mix(in oklch, var(--destructive) 6%, transparent)' },
  network: { icon: AlertTriangle, color: 'var(--warning)', bg: 'color-mix(in oklch, var(--warning) 6%, transparent)' },
  timeout: { icon: AlertTriangle, color: 'var(--warning)', bg: 'color-mix(in oklch, var(--warning) 6%, transparent)' },
  info: { icon: Info, color: 'var(--primary)', bg: 'color-mix(in oklch, var(--primary) 6%, transparent)' },
  default: { icon: AlertTriangle, color: 'var(--destructive)', bg: 'color-mix(in oklch, var(--destructive) 6%, transparent)' },
}

function getErrorType(error: string): string {
  if (error.toLowerCase().includes('permission') || error.toLowerCase().includes('denied')) return 'permission'
  if (error.toLowerCase().includes('network') || error.toLowerCase().includes('internet')) return 'network'
  if (error.toLowerCase().includes('timeout')) return 'timeout'
  return 'default'
}

export function ErrorAlert({
  error,
  suggestions = [],
  onDismiss,
  onRetry,
  retryable = true,
}: ErrorAlertProps) {
  if (!error) return null

  const errorType = getErrorType(error)
  const config = errorTypeMap[errorType] || errorTypeMap.default
  const Icon = config.icon

  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm leading-relaxed flex flex-col gap-3 animate-fade-in motion-in"
      style={{
        background: config.bg,
        borderColor: `${config.color}33`,
        color: config.color,
      }}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold">{error}</p>

          {suggestions.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs opacity-90">
              {suggestions.slice(0, 2).map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded text-xs font-medium hover:opacity-80 transition-opacity"
          >
            Dismiss
          </button>
        )}
        {retryable && onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-80 flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export function SuccessAlert({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm leading-relaxed flex items-start gap-3 animate-fade-in motion-in"
      style={{
        background: 'color-mix(in oklch, var(--success) 6%, transparent)',
        borderColor: 'color-mix(in oklch, var(--success) 22%, transparent)',
        color: 'var(--success)',
      }}
    >
      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}
