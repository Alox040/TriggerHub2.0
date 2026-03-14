import { AppController, HotkeyManager, WindowManager } from '../core/app-control'
import { InMemoryEventBus } from '../core/event-bus'
import { MacroEngine } from '../core/macro-system'
import type { MacroExecutionContext, MacroStep } from '../core/macro-system'
import {
  TriggerEngine,
  TriggerExecutor,
  TriggerExecutorError,
  TriggerGraph,
} from '../core/trigger-engine'
import type { Macro } from '../types'
import { EventTopics } from '../types'
import type { AppModuleContainer } from './container'
import { createClipService, createObsService, createSpotifyService, createTwitchService } from '../services'
import { createPluginRegistryWithDefaults, PluginRegistry } from '../plugins'
import { TriggerHubAppFacade } from './facade'
import { createConsoleLogger } from '../utils/logger'
import type { StoragePort } from '../storage/storagePort'
import { DEFAULT_RUNTIME_CONFIG, type RuntimeConfig } from './runtimeConfig'
import { stripMacroRecord, stripTriggerRecord } from './storageHelpers'
import type { GraphTrigger } from '../core/trigger-engine/triggerGraphTypes'
import {
  createPersistedMacrosPayload,
  createPersistedTriggersPayload,
  parsePersistedMacros,
  parsePersistedTriggers,
} from './storageValidation'

const runtimeLogger = createConsoleLogger('DesktopRuntime')
const RUNTIME_CONFIG_STORAGE_KEY = 'runtime-config'

