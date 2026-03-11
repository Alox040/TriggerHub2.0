import { describe, expect, it } from 'vitest'
import { MacroEngine } from '../core/macro-system'

describe('MacroEngine', () => {
  it('runs enabled macros and executes steps', async () => {
    const executed: string[] = []
    const engine = new MacroEngine(async (step) => {
      executed.push(step.id)
    })

    await engine.registerMacro({
      id: 'm1',
      name: 'Macro One',
      enabled: true,
      steps: [
        { id: 's1', type: 'plugin_action', plugin: 'x', action: 'run' },
        { id: 's2', type: 'plugin_action', plugin: 'y', action: 'run' },
      ],
    })

    const result = await engine.runMacroWithResult('m1')

    expect(result.executedStepCount).toBe(2)
    expect(executed).toEqual(['s1', 's2'])
  })

  it('does not execute disabled macros', async () => {
    const executed: string[] = []
    const engine = new MacroEngine(async (step) => {
      executed.push(step.id)
    })

    await engine.registerMacro({
      id: 'm2',
      name: 'Macro Two',
      enabled: false,
      steps: [{ id: 's1', type: 'plugin_action', plugin: 'x', action: 'run' }],
    })

    const result = await engine.runMacroWithResult('m2')
    expect(result.executedStepCount).toBe(0)
    expect(executed).toHaveLength(0)
  })

  it('enforces non-empty ids and typed step fields', async () => {
    const engine = new MacroEngine(async () => undefined)

    await expect(
      engine.registerMacro({
        id: '',
        name: 'invalid',
        enabled: true,
        steps: [],
      }),
    ).rejects.toThrow('must not be empty')

    await expect(
      engine.registerMacro({
        id: 'm-invalid-step',
        name: 'invalid step',
        enabled: true,
        steps: [{ id: 's1', type: 'plugin_action', plugin: '', action: 'run' }],
      }),
    ).rejects.toThrow('empty plugin/action')
  })

  it('enforces unique macro ids', async () => {
    const engine = new MacroEngine(async () => undefined)
    await engine.registerMacro({
      id: 'm1',
      name: 'Macro One',
      enabled: true,
      steps: [],
    })

    await expect(
      engine.registerMacro({
        id: 'm1',
        name: 'Duplicate',
        enabled: true,
        steps: [],
      }),
    ).rejects.toThrow('already registered')
  })
})
