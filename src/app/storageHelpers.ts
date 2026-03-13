import type { MacroRecord } from '../core/macro-system/macroTypes'
import type { GraphTrigger, GraphTriggerRecord } from '../core/trigger-engine/triggerGraphTypes'
import type { Macro } from '../types'

export function stripTriggerRecord(record: GraphTriggerRecord): GraphTrigger {
  const { createdAt: _createdAt, ...trigger } = record
  return { ...trigger }
}

export function stripMacroRecord(record: MacroRecord): Macro {
  const { createdAt: _createdAt, lastRunAt: _lastRunAt, ...macro } = record
  return { ...macro }
}
