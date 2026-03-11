export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, context?: Record<string, unknown>): void
}

export const createConsoleLogger = (namespace: string): Logger => ({
  debug: (msg, ctx) => console.debug(`[${namespace}] ${msg}`, ctx ?? ''),
  info: (msg, ctx) => console.info(`[${namespace}] ${msg}`, ctx ?? ''),
  warn: (msg, ctx) => console.warn(`[${namespace}] ${msg}`, ctx ?? ''),
  error: (msg, ctx) => console.error(`[${namespace}] ${msg}`, ctx ?? ''),
})

export const createNoopLogger = (): Logger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
})
