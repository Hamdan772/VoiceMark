export interface FillerInstance {
	phrase: string
	start: number
	end: number
}

export interface ToneAnalysis {
	primary: 'professional' | 'conversational' | 'aggressive' | 'uncertain' | 'enthusiastic' | 'monotone'
	energy: number
	sentiment: 'positive' | 'neutral' | 'negative'
	insights: string[]
}

export interface AnalysisResult {
	scores: {
		clarity: number
		structure: number
		vocabulary: number
		confidence: number
		overall: number
	}
	fillerWords: {
		count: number
		instances: FillerInstance[]
		breakdown: Record<string, number>
	}
	pace: {
		wpm: number
		label: 'too slow' | 'good' | 'too fast'
	}
	tone?: ToneAnalysis
	tip: string
	takeaway?: string
	hedgingPhrases: string[]
	repetition: Array<{ word: string; count: number }>
	lexicalRichness: { uniqueRatio: number; typeTokenRatio: number }
	sentenceStats: { count: number; avgWords: number; variance: number; longestSentence: number }
	transcript: string
	durationSeconds: number
	aiEnhanced: boolean
}

export type AppState =
	| { phase: 'idle' }
	| { phase: 'report'; result: AnalysisResult }
	| { phase: 'retry'; previous: AnalysisResult }
	| { phase: 'comparison'; previous: AnalysisResult; current: AnalysisResult }

export type UseCaseMode = 'speaking-coach' | 'interview-mode' | 'debate-mode'
