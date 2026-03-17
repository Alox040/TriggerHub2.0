export interface TwitchRuntimeConfig {
  clientId?: string
  accessToken?: string
  baseUrl?: string
}

export interface ObsRuntimeConfig {
  host?: string
  port?: number
  password?: string
}

export interface RuntimeConfig {
  storageKeys: {
    triggers: string
    macros: string
  }
  twitch?: TwitchRuntimeConfig
  obs?: ObsRuntimeConfig
}

export const DEFAULT_TWITCH_CONFIG: TwitchRuntimeConfig = {
  baseUrl: 'https://api.twitch.tv/helix',
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  storageKeys: {
    triggers: 'triggers',
    macros: 'macros',
  },
  twitch: DEFAULT_TWITCH_CONFIG,
}
