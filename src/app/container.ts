import type {
  AppControllerPort,
  AppFacadePort,
  ClipServicePort,
  EventBusPort,
  MacroEnginePort,
  ObsServicePort,
  PluginRegistryPort,
  SpotifyServicePort,
  TriggerEnginePort,
} from '../types'

export interface AppModuleContainer {
  appController: AppControllerPort
  triggerEngine: TriggerEnginePort
  macroEngine: MacroEnginePort
  obsService: ObsServicePort
  spotifyService: SpotifyServicePort
  clipService: ClipServicePort
  pluginRegistry: PluginRegistryPort
  appFacade: AppFacadePort
  eventBus: EventBusPort
}

export interface AppRuntimeLifecycle {
  start(): Promise<void>
  stop(): Promise<void>
}
