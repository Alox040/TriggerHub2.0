import type { MacroEnginePort, Macro, EventBusPort } from '../../types'
import { EventTopics } from '../../types'
import {
  MacroInvariantError,
  MacroRecursionLimitError,
  type MacroRecord,
  type MacroExecutionResult,
  type MacroRunOptions,
  type MacroStepHandler,
  type MacroStep,
} from './macroTypes'
import { runMacro } from './macroRunner'
import { recordRuntimeMetric } from '../../runtime/runtimeMonitor'

const noopEventBus: EventBusPort = {
  publish: async () => undefined,
  subscribe: () => ({ id: '', topic: '' }),
  once: () => ({ id: '', topic: '' }),
  unsubscribe: () => undefined,
  unsubscribeAll: () => undefined,
}

export class MacroEngine implements MacroEnginePort {
  private readonly macroMap = new Map<string, MacroRecord>()

  public constructor(
    private readonly stepHandler: MacroStepHandler,
    private readonly eventBus: EventBusPort = noopEventBus,
  ) {}

  public async registerMacro(macro: Macro): Promise<void> {
    this.assertValidMacro(macro)
    if (this.macroMap.has(macro.id)) {
      throw new MacroInvariantError(`Macro "${macro.id}" is already registered`)
    }

    this.macroMap.set(macro.id, {
      ...macro,
      createdAt: Date.now(),
    })
  }

  public async updateMacro(macro: Macro): Promise<void> {
    this.assertValidMacro(macro)

    const existing = this.macroMap.get(macro.id)
    if (!existing) {
      throw new MacroInvariantError(`Macro "${macro.id}" is not registered`)
    }

    this.macroMap.set(macro.id, {
      ...macro,
      createdAt: existing.createdAt,
      lastRunAt: existing.lastRunAt,
    })
  }

  public async removeMacro(macroId: string): Promise<void> {
    this.macroMap.delete(macroId)
  }

  public async runMacro(macroId: string, options: MacroRunOptions = {}): Promise<void> {
    const result = await this.runMacroWithResult(macroId, options)
    if (!result.skipped && result.success !== false) {
      await this.eventBus.publish(EventTopics.MACRO_COMPLETED, {
        macroId: result.macroId,
        stepCount: result.executedStepCount,
        executedAt: result.executedAt,
      })
    }
  }

  public async runMacroWithResult(
    macroId: string,
    options: MacroRunOptions = {},
    depth = 0,
    triggerPayload?: Record<string, unknown>,
  ): Promise<MacroExecutionResult> {
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const macro = this.macroMap.get(macroId)
    if (!macro) {
      throw new Error(`Macro "${macroId}" is not registered`)
    }

    if (!macro.enabled) {
      return {
        macroId,
        executedStepCount: 0,
        executedAt: Date.now(),
        success: true,
        depth,
        skipped: true,
      }
    }

    try {
      const result = await runMacro(macro, this.stepHandler, options, depth, triggerPayload)
      macro.lastRunAt = result.executedAt
      const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
      recordRuntimeMetric('macro_execution_time', Math.max(0, Number((finishedAt - startedAt).toFixed(3))), {
        macroId,
        depth,
        skipped: false,
        success: true,
      })
      return result
    } catch (error) {
      if (error instanceof MacroRecursionLimitError) {
        const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
        recordRuntimeMetric('macro_execution_time', Math.max(0, Number((finishedAt - startedAt).toFixed(3))), {
          macroId,
          depth,
          skipped: false,
          success: false,
        })

        if (depth > 0) {
          throw error
        }

        return {
          macroId,
          executedStepCount: 0,
          executedAt: Date.now(),
          success: false,
          error: 'MAX_RECURSION_DEPTH_EXCEEDED',
          depth: error.depth,
        }
      }

      const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
      recordRuntimeMetric('macro_execution_time', Math.max(0, Number((finishedAt - startedAt).toFixed(3))), {
        macroId,
        depth,
        skipped: false,
        success: false,
      })
      throw error
    }
  }

  public getMacroById(macroId: string): MacroRecord | undefined {
    return this.macroMap.get(macroId)
  }

  public getAllMacros(): MacroRecord[] {
    return Array.from(this.macroMap.values())
  }

  public hasMacro(macroId: string): boolean {
    return this.macroMap.has(macroId)
  }

  private assertValidMacro(macro: Macro): void {
    if (!macro.id.trim()) {
      throw new MacroInvariantError('Macro id must not be empty')
    }

    if (!macro.name.trim()) {
      throw new MacroInvariantError('Macro name must not be empty')
    }

    macro.steps.forEach((step) => this.assertValidStep(step, macro.id))
  }

  private assertValidStep(step: MacroStep, macroId: string): void {
    if (!step.id.trim()) {
      throw new MacroInvariantError(`Macro "${macroId}" contains a step with empty id`)
    }

    switch (step.type) {
      case 'delay':
        if (!Number.isFinite(step.durationMs) || step.durationMs < 0) {
          throw new MacroInvariantError(
            `Macro "${macroId}" contains delay step "${step.id}" with invalid durationMs`,
          )
        }
        break
      case 'service_call':
        if (!step.service.trim() || !step.action.trim()) {
          throw new MacroInvariantError(
            `Macro "${macroId}" contains service_call step "${step.id}" with empty service/action`,
          )
        }
        break
      case 'plugin_action':
        if (!step.plugin.trim() || !step.action.trim()) {
          throw new MacroInvariantError(
            `Macro "${macroId}" contains plugin_action step "${step.id}" with empty plugin/action`,
          )
        }
        break
      case 'macro_call':
        if (!step.macroId.trim()) {
          throw new MacroInvariantError(
            `Macro "${macroId}" contains macro_call step "${step.id}" with empty macroId`,
          )
        }
        break
      case 'conditional':
        if (!step.condition.variable.trim()) {
          throw new MacroInvariantError(
            `Macro "${macroId}" contains conditional step "${step.id}" with empty condition.variable`,
          )
        }
        step.then.forEach((child) => this.assertValidStep(child, macroId))
        step.else?.forEach((child) => this.assertValidStep(child, macroId))
        break
      case 'parallel':
      case 'sequence':
        step.steps.forEach((child) => this.assertValidStep(child, macroId))
        break
    }
  }
}
