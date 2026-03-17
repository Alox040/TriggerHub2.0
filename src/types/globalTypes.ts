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

interface TriggerHubElectronUpdaterState {
  status:
    | 'disabled'
    | 'idle'
    | 'checking'
    | 'available'
    | 'not-available'
    | 'downloading'
    | 'downloaded'
    | 'error'
  message?: string
  progressPercent?: number
  version?: string
}

type TriggerHubElectronUpdaterListener = (state: TriggerHubElectronUpdaterState) => void

interface TriggerHubElectronUpdaterApi {
  getState(): Promise<TriggerHubElectronUpdaterState>
  checkForUpdates(): Promise<TriggerHubElectronUpdaterState>
  downloadUpdate(): Promise<TriggerHubElectronUpdaterState>
  installUpdate(): Promise<void>
  onStateChange(listener: TriggerHubElectronUpdaterListener): () => void
}

interface TriggerHubElectron {
  storage?: TriggerHubElectronStorageApi
  clipExporter?: TriggerHubElectronClipExporterApi
  windowControl?: TriggerHubElectronWindowControlApi
  updater?: TriggerHubElectronUpdaterApi
}

interface Window {
  triggerHubElectron?: TriggerHubElectron
}
