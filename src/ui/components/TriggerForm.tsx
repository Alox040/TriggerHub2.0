import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import type { TriggerCondition } from '../../core/trigger-engine/triggerConditions'
import type { GraphTrigger, TriggerAction } from '../../core/trigger-engine/triggerGraphTypes'
import { EventTopics } from '../../types'
import { Button } from './Button'

interface TriggerFormProps {
  initialValue?: GraphTrigger
  onSubmit: (trigger: GraphTrigger) => Promise<void> | void
  onCancel?: () => void
}

const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
}

const inputStyle: CSSProperties = {
  border: '1px solid var(--th-border-subtle)',
  borderRadius: 'var(--th-radius-md)',
  background: 'var(--th-bg-main)',
  color: 'var(--th-text-primary)',
  padding: '10px 12px',
  font: 'inherit',
}

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 96,
  resize: 'vertical',
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

const knownEventTopics = Object.values(EventTopics)

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
    <form onSubmit={(event) => void handleSubmit(event)} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <label style={fieldStyle}>
          <span>Trigger ID</span>
          <input
            aria-label="Trigger ID"
            value={draft.id}
            disabled={editing || !allowManualIdEdit}
            onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={fieldStyle}>
          <span>Trigger Name</span>
          <input
            aria-label="Trigger Name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={fieldStyle}>
          <span>Event Topic</span>
          <select
            aria-label="Event Topic"
            value={eventSelection}
            onChange={(event) => {
              const nextSelection = event.target.value
              setEventSelection(nextSelection)
              if (nextSelection !== 'custom') {
                setDraft((current) => ({ ...current, event: nextSelection }))
              }
            }}
            style={inputStyle}
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
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--th-text-secondary)' }}>
          <input
            aria-label="Advanced Trigger Options"
            type="checkbox"
            checked={allowManualIdEdit}
            onChange={(event) => setAllowManualIdEdit(event.target.checked)}
          />
          Allow manual trigger ID editing
        </label>
      ) : null}

      {eventSelection === 'custom' ? (
        <label style={fieldStyle}>
          <span>Custom Event Topic</span>
          <input
            aria-label="Custom Event Topic"
            value={draft.event}
            onChange={(event) => setDraft((current) => ({ ...current, event: event.target.value }))}
            style={inputStyle}
          />
        </label>
      ) : null}

      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--th-text-secondary)' }}>
        <input
          aria-label="Trigger Enabled"
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))}
        />
        Enabled
      </label>

      <label style={fieldStyle}>
        <span>Conditions JSON</span>
        <textarea
          aria-label="Conditions JSON"
          value={conditionsText}
          onChange={(event) => setConditionsText(event.target.value)}
          style={textareaStyle}
        />
      </label>

      <label style={fieldStyle}>
        <span>Actions JSON</span>
        <textarea
          aria-label="Actions JSON"
          value={actionsText}
          onChange={(event) => setActionsText(event.target.value)}
          style={textareaStyle}
        />
      </label>

      {error ? <div style={{ color: 'var(--th-danger)', fontSize: 12 }}>{error}</div> : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button label={editing ? 'Save Trigger' : 'Create Trigger'} type="submit" variant="primary" />
        {editing && onCancel ? <Button label="Cancel Edit" onClick={onCancel} /> : null}
      </div>
    </form>
  )
}
