import {
  ACTIVE_ACCESS_MODES,
  DEFAULT_ACCESS_MODE,
  isAccessMode,
  type AccessMode,
} from '../modules/access-control/types'

export interface RuntimeConfigResolution {
  appAccessMode: AccessMode
}

interface RuntimeConfigEnv {
  readonly VITE_ACCESS_MODE?: string
  [key: string]: unknown
}

const parseAccessMode = (value: string | undefined): AccessMode => {
  if (!isAccessMode(value)) {
    return DEFAULT_ACCESS_MODE
  }

  return ACTIVE_ACCESS_MODES.includes(value) ? value : DEFAULT_ACCESS_MODE
}

export const resolveRuntimeConfig = (
  env: RuntimeConfigEnv,
  options: { isDev: boolean },
): RuntimeConfigResolution => {
  const appAccessMode = parseAccessMode(env.VITE_ACCESS_MODE)
  void options

  return {
    appAccessMode,
  }
}

const runtimeConfig = resolveRuntimeConfig(import.meta.env, {
  isDev: import.meta.env.DEV,
})

export const appAccessMode = runtimeConfig.appAccessMode
