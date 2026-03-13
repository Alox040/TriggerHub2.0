import type { ClipBuffer } from './clipProcessor'
import type { ClipExporter, ClipExportResult } from './clipExporter.interface'
import { exportClipWithValidation } from './clipExporter.shared'

export interface ClipExportRequest {
  outputDir?: string
}

const getElectronClipExporterApi = (): TriggerHubElectron['clipExporter'] | undefined => {
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
  return exportClipWithValidation(buffer, exporter)
}
