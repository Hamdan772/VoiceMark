import type { AnalysisResult } from './types'

// ─── Word lists ──────────────────────────────────────────────────────────────
// Sorted longest-first so multi-word phrases match before single words.
// Only words/phrases that are ALWAYS fillers regardless of context.
const FILLER_WORDS: string[] = [
  // 4-word phrases
  'at the end of the day',
  'if that makes sense',
  'you know what i mean',
  // 3-word phrases
  'kind of like',
  'sort of like',
  'you know what',
  'and stuff like',
  'and all that',
  // 2-word phrases
  'you know',
  'i mean',
  'you see',
  'and stuff',
  'and things',
  'or whatever',
  'or something',
  'kind of',
  'sort of',
  // 1-word — unambiguous hesitation sounds first
  'uhh',
  'umm',
  'hmm',
  'um',
  'uh',
  'er',
  'ah',
  // Common verbal fillers — words that are ONLY filler in casual speech
  'basically',
  'literally',
  'honestly',
  'obviously',
  'seriously',
  'totally',
  'absolutely',
  'essentially',
  'ultimately',
  // Context-sensitive — these require filler context detection below
  'like',
  'so',
  'right',
  'okay',
  'yeah',
  'well',
  'really',
  'actually',
]

// Words that need a filler-context check (surrounded by commas, pauses, or sentence-internal)
const CONTEXT_SENSITIVE = new Set(['like', 'so', 'right', 'okay', 'yeah', 'well', 'really', 'actually'])

const HEDGING_PHRASES: string[] = [
  "i'm not entirely sure",
  "not entirely sure",
  "i'm not sure if",
  "not sure if",
  "i'm not sure",
  "not sure",
  "i don't know",
  "it seems like",
  "it seems to me",
  "i suppose",
  "i guess",
  "i think",
  "in my opinion",
  "to be honest",
  "to be fair",
  "maybe",
  "perhaps",
  "probably",
  "might be",
  "could be",
]

// ─── Tokenizer ───────────────────────────────────────────────────────────────
interface Token {
  word: string
  start: number
  end: number
}

function canonicalizeToken(word: string): string {
  // Normalize common hesitation variants so "ummm", "uhhh", and "uhm" are detected.
  if (/^u+h+$/.test(word)) return 'uh'
  if (/^u+m+$/.test(word)) return 'um'
  if (/^u+h+m+$/.test(word)) return 'um'
  if (/^e+r+m*$/.test(word)) return 'er'
  if (/^h+m+$/.test(word)) return 'hmm'
  return word
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  const re = /[a-z']+/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const raw = m[0].toLowerCase().replace(/^'+|'+$/g, '')
    const word = canonicalizeToken(raw)
    if (word.length > 0) {
      tokens.push({ word, start: m.index, end: m.index + m[0].length })
    }
  }
  return tokens
}

// ─── Context check for ambiguous words ───────────────────────────────────────
// A word is a filler if it is NOT at the start of a sentence AND
// is surrounded by other content (not isolated as the only word).
// We detect "sentence start" by checking if the char before the word (ignoring spaces)
// is a sentence-ending punctuation or it's the very start.
function isFillerContext(
  word: string,
  tokenIndex: number,
  tokens: Token[],
  originalText: string,
): boolean {
  // For pure hesitation sounds — always filler
  if (['um', 'uh', 'er', 'ah', 'uhh', 'umm', 'hmm'].includes(word)) return true
  // For "yeah" — always filler in speech
  if (word === 'yeah') return true

  // For "okay", "right" — filler only if mid-sentence (not at sentence start or after a sentence-boundary)
  if (word === 'okay' || word === 'right') {
    const prevPunct = getPrecedingPunct(tokens[tokenIndex].start, originalText)
    const isAfterSentenceEnd = /[.!?]/.test(prevPunct)
    const isFirst = tokenIndex === 0
    // If it starts a new sentence, it's likely a discourse marker, not a filler
    if (isAfterSentenceEnd || isFirst) return false
    return true
  }

  // For "so" — filler only if mid-sentence after a comma or another word (not sentence opener)
  if (word === 'so') {
    const prevPunct = getPrecedingPunct(tokens[tokenIndex].start, originalText)
    const isAfterSentenceEnd = /[.!?]/.test(prevPunct)
    const isFirst = tokenIndex === 0
    if (isAfterSentenceEnd || isFirst) return false
    // "so" as a filler usually appears mid-clause: "and, so, I thought..." or "I, so, basically..."
    const prevToken = tokens[tokenIndex - 1]
    const nextToken = tokens[tokenIndex + 1]
    if (!prevToken || !nextToken) return false
    return true
  }

  // For "well" — filler only mid-sentence
  if (word === 'well') {
    const prevPunct = getPrecedingPunct(tokens[tokenIndex].start, originalText)
    const isAfterSentenceEnd = /[.!?]/.test(prevPunct)
    const isFirst = tokenIndex === 0
    if (isAfterSentenceEnd || isFirst) return false
    return true
  }

  // For "like", "really", "actually" — filler if used mid-clause (not as adjective/adverb in clear meaning context)
  if (word === 'like') {
    // "like" is not a filler when preceded by "just", "not", "feel", "looks", "sounds", "seems", "acts"
    const prevToken = tokens[tokenIndex - 1]
    const nextToken = tokens[tokenIndex + 1]
    if (!prevToken || !nextToken) return false
    const prevWord = prevToken?.word ?? ''
    if (['just', 'not', 'feel', 'looks', 'sounds', 'seems', 'acts', 'felt', 'seemed', 'appeared'].includes(prevWord)) {
      return false
    }
    return true
  }

  return true
}

