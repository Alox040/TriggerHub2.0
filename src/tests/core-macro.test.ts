import { describe, expect, it } from 'vitest'
import { MacroEngine, MacroRecursionLimitError } from '../core/macro-system'
import type { MacroExecutionContext, MacroStep } from '../core/macro-system'

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

  it('updates an existing macro and preserves its identity', async () => {
    const engine = new MacroEngine(async () => undefined)
    await engine.registerMacro({
      id: 'm-update',
      name: 'Original',
      enabled: true,
      steps: [],
    })

    await engine.updateMacro({
      id: 'm-update',
      name: 'Updated',
      enabled: false,
      steps: [{ id: 's-updated', type: 'delay', durationMs: 0 }],
    })

    expect(engine.getMacroById('m-update')).toMatchObject({
      id: 'm-update',
      name: 'Updated',
      enabled: false,
    })
  })

  it('throws when updating an unknown macro', async () => {
    const engine = new MacroEngine(async () => undefined)

    await expect(
      engine.updateMacro({
        id: 'missing-macro',
        name: 'Missing',
        enabled: true,
        steps: [],
      }),
    ).rejects.toThrow('not registered')
  })

  it('returns a recursion-limit failure result when macro nesting exceeds the hard limit', async () => {
    let engine!: MacroEngine
    let nestedRecursionError: MacroRecursionLimitError | null = null

    const executeStep = async (step: MacroStep, ctx: MacroExecutionContext) => {
      if (step.type !== 'macro_call') {
        return
      }

      try {
        const result = await engine.runMacroWithResult(
          step.macroId,
          { maxDepth: 20, ...(step.options ?? {}) },
          ctx.depth + 1,
        )
        if (result.success === false) {
          nestedRecursionError = new MacroRecursionLimitError(result.depth ?? ctx.depth + 1)
        }
      } catch (error) {
        if (error instanceof MacroRecursionLimitError) {
          nestedRecursionError = error
        }
        throw error
      }
    }

    engine = new MacroEngine(executeStep)

    for (let depth = 0; depth <= 11; depth += 1) {
      await engine.registerMacro({
        id: `chain-${depth}`,
        name: `Chain ${depth}`,
        enabled: true,
        steps:
          depth < 11
            ? [{ id: `call-${depth}`, type: 'macro_call', macroId: `chain-${depth + 1}` }]
            : [{ id: 'leaf', type: 'plugin_action', plugin: 'x', action: 'run' }],
      })
    }

    const result = await engine.runMacroWithResult('chain-0', { maxDepth: 20 })

    expect(result).toMatchObject({
      success: false,
      error: 'MAX_RECURSION_DEPTH_EXCEEDED',
      depth: 11,
    })
    expect(nestedRecursionError).toBeInstanceOf(MacroRecursionLimitError)
    expect((nestedRecursionError as unknown as MacroRecursionLimitError).depth).toBe(11)
  })

  it('allows macro nesting up to depth 10', async () => {
    let engine!: MacroEngine

    const executeStep = async (step: MacroStep, ctx: MacroExecutionContext) => {
      if (step.type !== 'macro_call') {
        return
      }

      try {
        const result = await engine.runMacroWithResult(
          step.macroId,
          { maxDepth: 20, ...(step.options ?? {}) },
          ctx.depth + 1,
        )
        if (result.success === false) {
          throw new MacroRecursionLimitError(result.depth ?? ctx.depth + 1)
        }
      } catch (error) {
        if (error instanceof MacroRecursionLimitError) {
          throw error
        }
        throw error
      }
    }

    engine = new MacroEngine(executeStep)

    for (let depth = 0; depth <= 10; depth += 1) {
      await engine.registerMacro({
        id: `ok-chain-${depth}`,
        name: `Ok Chain ${depth}`,
        enabled: true,
        steps:
          depth < 10
            ? [{ id: `ok-call-${depth}`, type: 'macro_call', macroId: `ok-chain-${depth + 1}` }]
            : [{ id: 'ok-leaf', type: 'plugin_action', plugin: 'x', action: 'run' }],
      })
    }

    const result = await engine.runMacroWithResult('ok-chain-0', { maxDepth: 20 })

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.depth).toBe(0)
  })
})
