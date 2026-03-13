import { TriggerGraphError, type GraphTrigger, type GraphTriggerRecord } from './triggerGraphTypes'
import type { TriggerGraphPort } from '../../types'

export class TriggerGraph implements TriggerGraphPort {
  private readonly eventIndex = new Map<string, Map<string, GraphTriggerRecord>>()
  private readonly triggerIndex = new Map<string, string>()

  private assertValidTrigger(trigger: GraphTrigger): void {
    if (!trigger.id.trim()) throw new TriggerGraphError('Trigger id must not be empty')
    if (!trigger.name.trim()) throw new TriggerGraphError('Trigger name must not be empty')
    if (!trigger.event.trim()) throw new TriggerGraphError('Trigger event must not be empty')
  }

  public registerTrigger(trigger: GraphTrigger): void {
    this.assertValidTrigger(trigger)
    if (this.triggerIndex.has(trigger.id)) {
      throw new TriggerGraphError(`Trigger "${trigger.id}" is already registered`)
    }

    const record: GraphTriggerRecord = { ...trigger, createdAt: Date.now() }

    let eventMap = this.eventIndex.get(trigger.event)
    if (!eventMap) {
      eventMap = new Map()
      this.eventIndex.set(trigger.event, eventMap)
    }

    eventMap.set(trigger.id, record)
    this.triggerIndex.set(trigger.id, trigger.event)
  }

  public updateTrigger(trigger: GraphTrigger): void {
    this.assertValidTrigger(trigger)

    const existing = this.getTrigger(trigger.id)
    if (!existing) {
      throw new TriggerGraphError(`Trigger "${trigger.id}" is not registered`)
    }

    const previousEventName = this.triggerIndex.get(trigger.id)
    if (!previousEventName) {
      throw new TriggerGraphError(`Trigger "${trigger.id}" is not registered`)
    }

    if (previousEventName !== trigger.event) {
      const previousEventMap = this.eventIndex.get(previousEventName)
      previousEventMap?.delete(trigger.id)
      if (previousEventMap && previousEventMap.size === 0) {
        this.eventIndex.delete(previousEventName)
      }
    }

    let nextEventMap = this.eventIndex.get(trigger.event)
    if (!nextEventMap) {
      nextEventMap = new Map()
      this.eventIndex.set(trigger.event, nextEventMap)
    }

    nextEventMap.set(trigger.id, {
      ...trigger,
      createdAt: existing.createdAt,
    })
    this.triggerIndex.set(trigger.id, trigger.event)
  }

  public removeTrigger(triggerId: string): void {
    const eventName = this.triggerIndex.get(triggerId)
    if (!eventName) return

    const eventMap = this.eventIndex.get(eventName)
    if (eventMap) {
      eventMap.delete(triggerId)
      if (eventMap.size === 0) this.eventIndex.delete(eventName)
    }

    this.triggerIndex.delete(triggerId)
  }

  public getTrigger(triggerId: string): GraphTriggerRecord | undefined {
    const eventName = this.triggerIndex.get(triggerId)
    if (!eventName) {
      return undefined
    }

    return this.eventIndex.get(eventName)?.get(triggerId)
  }

  public getTriggersByEvent(eventName: string): GraphTriggerRecord[] {
    const eventMap = this.eventIndex.get(eventName)
    return eventMap ? Array.from(eventMap.values()) : []
  }

  public hasTrigger(triggerId: string): boolean {
    return this.triggerIndex.has(triggerId)
  }

  public size(): number {
    return this.triggerIndex.size
  }

  public getAll(): GraphTriggerRecord[] {
    const results: GraphTriggerRecord[] = []
    for (const eventMap of this.eventIndex.values()) {
      results.push(...eventMap.values())
    }
    return results
  }
}
