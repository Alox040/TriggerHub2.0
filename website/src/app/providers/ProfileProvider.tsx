import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthProvider'
import { websiteProfileRuntime } from '../../modules/profile/runtime'
import type { ProfileInput, UserProfileView } from '../../modules/profile/types'

interface ProfileContextValue {
  profile: UserProfileView | null
  isProfileLoading: boolean
  profileError: string | null
  refreshProfile: () => Promise<void>
  updateProfile: (input: ProfileInput) => Promise<UserProfileView>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { identity } = useAuth()
  const [profile, setProfile] = useState<UserProfileView | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const refreshProfile = async (): Promise<void> => {
    if (!identity) {
      setProfile(null)
      setProfileError(null)
      return
    }

    setIsProfileLoading(true)
    try {
      const nextProfile = await websiteProfileRuntime.profileService.getCurrentProfile(identity.userId)
      setProfile(nextProfile)
      setProfileError(null)
    } catch (error) {
      setProfile(null)
      setProfileError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setIsProfileLoading(false)
    }
  }

  useEffect(() => {
    void refreshProfile()
    // identity is a small immutable object from auth provider; stable dependency is sufficient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.userId, identity?.role])

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      isProfileLoading,
      profileError,
      refreshProfile,
      updateProfile: async (input) => {
        if (!identity) {
          throw new Error('Cannot update profile without authenticated identity')
        }

        const updated = await websiteProfileRuntime.profileService.updateCurrentProfile(identity.userId, input)
        setProfile(updated)
        setProfileError(null)
        return updated
      },
    }),
    [identity, isProfileLoading, profile, profileError],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}
