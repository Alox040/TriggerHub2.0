import { runtimeMetrics } from './metrics'
import { createConsoleLogger } from '../utils/logger'

const logger = createConsoleLogger('RuntimeMonitor')

export const recordRuntimeMetric = (
  name: 'macro_execution_time' | 'trigger_dispatch_time' | 'service_latency',
  durationMs: number,
  attributes?: Record<string, string | number | boolean>,
): void => {
  runtimeMetrics.record({
    name,
    durationMs,
    timestamp: Date.now(),
    attributes,
  })

  logger.info('Runtime metric recorded', {
    metric: name,
    durationMs,
    ...attributes,
  })
}

export const installRuntimeProcessGuards = (): void => {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logger.error('Unhandled window error', {
        error: event.error instanceof Error ? event.error : new Error(String(event.message ?? 'Unknown window error')),
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        error:
          event.reason instanceof Error
            ? event.reason
            : new Error(`Unhandled rejection: ${String(event.reason ?? 'unknown')}`),
      })
    })
  }
}
