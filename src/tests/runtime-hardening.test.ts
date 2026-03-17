import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createConsoleLogger } from '../utils/logger'
import { runtimeMetrics } from '../runtime/metrics'
import { runWithPolicy, type OperationPolicy } from '../services/shared/reliability'
import { MacroEngine } from '../core/macro-system'
import { InMemoryEventBus } from '../core/event-bus'
import { TriggerEngine, TriggerGraph } from '../core/trigger-engine'
import { PluginRegistry } from '../plugins'

describe('runtime hardening', () => {
  beforeEach(() => {
    runtimeMetrics.clear()
    vi.restoreAllMocks()
  })

  it('emits structured json logs', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const logger = createConsoleLogger('RuntimeTest')

    logger.info('runtime started', {
      service: 'desktop',
      ok: true,
    })

    expect(infoSpy).toHaveBeenCalledTimes(1)
    const serialized = String(infoSpy.mock.calls[0]?.[0] ?? '')
    const payload = JSON.parse(serialized) as {
      namespace: string
      message: string
      level: string
      context?: Record<string, unknown>
    }

    expect(payload.namespace).toBe('RuntimeTest')
    expect(payload.message).toBe('runtime started')
    expect(payload.level).toBe('info')
    expect(payload.context?.service).toBe('desktop')
  })

  it('records service latency metrics via retry wrapper', async () => {
    const policy: OperationPolicy = {
      retries: 0,
      retryDelayMs: 1,
      timeoutMs: 50,
    }

    await runWithPolicy('service.test', policy, async () => undefined)

    expect(
      runtimeMetrics.snapshot().some((metric) => metric.name === 'service_latency' && metric.attributes?.operation === 'service.test'),
    ).toBe(true)
  })

  it('records macro execution timing', async () => {
    const engine = new MacroEngine(async () => undefined, new InMemoryEventBus())
    await engine.registerMacro({
      id: 'macro-1',
      name: 'Macro 1',
      enabled: true,
      steps: [],
    })

    await engine.runMacro('macro-1')

    expect(
      runtimeMetrics.snapshot().some((metric) => metric.name === 'macro_execution_time' && metric.attributes?.macroId === 'macro-1'),
    ).toBe(true)
  })

  it('records trigger dispatch timing', async () => {
    const engine = new TriggerEngine(new InMemoryEventBus(), new TriggerGraph(), async () => undefined)
    await engine.registerTrigger({
      id: 'trigger-1',
      name: 'Trigger 1',
      enabled: true,
      event: 'event.test',
      conditions: [],
      actions: [],
    })

    await engine.executeTrigger('trigger-1')

    expect(
      runtimeMetrics.snapshot().some((metric) => metric.name === 'trigger_dispatch_time' && metric.attributes?.triggerId === 'trigger-1'),
    ).toBe(true)
  })

  it('isolates plugin lifecycle failures', async () => {
    const registry = new PluginRegistry(createConsoleLogger('PluginRegistryTest'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await registry.register({
      id: 'broken-plugin',
      name: 'Broken Plugin',
      activate: async () => {
        throw new Error('activation failed')
      },
      deactivate: async () => {
        throw new Error('deactivation failed')
      },
    })

    await expect(
      registry.activateAll({
        appController: { start: async () => undefined, stop: async () => undefined },
        triggerEngine: {
          registerTrigger: async () => undefined,
          updateTrigger: async () => undefined,
          removeTrigger: async () => undefined,
          executeTrigger: async () => undefined,
          getTrigger: () => undefined,
          hasTrigger: () => false,
          getAll: () => [],
          destroy: () => undefined,
        },
        macroEngine: {
          registerMacro: async () => undefined,
          updateMacro: async () => undefined,
          removeMacro: () => false,
          getMacroById: () => undefined,
          getAllMacros: () => [],
          runMacro: async () => undefined,
        },
        eventBus: new InMemoryEventBus(),
        actionRegistry: {
          register: () => undefined,
          unregister: () => undefined,
        },
      }),
    ).resolves.toBeUndefined()

    await expect(registry.deactivateAll()).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalled()
  })
})
