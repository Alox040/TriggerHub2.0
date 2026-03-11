export interface VersionManifest {
  version: string
  builtAt?: string
}

export interface UpdateMonitorOptions {
  intervalMs?: number
  onUpdateAvailable?: (manifest: VersionManifest) => void
}

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000
const VERSION_ENDPOINT = '/version.json'
const currentVersion = __APP_VERSION__

let hasNotified = false

const isValidVersionManifest = (value: unknown): value is VersionManifest => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  return typeof record.version === 'string' && record.version.trim().length > 0
}

const fetchLatestManifest = async (): Promise<VersionManifest | null> => {
  try {
    const response = await fetch(`${VERSION_ENDPOINT}?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const parsed = (await response.json()) as unknown

    if (!isValidVersionManifest(parsed)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export const startVersionMonitor = (options: UpdateMonitorOptions = {}): (() => void) => {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS

  const checkForUpdates = async (): Promise<void> => {
    const manifest = await fetchLatestManifest()
    if (!manifest) {
      return
    }

    if (manifest.version !== currentVersion && !hasNotified) {
      hasNotified = true
      options.onUpdateAvailable?.(manifest)
    }
  }

  void checkForUpdates()
  const timerId = window.setInterval(() => {
    void checkForUpdates()
  }, intervalMs)

  return () => {
    window.clearInterval(timerId)
  }
}

export const applyUpdate = (): void => {
  window.location.reload()
}

export const getCurrentVersion = (): string => currentVersion
