import type { EventBusPort } from '../../types'
import type { OperationPolicy } from '../shared'
import { TwitchService } from './twitchActions'
import {
  InMemoryTwitchTransport,
  TwitchApiTransport,
  type TwitchApiTransportOptions,
} from './twitchClient'

export * from './contracts'
export * from './twitchActions'
export * from './twitchClient'

export interface CreateTwitchServiceOptions {
  eventBus: EventBusPort
  transport?: 'memory' | 'http'
  http?: Omit<TwitchApiTransportOptions, 'policy'>
  policy?: Partial<OperationPolicy>
  pollIntervalMs?: number
  defaultChannelName?: string
}

export const createTwitchService = (options: CreateTwitchServiceOptions): TwitchService => {
  const transport = options.transport ?? 'memory'

  if (transport === 'http') {
    if (!options.http?.baseUrl) {
      throw new Error('Twitch HTTP transport requires http.baseUrl')
    }

    return new TwitchService(
      new TwitchApiTransport({
        ...options.http,
        policy: options.policy,
      }),
      options.eventBus,
      options.pollIntervalMs,
      options.defaultChannelName,
    )
  }

  return new TwitchService(
    new InMemoryTwitchTransport(),
    options.eventBus,
    options.pollIntervalMs,
    options.defaultChannelName,
  )
}
