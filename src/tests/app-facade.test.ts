import { describe, expect, it, vi } from 'vitest'
import { InMemoryEventBus } from '../core/event-bus'
import { MacroEngine } from '../core/macro-system'
import { TriggerEngine, TriggerGraph } from '../core/trigger-engine'
import { TriggerHubAppFacade } from '../app/facade'
import { DashboardReadModelValidationError } from '../app/readModel'
import { createNoopLogger } from '../utils/logger'
import { InMemoryStorage } from '../storage/inMemoryStorage'

describe('TriggerHubAppFacade executeTrigger', () => {
  it('resolves without error when the trigger id is registered', async () => {
    const macroEngine = new MacroEngine(async () => undefined)
    const triggerEngine = new TriggerEngine(
      new InMemoryEventBus(),
      new TriggerGraph(),
      async () => undefined,
      createNoopLogger(),
    )

    await triggerEngine.registerTrigger({
      id: 'exec-trigger',
      name: 'Executable Trigger',
      enabled: true,
      event: 'test:event',
      conditions: [],
      actions: [],
    })

    const facade = new TriggerHubAppFacade(triggerEngine, macroEngine, {
      obs: false,
      spotify: false,
      clip: false,
    })

    await expect(facade.executeTrigger('exec-trigger')).resolves.toBeUndefined()
  })
})

describe('TriggerHubAppFacade read model validation', () => {
  it('returns valid dashboard state for valid inputs', async () => {
    const macroEngine = new MacroEngine(async () => undefined)
    const triggerEngine = new TriggerEngine(
      new InMemoryEventBus(),
      new TriggerGraph(),
      async () => undefined,
      createNoopLogger(),
    )

    await triggerEngine.registerTrigger({
      id: 't1',
      name: 'Trigger One',
      enabled: true,
      event: 'obs:scene-changed',
      conditions: [],
      actions: [],
    })
    await macroEngine.registerMacro({
      id: 'm1',
      name: 'Macro One',
      enabled: true,
      steps: [{ id: 's1', type: 'plugin_action', plugin: 'noop', action: 'run' }],
    })

    const facade = new TriggerHubAppFacade(triggerEngine, macroEngine, {
      obs: true,
      spotify: false,
      clip: true,
    })

    const state = await facade.getDashboardState()
    expect(state.activeTriggers.length).toBe(1)
    expect(state.activeMacros.length).toBe(1)
    expect(state.connectedServices.obs).toBe(true)
  })

  it('throws DashboardReadModelValidationError for invalid service state shape', async () => {
    const macroEngine = new MacroEngine(async () => undefined)
    const triggerEngine = new TriggerEngine(
      new InMemoryEventBus(),
      new TriggerGraph(),
      async () => undefined,
      createNoopLogger(),
    )

    const facade = new TriggerHubAppFacade(
      triggerEngine,
      macroEngine,
      { obs: 'yes', spotify: false, clip: true } as unknown as {
        obs: boolean
        spotify: boolean
        clip: boolean
      },
    )

    await expect(facade.getDashboardState()).rejects.toBeInstanceOf(DashboardReadModelValidationError)
  })
})

describe('TriggerHubAppFacade persistence integration', () => {
  it('persists trigger and macro mutations through the injected persistence callback', async () => {
    const storage = new InMemoryStorage()
    const macroEngine = new MacroEngine(async () => undefined)
    const triggerEngine = new TriggerEngine(
      new InMemoryEventBus(),
      new TriggerGraph(),
      async () => undefined,
      createNoopLogger(),
    )

    const facade = new TriggerHubAppFacade(
      triggerEngine,
      macroEngine,
      { obs: false, spotify: false, clip: false },
      {
        persist: async () => {
          await storage.save('custom-triggers', triggerEngine.getAll())
          await storage.save('custom-macros', macroEngine.getAllMacros())
        },
      },
    )

    await facade.createTrigger({
      id: 'persist-trigger',
      name: 'Persist Trigger',
      enabled: true,
      event: 'test:persist',
      conditions: [],
      actions: [],
    })
    await facade.createMacro({
      id: 'persist-macro',
      name: 'Persist Macro',
      enabled: true,
      steps: [{ id: 'step-1', type: 'delay', durationMs: 0 }],
    })
    await facade.deleteMacro('persist-macro')

    const persistedTriggers = await storage.load<Array<{ id: string }>>('custom-triggers')
    const persistedMacros = await storage.load<Array<{ id: string }>>('custom-macros')

    expect(persistedTriggers?.some((trigger) => trigger.id === 'persist-trigger')).toBe(true)
    expect(persistedMacros).toEqual([])
  })

  it('exposes read and update flows for triggers and macros through the facade', async () => {
    const persistSpy = vi.fn(async () => undefined)
    const macroEngine = new MacroEngine(async () => undefined)
    const triggerEngine = new TriggerEngine(
      new InMemoryEventBus(),
      new TriggerGraph(),
      async () => undefined,
      createNoopLogger(),
    )

    const facade = new TriggerHubAppFacade(
      triggerEngine,
      macroEngine,
      { obs: false, spotify: false, clip: false },
      { persist: persistSpy },
    )

    await facade.createTrigger({
      id: 'crud-trigger',
      name: 'Original Trigger',
      enabled: true,
      event: 'test:one',
      conditions: [],
      actions: [],
    })
    await facade.createMacro({
      id: 'crud-macro',
      name: 'Original Macro',
      enabled: true,
      steps: [{ id: 'step-1', type: 'delay', durationMs: 0 }],
    })

    expect(await facade.getTrigger('crud-trigger')).toMatchObject({ name: 'Original Trigger' })
    expect(await facade.getMacro('crud-macro')).toMatchObject({ name: 'Original Macro' })

    await facade.updateTrigger({
      id: 'crud-trigger',
      name: 'Updated Trigger',
      enabled: false,
      event: 'test:two',
      conditions: [],
      actions: [{ type: 'action.updated' }],
    })
    await facade.updateMacro({
      id: 'crud-macro',
      name: 'Updated Macro',
      enabled: false,
      steps: [{ id: 'step-2', type: 'delay', durationMs: 1 }],
    })

    expect(await facade.listTriggers()).toEqual([
      {
        id: 'crud-trigger',
        name: 'Updated Trigger',
        enabled: false,
        event: 'test:two',
        conditions: [],
        actions: [{ type: 'action.updated' }],
      },
    ])
    expect(await facade.listMacros()).toEqual([
      {
        id: 'crud-macro',
        name: 'Updated Macro',
        enabled: false,
        steps: [{ id: 'step-2', type: 'delay', durationMs: 1 }],
      },
    ])
    expect(persistSpy).toHaveBeenCalledTimes(4)
  })
})
