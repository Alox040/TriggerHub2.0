import type { DashboardState, EditorState, Macro, PluginsState, SettingsState } from './domain'
import type { ActionRegistryPort } from '../core/trigger-engine'
import type { GraphTrigger, GraphTriggerRecord } from '../core/trigger-engine/triggerGraphTypes'
import type { MacroDefinition, MacroRunOptions } from '../core/macro-system/macroTypes'

/** A handler for a typed event payload. May return a promise. */
export type EventHandler<TPayload = unknown> = (payload: TPayload) => void | Promise<void>

/** Opaque token returned by subscribe(). Pass to unsubscribe() to clean up. */
export type EventSubscription = { readonly id: string; readonly topic: string }

/**
 * Core pub/sub contract.
 *
 * Topics are namespaced strings, e.g. "obs:scene-changed", "spotify:track-changed".
 * Wildcard subscriptions use the namespace prefix followed by ":*",
 * e.g. "obs:*" receives all events whose topic starts with "obs:".
 *
 * @example
 * // Plugin reacting to OBS scene changes:
 * const sub = context.eventBus.subscribe('obs:scene-changed', async (payload) => {
 *   if (payload.sceneName === 'Gaming') await context.macroEngine.runMacro('gaming-macro')
 * })
 * // On deactivate:
 * context.eventBus.unsubscribe(sub)
 */
export interface EventBusPort {
  /** Publish an event. Handlers are awaited sequentially in subscription order. */
  publish<TPayload>(topic: string, payload: TPayload): Promise<void>
  /** Subscribe to a topic or wildcard pattern. Returns a token for cleanup. */
  subscribe<TPayload>(topic: string, handler: EventHandler<TPayload>): EventSubscription
  /** Subscribe once — handler is removed after the first matching event. */
  once<TPayload>(topic: string, handler: EventHandler<TPayload>): EventSubscription
  /** Remove a subscription by token. Safe to call after already removed. */
  unsubscribe(subscription: EventSubscription): void
  /** Remove all subscriptions for a topic. Useful during plugin deactivation. */
  unsubscribeAll(topic: string): void
}

export interface TriggerEnginePort {
  registerTrigger(trigger: GraphTrigger): Promise<void>
  updateTrigger(trigger: GraphTrigger): Promise<void>
  removeTrigger(triggerId: string): Promise<void>
  executeTrigger(triggerId: string): Promise<void>
  getTrigger(triggerId: string): GraphTriggerRecord | undefined
  hasTrigger(triggerId: string): boolean
  getAll(): GraphTriggerRecord[]
  destroy(): void
}

export interface TriggerGraphPort {
  registerTrigger(trigger: GraphTrigger): void
  updateTrigger(trigger: GraphTrigger): void
  removeTrigger(triggerId: string): void
  getTrigger(triggerId: string): GraphTriggerRecord | undefined
  getTriggersByEvent(eventName: string): GraphTriggerRecord[]
  hasTrigger(triggerId: string): boolean
  size(): number
  getAll(): GraphTriggerRecord[]
}

export interface MacroEnginePort {
  registerMacro(macro: Macro): Promise<void>
  updateMacro(macro: Macro): Promise<void>
  removeMacro(macroId: string): boolean
  getMacroById(macroId: string): MacroDefinition | undefined
  getAllMacros(): MacroDefinition[]
  runMacro(macroId: string, options?: MacroRunOptions): Promise<void>
}

export interface AppControllerPort {
  start(): Promise<void>
  stop(): Promise<void>
}

export interface ObsServicePort {
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  switchScene(sceneName: string): Promise<void>
}

export interface SpotifyServicePort {
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  play(): Promise<void>
  pause(): Promise<void>
  nextTrack(): Promise<void>
}

export interface ClipServicePort {
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  startCapture(): Promise<void>
  saveClip(): Promise<string>
}

export interface TwitchServicePort {
  connect(channelName?: string): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  getStreamStatus(): Promise<{
    channelName: string
    isLive: boolean
    title: string | null
    categoryName: string | null
    viewerCount: number
    startedAt: string | null
  }>
}

export interface PluginContext {
  appController: AppControllerPort
  triggerEngine: TriggerEnginePort
  macroEngine: MacroEnginePort
  eventBus: EventBusPort
  actionRegistry: ActionRegistryPort
}

export interface PluginModule {
  id: string
  name: string
  activate(context: PluginContext): Promise<void>
  deactivate(): Promise<void>
}

export interface PluginRegistryPort {
  register(plugin: PluginModule): Promise<void>
  unregister(pluginId: string): Promise<void>
  list(): Promise<PluginModule[]>
}

export interface AppFacadePort {
  getDashboardState(): Promise<DashboardState>
  getEditorState(): Promise<EditorState>
  getPluginsState(): Promise<PluginsState>
  getSettingsState(): Promise<SettingsState>
  listTriggers(): Promise<GraphTrigger[]>
  getTrigger(triggerId: string): Promise<GraphTrigger | undefined>
  executeTrigger(triggerId: string): Promise<void>
  updateTrigger(trigger: GraphTrigger): Promise<void>
  listMacros(): Promise<MacroDefinition[]>
  getMacro(macroId: string): Promise<MacroDefinition | undefined>
  runMacro(macroId: string): Promise<void>
  createTrigger(trigger: GraphTrigger): Promise<void>
  deleteTrigger(triggerId: string): Promise<void>
  createMacro(macro: MacroDefinition): Promise<void>
  updateMacro(macro: MacroDefinition): Promise<void>
  deleteMacro(macroId: string): Promise<void>
  activateRuntime(): Promise<void>
  deactivateRuntime(): Promise<void>
  connectTwitch(channelName?: string): Promise<void>
  disconnectTwitch(): Promise<void>
}
