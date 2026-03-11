import type { MacroEnginePort, Macro, EventBusPort } from '../../types'
import { EventTopics } from '../../types'
import {
  MacroInvariantError,
  type MacroRecord,
  type MacroExecutionResult,
  type MacroRunOptions,
  type MacroStepHandler,
  type MacroStep,
} from './macroTypes'
import { runMacro } from './macroRunner'

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
    if (!macro.id.trim()) {
      throw new MacroInvariantError('Macro id must not be empty')
    }

    if (!macro.name.trim()) {
      throw new MacroInvariantError('Macro name must not be empty')
    }

    if (this.macroMap.has(macro.id)) {
      throw new MacroInvariantError(`Macro "${macro.id}" is already registered`)
    }

    macro.steps.forEach((step) => this.assertValidStep(step, macro.id))

    this.macroMap.set(macro.id, {
      ...macro,
      createdAt: Date.now(),
    })
  }

  public async runMacro(macroId: string, options: MacroRunOptions = {}): Promise<void> {
    const result = await this.runMacroWithResult(macroId, options)
    if (!result.skipped) {
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
    const macro = this.macroMap.get(macroId)
    if (!macro) {
      throw new Error(`Macro "${macroId}" is not registered`)
    }

    if (!macro.enabled) {
      return {
        macroId,
        executedStepCount: 0,
        executedAt: Date.now(),
        skipped: true,
      }
    }

    const result = await runMacro(macro, this.stepHandler, options, depth, triggerPayload)
    macro.lastRunAt = result.executedAt
    return result
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
