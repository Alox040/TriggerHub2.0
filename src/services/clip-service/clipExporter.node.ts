import type { ClipBuffer } from './clipProcessor'
import type { ClipExporter, ClipExportResult } from './clipExporter.interface'
import { exportClipWithValidation } from './clipExporter.shared'

export interface FileSystemClipExporterOptions {
  outputDir: string
}

export class FileSystemClipExporter implements ClipExporter {
  public constructor(private readonly options: FileSystemClipExporterOptions) {}

  public async export(buffer: ClipBuffer): Promise<ClipExportResult> {
    const [{ mkdir, writeFile }, { dirname, join }] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
    ])
    const outputPath = join(this.options.outputDir, `${buffer.id}.json`)
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, JSON.stringify(buffer, null, 2), 'utf-8')

    return {
      clipId: buffer.id,
      path: outputPath,
    }
  }
}

export const exportClip = async (
  buffer: ClipBuffer,
  exporter: ClipExporter,
): Promise<ClipExportResult> => {
  return exportClipWithValidation(buffer, exporter)
}
