import { createLocalProfileCacheStore } from './profileCacheStore'
import { createBackendProfileApi, ProfileService } from './profileService'

export interface WebsiteProfileRuntime {
  profileService: ProfileService
}

export const createWebsiteProfileRuntime = (): WebsiteProfileRuntime => {
  const profileService = new ProfileService(
    createBackendProfileApi(),
    createLocalProfileCacheStore(),
  )

  return {
    profileService,
  }
}

export const websiteProfileRuntime = createWebsiteProfileRuntime()
