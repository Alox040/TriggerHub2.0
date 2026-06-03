import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthProvider'
import { websiteProfileRuntime } from '../../modules/profile/runtime'
import type { ProfileInput, UserProfileView } from '../../modules/profile/types'

interface ProfileContextValue {
  profile: UserProfileView | null
  refreshProfile: () => void
  updateProfile: (input: ProfileInput) => UserProfileView
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

const defaultDisplayNameForRole = (role: 'owner' | 'user'): string =>
  role === 'owner' ? 'Owner' : 'User'

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { identity } = useAuth()
  const [profile, setProfile] = useState<UserProfileView | null>(null)

  const refreshProfile = () => {
    if (!identity) {
      setProfile(null)
      return
    }

    websiteProfileRuntime.identityService.ensureUser(identity.userId, identity.role)
    const ensuredProfile = websiteProfileRuntime.profileService.ensureProfileForUser(
      identity.userId,
      defaultDisplayNameForRole(identity.role),
    )
    setProfile(ensuredProfile)
  }

  useEffect(() => {
    refreshProfile()
    // identity is a small immutable object from auth provider; stable dependency is sufficient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.userId, identity?.role])

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      refreshProfile,
      updateProfile: (input) => {
        if (!identity) {
          throw new Error('Cannot update profile without authenticated identity')
        }

        const updated = websiteProfileRuntime.profileService.updateProfile(identity.userId, input)
        setProfile(updated)
        return updated
      },
    }),
    [identity, profile],
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
