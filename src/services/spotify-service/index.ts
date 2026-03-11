import { SpotifyService } from './spotifyActions'
import {
  InMemorySpotifyTransport,
  SpotifyHttpTransport,
  type SpotifyHttpTransportOptions,
} from './spotifyClient'
import type { OperationPolicy } from '../shared'

export * from './spotifyActions'
export * from './spotifyClient'
export * from './contracts'

export interface CreateSpotifyServiceOptions {
  transport?: 'memory' | 'http'
  http?: SpotifyHttpTransportOptions
  policy?: Partial<OperationPolicy>
}

export const createSpotifyService = (options: CreateSpotifyServiceOptions = {}): SpotifyService => {
  const transport = options.transport ?? 'memory'

  if (transport === 'http') {
    if (!options.http?.baseUrl) {
      throw new Error('Spotify HTTP transport requires http.baseUrl')
    }

    return new SpotifyService(new SpotifyHttpTransport(options.http), options.policy)
  }

  return new SpotifyService(new InMemorySpotifyTransport(), options.policy)
}
