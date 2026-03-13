import type {
  AppControllerPort,
  AppFacadePort,
  ClipServicePort,
  EventBusPort,
  MacroEnginePort,
  ObsServicePort,
  PluginRegistryPort,
  SpotifyServicePort,
  TwitchServicePort,
  TriggerEnginePort,
} from '../types'

export interface AppModuleContainer {
  appController: AppControllerPort
  triggerEngine: TriggerEnginePort
  macroEngine: MacroEnginePort
  obsService: ObsServicePort
  spotifyService: SpotifyServicePort
  clipService: ClipServicePort
  twitchService: TwitchServicePort
  pluginRegistry: PluginRegistryPort
  appFacade: AppFacadePort
  eventBus: EventBusPort
}

export interface AppRuntimeLifecycle {
  start(): Promise<void>
  stop(): Promise<void>
}
