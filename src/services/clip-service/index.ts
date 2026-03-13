import type { ClipServicePort } from '../../types'
import { defaultOperationPolicy, runWithPolicy, type OperationPolicy } from '../shared'
import { exportClip, InMemoryClipExporter } from './clipExporter.browser'
import type { ClipExporter } from './clipExporter.interface'
import { buildClipBuffer } from './clipProcessor'

export class ClipService implements ClipServicePort {
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

  public async startCapture(): Promise<void> {
    this.active = true
  }

  public async saveClip(): Promise<string> {
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
