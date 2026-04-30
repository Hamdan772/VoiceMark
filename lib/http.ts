import { NextResponse } from 'next/server'

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function extractProviderError(err: unknown): {
  status?: number
  message?: string
} {
  const status =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined

  const message =
    typeof err === 'object' && err !== null && 'error' in err
      ? (err as { error?: { error?: { message?: string } } }).error?.error?.message
      : undefined

  return { status, message }
}
