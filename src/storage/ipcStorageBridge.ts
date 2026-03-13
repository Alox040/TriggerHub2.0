import type { StoragePort } from './storagePort'

type TriggerHubElectronStorageApi = TriggerHubElectron['storage']
type TriggerHubWindow = Window & { triggerHubElectron?: TriggerHubElectron }

export const getStorageApi = (
  targetWindow: TriggerHubWindow | undefined =
    typeof window === 'undefined' ? undefined : (window as TriggerHubWindow),
): TriggerHubElectronStorageApi | undefined => {
  if (!targetWindow) {
    return undefined
  }

  return targetWindow.triggerHubElectron?.storage
}

export class IpcStorageBridge implements StoragePort {
  public async load<T>(key: string): Promise<T | null> {
    const storage = getStorageApi()
    if (!storage) {
      return null
    }

    return storage.load<T>(key)
  }

  public async save<T>(key: string, data: T): Promise<void> {
    const storage = getStorageApi()
    if (!storage) {
      return
    }

    await storage.save(key, data)
  }
}
