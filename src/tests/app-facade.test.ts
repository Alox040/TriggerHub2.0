import { describe, expect, it, vi } from 'vitest'
import { InMemoryEventBus } from '../core/event-bus'
import { MacroEngine } from '../core/macro-system'
import { TriggerEngine, TriggerGraph } from '../core/trigger-engine'
import { TriggerHubAppFacade } from '../app/facade'
import { DashboardReadModelValidationError } from '../app/readModel'
import { createNoopLogger } from '../utils/logger'
import { InMemoryStorage } from '../storage/inMemoryStorage'
import type { PluginRegistryPort } from '../types/ports'

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

  it('returns editor, plugin and settings use-case state through the facade', async () => {
    const macroEngine = new MacroEngine(async () => undefined)
    const triggerEngine = new TriggerEngine(
      new InMemoryEventBus(),
      new TriggerGraph(),
      async () => undefined,
      createNoopLogger(),
    )
    const pluginRegistry: PluginRegistryPort = {
      register: async () => undefined,
      unregister: async () => undefined,
      list: async () => [{ id: 'example-plugin', name: 'Example Plugin', activate: async () => undefined, deactivate: async () => undefined }],
    }

    await triggerEngine.registerTrigger({
      id: 'editor-trigger',
      name: 'Editor Trigger',
      enabled: true,
      event: 'editor:event',
      conditions: [],
      actions: [{ type: 'macro.run', payload: { macroId: 'editor-macro' } }],
    })
    await macroEngine.registerMacro({
      id: 'editor-macro',
      name: 'Editor Macro',
      enabled: true,
      steps: [{ id: 'step-1', type: 'delay', durationMs: 0 }],
    })

    const facade = new TriggerHubAppFacade(
      triggerEngine,
      macroEngine,
      { obs: true, spotify: false, clip: true },
      pluginRegistry,
    )

    await expect(facade.getEditorState()).resolves.toEqual({
      triggers: [
        {
          id: 'editor-trigger',
          name: 'Editor Trigger',
          enabled: true,
          event: 'editor:event',
          conditions: [],
          actions: [{ type: 'macro.run', payload: { macroId: 'editor-macro' } }],
        },
      ],
      macros: [
        {
          id: 'editor-macro',
          name: 'Editor Macro',
          enabled: true,
          steps: [{ id: 'step-1', type: 'delay', durationMs: 0 }],
        },
      ],
    })
    await expect(facade.getPluginsState()).resolves.toEqual({
      plugins: [{ id: 'example-plugin', name: 'Example Plugin' }],
    })
    await expect(facade.getSettingsState()).resolves.toEqual({
      connectedServices: {
        obs: true,
        spotify: false,
        clip: true,
      },
      triggerCount: 1,
      macroCount: 1,
    })
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
      undefined,
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
      undefined,
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

  it('delegates explicit runtime activation commands when available', async () => {
    const activateRuntime = vi.fn(async () => undefined)
    const deactivateRuntime = vi.fn(async () => undefined)
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
      undefined,
      undefined,
      undefined,
      { activateRuntime, deactivateRuntime },
    )

    await facade.activateRuntime()
    await facade.deactivateRuntime()

    expect(activateRuntime).toHaveBeenCalledTimes(1)
    expect(deactivateRuntime).toHaveBeenCalledTimes(1)
  })
})
