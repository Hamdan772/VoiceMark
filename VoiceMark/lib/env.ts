export function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY?.trim()
  if (!key || key === 'gsk_placeholder_api_key_replace_me') {
    return null
  }
  return key
}

export function isMissingGroqKey(): boolean {
  return getGroqApiKey() === null
}
