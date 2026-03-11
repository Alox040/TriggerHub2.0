import type { EventHandler, EventSubscription } from '../../types'

export interface SubscriberRecord<TPayload = unknown> {
  subscription: EventSubscription
  handler: EventHandler<TPayload>
  once: boolean
}

export class EventBusError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'EventBusError'
  }
}
