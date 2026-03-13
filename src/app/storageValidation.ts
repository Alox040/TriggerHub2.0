import { z } from 'zod'
import type { MacroDefinition, MacroRunOptions, MacroStep } from '../core/macro-system/macroTypes'
import type { GraphTrigger } from '../core/trigger-engine/triggerGraphTypes'

const TriggerConditionOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'contains',
  'exists',
])

const TriggerConditionSchema = z.object({
  field: z.string().min(1),
  operator: TriggerConditionOperatorSchema,
  value: z.unknown().optional(),
})

const TriggerActionSchema = z.object({
  type: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
})

export const TriggerRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean(),
  event: z.string().min(1),
  conditions: z.array(TriggerConditionSchema),
  actions: z.array(TriggerActionSchema),
})

const MacroConditionOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'contains',
  'exists',
])

const MacroConditionSchema = z.object({
  variable: z.string().min(1),
  operator: MacroConditionOperatorSchema,
  value: z.unknown().optional(),
})

const MacroRunOptionsSchema: z.ZodType<MacroRunOptions> = z.object({
  stopOnError: z.boolean().optional(),
  maxDepth: z.number().optional(),
  variables: z.record(z.string(), z.unknown()).optional(),
})

const MacroStepSchema: z.ZodType<MacroStep> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      id: z.string().min(1),
      type: z.literal('delay'),
      durationMs: z.number(),
    }),
    z.object({
      id: z.string().min(1),
      type: z.literal('service_call'),
      service: z.string().min(1),
      action: z.string().min(1),
      params: z.record(z.string(), z.unknown()).optional(),
    }),
    z.object({
      id: z.string().min(1),
      type: z.literal('plugin_action'),
      plugin: z.string().min(1),
      action: z.string().min(1),
      params: z.record(z.string(), z.unknown()).optional(),
    }),
    z.object({
      id: z.string().min(1),
      type: z.literal('macro_call'),
      macroId: z.string().min(1),
      options: MacroRunOptionsSchema.optional(),
    }),
    z.object({
      id: z.string().min(1),
      type: z.literal('conditional'),
      condition: MacroConditionSchema,
      then: z.array(MacroStepSchema),
      else: z.array(MacroStepSchema).optional(),
    }),
    z.object({
      id: z.string().min(1),
      type: z.literal('parallel'),
      steps: z.array(MacroStepSchema),
    }),
    z.object({
      id: z.string().min(1),
      type: z.literal('sequence'),
      steps: z.array(MacroStepSchema),
    }),
  ]),
)

export const MacroRecordSchema: z.ZodType<MacroDefinition> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean(),
  steps: z.array(MacroStepSchema),
  variables: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
})

export const parseTriggers = (raw: unknown): GraphTrigger[] => {
  if (!Array.isArray(raw)) {
    console.warn('Storage triggers payload is not an array; ignoring persisted triggers', { raw })
    return []
  }

  const parsed: GraphTrigger[] = []
  for (const trigger of raw) {
    const result = TriggerRecordSchema.safeParse(trigger)
    if (!result.success) {
      console.warn('Skipping invalid stored trigger', {
        trigger,
        issues: result.error.issues,
      })
      continue
    }

    parsed.push(result.data)
  }

  return parsed
}

export const parseMacros = (raw: unknown): MacroDefinition[] => {
  if (!Array.isArray(raw)) {
    console.warn('Storage macros payload is not an array; ignoring persisted macros', { raw })
    return []
  }

  const parsed: MacroDefinition[] = []
  for (const macro of raw) {
    const result = MacroRecordSchema.safeParse(macro)
    if (!result.success) {
      console.warn('Skipping invalid stored macro', {
        macro,
        issues: result.error.issues,
      })
      continue
    }

    parsed.push(result.data)
  }

  return parsed
}
