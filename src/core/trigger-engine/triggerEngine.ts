import type { EventBusPort, EventSubscription, TriggerEnginePort, TriggerGraphPort } from '../../types'
import { EventTopics } from '../../types'
import { createNoopLogger, type Logger } from '../../utils/logger'
import { evaluateCondition, type TriggerPayload } from './triggerConditions'
import type { GraphTriggerRecord, GraphTrigger } from './triggerGraphTypes'
import { type ActionDispatcher, TriggerEngineError, type TriggerExecutionResult } from './triggerTypes'

export class TriggerEngine implements TriggerEnginePort {
  private readonly eventSubscriptions = new Map<string, EventSubscription>()
  private readonly triggerEventIndex = new Map<string, string>()

  public constructor(
    private readonly eventBus: EventBusPort,
    private readonly graph: TriggerGraphPort,
    private readonly dispatch: ActionDispatcher,
    private readonly logger: Logger = createNoopLogger(),
  ) {}

  public async registerTrigger(trigger: GraphTrigger): Promise<void> {
    if (!trigger.id.trim()) {
      throw new TriggerEngineError('Trigger id must not be empty')
    }

    if (!trigger.name.trim()) {
      throw new TriggerEngineError('Trigger name must not be empty')
    }

    if (!trigger.event.trim()) {
      throw new TriggerEngineError('Trigger event must not be empty')
    }

    if (this.graph.hasTrigger(trigger.id)) {
      throw new TriggerEngineError(`Trigger "${trigger.id}" is already registered`)
    }

    this.graph.registerTrigger(trigger)
    this.triggerEventIndex.set(trigger.id, trigger.event)

    if (!this.eventSubscriptions.has(trigger.event)) {
      const eventName = trigger.event
      const subscription = this.eventBus.subscribe<TriggerPayload>(eventName, async (payload) => {
        await this.handleEvent(eventName, payload)
      })
      this.eventSubscriptions.set(eventName, subscription)
    }

    this.logger.debug('Registered trigger', {
      triggerId: trigger.id,
      event: trigger.event,
    })
  }

  public async removeTrigger(triggerId: string): Promise<void> {
    if (!this.graph.hasTrigger(triggerId)) {
      this.logger.warn('Attempted to remove unknown trigger', { triggerId })
      return
    }

    const eventName = this.triggerEventIndex.get(triggerId)
    this.graph.removeTrigger(triggerId)
    this.triggerEventIndex.delete(triggerId)

    if (eventName && this.graph.getTriggersByEvent(eventName).length === 0) {
      const subscription = this.eventSubscriptions.get(eventName)
      if (subscription) {
        this.eventBus.unsubscribe(subscription)
      }
      this.eventSubscriptions.delete(eventName)
    }
  }

  public async executeTrigger(triggerId: string): Promise<void> {
    const trigger = this.graph.getAll().find((candidate) => candidate.id === triggerId)
    if (!trigger) {
      throw new TriggerEngineError(`Trigger "${triggerId}" is not registered`)
    }

    if (!trigger.enabled) {
      this.logger.warn('Skipping manual execution of disabled trigger', { triggerId })
      return
    }

    const result = await this.executeSingleTrigger(trigger, {})
    await this.eventBus.publish(EventTopics.TRIGGER_EXECUTED, {
      triggerId: result.triggerId,
      firedAt: result.firedAt,
    })
  }

  public hasTrigger(triggerId: string): boolean {
    return this.graph.hasTrigger(triggerId)
  }

  public getAll(): GraphTriggerRecord[] {
    return this.graph.getAll()
  }

  public destroy(): void {
    for (const subscription of this.eventSubscriptions.values()) {
      this.eventBus.unsubscribe(subscription)
    }
    this.eventSubscriptions.clear()
    this.triggerEventIndex.clear()
  }

  private async handleEvent(eventName: string, payload: TriggerPayload): Promise<void> {
    const triggers = this.graph.getTriggersByEvent(eventName)

    for (const trigger of triggers) {
      if (!trigger.enabled) {
        continue
      }

      const shouldFire =
        trigger.conditions.length === 0 ||
        trigger.conditions.every((condition) => evaluateCondition(condition, payload))

      if (!shouldFire) {
        this.logger.debug('Skipping trigger due to failing conditions', {
          triggerId: trigger.id,
          event: eventName,
        })
        continue
      }

      this.logger.info('Firing trigger', {
        triggerId: trigger.id,
        event: eventName,
      })

      const result = await this.executeSingleTrigger(trigger, payload)
      await this.eventBus.publish(EventTopics.TRIGGER_EXECUTED, {
        triggerId: result.triggerId,
        firedAt: result.firedAt,
      })
    }
  }

  private async executeSingleTrigger(
    trigger: GraphTriggerRecord,
    payload: TriggerPayload,
  ): Promise<TriggerExecutionResult> {
    const actionErrors: Array<{ actionType: string; error: unknown }> = []

    for (const action of trigger.actions) {
      try {
        await this.dispatch(action, payload)
      } catch (error) {
        this.logger.error('Trigger action dispatch failed', {
          triggerId: trigger.id,
          actionType: action.type,
          error,
        })
        actionErrors.push({
          actionType: action.type,
          error,
        })
      }
    }

    return {
      triggerId: trigger.id,
      firedAt: Date.now(),
      actionsAttempted: trigger.actions.length,
      actionErrors,
    }
  }
}
