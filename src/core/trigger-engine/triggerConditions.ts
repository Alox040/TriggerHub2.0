export type TriggerConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'exists'

export interface TriggerCondition {
  field: string
  operator: TriggerConditionOperator
  value?: unknown
}

export type TriggerPayload = Record<string, unknown>

type ConditionEvaluatorFn = (fieldValue: unknown, conditionValue: unknown) => boolean

const isNumber = (value: unknown): value is number => typeof value === 'number'

export const OperatorEvaluators: Record<TriggerConditionOperator, ConditionEvaluatorFn> = {
  equals: (fieldValue, conditionValue) => fieldValue === conditionValue,
  not_equals: (fieldValue, conditionValue) => fieldValue !== conditionValue,
  greater_than: (fieldValue, conditionValue) =>
    isNumber(fieldValue) && isNumber(conditionValue) && fieldValue > conditionValue,
  less_than: (fieldValue, conditionValue) =>
    isNumber(fieldValue) && isNumber(conditionValue) && fieldValue < conditionValue,
  contains: (fieldValue, conditionValue) => {
    if (typeof fieldValue === 'string') {
      return fieldValue.includes(String(conditionValue))
    }

    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(conditionValue)
    }

    return false
  },
  exists: (fieldValue) => fieldValue !== undefined && fieldValue !== null,
}

export const evaluateCondition = (
  condition: TriggerCondition,
  payload: TriggerPayload,
): boolean => {
  const fieldValue = payload[condition.field]
  const evaluator = OperatorEvaluators[condition.operator]

  if (fieldValue === undefined && condition.operator !== 'exists') {
    return false
  }

  return evaluator(fieldValue, condition.value)
}
