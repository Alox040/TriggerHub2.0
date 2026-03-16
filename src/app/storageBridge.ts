import { EventTopics, type Macro } from '../types'
import type { TriggerEngine } from '../core/trigger-engine'
import type { MacroEngine } from '../core/macro-system'
import type { StoragePort } from '../storage/storagePort'
import { createConsoleLogger } from '../utils/logger'
import type { RuntimeConfig } from './runtimeConfig'
import { stripMacroRecord, stripTriggerRecord } from './storageHelpers'
import {
  createPersistedMacrosPayload,
  createPersistedTriggersPayload,
  parsePersistedMacros,
  parsePersistedTriggers,
} from './storageValidation'

const runtimeLogger = createConsoleLogger('DesktopRuntime')

export const RUNTIME_CONFIG_STORAGE_KEY = 'runtime-config'
export const DESKTOP_PREFERENCES_STORAGE_KEY = 'desktop-preferences'

const DESKTOP_PREFERENCES_SCHEMA = 'triggerhub.desktop-preferences'
const DESKTOP_PREFERENCES_VERSION = 1 as const

export interface DesktopPreferences {
  restoreRuntimeOnLaunch: boolean
  restoreTwitchConnection: boolean
}

interface PersistedDesktopPreferences {
  schema: typeof DESKTOP_PREFERENCES_SCHEMA
  version: typeof DESKTOP_PREFERENCES_VERSION
  preferences: DesktopPreferences
}

export const DEFAULT_DESKTOP_PREFERENCES: DesktopPreferences = {
  restoreRuntimeOnLaunch: false,
  restoreTwitchConnection: false,
}

export const seedDefaultCoreData = async (
  triggerEngine: TriggerEngine,
  macroEngine: MacroEngine,
): Promise<void> => {
  const defaultMacro: Macro = {
    id: 'macro-default-scene',
    name: 'Default Scene Macro',
    enabled: true,
    steps: [
      {
        id: 'step-obs-scene',
        type: 'service_call',
        service: 'obs',
        action: 'switchScene',
        params: { sceneName: 'Main' },
      },
    ],
  }

  await macroEngine.registerMacro(defaultMacro)

  await triggerEngine.registerTrigger({
    id: 'trigger-main-scene',
    name: 'Switch To Main Scene',
    enabled: true,
    event: EventTopics.OBS_CONNECTED,
    conditions: [],
    actions: [
      {
        type: 'macro.run',
        payload: { macroId: defaultMacro.id },
      },
    ],
  })
}

export const isRuntimeConfig = (value: unknown): value is RuntimeConfig => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as { storageKeys?: { triggers?: unknown; macros?: unknown } }
  return (
    !!candidate.storageKeys &&
    typeof candidate.storageKeys.triggers === 'string' &&
    typeof candidate.storageKeys.macros === 'string'
  )
}

export const parseDesktopPreferences = (value: unknown): DesktopPreferences => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_DESKTOP_PREFERENCES
  }

  const candidate = value as Partial<PersistedDesktopPreferences>
  if (
    candidate.schema !== DESKTOP_PREFERENCES_SCHEMA ||
    candidate.version !== DESKTOP_PREFERENCES_VERSION ||
    !candidate.preferences ||
    typeof candidate.preferences !== 'object'
  ) {
    return DEFAULT_DESKTOP_PREFERENCES
  }

  const preferences = candidate.preferences as Partial<DesktopPreferences>
  return {
    restoreRuntimeOnLaunch: preferences.restoreRuntimeOnLaunch === true,
    restoreTwitchConnection: preferences.restoreTwitchConnection === true,
  }
}

export const loadDesktopPreferences = async (
  storage: StoragePort | undefined,
): Promise<DesktopPreferences> => {
  if (!storage) {
    return DEFAULT_DESKTOP_PREFERENCES
  }

  const raw = await storage.load<unknown>(DESKTOP_PREFERENCES_STORAGE_KEY)
  return parseDesktopPreferences(raw)
}

export const persistDesktopPreferences = async (
  storage: StoragePort | undefined,
  preferences: DesktopPreferences,
): Promise<void> => {
  if (!storage) {
    return
  }

  await storage.save<PersistedDesktopPreferences>(DESKTOP_PREFERENCES_STORAGE_KEY, {
    schema: DESKTOP_PREFERENCES_SCHEMA,
    version: DESKTOP_PREFERENCES_VERSION,
    preferences,
  })
}

export const loadOrSeedCoreData = async (
  triggerEngine: TriggerEngine,
  macroEngine: MacroEngine,
  storage: StoragePort | undefined,
  runtimeConfig: RuntimeConfig,
): Promise<{ mode: 'loaded' | 'seeded-fallback'; seededFallback: boolean; migrated: boolean }> => {
  if (triggerEngine.getAll().length > 0 || macroEngine.getAllMacros().length > 0) {
    return { mode: 'loaded', seededFallback: false, migrated: false }
  }

  if (!storage) {
    await seedDefaultCoreData(triggerEngine, macroEngine)
    return { mode: 'seeded-fallback', seededFallback: true, migrated: false }
  }

  const storedTriggers = await storage.load<unknown>(runtimeConfig.storageKeys.triggers)
  const storedMacros = await storage.load<unknown>(runtimeConfig.storageKeys.macros)
  const parsedMacros = parsePersistedMacros(storedMacros)
  const parsedTriggers = parsePersistedTriggers(storedTriggers)
  let hasUsablePersistedState = false
  const migrated = parsedMacros.migrated || parsedTriggers.migrated

  if (parsedMacros.recognized) {
    hasUsablePersistedState = true
    for (const macro of parsedMacros.items) {
      try {
        await macroEngine.registerMacro(macro)
      } catch (error) {
        runtimeLogger.warn('Skipping invalid stored macro', { error, macro })
      }
    }
  }

  if (parsedTriggers.recognized) {
    hasUsablePersistedState = true
    for (const trigger of parsedTriggers.items) {
      try {
        await triggerEngine.registerTrigger(trigger)
      } catch (error) {
        runtimeLogger.warn('Skipping invalid stored trigger', { error, trigger })
      }
    }
  }

  if (hasUsablePersistedState) {
    return { mode: 'loaded', seededFallback: false, migrated }
  }

  await seedDefaultCoreData(triggerEngine, macroEngine)
  return { mode: 'seeded-fallback', seededFallback: true, migrated: false }
}

export const persistCoreData = async (
  triggerEngine: TriggerEngine,
  macroEngine: MacroEngine,
  storage: StoragePort | undefined,
  runtimeConfig: RuntimeConfig,
): Promise<void> => {
  if (!storage) {
    return
  }

  await storage.save(
    runtimeConfig.storageKeys.triggers,
    createPersistedTriggersPayload(
      triggerEngine.getAll().map((trigger) => stripTriggerRecord(trigger)),
    ),
  )
  await storage.save(
    runtimeConfig.storageKeys.macros,
    createPersistedMacrosPayload(
      macroEngine.getAllMacros().map((macro) => stripMacroRecord(macro)),
    ),
  )
}
