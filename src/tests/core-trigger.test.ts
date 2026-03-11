import { describe, expect, it } from 'vitest'
import { InMemoryEventBus } from '../core/event-bus'
import { TriggerEngine, TriggerGraph, type ActionDispatcher, type GraphTrigger } from '../core/trigger-engine'
import { createNoopLogger } from '../utils/logger'
import { EventTopics, type EventBusPort, type EventSubscription } from '../types'

class InstrumentedEventBus implements EventBusPort {
  private readonly activeByTopic = new Map<string, Set<string>>()
  private readonly inner = new InMemoryEventBus()

  public subscribeCallsByTopic = new Map<string, number>()
  public unsubscribeCallsByTopic = new Map<string, number>()

  public async publish<TPayload>(topic: string, payload: TPayload): Promise<void> {
    await this.inner.publish(topic, payload)
  }

  public subscribe<TPayload>(
    topic: string,
    handler: (payload: TPayload) => void | Promise<void>,
  ): EventSubscription {
    const subscription = this.inner.subscribe(topic, handler)
    this.subscribeCallsByTopic.set(topic, (this.subscribeCallsByTopic.get(topic) ?? 0) + 1)

    let set = this.activeByTopic.get(topic)
    if (!set) {
      set = new Set<string>()
      this.activeByTopic.set(topic, set)
    }
    set.add(subscription.id)

    return subscription
  }

  public once<TPayload>(
    topic: string,
    handler: (payload: TPayload) => void | Promise<void>,
  ): EventSubscription {
    const subscription = this.inner.once(topic, handler)

    let set = this.activeByTopic.get(topic)
    if (!set) {
      set = new Set<string>()
      this.activeByTopic.set(topic, set)
    }
    set.add(subscription.id)

    return subscription
  }

  public unsubscribe(subscription: EventSubscription): void {
    this.inner.unsubscribe(subscription)
    this.unsubscribeCallsByTopic.set(
      subscription.topic,
      (this.unsubscribeCallsByTopic.get(subscription.topic) ?? 0) + 1,
    )

    const set = this.activeByTopic.get(subscription.topic)
    if (!set) return
    set.delete(subscription.id)
    if (set.size === 0) {
      this.activeByTopic.delete(subscription.topic)
    }
  }

  public unsubscribeAll(topic: string): void {
    this.inner.unsubscribeAll(topic)
    this.activeByTopic.delete(topic)
  }

  public getActiveCountForTopic(topic: string): number {
    return this.activeByTopic.get(topic)?.size ?? 0
  }
}

const createTrigger = (overrides: Partial<GraphTrigger> = {}): GraphTrigger => ({
  id: 'trigger-1',
  name: 'Trigger 1',
  enabled: true,
  event: 'obs:scene-changed',
  conditions: [],
  actions: [{ type: 'action.one' }],
  ...overrides,
})

