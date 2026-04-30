import type { UseCaseMode } from './types'

export type UseCaseModeConfig = {
    id: UseCaseMode
    emoji: string
    label: string
    description: string
    promptHint: string
    features: string[]
}

export const USE_CASE_MODES: UseCaseModeConfig[] = [
    {
        id: 'speaking-coach',
        emoji: '🎓',
        label: 'Speaking Coach',
        description: 'Clean, confident delivery for everyday speaking.',
        promptHint: 'Provide balanced feedback for general speaking and clarity improvements.',
        features: [
            'Balanced clarity, confidence, and structure feedback',
            'Friendly pace and filler guidance',
            'Great for day-to-day communication',
        ],
    },
    {
        id: 'interview-mode',
        emoji: '💼',
        label: 'Interview Mode',
        description: 'Structured, concise answers with measurable impact.',
        promptHint: 'Focus on concise, structured answers with confident, measurable claims.',
        features: [
            'Answer structure: opener, evidence, close',
            'Confidence-driven language checks',
            'STAR and metric-forward framing tips',
        ],
    },
    {
        id: 'debate-mode',
        emoji: '🧠',
        label: 'Debate mode',
        description: 'Argument clarity, evidence, and sharp rebuttals.',
        promptHint: 'Prioritize argument clarity, evidence, and assertive delivery without hostility.',
        features: [
            'Claim-evidence-impact focus',
            'Rebuttal readiness with concise pivots',
            'Assertive delivery without aggression',
        ],
    },
]

export function getUseCaseMode(id: UseCaseMode): UseCaseModeConfig {
    return USE_CASE_MODES.find((mode) => mode.id === id) ?? USE_CASE_MODES[0]
}
