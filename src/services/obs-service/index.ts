import { ObsService } from './obsActions'
import { InMemoryObsTransport, ObsHttpTransport, type ObsHttpTransportOptions } from './obsClient'
import type { OperationPolicy } from '../shared'

export * from './obsActions'
export * from './obsClient'
export * from './contracts'

export interface CreateObsServiceOptions {
  transport?: 'memory' | 'http'
  http?: ObsHttpTransportOptions
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

  return new ObsService(new InMemoryObsTransport(), options.policy)
}
