import { describe, expect, it } from 'vitest'
import { InMemoryEventBus } from '../core/event-bus'
import { MacroEngine } from '../core/macro-system'
import { TriggerEngine, TriggerGraph } from '../core/trigger-engine'
import { TriggerHubAppFacade } from '../app/facade'
import { DashboardReadModelValidationError } from '../app/readModel'
import { createNoopLogger } from '../utils/logger'

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
