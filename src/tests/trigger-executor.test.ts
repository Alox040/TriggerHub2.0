import { describe, expect, it, vi } from 'vitest'
import { TriggerExecutor, TriggerExecutorError } from '../core/trigger-engine'

describe('TriggerExecutor', () => {
  it('executes registered handler', async () => {
    const executor = new TriggerExecutor()
    const handler = vi.fn().mockResolvedValue(undefined)

    executor.register('custom.action', handler)

    const action = { type: 'custom.action', payload: { value: 123 } }
    const payload = { source: 'test' }
    await executor.execute(action, payload)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(action, payload)
  })

  it('throws TriggerExecutorError for unknown type', async () => {
    const executor = new TriggerExecutor()

    await expect(executor.execute({ type: 'unknown' }, {})).rejects.toBeInstanceOf(
      TriggerExecutorError,
    )
  })

  it('unregister removes handler', async () => {
    const executor = new TriggerExecutor()
    const handler = vi.fn().mockResolvedValue(undefined)

    executor.register('custom.action', handler)
    executor.unregister('custom.action')

    await expect(executor.execute({ type: 'custom.action' }, {})).rejects.toBeInstanceOf(
      TriggerExecutorError,
    )
    expect(handler).not.toHaveBeenCalled()
  })

  it('allows plugin to register and execute custom action', async () => {
    const executor = new TriggerExecutor()
    const pluginHandler = vi.fn().mockResolvedValue(undefined)
    const action = { type: 'plugin.custom', payload: { enabled: true } }
    const payload = { event: 'plugin:test' }

    executor.register('plugin.custom', pluginHandler)
    await executor.execute(action, payload)

    expect(pluginHandler).toHaveBeenCalledTimes(1)
    expect(pluginHandler).toHaveBeenCalledWith(action, payload)
  })

  it('toDispatcher returns ActionDispatcher-compatible function', async () => {
    const executor = new TriggerExecutor()
    const handler = vi.fn().mockResolvedValue(undefined)
    const action = { type: 'dispatch.action', payload: { a: 1 } }
    const payload = { b: 2 }

    executor.register('dispatch.action', handler)

    const dispatcher = executor.toDispatcher()
    await dispatcher(action, payload)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(action, payload)
  })
})
