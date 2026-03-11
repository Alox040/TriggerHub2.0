import type { Trigger } from '../../types'
import type { TriggerCondition } from './triggerConditions'

export interface TriggerAction {
  type: string
  payload?: Record<string, unknown>
}

export interface GraphTrigger extends Trigger {
  event: string
  conditions: TriggerCondition[]
  actions: TriggerAction[]
}

export interface GraphTriggerRecord extends GraphTrigger {
  createdAt: number
}

export class TriggerGraphError extends Error {}
