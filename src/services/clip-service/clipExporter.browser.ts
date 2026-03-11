import type { ClipBuffer } from './clipProcessor'
import { ClipExportValidationError, isClipExportResult, type ClipExporter, type ClipExportResult } from './contracts'

export interface ClipExportRequest {
  outputDir?: string
}

interface ElectronClipExporterApi {
  exportClip(buffer: ClipBuffer, request?: ClipExportRequest): Promise<ClipExportResult>
}

declare global {
  interface Window {
    triggerHubElectron?: {
      clipExporter?: ElectronClipExporterApi
    }
  }
}

const getElectronClipExporterApi = (): ElectronClipExporterApi | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.triggerHubElectron?.clipExporter
}

export class InMemoryClipExporter implements ClipExporter {
  public async export(buffer: ClipBuffer): Promise<ClipExportResult> {
    return {
      clipId: buffer.id,
      path: `clips/${buffer.id}.mp4`,
    }
  }
}

export class BrowserClipExporter implements ClipExporter {
  private readonly fallbackExporter: ClipExporter

  public constructor(
    private readonly request: ClipExportRequest = {},
    fallbackExporter: ClipExporter = new InMemoryClipExporter(),
  ) {
    this.fallbackExporter = fallbackExporter
  }

  public async export(buffer: ClipBuffer): Promise<ClipExportResult> {
    const electronClipExporter = getElectronClipExporterApi()
    if (!electronClipExporter) {
      return this.fallbackExporter.export(buffer)
    }

    return electronClipExporter.exportClip(buffer, this.request)
  }
}

export const exportClip = async (
  buffer: ClipBuffer,
  exporter: ClipExporter = new BrowserClipExporter(),
): Promise<ClipExportResult> => {
  const result = await exporter.export(buffer)
  if (!isClipExportResult(result)) {
    throw new ClipExportValidationError(result)
  }

  return result
}
