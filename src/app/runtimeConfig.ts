export interface RuntimeConfig {
  storageKeys: {
    triggers: string
    macros: string
  }
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  storageKeys: {
    triggers: 'triggers',
    macros: 'macros',
  },
}