function getPrecedingPunct(startPos: number, text: string): string {
  // Walk backwards from startPos, skip spaces, return the first non-space char
  for (let i = startPos - 1; i >= 0; i--) {
    if (text[i] !== ' ') return text[i]
  }
  return '' // start of text
}

// ─── Filler counter ──────────────────────────────────────────────────────────
export function countFillers(text: string): AnalysisResult['fillerWords'] {
  // Normalise: lowercase, collapse whitespace, keep apostrophes
  const norm = text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const tokens = tokenize(norm)
  const tokenWords = tokens.map((t) => t.word)
  const usedTokens = new Set<number>()
  const breakdown: Record<string, number> = {}
  const instances: Array<{ phrase: string; start: number; end: number }> = []

  for (const filler of FILLER_WORDS) {
    const parts = filler.split(' ')
    const isMulti = parts.length > 1

    if (isMulti) {
      for (let i = 0; i <= tokenWords.length - parts.length; i++) {
        if (parts.every((p, j) => tokenWords[i + j] === p)) {
          const indices = Array.from({ length: parts.length }, (_, j) => i + j)
          if (indices.some((idx) => usedTokens.has(idx))) continue
          indices.forEach((idx) => usedTokens.add(idx))
          const start = tokens[i].start
          const end = tokens[i + parts.length - 1].end
          breakdown[filler] = (breakdown[filler] ?? 0) + 1
          instances.push({ phrase: filler, start, end })
        }
      }
    } else {
      for (let i = 0; i < tokenWords.length; i++) {
        if (tokenWords[i] !== filler || usedTokens.has(i)) continue
        // Context-sensitive fillers need extra validation
        if (CONTEXT_SENSITIVE.has(filler) && !isFillerContext(filler, i, tokens, norm)) continue
        usedTokens.add(i)
        breakdown[filler] = (breakdown[filler] ?? 0) + 1
        instances.push({ phrase: filler, start: tokens[i].start, end: tokens[i].end })
      }
    }
  }

  // Sort instances by position so highlighting works left-to-right
  instances.sort((a, b) => a.start - b.start)

  return { count: instances.length, instances, breakdown }
}

// ─── Hedging detection ───────────────────────────────────────────────────────
export function detectHedging(text: string): string[] {
  const norm = text.toLowerCase().replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim()
  const found = new Set<string>()
  for (const phrase of HEDGING_PHRASES) {
    if (norm.includes(phrase)) found.add(phrase)
  }
  return Array.from(found)
}

// ─── Repetition detection ────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
  'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can',
  'that', 'this', 'these', 'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they',
  'my', 'your', 'his', 'her', 'our', 'their', 'me', 'him', 'us', 'them', 'what', 'which',
  'who', 'not', 'no', 'so', 'if', 'then', 'than', 'as', 'also', 'just', 'more', 'very',
])

export function detectRepetition(text: string): Array<{ word: string; count: number }> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
  const freq: Record<string, number> = {}
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1
  return Object.entries(freq)
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }))
}

// ─── Lexical richness ────────────────────────────────────────────────────────
export function lexicalRichness(text: string): { uniqueRatio: number; typeTokenRatio: number } {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1)
  if (words.length === 0) return { uniqueRatio: 0, typeTokenRatio: 0 }
  const unique = new Set(words)
  const typeTokenRatio = unique.size / words.length
  // Normalise to 0-100 (TTR is 0-1, so multiply by 100)
  const uniqueRatio = Math.round(typeTokenRatio * 100)
  return { uniqueRatio, typeTokenRatio }
}

