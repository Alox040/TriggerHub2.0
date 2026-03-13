export interface StreamStatus {
  channelName: string
  isLive: boolean
  title: string | null
  categoryName: string | null
  viewerCount: number
  startedAt: string | null
}

export type TwitchEvent = 'twitch.onStreamLive' | 'twitch.onStreamOffline'

export interface TwitchServicePort {
  connect(channelName: string): Promise<void>
  disconnect(): Promise<void>
  getStreamStatus(): Promise<StreamStatus>
}

export interface TwitchApiResponse {
  success: true
}

export interface TwitchConnectRequest {
  channelName: string
}

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