describe('TriggerEngine', () => {
  describe('validation', () => {
    it('throws for empty id', async () => {
      const engine = new TriggerEngine(
        new InMemoryEventBus(),
        new TriggerGraph(),
        async () => undefined,
        createNoopLogger(),
      )

      await expect(engine.registerTrigger(createTrigger({ id: '' }))).rejects.toThrow(
        'must not be empty',
      )
    })

    it('throws for empty name', async () => {
      const engine = new TriggerEngine(
        new InMemoryEventBus(),
        new TriggerGraph(),
        async () => undefined,
        createNoopLogger(),
      )

      await expect(engine.registerTrigger(createTrigger({ name: ' ' }))).rejects.toThrow(
        'must not be empty',
      )
    })

    it('throws for empty event', async () => {
      const engine = new TriggerEngine(
        new InMemoryEventBus(),
        new TriggerGraph(),
        async () => undefined,
        createNoopLogger(),
      )

      await expect(engine.registerTrigger(createTrigger({ event: '' }))).rejects.toThrow(
        'must not be empty',
      )
    })

    it('throws for duplicate id', async () => {
      const engine = new TriggerEngine(
        new InMemoryEventBus(),
        new TriggerGraph(),
        async () => undefined,
        createNoopLogger(),
      )

      await engine.registerTrigger(createTrigger({ id: 'dup-trigger' }))
      await expect(engine.registerTrigger(createTrigger({ id: 'dup-trigger' }))).rejects.toThrow(
        'already registered',
      )
    })
  })

  describe('subscription lifecycle', () => {
    it('creates one subscription for first trigger on topic', async () => {
      const eventBus = new InstrumentedEventBus()
      const engine = new TriggerEngine(eventBus, new TriggerGraph(), async () => undefined, createNoopLogger())

      await engine.registerTrigger(createTrigger({ event: 'obs:connected' }))

      expect(eventBus.subscribeCallsByTopic.get('obs:connected')).toBe(1)
      expect(eventBus.getActiveCountForTopic('obs:connected')).toBe(1)
    })

    it('does not create extra subscription for second trigger on same topic', async () => {
      const eventBus = new InstrumentedEventBus()
      const engine = new TriggerEngine(eventBus, new TriggerGraph(), async () => undefined, createNoopLogger())

      await engine.registerTrigger(createTrigger({ id: 't1', event: 'obs:connected' }))
      await engine.registerTrigger(createTrigger({ id: 't2', event: 'obs:connected' }))

      expect(eventBus.subscribeCallsByTopic.get('obs:connected')).toBe(1)
      expect(eventBus.getActiveCountForTopic('obs:connected')).toBe(1)
    })

    it('publishing event invokes actions for matching triggers', async () => {
      const calls: string[] = []
      const dispatch: ActionDispatcher = async (action) => {
        calls.push(String(action.type))
      }

      const eventBus = new InMemoryEventBus()
      const engine = new TriggerEngine(eventBus, new TriggerGraph(), dispatch, createNoopLogger())

      await engine.registerTrigger(createTrigger({ id: 't1', event: 'obs:scene-changed' }))
      await engine.registerTrigger(createTrigger({ id: 't2', event: 'obs:scene-changed' }))
      await engine.registerTrigger(createTrigger({ id: 't3', event: 'spotify:track-changed' }))

      await eventBus.publish('obs:scene-changed', { sceneName: 'Main' })

      expect(calls).toEqual(['action.one', 'action.one'])
    })

    it('removing one of multiple triggers keeps subscription alive', async () => {
      const calls: string[] = []
      const dispatch: ActionDispatcher = async (action) => {
        calls.push(String(action.type))
      }
      const eventBus = new InstrumentedEventBus()
      const engine = new TriggerEngine(eventBus, new TriggerGraph(), dispatch, createNoopLogger())

      await engine.registerTrigger(createTrigger({ id: 't1', event: 'obs:connected' }))
      await engine.registerTrigger(createTrigger({ id: 't2', event: 'obs:connected' }))
      await engine.removeTrigger('t1')
      await eventBus.publish('obs:connected', {})

      expect(eventBus.getActiveCountForTopic('obs:connected')).toBe(1)
      expect(calls).toEqual(['action.one'])
    })

    it('removing last trigger unsubscribes topic', async () => {
      const eventBus = new InstrumentedEventBus()
      const engine = new TriggerEngine(eventBus, new TriggerGraph(), async () => undefined, createNoopLogger())

      await engine.registerTrigger(createTrigger({ id: 't1', event: 'obs:connected' }))
      await engine.removeTrigger('t1')

      expect(eventBus.getActiveCountForTopic('obs:connected')).toBe(0)
      expect(eventBus.unsubscribeCallsByTopic.get('obs:connected')).toBe(1)
    })
  })

  describe('condition evaluation', () => {
    it('fires when no conditions', async () => {
      const calls: string[] = []
      const eventBus = new InMemoryEventBus()
      const engine = new TriggerEngine(
        eventBus,
        new TriggerGraph(),
        async (action) => {
          calls.push(String(action.type))
        },
        createNoopLogger(),
      )

      await engine.registerTrigger(createTrigger({ conditions: [] }))
      await eventBus.publish('obs:scene-changed', {})

      expect(calls).toEqual(['action.one'])
    })

    it('fires when all conditions pass', async () => {
      const calls: string[] = []
      const eventBus = new InMemoryEventBus()
      const engine = new TriggerEngine(
        eventBus,
        new TriggerGraph(),
        async (action) => {
          calls.push(String(action.type))
        },
        createNoopLogger(),
      )

      await engine.registerTrigger(
        createTrigger({
          conditions: [
            { field: 'scene', operator: 'equals', value: 'Main' },
            { field: 'viewers', operator: 'greater_than', value: 10 },
          ],
        }),
      )

      await eventBus.publish('obs:scene-changed', { scene: 'Main', viewers: 11 })
      expect(calls).toEqual(['action.one'])
    })

    it('skips when any condition fails', async () => {
      const calls: string[] = []
      const eventBus = new InMemoryEventBus()
      const engine = new TriggerEngine(
        eventBus,
        new TriggerGraph(),
        async (action) => {
          calls.push(String(action.type))
        },
        createNoopLogger(),
      )

      await engine.registerTrigger(
        createTrigger({
          conditions: [
            { field: 'scene', operator: 'equals', value: 'Main' },
            { field: 'viewers', operator: 'greater_than', value: 10 },
          ],
        }),
      )

      await eventBus.publish('obs:scene-changed', { scene: 'Main', viewers: 5 })
      expect(calls).toEqual([])
    })

    it('skips disabled triggers', async () => {
      const calls: string[] = []
      const eventBus = new InMemoryEventBus()
      const engine = new TriggerEngine(
        eventBus,
        new TriggerGraph(),
        async (action) => {
          calls.push(String(action.type))
        },
        createNoopLogger(),
      )

      await engine.registerTrigger(createTrigger({ enabled: false }))
      await eventBus.publish('obs:scene-changed', {})

      expect(calls).toEqual([])
    })
  })

  describe('action error isolation', () => {
    it('continues to later actions in the same trigger after one fails', async () => {
      const calls: string[] = []
      const eventBus = new InMemoryEventBus()
      const engine = new TriggerEngine(
        eventBus,
        new TriggerGraph(),
        async (action) => {
          calls.push(String(action.type))
          if (action.type === 'action.fail') {
            throw new Error('boom')
          }
        },
        createNoopLogger(),
      )

      await engine.registerTrigger(
        createTrigger({
          actions: [{ type: 'action.one' }, { type: 'action.fail' }, { type: 'action.three' }],
        }),
      )
      await eventBus.publish('obs:scene-changed', {})

      expect(calls).toEqual(['action.one', 'action.fail', 'action.three'])
    })

    it('does not block other triggers on same event when one trigger action fails', async () => {
      const calls: string[] = []
      const eventBus = new InMemoryEventBus()
      const engine = new TriggerEngine(
        eventBus,
        new TriggerGraph(),
        async (action) => {
          calls.push(String(action.type))
          if (action.type === 'action.fail') {
            throw new Error('fail-first-trigger')
          }
        },
        createNoopLogger(),
      )

      await engine.registerTrigger(createTrigger({ id: 't1', actions: [{ type: 'action.fail' }] }))
      await engine.registerTrigger(createTrigger({ id: 't2', actions: [{ type: 'action.ok' }] }))
      await eventBus.publish('obs:scene-changed', {})

      expect(calls).toEqual(['action.fail', 'action.ok'])
    })
  })

  describe('direct fire', () => {
    it('throws for unknown trigger id', async () => {
      const engine = new TriggerEngine(
        new InMemoryEventBus(),
        new TriggerGraph(),
        async () => undefined,
        createNoopLogger(),
      )

      await expect(engine.executeTrigger('unknown')).rejects.toThrow('not registered')
    })

    it('fires enabled trigger with empty payload', async () => {
      const payloads: unknown[] = []
      const engine = new TriggerEngine(
        new InMemoryEventBus(),
        new TriggerGraph(),
        async (_action, payload) => {
          payloads.push(payload)
        },
        createNoopLogger(),
      )

      await engine.registerTrigger(createTrigger({ id: 't-manual' }))
      await engine.executeTrigger('t-manual')

      expect(payloads).toEqual([{}])
    })

    it('publishes TRIGGER_EXECUTED on manual execute', async () => {
      const eventBus = new InMemoryEventBus()
      const published: Array<{ triggerId: string; firedAt: number }> = []
      eventBus.subscribe(EventTopics.TRIGGER_EXECUTED, async (payload) => {
        published.push(payload as { triggerId: string; firedAt: number })
      })

      const engine = new TriggerEngine(eventBus, new TriggerGraph(), async () => undefined, createNoopLogger())
      await engine.registerTrigger(createTrigger({ id: 't-manual' }))
      await engine.executeTrigger('t-manual')

      expect(published).toHaveLength(1)
      expect(published[0]?.triggerId).toBe('t-manual')
      expect(published[0]?.firedAt).toBeTypeOf('number')
    })
  })

  describe('event publication', () => {
    it('publishes TRIGGER_EXECUTED with triggerId for event-driven runs', async () => {
      const eventBus = new InMemoryEventBus()
      const published: Array<{ triggerId: string; firedAt: number }> = []
      eventBus.subscribe(EventTopics.TRIGGER_EXECUTED, async (payload) => {
        published.push(payload as { triggerId: string; firedAt: number })
      })

      const engine = new TriggerEngine(eventBus, new TriggerGraph(), async () => undefined, createNoopLogger())
      await engine.registerTrigger(createTrigger({ id: 't-event' }))
      await eventBus.publish('obs:scene-changed', {})

      expect(published).toHaveLength(1)
      expect(published[0]?.triggerId).toBe('t-event')
      expect(published[0]?.firedAt).toBeTypeOf('number')
    })
  })

  describe('destroy lifecycle', () => {
    it('stops dispatching actions after destroy', async () => {
      const calls: string[] = []
      const eventBus = new InMemoryEventBus()
      const engine = new TriggerEngine(
        eventBus,
        new TriggerGraph(),
        async (action) => {
          calls.push(String(action.type))
        },
        createNoopLogger(),
      )

      await engine.registerTrigger(createTrigger({ id: 't1', event: 'obs:connected' }))
      engine.destroy()
      await eventBus.publish('obs:connected', {})

      expect(calls).toEqual([])
    })
  })
})
