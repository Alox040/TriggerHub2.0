export type UserRole = "owner" | "user";

export interface IdentityRecord {
  id: string;
  email: string;
  role: UserRole;
  createdAt: number;
}

export interface IdentityStore {
  readAll(): IdentityRecord[];
}

export class IdentityService {
  constructor(private readonly store: IdentityStore) {}

  getUserById(id: string): IdentityRecord | null {
    return this.store.readAll().find((user) => user.id === id) ?? null;
  }
}

