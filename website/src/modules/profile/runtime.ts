import { IdentityService } from '../identity/identityService'
import { createLocalUserStore } from '../identity/userStore'
import { ProfileService } from './profileService'
import { createLocalProfileStore } from './profileStore'

export interface WebsiteProfileRuntime {
  identityService: IdentityService
  profileService: ProfileService
}

export const createWebsiteProfileRuntime = (): WebsiteProfileRuntime => {
  const identityService = new IdentityService(createLocalUserStore())
  const profileService = new ProfileService(identityService, createLocalProfileStore())

  return {
    identityService,
    profileService,
  }
}

export const websiteProfileRuntime = createWebsiteProfileRuntime()
