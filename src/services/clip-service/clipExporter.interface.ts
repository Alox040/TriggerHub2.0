import type { ClipBuffer } from './clipProcessor'

export interface ClipExportResult {
  clipId: string
  path: string
}

export interface ClipExporter {
  export(buffer: ClipBuffer): Promise<ClipExportResult>
}

export const isClipExportResult = (value: unknown): value is ClipExportResult => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return typeof candidate.clipId === 'string' && typeof candidate.path === 'string'
}

export class ClipExportValidationError extends Error {
  public constructor(public readonly payload: unknown) {
    super('Clip exporter returned invalid payload')
  }
}
