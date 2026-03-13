export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, context?: Record<string, unknown>): void
}

interface StructuredLogPayload {
  level: 'debug' | 'info' | 'warn' | 'error'
  namespace: string
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

const normalizeContext = (context?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!context || Object.keys(context).length === 0) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      if (value instanceof Error) {
        return [
          key,
          {
            name: value.name,
            message: value.message,
            stack: value.stack,
          },
        ]
      }

      return [key, value]
    }),
  )
}

const writeStructuredLog = (payload: StructuredLogPayload): void => {
  const serialized = JSON.stringify(payload)

  switch (payload.level) {
    case 'debug':
      console.debug(serialized)
      break
    case 'info':
      console.info(serialized)
      break
    case 'warn':
      console.warn(serialized)
      break
    case 'error':
      console.error(serialized)
      break
  }
}

export const createConsoleLogger = (namespace: string): Logger => ({
  debug: (message, context) =>
    writeStructuredLog({
      level: 'debug',
      namespace,
      message,
      timestamp: new Date().toISOString(),
      context: normalizeContext(context),
    }),
  info: (message, context) =>
    writeStructuredLog({
      level: 'info',
      namespace,
      message,
      timestamp: new Date().toISOString(),
      context: normalizeContext(context),
    }),
  warn: (message, context) =>
    writeStructuredLog({
      level: 'warn',
      namespace,
      message,
      timestamp: new Date().toISOString(),
      context: normalizeContext(context),
    }),
  error: (message, context) =>
    writeStructuredLog({
      level: 'error',
      namespace,
      message,
      timestamp: new Date().toISOString(),
      context: normalizeContext(context),
    }),
})

export const createNoopLogger = (): Logger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
})
