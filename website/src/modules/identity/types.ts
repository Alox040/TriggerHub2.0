import type { UserRole } from '../access-control/types'

export interface UserRecord {
  id: string
  role: UserRole
  createdAt: number
  updatedAt: number
}

export interface UserStore {
  readAll(): UserRecord[]
  writeAll(users: UserRecord[]): void
}
