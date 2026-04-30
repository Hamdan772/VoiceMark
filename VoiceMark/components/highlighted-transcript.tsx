'use client'

import type { FillerInstance } from '@/lib/types'

interface HighlightedTranscriptProps {
  transcript: string
  fillerInstances: FillerInstance[]
}

export function HighlightedTranscript({ transcript, fillerInstances }: HighlightedTranscriptProps) {
  // Normalise exactly as the analysis engine does
  const norm = transcript
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (fillerInstances.length === 0) {
    return (
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono">
        {norm}
      </p>
    )
  }

  // Sort by position, deduplicate overlapping ranges
  const sorted = [...fillerInstances].sort((a, b) => a.start - b.start)
  const deduped: FillerInstance[] = []
  let lastEnd = -1
  for (const inst of sorted) {
    if (inst.start >= lastEnd) {
      deduped.push(inst)
      lastEnd = inst.end
    }
  }

  const parts: Array<{ text: string; isHighlight: boolean; phrase?: string }> = []
  let cursor = 0

  for (const inst of deduped) {
    if (inst.start > cursor) {
      parts.push({ text: norm.slice(cursor, inst.start), isHighlight: false })
    }
    if (inst.start >= cursor) {
      parts.push({ text: norm.slice(inst.start, inst.end), isHighlight: true, phrase: inst.phrase })
      cursor = inst.end
    }
  }
  if (cursor < norm.length) {
    parts.push({ text: norm.slice(cursor), isHighlight: false })
  }

  return (
    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono">
      {parts.map((part, i) =>
        part.isHighlight ? (
          <mark key={i} title={`Filler: "${part.phrase}"`} className="filler-highlight">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  )
}
