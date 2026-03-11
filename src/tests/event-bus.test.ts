import { describe, expect, it, vi } from 'vitest'
import { InMemoryEventBus } from '../core/event-bus'

describe('InMemoryEventBus — basic pub/sub', () => {
  it('publishes to exact-match subscriber and passes payload', async () => {
    const bus = new InMemoryEventBus()
    const handler = vi.fn()
    bus.subscribe('obs:scene-changed', handler)

    await bus.publish('obs:scene-changed', { sceneName: 'Gaming' })

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ sceneName: 'Gaming' })
  })

  it('does not call subscriber for unrelated topic', async () => {
    const bus = new InMemoryEventBus()
    const handler = vi.fn()
    bus.subscribe('spotify:track-changed', handler)

    await bus.publish('obs:scene-changed', { sceneName: 'Gaming' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('calls multiple subscribers for the same topic in registration order', async () => {
    const bus = new InMemoryEventBus()
    const order: number[] = []
    bus.subscribe('obs:scene-changed', () => { order.push(1) })
    bus.subscribe('obs:scene-changed', () => { order.push(2) })

    await bus.publish('obs:scene-changed', { sceneName: 'Main' })

    expect(order).toEqual([1, 2])
  })
})

describe('InMemoryEventBus — wildcard subscriptions', () => {
  it('wildcard subscriber receives all events in its namespace', async () => {
    const bus = new InMemoryEventBus()
    const handler = vi.fn()
    bus.subscribe('obs:*', handler)

    await bus.publish('obs:scene-changed', { sceneName: 'Main' })
    await bus.publish('obs:connected', { host: 'localhost' })

    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('wildcard subscriber does not receive events from other namespaces', async () => {
    const bus = new InMemoryEventBus()
    const handler = vi.fn()
    bus.subscribe('obs:*', handler)

    await bus.publish('spotify:track-changed', { trackId: '123', title: 'Song' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('exact subscriber and wildcard subscriber both fire for the same event', async () => {
    const bus = new InMemoryEventBus()
    const exactHandler = vi.fn()
    const wildcardHandler = vi.fn()
    bus.subscribe('obs:scene-changed', exactHandler)
    bus.subscribe('obs:*', wildcardHandler)

    await bus.publish('obs:scene-changed', { sceneName: 'Gaming' })

    expect(exactHandler).toHaveBeenCalledOnce()
    expect(wildcardHandler).toHaveBeenCalledOnce()
  })
})

describe('InMemoryEventBus — once()', () => {
  it('once subscriber is called exactly once then removed', async () => {
    const bus = new InMemoryEventBus()
    const handler = vi.fn()
    bus.once('obs:scene-changed', handler)

    await bus.publish('obs:scene-changed', { sceneName: 'A' })
    await bus.publish('obs:scene-changed', { sceneName: 'B' })
    await bus.publish('obs:scene-changed', { sceneName: 'C' })

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ sceneName: 'A' })
  })

  it('once subscription token can be unsubscribed before first fire', async () => {
    const bus = new InMemoryEventBus()
    const handler = vi.fn()
    const sub = bus.once('obs:scene-changed', handler)
    bus.unsubscribe(sub)

    await bus.publish('obs:scene-changed', { sceneName: 'A' })

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('InMemoryEventBus — unsubscribe', () => {
  it('unsubscribe removes handler from future publishes', async () => {
    const bus = new InMemoryEventBus()
    const handler = vi.fn()
    const sub = bus.subscribe('obs:scene-changed', handler)

    bus.unsubscribe(sub)
    await bus.publish('obs:scene-changed', { sceneName: 'Main' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('unsubscribeAll removes all handlers for a topic', async () => {
    const bus = new InMemoryEventBus()
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    bus.subscribe('obs:scene-changed', handler1)
    bus.subscribe('obs:scene-changed', handler2)

    bus.unsubscribeAll('obs:scene-changed')
    await bus.publish('obs:scene-changed', { sceneName: 'Main' })

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('unsubscribe is a no-op for already-removed subscription', async () => {
    const bus = new InMemoryEventBus()
    const handler = vi.fn()
    const sub = bus.subscribe('obs:scene-changed', handler)

    bus.unsubscribe(sub)
    expect(() => bus.unsubscribe(sub)).not.toThrow()
  })
})

describe('InMemoryEventBus — async handlers', () => {
  it('awaits async handlers before resolving publish', async () => {
    const bus = new InMemoryEventBus()
    const order: string[] = []

    bus.subscribe('test:event', async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 5))
      order.push('handler')
    })

    await bus.publish('test:event', {})
    order.push('after-publish')

    expect(order).toEqual(['handler', 'after-publish'])
  })
})
