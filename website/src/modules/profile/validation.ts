import type { ProfileInput } from './types'

export class ProfileValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProfileValidationError'
  }
}

const MAX_DISPLAY_NAME_LENGTH = 64
const MAX_BIO_LENGTH = 280
const MAX_AVATAR_URL_LENGTH = 512

const sanitizeString = (value: string): string => value.trim()

const assertAvatarUrl = (value: string): string => {
  const sanitized = sanitizeString(value)
  if (!sanitized) {
    return ''
  }

  if (sanitized.length > MAX_AVATAR_URL_LENGTH) {
    throw new ProfileValidationError('avatar_url exceeds maximum length')
  }

  try {
    const parsed = new URL(sanitized)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new ProfileValidationError('avatar_url must use http or https')
    }
  } catch {
    throw new ProfileValidationError('avatar_url must be a valid absolute URL')
  }

  return sanitized
}

export const validateProfileInput = (input: ProfileInput): ProfileInput => {
  const displayName = sanitizeString(input.display_name)
  if (!displayName) {
    throw new ProfileValidationError('display_name is required')
  }

  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new ProfileValidationError('display_name exceeds maximum length')
  }

  const bio = sanitizeString(input.bio)
  if (bio.length > MAX_BIO_LENGTH) {
    throw new ProfileValidationError('bio exceeds maximum length')
  }

  return {
    display_name: displayName,
    avatar_url: assertAvatarUrl(input.avatar_url),
    bio,
  }
}
