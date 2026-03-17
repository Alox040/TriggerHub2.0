export interface StreamStatus {
  channelName: string
  isLive: boolean
  title: string | null
  categoryName: string | null
  viewerCount: number
  startedAt: string | null
}

export interface TwitchChannelInfo {
  channelName: string
  title: string | null
  categoryName: string | null
}

export type TwitchEvent = 'twitch:stream-live' | 'twitch:stream-offline'

export class TwitchServiceError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'TwitchServiceError'
  }
}

export const normalizeTwitchChannelName = (channelName: string): string => {
  const normalized = channelName.trim().toLowerCase()
  if (normalized.length === 0) {
    throw new TwitchServiceError('Twitch channel name must not be empty')
  }

  return normalized
}

export const isTwitchApiResponse = (value: unknown): value is TwitchApiResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return candidate.success === true
}

export const isStreamStatus = (value: unknown): value is StreamStatus => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.channelName === 'string' &&
    typeof candidate.isLive === 'boolean' &&
    (candidate.title === null || typeof candidate.title === 'string') &&
    (candidate.categoryName === null || typeof candidate.categoryName === 'string') &&
    typeof candidate.viewerCount === 'number' &&
    (candidate.startedAt === null || typeof candidate.startedAt === 'string')
  )
}

interface TwitchApiResponse {
  success: true
}

interface TwitchHelixUser {
  id: string
  login: string
}

interface TwitchHelixChannel {
  broadcaster_login?: string
  title?: string
  game_name?: string
}

interface TwitchHelixStream {
  user_login?: string
  title?: string
  game_name?: string
  viewer_count?: number
  started_at?: string
}

export interface TwitchHelixUsersResponse {
  data: TwitchHelixUser[]
}

export interface TwitchHelixChannelsResponse {
  data: TwitchHelixChannel[]
}

export interface TwitchHelixStreamsResponse {
  data: TwitchHelixStream[]
}

export const isTwitchHelixUsersResponse = (value: unknown): value is TwitchHelixUsersResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return Array.isArray(candidate.data) && candidate.data.every((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false
    }

    const item = entry as Record<string, unknown>
    return typeof item.id === 'string' && typeof item.login === 'string'
  })
}

export const isTwitchHelixChannelsResponse = (value: unknown): value is TwitchHelixChannelsResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return Array.isArray(candidate.data) && candidate.data.every((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false
    }

    const item = entry as Record<string, unknown>
    return (
      (item.broadcaster_login === undefined || typeof item.broadcaster_login === 'string') &&
      (item.title === undefined || typeof item.title === 'string') &&
      (item.game_name === undefined || typeof item.game_name === 'string')
    )
  })
}

export const isTwitchHelixStreamsResponse = (value: unknown): value is TwitchHelixStreamsResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return Array.isArray(candidate.data) && candidate.data.every((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false
    }

    const item = entry as Record<string, unknown>
    return (
      (item.user_login === undefined || typeof item.user_login === 'string') &&
      (item.title === undefined || typeof item.title === 'string') &&
      (item.game_name === undefined || typeof item.game_name === 'string') &&
      (item.viewer_count === undefined || typeof item.viewer_count === 'number') &&
      (item.started_at === undefined || typeof item.started_at === 'string')
    )
  })
}
