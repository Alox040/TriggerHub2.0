import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { SignedSessionPayload } from './_auth'
import type { ProfileInput, ProfileRecord, UserProfileView } from '../src/modules/profile/types'
import { validateProfileInput } from '../src/modules/profile/validation'

let inMemoryProfiles: ProfileRecord[] = []

const PROFILE_STORE_FILENAME = 'triggerhub.website.profiles.v1.json'

const isProfileRecord = (value: unknown): value is ProfileRecord => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Partial<ProfileRecord>
  return (
    typeof record.userId === 'string' &&
    typeof record.displayName === 'string' &&
    typeof record.avatarUrl === 'string' &&
    typeof record.bio === 'string' &&
    typeof record.createdAt === 'number' &&
    typeof record.updatedAt === 'number'
  )
}

const resolveProfileStorePath = (): string =>
  process.env.PROFILE_STORE_PATH?.trim() || path.join(os.tmpdir(), PROFILE_STORE_FILENAME)

const readProfileRecords = async (): Promise<ProfileRecord[]> => {
  try {
    const raw = await readFile(resolveProfileStorePath(), 'utf8')
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter(isProfileRecord) : []
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    if (nodeError.code === 'ENOENT') {
      return []
    }

    return [...inMemoryProfiles]
  }
}

const writeProfileRecords = async (profiles: ProfileRecord[]): Promise<void> => {
  try {
    const storePath = resolveProfileStorePath()
    await mkdir(path.dirname(storePath), { recursive: true })
    await writeFile(storePath, JSON.stringify(profiles), 'utf8')
    inMemoryProfiles = [...profiles]
  } catch {
    inMemoryProfiles = [...profiles]
  }
}

const toProfileView = (record: ProfileRecord, role: SignedSessionPayload['role']): UserProfileView => ({
  user_id: record.userId,
  display_name: record.displayName,
  avatar_url: record.avatarUrl,
  bio: record.bio,
  role,
})

const defaultDisplayNameForSession = (session: SignedSessionPayload): string => {
  if (session.role === 'owner') {
    return 'Owner'
  }

  const emailName = session.email.split('@')[0]?.trim()
  return emailName && emailName.length > 0 ? emailName : 'User'
}

export const loadOrCreateProfileForSession = async (
  session: SignedSessionPayload,
): Promise<UserProfileView> => {
  const profiles = await readProfileRecords()
  const existing = profiles.find((record) => record.userId === session.userId)
  if (existing) {
    return toProfileView(existing, session.role)
  }

  const now = Date.now()
  const created: ProfileRecord = {
    userId: session.userId,
    displayName: defaultDisplayNameForSession(session),
    avatarUrl: '',
    bio: '',
    createdAt: now,
    updatedAt: now,
  }

  await writeProfileRecords([...profiles, created])
  return toProfileView(created, session.role)
}

export const updateProfileForSession = async (
  session: SignedSessionPayload,
  input: ProfileInput,
): Promise<UserProfileView> => {
  const validated = validateProfileInput(input)
  const profiles = await readProfileRecords()
  const existing = profiles.find((record) => record.userId === session.userId)
  const now = Date.now()

  const baseRecord: ProfileRecord = existing ?? {
    userId: session.userId,
    displayName: defaultDisplayNameForSession(session),
    avatarUrl: '',
    bio: '',
    createdAt: now,
    updatedAt: now,
  }

  const updatedRecord: ProfileRecord = {
    ...baseRecord,
    displayName: validated.display_name,
    avatarUrl: validated.avatar_url,
    bio: validated.bio,
    updatedAt: now,
  }

  const nextProfiles = existing
    ? profiles.map((record) => (record.userId === session.userId ? updatedRecord : record))
    : [...profiles, updatedRecord]

  await writeProfileRecords(nextProfiles)
  return toProfileView(updatedRecord, session.role)
}

export const resetProfileStoreForTests = async (): Promise<void> => {
  inMemoryProfiles = []
  try {
    await writeProfileRecords([])
  } catch {
    // ignore test cleanup failure
  }
}
