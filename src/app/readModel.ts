import type { DashboardState } from '../types'

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

const isTrigger = (value: unknown): value is DashboardState['activeTriggers'][number] => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'string' && typeof candidate.name === 'string' && isBoolean(candidate.enabled)
}

const isMacroStep = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  if (typeof candidate.id !== 'string' || typeof candidate.type !== 'string') {
    return false
  }

  return (
    candidate.type === 'delay' ||
    candidate.type === 'service_call' ||
    candidate.type === 'plugin_action' ||
    candidate.type === 'macro_call' ||
    candidate.type === 'conditional' ||
    candidate.type === 'parallel' ||
    candidate.type === 'sequence'
  )
}

const isMacro = (value: unknown): value is DashboardState['activeMacros'][number] => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    isBoolean(candidate.enabled) &&
    Array.isArray(candidate.steps) &&
    candidate.steps.every((step) => isMacroStep(step))
  )
}

export const isDashboardState = (value: unknown): value is DashboardState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  const connectedServices = candidate.connectedServices as Record<string, unknown> | undefined

  return (
    !!connectedServices &&
    isBoolean(connectedServices.obs) &&
    isBoolean(connectedServices.spotify) &&
    isBoolean(connectedServices.clip) &&
    Array.isArray(candidate.activeTriggers) &&
    candidate.activeTriggers.every((trigger) => isTrigger(trigger)) &&
    Array.isArray(candidate.activeMacros) &&
    candidate.activeMacros.every((macro) => isMacro(macro))
  )
}

export class DashboardReadModelValidationError extends Error {
  public constructor(public readonly payload: unknown) {
    super('Dashboard read model is invalid')
  }
}
