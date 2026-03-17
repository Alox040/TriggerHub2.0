import type { AppController } from '../core/app-control'
import type { MacroEngine } from '../core/macro-system'
import type { TriggerEngine, ActionRegistryPort } from '../core/trigger-engine'
import type { EventBusPort, ObsServicePort, SpotifyServicePort, ClipServicePort, TwitchServicePort } from '../types'
import { createConsoleLogger } from '../utils/logger'

const runtimeLogger = createConsoleLogger('DesktopRuntime')

type RuntimeServiceState = {
  obs: boolean
  spotify: boolean
  clip: boolean
  twitch: boolean
}

type ActivatablePluginRegistry = {
  activateAll(context: {
    appController: AppController
    triggerEngine: TriggerEngine
    macroEngine: MacroEngine
    eventBus: EventBusPort
    actionRegistry: ActionRegistryPort
  }): Promise<void>
  deactivateAll(): Promise<void>
}

export interface RuntimeActivationDeps {
  appController: AppController
  triggerEngine: TriggerEngine
  macroEngine: MacroEngine
  eventBus: EventBusPort
  actionRegistry: ActionRegistryPort
  pluginRegistry: ActivatablePluginRegistry
  obsService: ObsServicePort
  spotifyService: SpotifyServicePort
  clipService: ClipServicePort
  twitchService: TwitchServicePort
  serviceState: RuntimeServiceState
  isRuntimeStarted: () => boolean
  isRuntimeActivated: () => boolean
  setRuntimeActivated: (value: boolean) => void
}

export const createRuntimeActivation = (deps: RuntimeActivationDeps) => {
  const syncServiceState = (): void => {
    deps.serviceState.obs = deps.obsService.isConnected()
    deps.serviceState.spotify = deps.spotifyService.isConnected()
    deps.serviceState.clip = deps.clipService.isConnected()
    deps.serviceState.twitch = deps.twitchService.isConnected()
  }

  type ServiceName = keyof RuntimeServiceState

  const activateRuntime = async (): Promise<void> => {
    if (deps.isRuntimeActivated()) {
      return
    }

    if (!deps.isRuntimeStarted()) {
      throw new Error('Desktop runtime must be started before activation')
    }

    runtimeLogger.info('Desktop runtime activation requested')

    const failedServices: Array<{ service: ServiceName; error: unknown }> = []

    try {
      await deps.appController.start()
      const connectService = async (service: ServiceName, connectFn: () => Promise<void>): Promise<void> => {
        try {
          await connectFn()
        } catch (error) {
          failedServices.push({ service, error })
          runtimeLogger.warn('Service connection failed, continuing activation', {
            service,
            error,
          })
        }
      }

      await connectService('obs', () => deps.obsService.connect())
      await connectService('spotify', () => deps.spotifyService.connect())
      await connectService('clip', () => deps.clipService.connect())
      await connectService('twitch', () => deps.twitchService.connect())

      await deps.pluginRegistry.activateAll({
        appController: deps.appController,
        triggerEngine: deps.triggerEngine,
        macroEngine: deps.macroEngine,
        eventBus: deps.eventBus,
        actionRegistry: deps.actionRegistry,
      })

      syncServiceState()
      deps.setRuntimeActivated(true)
      if (failedServices.length > 0) {
        runtimeLogger.warn('Some services failed to connect during activation', {
          services: failedServices.map((entry) => entry.service),
        })
      }
      runtimeLogger.info('Desktop runtime activated', {
        services: { ...deps.serviceState },
        failedServices: failedServices.map((entry) => entry.service),
      })
    } catch (error) {
      syncServiceState()
      runtimeLogger.error('Desktop runtime activation failed', {
        error,
        failedServices: failedServices.map((entry) => entry.service),
        services: { ...deps.serviceState },
      })
      throw error
    }
  }

  const deactivateRuntime = async (): Promise<void> => {
    if (!deps.isRuntimeActivated()) {
      return
    }

    runtimeLogger.info('Desktop runtime deactivation requested')

    try {
      await deps.pluginRegistry.deactivateAll()
      await deps.obsService.disconnect()
      await deps.spotifyService.disconnect()
      await deps.clipService.disconnect()
      await deps.twitchService.disconnect()
      await deps.appController.stop()

      syncServiceState()
      deps.setRuntimeActivated(false)

      runtimeLogger.info('Desktop runtime deactivated', {
        services: { ...deps.serviceState },
      })
    } catch (error) {
      runtimeLogger.error('Desktop runtime deactivation failed', {
        error,
        services: { ...deps.serviceState },
      })
      throw error
    }
  }

  return { activateRuntime, deactivateRuntime }
}
