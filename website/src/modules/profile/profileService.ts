import { IdentityService } from '../identity/identityService'
import type { ProfileInput, ProfileRecord, ProfileStore, UserProfileView } from './types'
import { validateProfileInput } from './validation'

const toProfileView = (record: ProfileRecord, role: 'owner' | 'user'): UserProfileView => ({
  user_id: record.userId,
  display_name: record.displayName,
  avatar_url: record.avatarUrl,
  bio: record.bio,
  role,
})

export class ProfileService {
  constructor(
    private readonly identityService: IdentityService,
    private readonly profileStore: ProfileStore,
  ) {}

  getProfileViewByUserId(userId: string): UserProfileView | null {
    const user = this.identityService.getUserById(userId)
    if (!user) {
      return null
    }

    const profile = this.profileStore.readAll().find((record) => record.userId === userId)
    return profile ? toProfileView(profile, user.role) : null
  }

  ensureProfileForUser(userId: string, defaultDisplayName: string): UserProfileView {
    const user = this.identityService.getUserById(userId)
    if (!user) {
      throw new Error(`Cannot create profile for unknown user: ${userId}`)
    }

    const profiles = this.profileStore.readAll()
    const existing = profiles.find((record) => record.userId === userId)
    if (existing) {
      return toProfileView(existing, user.role)
    }

    const now = Date.now()
    const created: ProfileRecord = {
      userId,
      displayName: defaultDisplayName.trim(),
      avatarUrl: '',
      bio: '',
      createdAt: now,
      updatedAt: now,
    }

    this.profileStore.writeAll([...profiles, created])
    return toProfileView(created, user.role)
  }

  updateProfile(userId: string, input: ProfileInput): UserProfileView {
    const user = this.identityService.getUserById(userId)
    if (!user) {
      throw new Error(`Cannot update profile for unknown user: ${userId}`)
    }

    const validated = validateProfileInput(input)
    const profiles = this.profileStore.readAll()
    const existing = profiles.find((record) => record.userId === userId)
    const now = Date.now()

    const baseRecord: ProfileRecord =
      existing ??
      ({
        userId,
        displayName: validated.display_name,
        avatarUrl: validated.avatar_url,
        bio: validated.bio,
        createdAt: now,
        updatedAt: now,
      } as ProfileRecord)

    const updatedRecord: ProfileRecord = {
      ...baseRecord,
      displayName: validated.display_name,
      avatarUrl: validated.avatar_url,
      bio: validated.bio,
      updatedAt: now,
    }

    const nextProfiles = existing
      ? profiles.map((record) => (record.userId === userId ? updatedRecord : record))
      : [...profiles, updatedRecord]
    this.profileStore.writeAll(nextProfiles)

    return toProfileView(updatedRecord, user.role)
  }
}
