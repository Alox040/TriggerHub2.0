//  Variable Map
export type MacroVariableMap = Record<string, unknown>

export const MAX_MACRO_DEPTH = 10

//  Condition
export type MacroConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'exists'

export interface MacroCondition {
  variable: string
  operator: MacroConditionOperator
  value?: unknown
}

//  Step Discriminated Union
export type MacroStepType =
  | 'delay'
  | 'service_call'
  | 'plugin_action'
  | 'macro_call'
  | 'conditional'
  | 'parallel'
  | 'sequence'

interface MacroStepBase {
  id: string
}

export interface DelayStep extends MacroStepBase {
  type: 'delay'
  durationMs: number
}

export interface ServiceCallStep extends MacroStepBase {
  type: 'service_call'
  service: string
  action: string
  params?: Record<string, unknown>
}

export interface PluginActionStep extends MacroStepBase {
  type: 'plugin_action'
  plugin: string
  action: string
  params?: Record<string, unknown>
}

export interface MacroCallStep extends MacroStepBase {
  type: 'macro_call'
  macroId: string
  options?: MacroRunOptions
}

export interface ConditionalStep extends MacroStepBase {
  type: 'conditional'
  condition: MacroCondition
  then: MacroStep[]
  else?: MacroStep[]
}

export interface ParallelStep extends MacroStepBase {
  type: 'parallel'
  steps: MacroStep[]
}

export interface SequenceStep extends MacroStepBase {
  type: 'sequence'
  steps: MacroStep[]
}

/** Discriminated union of all step variants. Narrow on `.type`. */
export type MacroStep =
  | DelayStep
  | ServiceCallStep
  | PluginActionStep
  | MacroCallStep
  | ConditionalStep
  | ParallelStep
  | SequenceStep

//  Definition
export interface MacroDefinition {
  id: string
  name: string
  description?: string
  enabled: boolean
  steps: MacroStep[]
  variables?: MacroVariableMap
  tags?: string[]
}

//  Template Reference
export interface MacroTemplateReference {
  templateId: string
  paramOverrides?: MacroVariableMap
}

//  Run Options
export interface MacroRunOptions {
  stopOnError?: boolean
  /** Max recursion depth for macro_call steps (default: 5) */
  maxDepth?: number
  variables?: MacroVariableMap
}

//  Execution Context
export interface MacroExecutionContext {
  macroId: string
  variables: MacroVariableMap
  /** Trigger payload that fired this macro, if any */
  triggerPayload?: Record<string, unknown>
  /** Recursion depth  engine increments per macro_call, rejects above maxDepth */
  depth: number
}

//  Execution Result
export interface MacroExecutionResult {
  macroId: string
  executedStepCount: number
  executedAt: number
  success?: boolean
  error?: 'MAX_RECURSION_DEPTH_EXCEEDED'
  depth?: number
  skipped?: boolean
}

//  Engine internals
export type MacroStepHandler = (step: MacroStep, ctx: MacroExecutionContext) => Promise<void>

export interface MacroRecord extends MacroDefinition {
  createdAt: number
  lastRunAt?: number
}

export class MacroInvariantError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'MacroInvariantError'
  }
}

export class MacroRecursionLimitError extends Error {
  public readonly depth: number

  public constructor(depth: number) {
    super(`Macro recursion depth limit exceeded at depth ${depth}`)
    this.name = 'MacroRecursionLimitError'
    this.depth = depth
  }
}