// ─── Sentence stats ───────────────────────────────────────────────────────────
export function sentenceStats(text: string): {
  count: number
  avgWords: number
  variance: number
  longestSentence: number
} {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim().split(/\s+/).filter(Boolean).length)
    .filter((n) => n > 0)
  if (sentences.length === 0) return { count: 0, avgWords: 0, variance: 0, longestSentence: 0 }
  const avg = sentences.reduce((a, b) => a + b, 0) / sentences.length
  const variance =
    sentences.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / sentences.length
  return {
    count: sentences.length,
    avgWords: Math.round(avg),
    variance: Math.round(variance),
    longestSentence: Math.max(...sentences),
  }
}

// ─── Pace ────────────────────────────────────────────────────────────────────
export function estimateWPM(wordCount: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0
  return Math.round((wordCount / durationSeconds) * 60)
}

export function classifyPace(wpm: number): 'too slow' | 'good' | 'too fast' {
  if (wpm < 110) return 'too slow'
  if (wpm > 175) return 'too fast'
  return 'good'
}

// ─── Scoring ─────────────────────────────────────────────────────────────────
function scoreClarity(
  text: string,
  fillerCount: number,
  wordCount: number,
  stats: ReturnType<typeof sentenceStats>,
): number {
  if (wordCount === 0) return 0
  const fillerRatio = fillerCount / wordCount
  // Heavy penalty for fillers, properly bounded: 0% = 100, 5% = ~80, 15% = ~50, 25%+ = ~30 (not lower)
  const fillerPenalty = Math.min(70, Math.round(fillerRatio * 320))
  // Run-on sentences reduce clarity
  const runOnPenalty = stats.avgWords > 35 ? 18 : stats.avgWords > 25 ? 8 : 0
  // High variance (mixing very short + very long sentences) is fine, but very low variance is monotone
  const varianceBonus = stats.variance > 20 && stats.variance < 200 ? 5 : 0
  return Math.min(100, Math.max(30, Math.round(100 - fillerPenalty - runOnPenalty + varianceBonus)))
}

