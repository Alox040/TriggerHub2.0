import type { SignedSessionPayload } from './_auth'
import { createDefaultFileProfileStorage, FileProfileStorage } from '../src/modules/profile/fileProfileStorage'
import type { ProfileInput, ProfileRecord, ProfileStoragePort, UserProfileView } from '../src/modules/profile/types'
import { validateProfileInput } from '../src/modules/profile/validation'

let profileStorage: ProfileStoragePort = createDefaultFileProfileStorage()

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

export const getProfileStorage = (): ProfileStoragePort => profileStorage

export const setProfileStorageForTests = (storage?: ProfileStoragePort): void => {
  profileStorage = storage ?? createDefaultFileProfileStorage()
}

export const loadOrCreateProfileForSession = async (
  session: SignedSessionPayload,
): Promise<UserProfileView> => {
  const existing = await profileStorage.getProfile(session.userId)
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

  await profileStorage.saveProfile(created)
  return toProfileView(created, session.role)
}

export const updateProfileForSession = async (
  session: SignedSessionPayload,
  input: ProfileInput,
): Promise<UserProfileView> => {
  const validated = validateProfileInput(input)
  const existing = await profileStorage.getProfile(session.userId)
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

  if (existing) {
    await profileStorage.updateProfile(updatedRecord)
  } else {
    await profileStorage.saveProfile(updatedRecord)
  }

  return toProfileView(updatedRecord, session.role)
}

export const resetProfileStoreForTests = async (): Promise<void> => {
  if (profileStorage instanceof FileProfileStorage) {
    await profileStorage.reset()
    return
  }

  setProfileStorageForTests()
  const storage = getProfileStorage()
  if (storage instanceof FileProfileStorage) {
    await storage.reset()
  }
}
