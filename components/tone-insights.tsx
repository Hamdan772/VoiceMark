'use client'

import { Lightbulb, Volume2 } from 'lucide-react'
import type { ToneAnalysis } from '@/lib/types'

interface ToneInsightsProps {
  tone: ToneAnalysis
}

const toneColors: Record<ToneAnalysis['primary'], { bg: string; text: string; badge: string }> = {
  professional: { bg: 'bg-blue-500/10', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
  conversational: { bg: 'bg-green-500/10', text: 'text-green-600', badge: 'bg-green-100 text-green-800' },
  aggressive: { bg: 'bg-red-500/10', text: 'text-red-600', badge: 'bg-red-100 text-red-800' },
  uncertain: { bg: 'bg-amber-500/10', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-800' },
  enthusiastic: { bg: 'bg-purple-500/10', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' },
  monotone: { bg: 'bg-gray-500/10', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-800' },
}

export function ToneInsights({ tone }: ToneInsightsProps) {
  const colors = toneColors[tone.primary]

  const getSentimentEmoji = () => {
    switch (tone.sentiment) {
      case 'positive':
        return '😊'
      case 'negative':
        return '😟'
      default:
        return '😐'
    }
  }

  return (
    <div className={`rounded-lg border border-border/50 p-4 space-y-3 ${colors.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className={`h-5 w-5 flex-shrink-0 ${colors.text}`} />
          <div>
            <h3 className="font-semibold text-sm text-foreground">Tone Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">How your speech sounds</p>
          </div>
        </div>
        <span className="text-2xl">{getSentimentEmoji()}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colors.badge}`}>
          {tone.primary}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
          Energy: {tone.energy}%
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colors.badge}`}>
          {tone.sentiment}
        </div>
      </div>

      <div className="space-y-2">
        {tone.insights.map((insight, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
            <span>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