function scoreStructure(text: string, wordCount: number, stats: ReturnType<typeof sentenceStats>): number {
  if (wordCount < 10) return 20
  const hasOpener = /^(today|i want|let me|good (morning|afternoon|evening)|hello|hi |greetings|welcome|thank|first|to begin|to start|i'd like to|i am here|my name)/i.test(text.trim())
  const hasCloser = /(thank you|in conclusion|to summarize|to sum up|finally|in closing|that's all|that is all|i hope|any questions|to recap|in summary)[\s.!?]*$/i.test(text.trim())
  const hasTransitions = /(first(ly)?|second(ly)?|third(ly)?|next|then|also|additionally|furthermore|however|but|on the other hand|in addition|finally|lastly|moreover|nevertheless|therefore|consequently|as a result)/i.test(text)
  const hasExamples = /(for example|for instance|such as|to illustrate|consider|specifically|in particular|like when)/i.test(text)

  let score = 25
  if (stats.count >= 2) score += 15
  if (stats.count >= 5) score += 15
  if (stats.count >= 8) score += 5
  if (hasTransitions) score += 18
  if (hasOpener) score += 8
  if (hasCloser) score += 8
  if (hasExamples) score += 8
  return Math.min(100, score)
}

function scoreVocabulary(text: string, wordCount: number): number {
  if (wordCount === 0) return 0
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter((w) => w.length > 2)
  const unique = new Set(words)
  const diversity = unique.size / Math.max(1, words.length)
  const complexWords = words.filter((w) => w.length >= 7).length
  const complexRatio = complexWords / Math.max(1, words.length)
  // Diversity: 0.3=23, 0.5=38, 0.7=53, 0.9=68. Complex ratio: 0.1=3, 0.3=8, 0.5=13. Base 20 minimum.
  const baseScore = 20
  const diversityScore = Math.round(diversity * 75)
  const complexityScore = Math.round(complexRatio * 25)
  return Math.min(100, Math.max(20, baseScore + diversityScore + complexityScore))
}

function scoreConfidence(text: string, hedgingCount: number, wordCount: number): number {
  if (wordCount === 0) return 50
  const hedgeRatio = hedgingCount / Math.max(1, wordCount / 15)
  // Hedge penalty scaled properly: 0 hedges = 90, 1 hedge ≈ 75, 2+ hedges ≈ 60 (floor 30)
  const hedgePenalty = Math.min(60, Math.round(hedgeRatio * 20))
  const base = Math.max(30, 90 - hedgePenalty)
  const hasDeclarative = /(we will|i will|we are|i am|this is|the result|the key|the goal|in fact|without question|undoubtedly|clearly|the evidence|research shows|data shows|proven|guaranteed)/i.test(text)
  const hasPowerWords = /(transform|revolutionize|achieve|deliver|excel|commit|ensure|guarantee|drive|lead|build|create|solve|win|succeed)/i.test(text)
  return Math.min(100, base + (hasDeclarative ? 5 : 0) + (hasPowerWords ? 5 : 0))
}

// ─── Tip generator ────────────────────────────────────────────────────────────
export function pickTip(
  scores: AnalysisResult['scores'],
  pace: AnalysisResult['pace'],
  fillerCount: number,
  topFiller: string | null,
  hedging: string[],
  wordCount: number,
  repetition: Array<{ word: string; count: number }>,
): string {
  const issues: Array<{ priority: number; tip: string }> = []
  const rate = wordCount > 0 ? Math.round((fillerCount / wordCount) * 100) : 0

  if (fillerCount > 0) {
    issues.push({
      priority: fillerCount > 8 ? 10 : fillerCount > 4 ? 7 : 5,
      tip: `You used ${fillerCount} filler word${fillerCount !== 1 ? 's' : ''} (${rate}% of your speech)${topFiller ? ` — "${topFiller}" appeared most often` : ''}. Train the pause: every time you feel a filler coming, take a silent breath instead. Silence signals control, not weakness.`,
    })
  }

  if (pace.label === 'too fast') {
    issues.push({
      priority: 8,
      tip: `At ${pace.wpm} WPM you're above the ideal range of 110–170 WPM. Slow down by inserting deliberate 1-second pauses after every key point — your audience needs processing time. Record yourself at 140 WPM and notice how much clearer it feels.`,
    })
  }

  if (pace.label === 'too slow') {
    issues.push({
      priority: 6,
      tip: `At ${pace.wpm} WPM your delivery feels slow. Target 130–150 WPM by trimming unnecessary pauses and adding vocal energy — vary your pitch and volume to prevent listeners from zoning out.`,
    })
  }

  if (hedging.length >= 2) {
    issues.push({
      priority: 7,
      tip: `You used ${hedging.length} hedging phrase${hedging.length !== 1 ? 's' : ''} like "${hedging[0]}". Replace them with declarative statements — instead of "I think this might work", say "This works because…". Every hedge signals doubt; remove it and you instantly sound more credible.`,
    })
  }

  if (repetition.length > 0) {
    const top = repetition[0]
    issues.push({
      priority: 5,
      tip: `The word "${top.word}" appears ${top.count} times in your transcript. Repeated words reduce perceived vocabulary range. Before your next take, write down 3 synonyms and rotate them throughout your delivery.`,
    })
  }

  if (scores.structure < 55) {
    issues.push({
      priority: 6,
      tip: `Your delivery lacks a clear structure. Use the rule of three: one strong opening ("Today I'll cover…"), three supporting points connected with "First… Then… Finally…", and one memorable close. Structured speech is 60% easier to recall.`,
    })
  }

  if (scores.clarity < 55) {
    issues.push({
      priority: 5,
      tip: `Aim for sentences under 20 words each. Read your transcript aloud and cut every word that doesn't add meaning — shorter sentences signal confidence and make complex ideas land faster.`,
    })
  }

  if (scores.vocabulary < 55) {
    issues.push({
      priority: 4,
      tip: `Your vocabulary diversity is low — many words are repeated. Before your next take, identify the 3 words you use most and find two alternatives for each. Richer vocabulary signals expertise to your audience.`,
    })
  }

  if (issues.length === 0) {
    return `Excellent delivery. For your next take, experiment with strategic pauses of 1–2 seconds after your key points — research shows pauses make what follows 30% more memorable and give your audience time to absorb the message.`
  }

  issues.sort((a, b) => b.priority - a.priority)
  return issues[0].tip
}

// ─── Full fallback analysis ───────────────────────────────────────────────────
export function runFallbackAnalysis(transcript: string, durationSeconds: number): AnalysisResult {
  const fillerData = countFillers(transcript)
  const hedging = detectHedging(transcript)
  const repetition = detectRepetition(transcript)
  const lex = lexicalRichness(transcript)
  const stats = sentenceStats(transcript)
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const wpm = estimateWPM(words.length, durationSeconds)
  const pace: AnalysisResult['pace'] = { wpm, label: classifyPace(wpm) }
  const topFiller = Object.entries(fillerData.breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const scores: AnalysisResult['scores'] = {
    clarity: scoreClarity(transcript, fillerData.count, words.length, stats),
    structure: scoreStructure(transcript, words.length, stats),
    vocabulary: scoreVocabulary(transcript, words.length),
    confidence: scoreConfidence(transcript, hedging.length, words.length),
    overall: 0,
  }
  scores.overall = Math.round(
    scores.clarity * 0.30 +
    scores.structure * 0.25 +
    scores.vocabulary * 0.20 +
    scores.confidence * 0.25,
  )

  const tone = analyzeTone(transcript, words.length, fillerData.count)

  return {
    scores,
    fillerWords: fillerData,
    pace,
    tone,
    tip: pickTip(scores, pace, fillerData.count, topFiller, hedging, words.length, repetition),
    hedgingPhrases: hedging,
    repetition,
    lexicalRichness: lex,
    sentenceStats: stats,
    transcript,
    durationSeconds,
    aiEnhanced: false,
  }
}

// ─── Tone & Sentiment Analysis ────────────────────────────────────────────────
export function analyzeTone(text: string, wordCount: number, fillerCount: number): {
  primary: 'professional' | 'conversational' | 'aggressive' | 'uncertain' | 'enthusiastic' | 'monotone'
  energy: number
  sentiment: 'positive' | 'neutral' | 'negative'
  insights: string[]
} {
  const insights: string[] = []
  const norm = text.toLowerCase()

  // Energy level: based on exclamation marks, power words, and pacing
  const exclamations = (text.match(/!/g) || []).length
  const questions = (text.match(/\?/g) || []).length
  const powerWords = /(amazing|incredible|fantastic|excellent|perfect|love|thrilled|excited|brilliant|revolutionary|transform|achieve|win|succeed)/g.test(
    norm,
  ) ? 1 : 0
  let energy = 50
  if (exclamations > wordCount * 0.03) energy += 25 // High exclamation density
  if (powerWords) energy += 15
  if (fillerCount > wordCount * 0.1) energy -= 15 // Fillers reduce perceived energy
  energy = Math.max(0, Math.min(100, energy))

  // Sentiment detection
  const positiveWords =
    /(great|good|well|excellent|amazing|love|happy|perfect|success|achieve|win|better|improve|progress)/g
  const negativeWords =
    /(bad|poor|fail|terrible|awful|hate|difficult|problem|wrong|worst|broke|failed|risk|danger)/g
  const posMatches = (norm.match(positiveWords) || []).length
  const negMatches = (norm.match(negativeWords) || []).length
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (posMatches > negMatches + 1) sentiment = 'positive'
  else if (negMatches > posMatches) sentiment = 'negative'

  // Tone classification
  let primary: 'professional' | 'conversational' | 'aggressive' | 'uncertain' | 'enthusiastic' | 'monotone'

  // Check for uncertainty indicators
  if (fillerCount > wordCount * 0.15 || /i (think|believe|guess|suppose|maybe|perhaps)/i.test(norm)) {
    primary = 'uncertain'
    insights.push('Your tone signals uncertainty. Use more declarative statements to sound confident.')
  }
  // Check for high energy/enthusiasm
  else if (energy > 70 && exclamations > 2) {
    primary = 'enthusiastic'
    insights.push('Great enthusiasm! Ensure this matches your content—avoid overselling.')
  }
  // Check for aggressive tone
  else if (/absolutely|must|always|never|wrong|stupid|obviously|clearly/i.test(norm) && sentiment === 'negative') {
    primary = 'aggressive'
    insights.push('Tone comes across as confrontational. Consider softening language while maintaining authority.')
  }
  // Check for monotone
  else if (questions < 1 && exclamations < 1 && energy < 40) {
    primary = 'monotone'
    insights.push('Your delivery lacks vocal variety. Vary pitch, pace, and emphasis to maintain audience engagement.')
  }
  // Check for conversational
  else if (/you know|i mean|like|basically|kind of|sort of/i.test(norm)) {
    primary = 'conversational'
    insights.push('Tone is casual and relatable, which is great for some contexts—but ensure it remains professional.')
  }
  // Default: professional
  else {
    primary = 'professional'
    insights.push('Your tone is professional and measured.')
  }

  if (sentiment === 'positive') {
    insights.push('Overall sentiment is positive and optimistic.')
  } else if (sentiment === 'negative') {
    insights.push('Watch the negative language—reframe problems as opportunities.')
  }

  return {
    primary,
    energy,
    sentiment,
    insights,
  }
}
