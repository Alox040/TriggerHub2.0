export interface StoragePort {
  load<T>(key: string): Promise<T | null>
  save<T>(key: string, data: T): Promise<void>
}
