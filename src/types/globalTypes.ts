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

interface TriggerHubElectronWindowCommand {
  type: 'focus' | 'minimize' | 'toggle-fullscreen'
}

interface TriggerHubElectronWindowControlApi {
  execute(command: TriggerHubElectronWindowCommand): Promise<void>
}

interface TriggerHubElectron {
  storage?: TriggerHubElectronStorageApi
  clipExporter?: TriggerHubElectronClipExporterApi
  windowControl?: TriggerHubElectronWindowControlApi
}

interface Window {
  triggerHubElectron?: TriggerHubElectron
}
