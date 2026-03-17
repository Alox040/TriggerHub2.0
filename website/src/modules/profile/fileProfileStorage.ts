import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { ProfileRecord, ProfileStoragePort } from './types'
import { isProfileRecord, PROFILE_STORE_FILENAME } from './storage'

export interface FileProfileStorageOptions {
  storePath?: string
}

export class FileProfileStorage implements ProfileStoragePort {
  private inMemoryProfiles: ProfileRecord[] = []

  public constructor(private readonly options: FileProfileStorageOptions = {}) {}

  public async getProfile(userId: string): Promise<ProfileRecord | null> {
    const profiles = await this.readProfileRecords()
    return profiles.find((profile) => profile.userId === userId) ?? null
  }

  public async saveProfile(profile: ProfileRecord): Promise<void> {
    const profiles = await this.readProfileRecords()
    const existing = profiles.find((entry) => entry.userId === profile.userId)
    const nextProfiles = existing
      ? profiles.map((entry) => (entry.userId === profile.userId ? profile : entry))
      : [...profiles, profile]

    await this.writeProfileRecords(nextProfiles)
  }

  public async updateProfile(profile: ProfileRecord): Promise<void> {
    const profiles = await this.readProfileRecords()
    const nextProfiles = profiles.map((entry) => (entry.userId === profile.userId ? profile : entry))
    await this.writeProfileRecords(nextProfiles)
  }

  public async deleteProfile(userId: string): Promise<void> {
    const profiles = await this.readProfileRecords()
    await this.writeProfileRecords(profiles.filter((profile) => profile.userId !== userId))
  }

  public async reset(): Promise<void> {
    this.inMemoryProfiles = []
    await this.writeProfileRecords([])
  }

  private resolveStorePath(): string {
    return this.options.storePath?.trim() || process.env.PROFILE_STORE_PATH?.trim() || path.join(os.tmpdir(), PROFILE_STORE_FILENAME)
  }

  private async readProfileRecords(): Promise<ProfileRecord[]> {
    try {
      const raw = await readFile(this.resolveStorePath(), 'utf8')
      const parsed = JSON.parse(raw) as unknown
      return Array.isArray(parsed) ? parsed.filter(isProfileRecord) : []
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException
      if (nodeError.code === 'ENOENT') {
        return []
      }

      return [...this.inMemoryProfiles]
    }
  }

  private async writeProfileRecords(profiles: ProfileRecord[]): Promise<void> {
    try {
      const storePath = this.resolveStorePath()
      await mkdir(path.dirname(storePath), { recursive: true })
      await writeFile(storePath, JSON.stringify(profiles), 'utf8')
      this.inMemoryProfiles = [...profiles]
    } catch {
      this.inMemoryProfiles = [...profiles]
    }
  }
}

export const createDefaultFileProfileStorage = (): FileProfileStorage => new FileProfileStorage()
