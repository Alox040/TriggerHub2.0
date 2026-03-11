import { describe, expect, it } from 'vitest'
import { IdentityService } from '../../website/src/modules/identity/identityService'
import type { UserRecord, UserStore } from '../../website/src/modules/identity/types'
import { ProfileService } from '../../website/src/modules/profile/profileService'
import type { ProfileRecord, ProfileStore } from '../../website/src/modules/profile/types'
import { ProfileValidationError } from '../../website/src/modules/profile/validation'

const createMemoryUserStore = (): UserStore => {
  let users: UserRecord[] = []
  return {
    readAll: () => users,
    writeAll: (nextUsers) => {
      users = nextUsers
    },
  }
}

const createMemoryProfileStore = (): ProfileStore => {
  let profiles: ProfileRecord[] = []
  return {
    readAll: () => profiles,
    writeAll: (nextProfiles) => {
      profiles = nextProfiles
    },
  }
}

describe('website profile v1', () => {
  it('keeps user identity and profile as separate records', () => {
    const identityService = new IdentityService(createMemoryUserStore())
    const profileService = new ProfileService(identityService, createMemoryProfileStore())

    identityService.ensureUser('owner', 'owner')
    const profile = profileService.ensureProfileForUser('owner', 'Owner')

    expect(identityService.getUserById('owner')?.role).toBe('owner')
    expect(profile.user_id).toBe('owner')
    expect(profile.display_name).toBe('Owner')
    expect(profile.role).toBe('owner')
  })

  it('supports future multi-user shape (owner + user)', () => {
    const identityService = new IdentityService(createMemoryUserStore())
    const profileService = new ProfileService(identityService, createMemoryProfileStore())

    identityService.ensureUser('owner', 'owner')
    identityService.ensureUser('user-1', 'user')

    profileService.ensureProfileForUser('owner', 'Owner')
    profileService.ensureProfileForUser('user-1', 'User One')

    const ownerProfile = profileService.getProfileViewByUserId('owner')
    const userProfile = profileService.getProfileViewByUserId('user-1')

    expect(ownerProfile?.role).toBe('owner')
    expect(userProfile?.role).toBe('user')
  })

  it('validates profile updates', () => {
    const identityService = new IdentityService(createMemoryUserStore())
    const profileService = new ProfileService(identityService, createMemoryProfileStore())

    identityService.ensureUser('owner', 'owner')
    profileService.ensureProfileForUser('owner', 'Owner')

    const updated = profileService.updateProfile('owner', {
      display_name: 'Owner Updated',
      avatar_url: 'https://example.com/avatar.png',
      bio: 'TriggerHub owner profile',
    })

    expect(updated.display_name).toBe('Owner Updated')
    expect(updated.avatar_url).toBe('https://example.com/avatar.png')
    expect(updated.bio).toBe('TriggerHub owner profile')
    expect(updated.role).toBe('owner')
  })

  it('rejects invalid avatar_url', () => {
    const identityService = new IdentityService(createMemoryUserStore())
    const profileService = new ProfileService(identityService, createMemoryProfileStore())

    identityService.ensureUser('owner', 'owner')
    profileService.ensureProfileForUser('owner', 'Owner')

    expect(() =>
      profileService.updateProfile('owner', {
        display_name: 'Owner',
        avatar_url: 'not-a-url',
        bio: '',
      }),
    ).toThrow(ProfileValidationError)
  })

  it('guards updates for unknown users', () => {
    const identityService = new IdentityService(createMemoryUserStore())
    const profileService = new ProfileService(identityService, createMemoryProfileStore())

    expect(() =>
      profileService.updateProfile('missing', {
        display_name: 'Unknown',
        avatar_url: '',
        bio: '',
      }),
    ).toThrowError(/unknown user/i)
  })
})
