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
import { DEFAULT_RUNTIME_CONFIG, DEFAULT_TWITCH_CONFIG } from './runtimeConfig'
import { createRuntimeActivation } from './serviceActivation'
import {
  DEFAULT_DESKTOP_PREFERENCES,
  loadDesktopPreferences,
  persistDesktopPreferences,
  loadOrSeedCoreData,
  persistCoreData,
  loadRuntimeConfig,
  persistRuntimeConfig,
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
  const runtimeConfig = await loadRuntimeConfig(storage, DEFAULT_RUNTIME_CONFIG)
  let desktopPreferences = DEFAULT_DESKTOP_PREFERENCES

  const eventBus = new InMemoryEventBus()

  const obsConfig = runtimeConfig.obs
  const shouldUseWebSocketObs =
    !!obsConfig?.host && typeof obsConfig.port === 'number' && obsConfig.port > 0

  const obsService = shouldUseWebSocketObs
    ? createObsService({
        transport: 'websocket',
        websocket: {
          host: obsConfig.host as string,
          port: obsConfig.port as number,
          password: obsConfig.password,
          eventBus,
        },
      })
    : createObsService()
  const spotifyService = createSpotifyService()
  const clipService = createClipService()
  const normalizedTwitchConfig = {
    ...DEFAULT_TWITCH_CONFIG,
    ...(runtimeConfig.twitch ?? {}),
  }
  const trimmedClientId = normalizedTwitchConfig.clientId?.trim()
  const trimmedAccessToken = normalizedTwitchConfig.accessToken?.trim()
  const useHttpTwitch = Boolean(trimmedClientId && trimmedAccessToken)
  const twitchService = createTwitchService({
    eventBus,
    transport: useHttpTwitch ? 'http' : undefined,
    http: useHttpTwitch
      ? {
          baseUrl: normalizedTwitchConfig.baseUrl ?? DEFAULT_TWITCH_CONFIG.baseUrl,
          headers: {
            Authorization: `Bearer ${trimmedAccessToken}`,
            'Client-ID': trimmedClientId,
          },
        }
      : undefined,
    defaultChannelName: 'triggerhubchannel',
  })
  let executeMacroStep!: ReturnType<typeof createActionDispatcher>['executeMacroStep']
  const macroEngine = new MacroEngine((step, ctx) => executeMacroStep(step, ctx), eventBus)
  const { executor: actionRegistry, executeMacroStep: actionDispatcherExecuteMacroStep } = createActionDispatcher({
    obsService,
    spotifyService,
    clipService,
    twitchService,
  }, macroEngine)
  executeMacroStep = actionDispatcherExecuteMacroStep

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
    await persistRuntimeConfig(storage, runtimeConfig)
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

      runtimeStarted = true

      if (desktopPreferences.restoreRuntimeOnLaunch) {
        try {
          await activateRuntime()
        } catch (error) {
          runtimeStarted = false
          desktopPreferences = DEFAULT_DESKTOP_PREFERENCES
          await persist()
          throw error
        }
      } else if (desktopPreferences.restoreTwitchConnection) {
        try {
          await twitchService.connect()
          serviceState.twitch = twitchService.isConnected()
        } catch (error) {
          runtimeStarted = false
          desktopPreferences = {
            ...desktopPreferences,
            restoreTwitchConnection: false,
          }
          await persist()
          throw error
        }
      }

      runtimeLogger.info('Desktop runtime bootstrapped', {
        services: { ...serviceState },
        desktopPreferences,
      })
    } catch (error) {
      runtimeStarted = false
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
