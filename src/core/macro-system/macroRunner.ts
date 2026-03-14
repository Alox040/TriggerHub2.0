import { MAX_MACRO_DEPTH, MacroInvariantError, MacroRecursionLimitError } from './macroTypes'
import type {
  MacroExecutionContext,
  MacroExecutionResult,
  MacroRecord,
  MacroRunOptions,
  MacroStepHandler,
} from './macroTypes'

export const runMacro = async (
  macro: MacroRecord,
  stepHandler: MacroStepHandler,
  options: MacroRunOptions = {},
  depth = 0,
  triggerPayload?: Record<string, unknown>,
): Promise<MacroExecutionResult> => {
  if (depth > MAX_MACRO_DEPTH) {
    throw new MacroRecursionLimitError(depth)
  }

  const maxDepth = options.maxDepth ?? 5
  if (depth > maxDepth) {
    throw new MacroInvariantError(
      `Macro "${macro.id}" exceeded max recursion depth (${maxDepth})`,
    )
  }

  const ctx: MacroExecutionContext = {
    macroId: macro.id,
    variables: {
      ...(macro.variables ?? {}),
      ...(options.variables ?? {}),
    },
    triggerPayload,
    depth,
  }

  let executedStepCount = 0

  for (const step of macro.steps) {
    try {
      await stepHandler(step, ctx)
      executedStepCount += 1
    } catch (error) {
      if (options.stopOnError ?? true) {
        throw error
      }
    }
  }

  return {
    macroId: macro.id,
    executedStepCount,
    executedAt: Date.now(),
    success: true,
    depth,
  }
}
