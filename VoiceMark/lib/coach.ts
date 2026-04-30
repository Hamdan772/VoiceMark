export type WordToken = {
  raw: string
  normalized: string
}

export type AlignmentPiece =
  | { kind: 'matched'; text: string; key: string }
  | { kind: 'inaccurate'; text: string; expected: string; key: string }
  | { kind: 'missing'; text: string; key: string }
  | { kind: 'extra'; text: string; key: string }

export type AlignmentSummary = {
  targetCount: number
  liveCount: number
  matchedCount: number
  inaccurateCount: number
  missingCount: number
  extraCount: number
  accuracy: number
}

type EditOperation =
  | { kind: 'match'; targetIndex: number; liveIndex: number }
  | { kind: 'substitute'; targetIndex: number; liveIndex: number }
  | { kind: 'insert'; liveIndex: number }
  | { kind: 'delete'; targetIndex: number }

export function tokenizeWords(text: string): WordToken[] {
  const matches = text.match(/[A-Za-z0-9']+/g) ?? []
  return matches.map((raw) => ({
    raw,
    normalized: raw.toLowerCase().replace(/^'+|'+$/g, ''),
  }))
}

export function buildEditOperations(targetTokens: WordToken[], liveTokens: WordToken[]): EditOperation[] {
  const targetCount = targetTokens.length
  const liveCount = liveTokens.length

  if (targetCount === 0 && liveCount === 0) return []

  const dp: number[][] = Array.from({ length: targetCount + 1 }, () => Array(liveCount + 1).fill(0))

  for (let i = 0; i <= targetCount; i += 1) {
    dp[i][0] = i
  }
  for (let j = 0; j <= liveCount; j += 1) {
    dp[0][j] = j
  }

  for (let i = 1; i <= targetCount; i += 1) {
    for (let j = 1; j <= liveCount; j += 1) {
      const isMatch = targetTokens[i - 1].normalized === liveTokens[j - 1].normalized
      const substitutionCost = isMatch ? 0 : 1

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + substitutionCost,
      )
    }
  }

  const operations: EditOperation[] = []
  let i = targetCount
  let j = liveCount

  while (i > 0 || j > 0) {
    const canSubstituteOrMatch = i > 0 && j > 0
    const canDelete = i > 0
    const canInsert = j > 0

    if (canSubstituteOrMatch) {
      const isMatch = targetTokens[i - 1].normalized === liveTokens[j - 1].normalized
      const substitutionCost = isMatch ? 0 : 1

      if (dp[i][j] === dp[i - 1][j - 1] + substitutionCost) {
        operations.push({
          kind: isMatch ? 'match' : 'substitute',
          targetIndex: i - 1,
          liveIndex: j - 1,
        })
        i -= 1
        j -= 1
        continue
      }
    }

    if (canDelete && dp[i][j] === dp[i - 1][j] + 1) {
      operations.push({ kind: 'delete', targetIndex: i - 1 })
      i -= 1
      continue
    }

    if (canInsert && dp[i][j] === dp[i][j - 1] + 1) {
      operations.push({ kind: 'insert', liveIndex: j - 1 })
      j -= 1
      continue
    }

    if (canSubstituteOrMatch) {
      operations.push({ kind: 'substitute', targetIndex: i - 1, liveIndex: j - 1 })
      i -= 1
      j -= 1
    }
  }

  return operations.reverse()
}

export function buildPieces(targetText: string, liveText: string): AlignmentPiece[] {
  const targetTokens = tokenizeWords(targetText)
  const liveTokens = tokenizeWords(liveText)
  const operations = buildEditOperations(targetTokens, liveTokens)
  const pieces: AlignmentPiece[] = []

  for (const operation of operations) {
    if (operation.kind === 'match') {
      const targetToken = targetTokens[operation.targetIndex]
      pieces.push({
        kind: 'matched',
        text: targetToken.raw,
        key: `target-${operation.targetIndex}`,
      })
      continue
    }

    if (operation.kind === 'substitute') {
      pieces.push({
        kind: 'inaccurate',
        text: liveTokens[operation.liveIndex].raw,
        expected: targetTokens[operation.targetIndex].raw,
        key: `substitute-${operation.targetIndex}-${operation.liveIndex}`,
      })
      continue
    }

    if (operation.kind === 'delete') {
      pieces.push({
        kind: 'missing',
        text: targetTokens[operation.targetIndex].raw,
        key: `missing-${operation.targetIndex}`,
      })
      continue
    }

    pieces.push({
      kind: 'extra',
      text: liveTokens[operation.liveIndex].raw,
      key: `extra-${operation.liveIndex}`,
    })
  }

  return pieces
}

export function trimAndNormalize(text: string) {
  return text.trim().replace(/\s+/g, ' ')
}

export function createAlignmentSummary(targetText: string, liveText: string): AlignmentSummary {
  const targetTokens = tokenizeWords(targetText)
  const liveTokens = tokenizeWords(liveText)
  const operations = buildEditOperations(targetTokens, liveTokens)

  let matchedCount = 0
  let inaccurateCount = 0
  let missingCount = 0
  let extraCount = 0

  for (const operation of operations) {
    if (operation.kind === 'match') matchedCount += 1
    if (operation.kind === 'substitute') inaccurateCount += 1
    if (operation.kind === 'delete') missingCount += 1
    if (operation.kind === 'insert') extraCount += 1
  }

  return {
    targetCount: targetTokens.length,
    liveCount: liveTokens.length,
    matchedCount,
    inaccurateCount,
    missingCount,
    extraCount,
    accuracy: targetTokens.length === 0 ? 0 : Math.round((matchedCount / targetTokens.length) * 100),
  }
}

export function getImprovementTips(summary: AlignmentSummary): string[] {
  const tips: string[] = []

  if (summary.targetCount === 0) {
    return ['Paste a script to start coaching.']
  }

  if (summary.targetCount < 8) {
    tips.push('Use a slightly longer passage so the alignment can show your patterns more clearly.')
  }

  if (summary.accuracy < 60) {
    tips.push('Slow down one notch and practice one sentence at a time before running the full passage.')
  }

  if (summary.inaccurateCount > 0) {
    tips.push('Some words are close but inaccurate. Emphasize consonants and finish each word cleanly before moving on.')
  }

  if (summary.missingCount > summary.extraCount) {
    tips.push('Keep the script phrasing steady and aim to complete the words you skip at the end of each phrase.')
  } else if (summary.extraCount > 0) {
    tips.push('You are adding words that are not in the script, so pause at commas and tighten your endings.')
  }

  if (summary.accuracy >= 85) {
    tips.push('You are close. Try a harder passage or remove some visual support for the next round.')
  }

  return tips.slice(0, 3)
}