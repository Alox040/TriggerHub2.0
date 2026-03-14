import type { BackendProfileApi, ProfileCacheStore, ProfileInput, UserProfileView } from './types'
import { ProfileValidationError, validateProfileInput } from './validation'

export class ProfileServiceError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'ProfileServiceError'
  }
}

const parseErrorMessage = async (response: Response, fallbackMessage: string): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: { message?: string } }
    return payload.error?.message ?? fallbackMessage
  } catch {
    return fallbackMessage
  }
}

const readCookieValue = (cookieName: string): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const encodedName = `${cookieName}=`
  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(encodedName))

  return cookie ? cookie.slice(encodedName.length) : null
}

export const createBackendProfileApi = (): BackendProfileApi => ({
  getCurrentProfile: async () => {
    const response = await fetch('/api/profile/me', {
      method: 'GET',
      credentials: 'same-origin',
    })

    if (response.status === 401) {
      throw new ProfileServiceError('No authenticated profile session')
    }

    if (!response.ok) {
      throw new ProfileServiceError(await parseErrorMessage(response, 'Failed to load profile'))
    }

    const payload = (await response.json()) as { profile?: UserProfileView }
    if (!payload.profile) {
      throw new ProfileServiceError('Profile response did not include a profile payload')
    }

    return payload.profile
  },
  updateCurrentProfile: async (input) => {
    const csrfToken = readCookieValue('th_csrf')
    const response = await fetch('/api/profile/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      credentials: 'same-origin',
      body: JSON.stringify(input),
    })

    if (response.status === 400) {
      throw new ProfileValidationError(await parseErrorMessage(response, 'Profile input is invalid'))
    }

    if (!response.ok) {
      throw new ProfileServiceError(await parseErrorMessage(response, 'Failed to update profile'))
    }

    const payload = (await response.json()) as { profile?: UserProfileView }
    if (!payload.profile) {
      throw new ProfileServiceError('Profile response did not include a profile payload')
    }

    return payload.profile
  },
})

export class ProfileService {
  public constructor(
    private readonly backendApi: BackendProfileApi,
    private readonly cacheStore?: ProfileCacheStore,
  ) {}

  public async getCurrentProfile(userId: string): Promise<UserProfileView> {
    try {
      const profile = await this.backendApi.getCurrentProfile()
      this.cacheStore?.write(profile)
      return profile
    } catch (error) {
      const cachedProfile = this.cacheStore?.read(userId)
      if (cachedProfile) {
        return cachedProfile
      }

      throw error
    }
  }

  public async updateCurrentProfile(userId: string, input: ProfileInput): Promise<UserProfileView> {
    const validated = validateProfileInput(input)
    const profile = await this.backendApi.updateCurrentProfile(validated)

    if (profile.user_id !== userId) {
      throw new ProfileServiceError('Updated profile does not match the authenticated user')
    }

    this.cacheStore?.write(profile)
    return profile
  }

  public clearCachedProfile(userId: string): void {
    this.cacheStore?.clear(userId)
  }
}
