import { describe, expect, it } from 'vitest'
import { createPluginRegistryWithDefaults } from '../plugins'
import { AppController, HotkeyManager, WindowManager } from '../core/app-control'
import { InMemoryEventBus } from '../core/event-bus'
import { MacroEngine } from '../core/macro-system'
import { TriggerEngine, TriggerExecutor, TriggerGraph } from '../core/trigger-engine'
import { createNoopLogger } from '../utils/logger'

describe('PluginRegistry', () => {
  it('registers default plugin and supports lifecycle', async () => {
    const registry = await createPluginRegistryWithDefaults()
    const plugins = await registry.list()

    expect(plugins.length).toBeGreaterThan(0)
    expect(plugins[0]?.id).toBe('example-plugin')

    const appController = new AppController(new HotkeyManager(), new WindowManager())
    const macroEngine = new MacroEngine(async () => undefined)
    const actionRegistry = new TriggerExecutor()
    const triggerEngine = new TriggerEngine(
      new InMemoryEventBus(),
      new TriggerGraph(),
      async () => undefined,
      createNoopLogger(),
    )

    await triggerEngine.registerTrigger({
      id: 't-default',
      name: 'T default',
      enabled: true,
      event: 'obs:scene-changed',
      conditions: [],
      actions: [],
    })
    await macroEngine.registerMacro({
      id: 'm-default',
      name: 'M default',
      enabled: true,
      steps: [],
    })

    await expect(
      registry.activateAll({
        appController,
        macroEngine,
        triggerEngine,
        eventBus: new InMemoryEventBus(),
        actionRegistry,
      }),
    ).resolves.toBeUndefined()

    await expect(registry.deactivateAll()).resolves.toBeUndefined()
  })
})
