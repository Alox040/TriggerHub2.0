import type { UserRole } from '../access-control/types'
import type { UserRecord, UserStore } from './types'

export class IdentityService {
  constructor(private readonly userStore: UserStore) {}

  listUsers(): UserRecord[] {
    return this.userStore.readAll()
  }

  getUserById(userId: string): UserRecord | null {
    return this.userStore.readAll().find((user) => user.id === userId) ?? null
  }

  ensureUser(userId: string, role: UserRole): UserRecord {
    const users = this.userStore.readAll()
    const existingUser = users.find((user) => user.id === userId)
    const now = Date.now()

    if (existingUser) {
      if (existingUser.role === role) {
        return existingUser
      }

      const updatedUser: UserRecord = {
        ...existingUser,
        role,
        updatedAt: now,
      }
      this.userStore.writeAll(users.map((user) => (user.id === userId ? updatedUser : user)))
      return updatedUser
    }

    const newUser: UserRecord = {
      id: userId,
      role,
      createdAt: now,
      updatedAt: now,
    }
    this.userStore.writeAll([...users, newUser])
    return newUser
  }
}
