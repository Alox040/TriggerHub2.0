import type { AccessMode } from '../modules/access-control/types'
import type { AuthConfig, OwnerAuthConfigStatus, OwnerCredentialConfig } from '../modules/auth/types'

const DEFAULT_MODE: AccessMode = 'private_prelaunch'
const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 8
const MIN_OWNER_PASSWORD_ITERATIONS = 120_000

export interface RuntimeConfigResolution {
  appAccessMode: AccessMode
  isSignupEnabled: boolean
  authConfig: AuthConfig | null
  ownerProviderConfig: OwnerCredentialConfig | null
  ownerAuthConfigStatus: OwnerAuthConfigStatus
}

interface RuntimeEnv {
  VITE_ACCESS_MODE?: string
  VITE_ENABLE_SIGNUP?: string
  VITE_SESSION_TTL_MS?: string
  VITE_OWNER_USER_ID?: string
  VITE_OWNER_EMAIL?: string
  VITE_OWNER_USERNAME?: string
  VITE_OWNER_PASSWORD_HASH?: string
  VITE_OWNER_PASSWORD_SALT?: string
  VITE_OWNER_PASSWORD_ITERATIONS?: string
}

const parseAccessMode = (value: string | undefined): AccessMode => {
  if (value === 'private_prelaunch' || value === 'invite_only' || value === 'public_product') {
    return value
  }
  return DEFAULT_MODE
}

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback
  }

  return value.toLowerCase() === 'true'
}

const requiredField = (value: string | undefined): string => (value ?? '').trim()

const validateOwnerConfig = (env: RuntimeEnv): OwnerAuthConfigStatus => {
  const reasons: string[] = []

  const ownerUserId = requiredField(env.VITE_OWNER_USER_ID)
  const ownerEmail = requiredField(env.VITE_OWNER_EMAIL)
  const ownerUsername = requiredField(env.VITE_OWNER_USERNAME)
  const ownerPasswordHash = requiredField(env.VITE_OWNER_PASSWORD_HASH)
  const ownerPasswordSalt = requiredField(env.VITE_OWNER_PASSWORD_SALT)
  const ownerIterations = parsePositiveInt(env.VITE_OWNER_PASSWORD_ITERATIONS, 0)

  if (!ownerUserId) reasons.push('VITE_OWNER_USER_ID missing')
  if (!ownerEmail) reasons.push('VITE_OWNER_EMAIL missing')
  if (!ownerUsername) reasons.push('VITE_OWNER_USERNAME missing')
  if (!ownerPasswordHash) reasons.push('VITE_OWNER_PASSWORD_HASH missing')
  if (!ownerPasswordSalt) reasons.push('VITE_OWNER_PASSWORD_SALT missing')
  if (ownerIterations < MIN_OWNER_PASSWORD_ITERATIONS) {
    reasons.push(`VITE_OWNER_PASSWORD_ITERATIONS must be >= ${MIN_OWNER_PASSWORD_ITERATIONS}`)
  }

  return {
    configured: reasons.length === 0,
    reasons,
  }
}

export const resolveRuntimeConfig = (
  env: RuntimeEnv,
  options: { isDev: boolean },
): RuntimeConfigResolution => {
  const appAccessMode = parseAccessMode(env.VITE_ACCESS_MODE)
  const isSignupEnabled = parseBoolean(env.VITE_ENABLE_SIGNUP, false)
  const ownerAuthConfigStatus = validateOwnerConfig(env)

  if (!ownerAuthConfigStatus.configured) {
    const reasons = options.isDev
      ? [...ownerAuthConfigStatus.reasons, 'DEV fail-closed active until owner env is configured']
      : ownerAuthConfigStatus.reasons

    return {
      appAccessMode,
      isSignupEnabled,
      authConfig: null,
      ownerProviderConfig: null,
      ownerAuthConfigStatus: {
        configured: false,
        reasons,
      },
    }
  }

  const authConfig: AuthConfig = {
    sessionTtlMs: parsePositiveInt(env.VITE_SESSION_TTL_MS, DEFAULT_SESSION_TTL_MS),
  }

  const ownerProviderConfig: OwnerCredentialConfig = {
    userId: requiredField(env.VITE_OWNER_USER_ID),
    email: requiredField(env.VITE_OWNER_EMAIL),
    username: requiredField(env.VITE_OWNER_USERNAME),
    passwordHashBase64: requiredField(env.VITE_OWNER_PASSWORD_HASH),
    saltBase64: requiredField(env.VITE_OWNER_PASSWORD_SALT),
    iterations: parsePositiveInt(env.VITE_OWNER_PASSWORD_ITERATIONS, MIN_OWNER_PASSWORD_ITERATIONS),
  }

  return {
    appAccessMode,
    isSignupEnabled,
    authConfig,
    ownerProviderConfig,
    ownerAuthConfigStatus,
  }
}

const runtimeConfig = resolveRuntimeConfig(import.meta.env as RuntimeEnv, {
  isDev: Boolean(import.meta.env.DEV),
})

export const appAccessMode = runtimeConfig.appAccessMode
export const isSignupEnabled = runtimeConfig.isSignupEnabled
export const authConfig = runtimeConfig.authConfig
export const ownerProviderConfig = runtimeConfig.ownerProviderConfig
export const ownerAuthConfigStatus = runtimeConfig.ownerAuthConfigStatus

export const isOwnerAuthFailClosed = !ownerAuthConfigStatus.configured