const seedDefaultCoreData = async (
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

export interface RuntimeContainer extends AppModuleContainer {
  start(): Promise<void>
  stop(): Promise<void>
}

const isRuntimeConfig = (value: unknown): value is RuntimeConfig => {
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

const loadOrSeedCoreData = async (
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

const persistCoreData = async (
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

export const createAppModuleContainer = async (storage?: StoragePort): Promise<RuntimeContainer> => {
  const serviceState = {
    obs: false,
    spotify: false,
    clip: false,
  }
  let runtimeActivated = false
  let runtimeStarted = false
  let runtimeConfig = DEFAULT_RUNTIME_CONFIG

  const eventBus = new InMemoryEventBus()

  const obsService = createObsService()
  const spotifyService = createSpotifyService()
  const clipService = createClipService()
  const twitchService = createTwitchService({ eventBus })
  const executor = new TriggerExecutor()

  let macroEngine!: MacroEngine
  const executeMacroStep = async (step: MacroStep, ctx: MacroExecutionContext): Promise<void> => {
    switch (step.type) {
      case 'delay':
        await new Promise((resolve) => {
          setTimeout(resolve, step.durationMs)
        })
        break
      case 'service_call':
        await executor.execute(
          {
            type: `${step.service}.${step.action}`,
            payload: step.params,
          },
          {},
        )
        break
      case 'plugin_action':
        await executor.execute(
          {
            type: `${step.plugin}.${step.action}`,
            payload: step.params,
          },
          {},
        )
        break
      case 'macro_call': {
        const mergedOptions = {
          ...(step.options ?? {}),
          variables: {
            ...ctx.variables,
            ...(step.options?.variables ?? {}),
          },
        }
        await macroEngine.runMacroWithResult(
          step.macroId,
          mergedOptions,
          ctx.depth + 1,
          ctx.triggerPayload,
        )
        break
      }
      case 'conditional': {
        const variableValue = ctx.variables[step.condition.variable]
        const conditionResult = (() => {
          switch (step.condition.operator) {
            case 'equals':
              return variableValue === step.condition.value
            case 'not_equals':
              return variableValue !== step.condition.value
            case 'greater_than':
              return (
                typeof variableValue === 'number' &&
                typeof step.condition.value === 'number' &&
                variableValue > step.condition.value
              )
            case 'less_than':
              return (
                typeof variableValue === 'number' &&
                typeof step.condition.value === 'number' &&
                variableValue < step.condition.value
              )
            case 'contains':
              return Array.isArray(variableValue)
                ? variableValue.includes(step.condition.value)
                : typeof variableValue === 'string' && typeof step.condition.value === 'string'
                  ? variableValue.includes(step.condition.value)
                  : false
            case 'exists':
              return variableValue !== undefined
          }
        })()

        const selectedSteps = conditionResult ? step.then : (step.else ?? [])
        for (const nestedStep of selectedSteps) {
          await executeMacroStep(nestedStep, ctx)
        }
        break
      }
      case 'parallel':
        await Promise.all(step.steps.map((nestedStep) => executeMacroStep(nestedStep, ctx)))
        break
      case 'sequence':
        for (const nestedStep of step.steps) {
          await executeMacroStep(nestedStep, ctx)
        }
        break
    }
  }
  macroEngine = new MacroEngine(executeMacroStep, eventBus)

  executor.register('obs.switchScene', async (action) => {
    const sceneName = action.payload?.sceneName
    if (typeof sceneName !== 'string' || sceneName.length === 0) {
      throw new Error('obs.switchScene requires payload.sceneName')
    }

    await obsService.switchScene(sceneName)
  })

  executor.register('spotify.play', async () => {
    await spotifyService.play()
  })

  executor.register('spotify.pause', async () => {
    await spotifyService.pause()
  })

  executor.register('spotify.nextTrack', async () => {
    await spotifyService.nextTrack()
  })

  executor.register('clip.startCapture', async () => {
    await clipService.startCapture()
  })

  executor.register('clip.saveClip', async () => {
    await clipService.saveClip()
  })

  executor.register('macro.run', async (action) => {
    const macroId = action.payload?.macroId
    if (typeof macroId !== 'string' || macroId.length === 0) {
      throw new Error('macro.run requires payload.macroId')
    }

    await macroEngine.runMacro(macroId)
  })

  executor.register('macro', async (action) => {
    const name = action.payload?.name
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('macro requires payload.name')
    }

    const foundMacro = macroEngine.getAllMacros().find((macro) => macro.name === name)
    if (!foundMacro) {
      throw new TriggerExecutorError(`Macro not found by name: "${name}"`)
    }

    await macroEngine.runMacro(foundMacro.id)
  })

  const triggerGraph = new TriggerGraph()

  const triggerEngine = new TriggerEngine(
    eventBus,
    triggerGraph,
    executor.toDispatcher(),
    createConsoleLogger('TriggerEngine'),
  )

  const appController = new AppController(new HotkeyManager(), new WindowManager())
  const pluginRegistry: PluginRegistry = await createPluginRegistryWithDefaults()

  const activateRuntime = async (): Promise<void> => {
    if (runtimeActivated) {
      return
    }

    if (!runtimeStarted) {
      throw new Error('Desktop runtime must be started before activation')
    }

    runtimeLogger.info('Desktop runtime activation requested')

    try {
      await appController.start()
      await obsService.connect()
      serviceState.obs = true

      await spotifyService.play()
      serviceState.spotify = true

      await clipService.startCapture()
      serviceState.clip = true

      await pluginRegistry.activateAll({
        appController,
        triggerEngine,
        macroEngine,
        eventBus,
        actionRegistry: executor,
      })

      runtimeActivated = true
      runtimeLogger.info('Desktop runtime activated', {
        services: { ...serviceState },
      })
    } catch (error) {
      runtimeLogger.error('Desktop runtime activation failed', {
        error,
        services: { ...serviceState },
      })
      throw error
    }
  }

  const deactivateRuntime = async (): Promise<void> => {
    if (!runtimeActivated) {
      return
    }

    runtimeLogger.info('Desktop runtime deactivation requested')

    try {
      await pluginRegistry.deactivateAll()
      await obsService.disconnect()
      await spotifyService.pause()
      await twitchService.disconnect()
      await appController.stop()

      serviceState.obs = false
      serviceState.spotify = false
      serviceState.clip = false
      runtimeActivated = false

      runtimeLogger.info('Desktop runtime deactivated', {
        services: { ...serviceState },
      })
    } catch (error) {
      runtimeLogger.error('Desktop runtime deactivation failed', {
        error,
        services: { ...serviceState },
      })
      throw error
    }
  }

  const appFacade = new TriggerHubAppFacade(
    triggerEngine,
    macroEngine,
    serviceState,
    pluginRegistry,
    {
      persist: async () => {
        await persistCoreData(triggerEngine, macroEngine, storage, runtimeConfig)
      },
    },
    runtimeConfig,
    {
      activateRuntime,
      deactivateRuntime,
    },
  )

  return {
    appController,
    triggerEngine,
    macroEngine,
    obsService,
    spotifyService,
    clipService,
    twitchService,
    pluginRegistry,
    appFacade,
    eventBus,
    start: async () => {
      if (runtimeStarted) {
        return
      }

      runtimeLogger.info('Desktop runtime start requested')
      try {
        const storedRuntimeConfig = await storage?.load<unknown>(RUNTIME_CONFIG_STORAGE_KEY)
        runtimeConfig = isRuntimeConfig(storedRuntimeConfig) ? storedRuntimeConfig : DEFAULT_RUNTIME_CONFIG

        const coreDataInitialization = await loadOrSeedCoreData(
          triggerEngine,
          macroEngine,
          storage,
          runtimeConfig,
        )
        if ((coreDataInitialization.seededFallback || coreDataInitialization.migrated) && storage) {
          await persistCoreData(triggerEngine, macroEngine, storage, runtimeConfig)
        }
        runtimeStarted = true
        runtimeLogger.info('Desktop runtime bootstrapped', {
          services: { ...serviceState },
        })
      } catch (error) {
        runtimeLogger.error('Desktop runtime start failed', {
          error,
          services: { ...serviceState },
        })
        throw error
      }
    },
    stop: async () => {
      runtimeLogger.info('Desktop runtime stop requested')
      try {
        await deactivateRuntime()
        await persistCoreData(triggerEngine, macroEngine, storage, runtimeConfig)

        triggerEngine.destroy()
        runtimeStarted = false
        runtimeLogger.info('Desktop runtime stopped', {
          services: { ...serviceState },
        })
      } catch (error) {
        runtimeLogger.error('Desktop runtime stop failed', {
          error,
          services: { ...serviceState },
        })
        throw error
      }
    },
  }
}
