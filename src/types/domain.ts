import type {
  MacroDefinition as CoreMacroDefinition,
  MacroStep as CoreMacroStep,
} from '../core/macro-system/macroTypes'
import type { GraphTrigger } from '../core/trigger-engine/triggerGraphTypes'

export interface Trigger {
  id: string
  name: string
  enabled: boolean
}

export type MacroStep = CoreMacroStep
export type Macro = CoreMacroDefinition

export interface DashboardState {
  connectedServices: {
    obs: boolean
    spotify: boolean
    clip: boolean
    twitch: boolean
  }
  activeTriggers: Trigger[]
  activeMacros: Macro[]
}

export interface EditorState {
  triggers: GraphTrigger[]
  macros: Macro[]
}

export interface PluginSummary {
  id: string
  name: string
}

export interface PluginsState {
  plugins: PluginSummary[]
}

export interface SettingsState {
  connectedServices: {
    obs: boolean
    spotify: boolean
    clip: boolean
    twitch: boolean
  }
  triggerCount: number
  macroCount: number
}

/** Well-known event topic strings. Use as constants in publish/subscribe calls. */
export const EventTopics = {
  OBS_SCENE_CHANGED: 'obs:scene-changed',
  OBS_CONNECTED: 'obs:connected',
  OBS_DISCONNECTED: 'obs:disconnected',
  SPOTIFY_TRACK_CHANGED: 'spotify:track-changed',
  SPOTIFY_PLAYBACK_STARTED: 'spotify:playback-started',
  SPOTIFY_PLAYBACK_PAUSED: 'spotify:playback-paused',
  TRIGGER_EXECUTED: 'trigger:executed',
  MACRO_COMPLETED: 'macro:completed',
} as const

export type EventTopic = (typeof EventTopics)[keyof typeof EventTopics]

export interface ObsSceneChangedPayload {
  sceneName: string
}

export interface TriggerExecutedPayload {
  triggerId: string
  firedAt: number
}

export interface MacroCompletedPayload {
  macroId: string
  stepCount: number
  executedAt: number
}
