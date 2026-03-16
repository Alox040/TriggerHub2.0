import { AppController, HotkeyManager, WindowManager } from '../core/app-control'
import { InMemoryEventBus } from '../core/event-bus'
import { MacroEngine } from '../core/macro-system'
import { TriggerEngine, TriggerGraph } from '../core/trigger-engine'
import { createPluginRegistryWithDefaults, PluginRegistry } from '../plugins'
import { createClipService, createObsService, createSpotifyService, createTwitchService } from '../services'
import type { StoragePort } from '../storage/storagePort'
import { TriggerHubAppFacade } from './facade'
import { createActionDispatcher } from './actionDispatcher'
import type { AppModuleContainer } from './container'
import { DEFAULT_RUNTIME_CONFIG } from './runtimeConfig'
import { createRuntimeActivation } from './serviceActivation'
import {
  DEFAULT_DESKTOP_PREFERENCES,
  loadDesktopPreferences,
  persistDesktopPreferences,
  RUNTIME_CONFIG_STORAGE_KEY,
  isRuntimeConfig,
  loadOrSeedCoreData,
  persistCoreData,
} from './storageBridge'
import { createConsoleLogger } from '../utils/logger'

const runtimeLogger = createConsoleLogger('DesktopRuntime')

export interface RuntimeContainer extends AppModuleContainer {
  start(): Promise<void>
  stop(): Promise<void>
}

export const createAppModuleContainer = async (storage?: StoragePort): Promise<RuntimeContainer> => {
  const serviceState = {
    obs: false,
    spotify: false,
    clip: false,
    twitch: false,
  }
  let runtimeActivated = false
  let runtimeStarted = false
  let runtimeConfig = DEFAULT_RUNTIME_CONFIG
  let desktopPreferences = DEFAULT_DESKTOP_PREFERENCES

  const eventBus = new InMemoryEventBus()

  const obsService = createObsService()
  const spotifyService = createSpotifyService()
  const clipService = createClipService()
  const twitchService = createTwitchService({ eventBus, defaultChannelName: 'triggerhubchannel' })
  const { executor: actionRegistry, executeMacroStep, setMacroEngine } = createActionDispatcher({
    obsService,
    spotifyService,
    clipService,
    twitchService,
  })

  const macroEngine = new MacroEngine(executeMacroStep, eventBus)
  setMacroEngine(macroEngine)

  const triggerGraph = new TriggerGraph()

  const triggerEngine = new TriggerEngine(
    eventBus,
    triggerGraph,
    actionRegistry.toDispatcher(),
    createConsoleLogger('TriggerEngine'),
  )

  const appController = new AppController(new HotkeyManager(), new WindowManager())
  const pluginRegistry: PluginRegistry = await createPluginRegistryWithDefaults()

  const { activateRuntime, deactivateRuntime } = createRuntimeActivation({
    appController,
    triggerEngine,
    macroEngine,
    eventBus,
    actionRegistry,
    pluginRegistry,
    obsService,
    spotifyService,
    clipService,
    twitchService,
    serviceState,
    isRuntimeStarted: () => runtimeStarted,
    isRuntimeActivated: () => runtimeActivated,
    setRuntimeActivated: (value) => {
      runtimeActivated = value
    },
  })

  const persist = async (): Promise<void> => {
    await persistCoreData(triggerEngine, macroEngine, storage, runtimeConfig)
    await persistDesktopPreferences(storage, desktopPreferences)
  }

  const appFacade = new TriggerHubAppFacade(
    triggerEngine,
    macroEngine,
    serviceState,
    pluginRegistry,
    { persist },
    runtimeConfig,
    {
      activateRuntime: async () => {
        await activateRuntime()
        desktopPreferences = {
          ...desktopPreferences,
          restoreRuntimeOnLaunch: true,
          restoreTwitchConnection: true,
        }
      },
      deactivateRuntime: async () => {
        await deactivateRuntime()
        desktopPreferences = {
          ...desktopPreferences,
          restoreRuntimeOnLaunch: false,
          restoreTwitchConnection: false,
        }
      },
      connectTwitch: async (channelName?: string) => {
        await twitchService.connect(channelName)
        serviceState.twitch = twitchService.isConnected()
        desktopPreferences = {
          ...desktopPreferences,
          restoreTwitchConnection: serviceState.twitch,
        }
      },
      disconnectTwitch: async () => {
        await twitchService.disconnect()
        serviceState.twitch = twitchService.isConnected()
        desktopPreferences = {
          ...desktopPreferences,
          restoreTwitchConnection: false,
        }
      },
    },
  )

  const start = async (): Promise<void> => {
    if (runtimeStarted) {
      return
    }

    runtimeLogger.info('Desktop runtime start requested')
    try {
      const storedRuntimeConfig = await storage?.load<unknown>(RUNTIME_CONFIG_STORAGE_KEY)
      runtimeConfig = isRuntimeConfig(storedRuntimeConfig) ? storedRuntimeConfig : DEFAULT_RUNTIME_CONFIG
      desktopPreferences = await loadDesktopPreferences(storage)

      const coreDataInitialization = await loadOrSeedCoreData(
        triggerEngine,
        macroEngine,
        storage,
        runtimeConfig,
      )
      if ((coreDataInitialization.seededFallback || coreDataInitialization.migrated) && storage) {
        await persist()
      }

      if (desktopPreferences.restoreRuntimeOnLaunch) {
        try {
          await activateRuntime()
        } catch (error) {
          desktopPreferences = DEFAULT_DESKTOP_PREFERENCES
          await persist()
          throw error
        }
      } else if (desktopPreferences.restoreTwitchConnection) {
        try {
          await twitchService.connect()
          serviceState.twitch = twitchService.isConnected()
        } catch (error) {
          desktopPreferences = {
            ...desktopPreferences,
            restoreTwitchConnection: false,
          }
          await persist()
          throw error
        }
      }

      runtimeStarted = true
      runtimeLogger.info('Desktop runtime bootstrapped', {
        services: { ...serviceState },
        desktopPreferences,
      })
    } catch (error) {
      runtimeLogger.error('Desktop runtime start failed', {
        error,
        services: { ...serviceState },
        desktopPreferences,
      })
      throw error
    }
  }

  const stop = async (): Promise<void> => {
    runtimeLogger.info('Desktop runtime stop requested')
    try {
      await deactivateRuntime()
      if (twitchService.isConnected()) {
        await twitchService.disconnect()
        serviceState.twitch = twitchService.isConnected()
      }
      await persist()

      triggerEngine.destroy()
      runtimeStarted = false
      runtimeLogger.info('Desktop runtime stopped', {
        services: { ...serviceState },
        desktopPreferences,
      })
    } catch (error) {
      runtimeLogger.error('Desktop runtime stop failed', {
        error,
        services: { ...serviceState },
        desktopPreferences,
      })
      throw error
    }
  }

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
    start,
    stop,
  }
}
