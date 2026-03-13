import type { ClipBuffer } from './clipProcessor'
import {
  ClipExportValidationError,
  isClipExportResult,
  type ClipExporter,
  type ClipExportResult,
} from './clipExporter.interface'

export const exportClipWithValidation = async (
  buffer: ClipBuffer,
  exporter: ClipExporter,
): Promise<ClipExportResult> => {
  const result = await exporter.export(buffer)
  if (!isClipExportResult(result)) {
    throw new ClipExportValidationError(result)
  }

  return result
}
