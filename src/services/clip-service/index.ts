import type { ClipServicePort } from '../../types'
import { defaultOperationPolicy, runWithPolicy, type OperationPolicy } from '../shared'
import {
  BrowserClipExporter,
  exportClip,
  InMemoryClipExporter,
  type ClipExporter,
  type ClipExportRequest,
} from './clipExporter.browser'
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
  exporter?: 'memory' | 'filesystem'
  outputDir?: string
  policy?: Partial<OperationPolicy>
}

export const createClipService = (options: CreateClipServiceOptions = {}): ClipService => {
  const exporterKind = options.exporter ?? 'memory'

  if (exporterKind === 'filesystem') {
    const request: ClipExportRequest = {}
    if (options.outputDir) {
      request.outputDir = options.outputDir
    }

    return new ClipService(new BrowserClipExporter(request), options.policy)
  }

  return new ClipService(new InMemoryClipExporter(), options.policy)
}

export * from './clipProcessor'
export * from './clipExporter.browser'
export * from './contracts'
