import type { ClipServicePort } from '../../types'
import { defaultOperationPolicy, runWithPolicy, type OperationPolicy } from '../shared'
import { exportClip, InMemoryClipExporter } from './clipExporter.browser'
import type { ClipExporter } from './clipExporter.interface'
import { buildClipBuffer } from './clipProcessor'

export class ClipService implements ClipServicePort {
  private connected = false
  private active = false
  private readonly policy: OperationPolicy

  public constructor(
    private readonly exporter: ClipExporter = new InMemoryClipExporter(),
    policy?: Partial<OperationPolicy>,
  ) {
    this.policy = {
      ...defaultOperationPolicy,
      ...policy,
    }
  }

  public async connect(): Promise<void> {
    this.connected = true
  }

  public async disconnect(): Promise<void> {
    this.connected = false
    this.active = false
  }

  public isConnected(): boolean {
    return this.connected
  }

  public async startCapture(): Promise<void> {
    if (!this.connected) {
      throw new Error('Clip service must be connected before starting capture')
    }

    this.active = true
  }

  public async saveClip(): Promise<string> {
    if (!this.connected) {
      throw new Error('Clip service must be connected before saving clips')
    }

    if (!this.active) {
      throw new Error('Clip capture is not active')
    }

    return runWithPolicy('clip.saveClip', this.policy, async () => {
      const buffer = buildClipBuffer({
        source: 'default',
        durationMs: 30_000,
      })

      const result = await exportClip(buffer, this.exporter)
      return result.path
    })
  }
}

export interface CreateClipServiceOptions {
  exporter?: ClipExporter
  policy?: Partial<OperationPolicy>
}

export const createClipService = (options: CreateClipServiceOptions = {}): ClipService => {
  return new ClipService(options.exporter ?? new InMemoryClipExporter(), options.policy)
}

export * from './clipProcessor'
export * from './clipExporter.browser'
export * from './clipExporter.interface'
