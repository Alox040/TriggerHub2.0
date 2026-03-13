import type { StoragePort } from './storagePort'

export class InMemoryStorage implements StoragePort {
  private readonly storage = new Map<string, unknown>()

  async load<T>(key: string): Promise<T | null> {
    if (!this.storage.has(key)) {
      return null
    }

    return this.storage.get(key) as T
  }

  async save<T>(key: string, data: T): Promise<void> {
    this.storage.set(key, data)
  }
}
