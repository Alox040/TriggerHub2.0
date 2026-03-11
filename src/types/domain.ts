import type {
  MacroDefinition as CoreMacroDefinition,
  MacroStep as CoreMacroStep,
} from '../core/macro-system/macroTypes'

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
  }
  activeTriggers: Trigger[]
  activeMacros: Macro[]
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
