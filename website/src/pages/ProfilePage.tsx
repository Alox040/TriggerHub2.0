import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useProfile } from '../app/providers/ProfileProvider'
import { ProfileValidationError } from '../modules/profile/validation'
import { ProfileServiceError } from '../modules/profile/profileService'

interface ProfilePageProps {
  onNavigate: (path: string) => void
}

export const ProfilePage = ({ onNavigate }: ProfilePageProps) => {
  const { t } = useTranslation()
  const { profile, updateProfile, isProfileLoading, profileError } = useProfile()
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const translateProfileError = (message: string): string => {
    const keyByMessage: Record<string, string> = {
      'Failed to load profile': 'errors.profile.profile_load_failed',
      'Cannot update profile without authenticated identity': 'errors.profile.profile_update_identity',
      'No authenticated profile session': 'errors.profile.profile_no_session',
      'Profile response did not include a profile payload': 'errors.profile.profile_no_payload',
      'Profile input is invalid': 'errors.profile.profile_input_invalid',
      'Failed to update profile': 'errors.profile.profile_update_failed',
      'Updated profile does not match the authenticated user': 'errors.profile.profile_user_mismatch',
      'avatar_url exceeds maximum length': 'errors.profile.validation_avatar_length',
      'avatar_url must use http or https': 'errors.profile.validation_avatar_http',
      'avatar_url must be a valid absolute URL': 'errors.profile.validation_avatar_url',
      'display_name is required': 'errors.profile.validation_display_name_required',
      'display_name exceeds maximum length': 'errors.profile.validation_display_name_length',
      'bio exceeds maximum length': 'errors.profile.validation_bio_length',
    }

    const translationKey = keyByMessage[message]
    return translationKey ? t(translationKey) : message
  }

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
      setSuccess(t('profile.saved'))
    } catch (unknownError) {
      if (unknownError instanceof ProfileValidationError) {
        setError(translateProfileError(unknownError.message))
      } else if (unknownError instanceof ProfileServiceError) {
        setError(translateProfileError(unknownError.message))
      } else {
        setError(t('profile.updateFailed'))
      }
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher variant="light" />
        </div>
        <h1 className="text-2xl font-semibold">{t('profile.title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('profile.identityNote', { role: profile?.role ?? t('profile.unknownRole') })}
        </p>
        {isProfileLoading ? <p className="mt-4 text-sm text-muted-foreground">{t('profile.loading')}</p> : null}
        {!isProfileLoading && profileError ? <p className="mt-4 text-sm text-red-300">{translateProfileError(profileError)}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            {t('profile.displayName')}
            <input
              className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>

          <label className="block text-sm">
            {t('profile.avatarUrl')}
            <input
              className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder={t('profile.avatarPlaceholder')}
            />
          </label>

          <label className="block text-sm">
            {t('profile.bio')}
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
              {t('profile.save')}
            </button>
            <button
              className="rounded-md border border-border px-4 py-2"
              type="button"
              onClick={() => onNavigate('/internal')}
            >
              {t('profile.back')}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
