import { useEffect, useState, type FormEvent } from 'react'
import type { TriggerCondition } from '../../core/trigger-engine/triggerConditions'
import type { GraphTrigger, TriggerAction } from '../../core/trigger-engine/triggerGraphTypes'
import { EventTopics } from '../../types'
import { Button } from './Button'

interface TriggerFormProps {
  initialValue?: GraphTrigger
  onSubmit: (trigger: GraphTrigger) => Promise<void> | void
  onCancel?: () => void
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseTriggerConditions = (text: string): TriggerCondition[] => {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return []
  }

  const parsed = JSON.parse(trimmed) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('Conditions must be a JSON array')
  }

  return parsed.map((entry, index) => {
    if (!isRecord(entry) || typeof entry.field !== 'string' || typeof entry.operator !== 'string') {
      throw new Error(`Condition ${index + 1} is invalid`)
    }

    return {
      field: entry.field,
      operator: entry.operator as TriggerCondition['operator'],
      value: entry.value,
    }
  })
}

const parseTriggerActions = (text: string): TriggerAction[] => {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return []
  }

  const parsed = JSON.parse(trimmed) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('Actions must be a JSON array')
  }

  return parsed.map((entry, index) => {
    if (!isRecord(entry) || typeof entry.type !== 'string') {
      throw new Error(`Action ${index + 1} is invalid`)
    }

    return {
      type: entry.type,
      payload: isRecord(entry.payload) ? entry.payload : undefined,
    }
  })
}

const serialize = (value: unknown): string => JSON.stringify(value, null, 2)

const knownEventTopics = Object.values(EventTopics) as GraphTrigger['event'][]

const createDraftId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.()
  if (randomId) {
    return randomId.slice(0, 8)
  }

  return `trigger-${Math.random().toString(16).slice(2, 8)}`
}

const createBlankTrigger = (): GraphTrigger => ({
  id: createDraftId(),
  name: '',
  enabled: true,
  event: EventTopics.OBS_CONNECTED,
  conditions: [],
  actions: [],
})

const resolveEventSelection = (eventTopic: string): string =>
  knownEventTopics.includes(eventTopic) ? eventTopic : 'custom'

export const TriggerForm = ({ initialValue, onSubmit, onCancel }: TriggerFormProps): JSX.Element => {
  const [draft, setDraft] = useState<GraphTrigger>(initialValue ?? createBlankTrigger())
  const [conditionsText, setConditionsText] = useState(serialize(initialValue?.conditions ?? []))
  const [actionsText, setActionsText] = useState(serialize(initialValue?.actions ?? []))
  const [error, setError] = useState<string | null>(null)
  const [allowManualIdEdit, setAllowManualIdEdit] = useState(false)
  const [eventSelection, setEventSelection] = useState(resolveEventSelection(initialValue?.event ?? EventTopics.OBS_CONNECTED))
  const editing = initialValue !== undefined

  useEffect(() => {
    const nextDraft = initialValue ?? createBlankTrigger()
    setDraft(nextDraft)
    setConditionsText(serialize(nextDraft.conditions))
    setActionsText(serialize(nextDraft.actions))
    setError(null)
    setAllowManualIdEdit(false)
    setEventSelection(resolveEventSelection(nextDraft.event))
  }, [initialValue])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    try {
      const nextTrigger: GraphTrigger = {
        ...draft,
        id: draft.id.trim(),
        name: draft.name.trim(),
        event: draft.event.trim(),
        conditions: parseTriggerConditions(conditionsText),
        actions: parseTriggerActions(actionsText),
      }

      if (nextTrigger.id.length === 0) {
        throw new Error('Trigger id is required')
      }

      if (nextTrigger.name.length === 0) {
        throw new Error('Trigger name is required')
      }

      if (nextTrigger.event.length === 0) {
        throw new Error('Trigger event is required')
      }

      await onSubmit(nextTrigger)

      if (!editing) {
        const blank = createBlankTrigger()
        setDraft(blank)
        setConditionsText(serialize(blank.conditions))
        setActionsText(serialize(blank.actions))
      }

      setError(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save trigger')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="th-form">
      <div className="th-form-grid">
        <label className="th-form-field">
          <span className="th-form-label">Trigger ID</span>
          <input
            className="th-input"
            aria-label="Trigger ID"
            value={draft.id}
            disabled={editing || !allowManualIdEdit}
            onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))}
          />
        </label>
        <label className="th-form-field">
          <span className="th-form-label">Trigger Name</span>
          <input
            className="th-input"
            aria-label="Trigger Name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label className="th-form-field">
          <span className="th-form-label">Event Topic</span>
          <select
            className="th-input th-select"
            aria-label="Event Topic"
            value={eventSelection}
            onChange={(event) => {
              const nextSelection = event.target.value
              setEventSelection(nextSelection)
              if (nextSelection !== 'custom') {
                setDraft((current) => ({ ...current, event: nextSelection }))
              }
            }}
          >
            {knownEventTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>

      {!editing ? (
        <label className="th-form-field th-form-field--inline">
          <input
            className="th-checkbox"
            aria-label="Advanced Trigger Options"
            type="checkbox"
            checked={allowManualIdEdit}
            onChange={(event) => setAllowManualIdEdit(event.target.checked)}
          />
          <span>Allow manual trigger ID editing</span>
        </label>
      ) : null}

      {eventSelection === 'custom' ? (
        <label className="th-form-field">
          <span className="th-form-label">Custom Event Topic</span>
          <input
            className="th-input"
            aria-label="Custom Event Topic"
            value={draft.event}
            onChange={(event) => setDraft((current) => ({ ...current, event: event.target.value }))}
          />
        </label>
      ) : null}

      <label className="th-form-field th-form-field--inline">
        <input
          className="th-checkbox"
          aria-label="Trigger Enabled"
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))}
        />
        <span>Enabled</span>
      </label>

      <label className="th-form-field">
        <span className="th-form-label">Conditions JSON</span>
        <textarea
          className="th-textarea"
          aria-label="Conditions JSON"
          value={conditionsText}
          onChange={(event) => setConditionsText(event.target.value)}
        />
      </label>

      <label className="th-form-field">
        <span className="th-form-label">Actions JSON</span>
        <textarea
          className="th-textarea"
          aria-label="Actions JSON"
          value={actionsText}
          onChange={(event) => setActionsText(event.target.value)}
        />
      </label>

      {error ? <div className="th-form-error">{error}</div> : null}

      <div className="th-form-actions">
        <Button label={editing ? 'Save Trigger' : 'Create Trigger'} type="submit" variant="primary" />
        {editing && onCancel ? <Button label="Cancel Edit" onClick={onCancel} /> : null}
      </div>
    </form>
  )
}
