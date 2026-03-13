interface TriggerHubElectronStorageApi {
  load<T>(key: string): Promise<T | null>
  save<T>(key: string, data: T): Promise<void>
}

interface TriggerHubElectronClipExportRequest {
  outputDir?: string
}

interface TriggerHubElectronClipExportResult {
  clipId: string
  path: string
}

interface TriggerHubElectronClipExporterApi {
  exportClip(buffer: unknown, request?: TriggerHubElectronClipExportRequest): Promise<TriggerHubElectronClipExportResult>
}

interface TriggerHubElectron {
  storage?: TriggerHubElectronStorageApi
  clipExporter?: TriggerHubElectronClipExporterApi
}

interface Window {
  triggerHubElectron?: TriggerHubElectron
}
