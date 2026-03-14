import type { UserRole } from '../access-control/types'

export interface ProfileRecord {
  userId: string
  displayName: string
  avatarUrl: string
  bio: string
  createdAt: number
  updatedAt: number
}

export interface ProfileStore {
  readAll(): ProfileRecord[]
  writeAll(profiles: ProfileRecord[]): void
}

export interface ProfileCacheStore {
  read(userId: string): UserProfileView | null
  write(profile: UserProfileView): void
  clear(userId: string): void
}

export interface ProfileInput {
  display_name: string
  avatar_url: string
  bio: string
}

export interface UserProfileView {
  user_id: string
  display_name: string
  avatar_url: string
  bio: string
  role: UserRole
}

export interface BackendProfileApi {
  getCurrentProfile(): Promise<UserProfileView>
  updateCurrentProfile(input: ProfileInput): Promise<UserProfileView>
}
