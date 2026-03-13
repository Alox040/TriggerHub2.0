import {
  ACTIVE_ACCESS_MODES,
  DEFAULT_ACCESS_MODE,
  isAccessMode,
  type AccessMode,
} from '../modules/access-control/types'

export interface RuntimeConfigResolution {
  appAccessMode: AccessMode
  isSignupEnabled: boolean
}

interface RuntimeConfigEnv {
  readonly VITE_ACCESS_MODE?: string
  readonly VITE_ENABLE_SIGNUP?: string
  [key: string]: unknown
}

const parseAccessMode = (value: string | undefined): AccessMode => {
  if (!isAccessMode(value)) {
    return DEFAULT_ACCESS_MODE
  }

  return ACTIVE_ACCESS_MODES.includes(value) ? value : DEFAULT_ACCESS_MODE
}

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback
  }

  return value.toLowerCase() === 'true'
}

export const resolveRuntimeConfig = (
  env: RuntimeConfigEnv,
  options: { isDev: boolean },
): RuntimeConfigResolution => {
  const appAccessMode = parseAccessMode(env.VITE_ACCESS_MODE)
  const isSignupEnabled = parseBoolean(env.VITE_ENABLE_SIGNUP, false)
  void options

  return {
    appAccessMode,
    isSignupEnabled,
  }
}

const runtimeConfig = resolveRuntimeConfig(import.meta.env, {
  isDev: import.meta.env.DEV,
})

export const appAccessMode = runtimeConfig.appAccessMode
export const isSignupEnabled = runtimeConfig.isSignupEnabled
