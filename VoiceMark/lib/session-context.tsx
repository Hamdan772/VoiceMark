'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface SessionState {
  mode: string
  persona: string
  accentMode: string
  selectedScript: { script: string; name: string } | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface SessionContextType {
  session: SessionState
  setMode: (mode: string) => void
  setPersona: (persona: string) => void
  setAccentMode: (accent: string) => void
  setSelectedScript: (script: { script: string; name: string } | null) => void
  setDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void
  reset: () => void
}

const defaultSession: SessionState = {
  mode: 'interview-mode',
  persona: 'student',
  accentMode: 'native',
  selectedScript: null,
  difficulty: 'intermediate',
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(defaultSession)

  const value: SessionContextType = {
    session,
    setMode: (mode: string) => setSession(prev => ({ ...prev, mode })),
    setPersona: (persona: string) => setSession(prev => ({ ...prev, persona })),
    setAccentMode: (accentMode: string) => setSession(prev => ({ ...prev, accentMode })),
    setSelectedScript: (selectedScript) => setSession(prev => ({ ...prev, selectedScript })),
    setDifficulty: (difficulty) => setSession(prev => ({ ...prev, difficulty })),
    reset: () => setSession(defaultSession),
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
