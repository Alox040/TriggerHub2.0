export interface SpotifyApiResponse {
  success: true
}

export const isSpotifyApiResponse = (value: unknown): value is SpotifyApiResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return candidate.success === true
}
