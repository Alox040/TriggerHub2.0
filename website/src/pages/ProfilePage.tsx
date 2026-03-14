import { FormEvent, useEffect, useState } from 'react'
import { useProfile } from '../app/providers/ProfileProvider'
import { ProfileValidationError } from '../modules/profile/validation'
import { ProfileServiceError } from '../modules/profile/profileService'

interface ProfilePageProps {
  onNavigate: (path: string) => void
}

export const ProfilePage = ({ onNavigate }: ProfilePageProps) => {
  const { profile, updateProfile, isProfileLoading, profileError } = useProfile()
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) {
      return
    }

    setDisplayName(profile.display_name)
    setAvatarUrl(profile.avatar_url)
    setBio(profile.bio)
  }, [profile])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const updated = await updateProfile({
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
      })

      setDisplayName(updated.display_name)
      setAvatarUrl(updated.avatar_url)
      setBio(updated.bio)
      setSuccess('Profile saved')
    } catch (unknownError) {
      if (unknownError instanceof ProfileValidationError) {
        setError(unknownError.message)
      } else if (unknownError instanceof ProfileServiceError) {
        setError(unknownError.message)
      } else {
        setError('Failed to update profile')
      }
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Identity is managed separately from auth/session. Current role:{' '}
          <span className="font-mono">{profile?.role ?? 'unknown'}</span>
        </p>
        {isProfileLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading profile...</p> : null}
        {!isProfileLoading && profileError ? <p className="mt-4 text-sm text-red-300">{profileError}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            Display name
            <input
              className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>

          <label className="block text-sm">
            Avatar URL
            <input
              className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className="block text-sm">
            Bio
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2 min-h-28"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <div className="flex gap-3">
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground font-semibold" type="submit">
              Save profile
            </button>
            <button
              className="rounded-md border border-border px-4 py-2"
              type="button"
              onClick={() => onNavigate('/internal')}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
