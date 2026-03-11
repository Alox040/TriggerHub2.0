import type { TriggerPayload } from './triggerConditions'
import type { TriggerAction } from './triggerGraphTypes'

export class TriggerEngineError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'TriggerEngineError'
  }
}

export type ActionDispatcher = (
  action: TriggerAction,
  eventPayload: TriggerPayload,
) => Promise<void>

export interface TriggerExecutionResult {
  triggerId: string
  firedAt: number
  actionsAttempted: number
  actionErrors: Array<{ actionType: string; error: unknown }>
}
