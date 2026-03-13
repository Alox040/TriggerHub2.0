import { recordRuntimeMetric } from '../../runtime/runtimeMonitor'

export interface OperationPolicy {
  timeoutMs: number
  retries: number
  retryDelayMs: number
}

export class ServiceOperationError extends Error {
  public constructor(
    public readonly operation: string,
    public readonly attempts: number,
    public readonly cause: unknown,
  ) {
    super(`Service operation "${operation}" failed after ${attempts} attempt(s)`)
  }
}

export const defaultOperationPolicy: OperationPolicy = {
  timeoutMs: 1_000,
  retries: 2,
  retryDelayMs: 50,
}

const delay = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const withTimeout = async <T>(
  operation: string,
  timeoutMs: number,
  task: () => Promise<T>,
): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout | undefined

  try {
    return await Promise.race([
      task(),
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Operation "${operation}" timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
}

export const runWithPolicy = async <T>(
  operation: string,
  policy: OperationPolicy,
  task: () => Promise<T>,
): Promise<T> => {
  const attempts = policy.retries + 1
  let lastError: unknown = undefined

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
    try {
      const result = await withTimeout(operation, policy.timeoutMs, task)
      const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
      recordRuntimeMetric('service_latency', Math.max(0, Number((finishedAt - startedAt).toFixed(3))), {
        operation,
        attempt,
        success: true,
      })
      return result
    } catch (error) {
      lastError = error
      const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
      recordRuntimeMetric('service_latency', Math.max(0, Number((finishedAt - startedAt).toFixed(3))), {
        operation,
        attempt,
        success: false,
      })

      if (attempt < attempts) {
        await delay(policy.retryDelayMs)
      }
    }
  }

  throw new ServiceOperationError(operation, attempts, lastError)
}
