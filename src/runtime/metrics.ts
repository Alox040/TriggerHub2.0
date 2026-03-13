export interface RuntimeMetricRecord {
  name: 'macro_execution_time' | 'trigger_dispatch_time' | 'service_latency'
  durationMs: number
  timestamp: number
  attributes?: Record<string, string | number | boolean>
}

export interface RuntimeMetricsSink {
  record(metric: RuntimeMetricRecord): void
}

class InMemoryRuntimeMetricsSink implements RuntimeMetricsSink {
  private readonly metrics: RuntimeMetricRecord[] = []

  public record(metric: RuntimeMetricRecord): void {
    this.metrics.push(metric)
  }

  public snapshot(): RuntimeMetricRecord[] {
    return [...this.metrics]
  }

  public clear(): void {
    this.metrics.length = 0
  }
}

const globalSink = new InMemoryRuntimeMetricsSink()

export const runtimeMetrics = {
  record(metric: RuntimeMetricRecord): void {
    globalSink.record(metric)
  },
  snapshot(): RuntimeMetricRecord[] {
    return globalSink.snapshot()
  },
  clear(): void {
    globalSink.clear()
  },
}

export const getHighResolutionTime = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now()

export const measureDurationMs = (startedAt: number): number =>
  Math.max(0, Number((getHighResolutionTime() - startedAt).toFixed(3)))
