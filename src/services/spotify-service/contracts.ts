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

export interface SpotifyUserProfile {
  id: string
  display_name?: string | null
}

export const isSpotifyUserProfile = (value: unknown): value is SpotifyUserProfile => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'string'
}
