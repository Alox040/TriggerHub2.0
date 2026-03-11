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
