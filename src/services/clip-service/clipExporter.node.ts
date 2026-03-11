import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { ClipBuffer } from './clipProcessor'
import { ClipExportValidationError, isClipExportResult, type ClipExporter, type ClipExportResult } from './contracts'

export interface FileSystemClipExporterOptions {
  outputDir: string
}

export class FileSystemClipExporter implements ClipExporter {
  public constructor(private readonly options: FileSystemClipExporterOptions) {}

  public async export(buffer: ClipBuffer): Promise<ClipExportResult> {
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
  const result = await exporter.export(buffer)
  if (!isClipExportResult(result)) {
    throw new ClipExportValidationError(result)
  }

  return result
}
