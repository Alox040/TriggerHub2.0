import type { EventBusPort, EventHandler, EventSubscription } from '../../types'
import type { SubscriberRecord } from './eventBusTypes'

/**
 * In-process, in-memory EventBus implementation.
 *
 * Not thread-safe. Suitable for single-process desktop use.
 * Handlers are awaited sequentially in subscription order.
 * Errors thrown by handlers propagate out of publish() — handlers should catch their own errors.
 */
export class InMemoryEventBus implements EventBusPort {
  private readonly subscribers = new Map<string, SubscriberRecord[]>()
  private nextId = 0

  public subscribe<TPayload>(topic: string, handler: EventHandler<TPayload>): EventSubscription {
    return this.addRecord(topic, handler, false)
  }

  public once<TPayload>(topic: string, handler: EventHandler<TPayload>): EventSubscription {
    return this.addRecord(topic, handler, true)
  }

  public async publish<TPayload>(topic: string, payload: TPayload): Promise<void> {
    const matching = this.collectMatchingRecords(topic)
    for (const record of matching) {
      if (record.once) {
        this.removeById(record.subscription.id, record.subscription.topic)
      }
      await (record.handler as EventHandler<TPayload>)(payload)
    }
  }

  public unsubscribe(subscription: EventSubscription): void {
    this.removeById(subscription.id, subscription.topic)
  }

  public unsubscribeAll(topic: string): void {
    this.subscribers.delete(topic)
  }

  private addRecord<TPayload>(
    topic: string,
    handler: EventHandler<TPayload>,
    once: boolean,
  ): EventSubscription {
    const subscription: EventSubscription = { id: String(this.nextId++), topic }
    const record: SubscriberRecord<TPayload> = { subscription, handler, once }
    const list = this.subscribers.get(topic)
    if (list) {
      list.push(record as SubscriberRecord)
    } else {
      this.subscribers.set(topic, [record as SubscriberRecord])
    }
    return subscription
  }

  private collectMatchingRecords(publishedTopic: string): SubscriberRecord[] {
    const results: SubscriberRecord[] = []
    for (const [subscribedTopic, list] of this.subscribers) {
      if (subscribedTopic === publishedTopic || this.matchesWildcard(subscribedTopic, publishedTopic)) {
        // Snapshot the list so once-removal during iteration is safe
        results.push(...list)
      }
    }
    return results
  }

  private removeById(id: string, topic: string): void {
    const list = this.subscribers.get(topic)
    if (!list) return
    const idx = list.findIndex((r) => r.subscription.id === id)
    if (idx !== -1) {
      list.splice(idx, 1)
    }
    if (list.length === 0) {
      this.subscribers.delete(topic)
    }
  }

  /** "obs:*" matches any published topic starting with "obs:" */
  private matchesWildcard(subscribedTopic: string, publishedTopic: string): boolean {
    if (!subscribedTopic.endsWith(':*')) return false
    const prefix = subscribedTopic.slice(0, -1) // "obs:*" → "obs:"
    return publishedTopic.startsWith(prefix)
  }
}
