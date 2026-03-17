import { ObsService } from './obsActions'
import {
  InMemoryObsTransport,
  ObsHttpTransport,
  ObsWebSocketTransport,
  type ObsHttpTransportOptions,
  type ObsWebSocketTransportOptions,
} from './obsClient'
import type { OperationPolicy } from '../shared'

export * from './obsActions'
export * from './obsClient'
export * from './contracts'

export interface CreateObsServiceOptions {
  transport?: 'memory' | 'http' | 'websocket'
  http?: ObsHttpTransportOptions
  websocket?: ObsWebSocketTransportOptions
  policy?: Partial<OperationPolicy>
}

export const createObsService = (options: CreateObsServiceOptions = {}): ObsService => {
  const transport = options.transport ?? 'memory'

  if (transport === 'http') {
    if (!options.http?.baseUrl) {
      throw new Error('OBS HTTP transport requires http.baseUrl')
    }

    return new ObsService(new ObsHttpTransport(options.http), options.policy)
  }

  if (transport === 'websocket') {
    if (!options.websocket) {
      throw new Error('OBS WebSocket transport requires websocket options')
    }

    return new ObsService(new ObsWebSocketTransport(options.websocket), options.policy)
  }

  return new ObsService(new InMemoryObsTransport(), options.policy)
}
