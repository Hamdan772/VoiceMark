'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronUp, ChevronDown, RotateCcw, Minus, Plus, Highlighter } from 'lucide-react'

interface TeleprompterProps {
  scriptText: string
  liveTranscript: string
  isActive: boolean
}

export function Teleprompter({ scriptText, liveTranscript, isActive }: TeleprompterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [fontScale, setFontScale] = useState(2)
  const [progress, setProgress] = useState(0)
  const [highlightSpoken, setHighlightSpoken] = useState(true)

  const fontSizes = {
    0: 'text-sm',
    1: 'text-base',
    2: 'text-lg',
    3: 'text-2xl',
    4: 'text-3xl',
  }
  const fontClass = fontSizes[Math.min(4, Math.max(0, fontScale)) as keyof typeof fontSizes]

  // Calculate scroll position based on transcript progress
  useEffect(() => {
    if (!isActive || !autoScroll || !containerRef.current) return

    // Normalize texts for comparison
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(Boolean)

    const scriptWords = normalizeText(scriptText)
    const transcriptWords = normalizeText(liveTranscript)

    if (scriptWords.length === 0 || transcriptWords.length === 0) return

    // Find where the transcript ends in the script
    let matchPosition = 0
    for (let i = 0; i < transcriptWords.length; i++) {
      const matchIdx = scriptWords.indexOf(transcriptWords[i], matchPosition)
      if (matchIdx !== -1) {
        matchPosition = matchIdx
      }
    }

    // Calculate progress percentage
    const scrollPercent = (matchPosition / scriptWords.length) * 100
    setProgress(Math.min(100, Math.max(0, Math.round(scrollPercent))))

    // Calculate pixel position for smooth scrolling
    const container = containerRef.current
    if (container) {
      const maxScroll = container.scrollHeight - container.clientHeight
      const targetScroll = (scrollPercent / 100) * maxScroll - container.clientHeight / 3
      container.scrollTo({ top: Math.max(0, Math.min(maxScroll, targetScroll)), behavior: 'smooth' })
    }
  }, [liveTranscript, isActive, autoScroll, scriptText])

  const handleManualScroll = (direction: 'up' | 'down') => {
    if (!containerRef.current) return
    const scrollAmount = 150
    containerRef.current.scrollTop += direction === 'down' ? scrollAmount : -scrollAmount
  }

  const handleReset = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }

  // Parse words with their positions for highlighting
  const scriptWords = scriptText.split(/\s+/).filter(Boolean)
  const transcriptWords = liveTranscript.toLowerCase().split(/\s+/).filter(Boolean)

  const getSpokenWords = () => {
    if (!highlightSpoken) return new Set()
    const spokenSet = new Set<number>()
    let scriptIdx = 0

    for (const tword of transcriptWords) {
      while (scriptIdx < scriptWords.length) {
        const swordNorm = scriptWords[scriptIdx].toLowerCase().replace(/[^\w]/g, '')
        const twordNorm = tword.replace(/[^\w]/g, '')
        if (swordNorm.includes(twordNorm) || twordNorm.includes(swordNorm)) {
          spokenSet.add(scriptIdx)
          scriptIdx++
          break
        }
        scriptIdx++
      }
    }
    return spokenSet
  }

  const spokenWords = getSpokenWords()

  return (
    <div className="flex flex-col h-full gap-3">
      {/* ── Controls Header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-2xl border border-border/60 bg-card/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground">TELEPROMPTER</span>
          <span className="text-[10px] font-semibold text-primary ml-2">{progress}%</span>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 p-1">
          <button
            onClick={() => setFontScale((v) => Math.max(0, v - 1))}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
            title="Decrease font size"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-semibold w-6 text-center text-muted-foreground">{fontScale}</span>
          <button
            onClick={() => setFontScale((v) => Math.min(4, v + 1))}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
            title="Increase font size"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-background/40 cursor-pointer hover:bg-muted/40 transition-colors">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3.5 h-3.5"
            />
            <span className="text-xs font-semibold text-muted-foreground">Auto</span>
          </label>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-background/40 cursor-pointer hover:bg-muted/40 transition-colors">
            <Highlighter className="h-3.5 w-3.5 text-primary" />
            <input
              type="checkbox"
              checked={highlightSpoken}
              onChange={(e) => setHighlightSpoken(e.target.checked)}
              className="w-3.5 h-3.5"
            />
          </label>
        </div>
      </div>

      {/* ── Script Display ────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 rounded-3xl border border-border/50 bg-gradient-to-b from-foreground/95 to-foreground/92 p-8 overflow-y-auto shadow-lg"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 70%)',
        }}
      >
        <div className="space-y-5 text-center max-w-3xl mx-auto">
          {scriptText.split('\n').map((line, lineIdx) => (
            line.trim() && (
              <p key={lineIdx} className={`${fontClass} leading-relaxed text-background/85 font-serif tracking-wide`}>
                {line.split(/\s+/).map((word, wordIdx) => {
                  const globalIdx = scriptWords.indexOf(word)
                  const isSpoken = spokenWords.has(globalIdx)

                  return (
                    <span
                      key={wordIdx}
                      className={`transition-all duration-300 ${isSpoken
                          ? 'text-primary font-bold underline decoration-2 underline-offset-2'
                          : 'text-background/70'
                        }`}
                    >
                      {word}{' '}
                    </span>
                  )
                })}
              </p>
            )
          ))}

          {/* Progress indicator */}
          <div className="mt-8 pt-6 border-t border-background/10">
            <div className="h-1 rounded-full bg-background/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Controls ──────────────────────────────────────────── */}
      <div className="flex gap-2 px-3 py-3 rounded-2xl border border-border/60 bg-card/60 backdrop-blur">
        <button
          onClick={() => handleManualScroll('up')}
          disabled={!autoScroll}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-border/70 hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
        >
          <ChevronUp className="h-4 w-4" />
          Scroll up
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-border/70 hover:bg-muted/60 transition-colors text-xs font-semibold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleManualScroll('down')}
          disabled={!autoScroll}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-border/70 hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold"
        >
          <ChevronDown className="h-4 w-4" />
          Scroll down
        </button>
      </div>
    </div>
  )
}
