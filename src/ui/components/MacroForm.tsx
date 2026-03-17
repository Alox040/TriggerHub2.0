import { useEffect, useState, type FormEvent } from 'react'
import type {
  ConditionalStep,
  DelayStep,
  MacroCallStep,
  MacroDefinition,
  MacroStep,
  MacroStepType,
  ParallelStep,
  PluginActionStep,
  SequenceStep,
  ServiceCallStep,
} from '../../core/macro-system/macroTypes'
import { Button } from './Button'
import { MacroStepEditor, type MacroStepDraft } from './MacroStepEditor'

interface MacroFormProps {
  initialValue?: MacroDefinition
  onSubmit: (macro: MacroDefinition) => Promise<void> | void
  onCancel?: () => void
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const serialize = (value: unknown): string => JSON.stringify(value, null, 2)

const createDraftId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.()
  if (randomId) {
    return randomId.slice(0, 8)
  }

  return `macro-${Math.random().toString(16).slice(2, 8)}`
}

const createBlankMacro = (): MacroDefinition => ({
  id: createDraftId(),
  name: '',
  description: '',
  enabled: true,
  steps: [],
  variables: {},
  tags: [],
})

const createStepDraft = (step: MacroStep): MacroStepDraft => {
  switch (step.type) {
    case 'delay':
      return { id: step.id, type: step.type, configText: serialize({ durationMs: step.durationMs }) }
    case 'service_call':
      return {
        id: step.id,
        type: step.type,
        configText: serialize({ service: step.service, action: step.action, params: step.params ?? {} }),
      }
    case 'plugin_action':
      return {
        id: step.id,
        type: step.type,
        configText: serialize({ plugin: step.plugin, action: step.action, params: step.params ?? {} }),
      }
    case 'macro_call':
      return {
        id: step.id,
        type: step.type,
        configText: serialize({ macroId: step.macroId, options: step.options ?? {} }),
      }
    case 'conditional':
      return {
        id: step.id,
        type: step.type,
        configText: serialize({ condition: step.condition, then: step.then, else: step.else ?? [] }),
      }
    case 'parallel':
    case 'sequence':
      return { id: step.id, type: step.type, configText: serialize({ steps: step.steps }) }
  }
}

const parseStep = (draft: MacroStepDraft): MacroStep => {
  const parsed = JSON.parse(draft.configText.trim() || '{}') as unknown
  if (!isRecord(parsed)) {
    throw new Error(`Step "${draft.id}" config must be a JSON object`)
  }

  const id = draft.id.trim()
  if (id.length === 0) {
    throw new Error('Each step must have an id')
  }

  const type = draft.type as MacroStepType

  switch (type) {
    case 'delay':
      return {
        id,
        type,
        durationMs: typeof parsed.durationMs === 'number' ? parsed.durationMs : 0,
      } satisfies DelayStep
    case 'service_call':
      if (typeof parsed.service !== 'string' || typeof parsed.action !== 'string') {
        throw new Error(`Step "${id}" requires service and action`)
      }
      return {
        id,
        type,
        service: parsed.service,
        action: parsed.action,
        params: isRecord(parsed.params) ? parsed.params : undefined,
      } satisfies ServiceCallStep
    case 'plugin_action':
      if (typeof parsed.plugin !== 'string' || typeof parsed.action !== 'string') {
        throw new Error(`Step "${id}" requires plugin and action`)
      }
      return {
        id,
        type,
        plugin: parsed.plugin,
        action: parsed.action,
        params: isRecord(parsed.params) ? parsed.params : undefined,
      } satisfies PluginActionStep
    case 'macro_call':
      if (typeof parsed.macroId !== 'string') {
        throw new Error(`Step "${id}" requires macroId`)
      }
      return {
        id,
        type,
        macroId: parsed.macroId,
        options: isRecord(parsed.options) ? parsed.options : undefined,
      } satisfies MacroCallStep
    case 'conditional':
      if (!isRecord(parsed.condition) || !Array.isArray(parsed.then)) {
        throw new Error(`Step "${id}" requires condition and then arrays`)
      }
      return {
        id,
        type,
        condition: {
          variable: String(parsed.condition.variable ?? ''),
          operator: String(parsed.condition.operator ?? 'equals') as ConditionalStep['condition']['operator'],
          value: parsed.condition.value,
        },
        then: parsed.then as MacroStep[],
        else: Array.isArray(parsed.else) ? (parsed.else as MacroStep[]) : undefined,
      } satisfies ConditionalStep
    case 'parallel':
      if (!Array.isArray(parsed.steps)) {
        throw new Error(`Step "${id}" requires a steps array`)
      }
      return { id, type, steps: parsed.steps as MacroStep[] } satisfies ParallelStep
    case 'sequence':
      if (!Array.isArray(parsed.steps)) {
        throw new Error(`Step "${id}" requires a steps array`)
      }
      return { id, type, steps: parsed.steps as MacroStep[] } satisfies SequenceStep
  }
}

export const MacroForm = ({ initialValue, onSubmit, onCancel }: MacroFormProps): JSX.Element => {
  const [draft, setDraft] = useState<MacroDefinition>(initialValue ?? createBlankMacro())
  const [variablesText, setVariablesText] = useState(serialize(initialValue?.variables ?? {}))
  const [tagsText, setTagsText] = useState((initialValue?.tags ?? []).join(', '))
  const [stepDrafts, setStepDrafts] = useState<MacroStepDraft[]>((initialValue?.steps ?? []).map(createStepDraft))
  const [error, setError] = useState<string | null>(null)
  const editing = initialValue !== undefined

  useEffect(() => {
    const nextDraft = initialValue ?? createBlankMacro()
    setDraft(nextDraft)
    setVariablesText(serialize(nextDraft.variables ?? {}))
    setTagsText((nextDraft.tags ?? []).join(', '))
    setStepDrafts((nextDraft.steps ?? []).map(createStepDraft))
    setError(null)
  }, [initialValue])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    try {
      const parsedVariables = JSON.parse(variablesText.trim() || '{}') as unknown
      if (!isRecord(parsedVariables)) {
        throw new Error('Variables must be a JSON object')
      }

      const nextMacro: MacroDefinition = {
        ...draft,
        id: draft.id.trim(),
        name: draft.name.trim(),
        description: draft.description?.trim() || undefined,
        tags: tagsText
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        variables: parsedVariables,
        steps: stepDrafts.map(parseStep),
      }

      if (nextMacro.id.length === 0) {
        throw new Error('Macro id is required')
      }

      if (nextMacro.name.length === 0) {
        throw new Error('Macro name is required')
      }

      await onSubmit(nextMacro)

      if (!editing) {
        const blank = createBlankMacro()
        setDraft(blank)
        setVariablesText(serialize(blank.variables ?? {}))
        setTagsText('')
        setStepDrafts([])
      }

      setError(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save macro')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="th-form">
      <div className="th-form-grid">
        <label className="th-form-field">
          <span className="th-form-label">Macro ID</span>
          <input
            className="th-input"
            aria-label="Macro ID"
            value={draft.id}
            disabled
            onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))}
          />
        </label>
        <label className="th-form-field">
          <span className="th-form-label">Macro Name</span>
          <input
            className="th-input"
            aria-label="Macro Name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
      </div>

      <label className="th-form-field">
        <span className="th-form-label">Description</span>
        <textarea
          className="th-textarea"
          aria-label="Macro Description"
          value={draft.description ?? ''}
          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          rows={3}
        />
      </label>

      <label className="th-form-field th-form-field--inline">
        <input
          className="th-checkbox"
          aria-label="Macro Enabled"
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))}
        />
        <span>Enabled</span>
      </label>

      <label className="th-form-field">
        <span className="th-form-label">Variables JSON</span>
        <textarea
          className="th-textarea"
          aria-label="Variables JSON"
          value={variablesText}
          onChange={(event) => setVariablesText(event.target.value)}
        />
      </label>

      <label className="th-form-field">
        <span className="th-form-label">Tags</span>
        <input
          className="th-input"
          aria-label="Macro Tags"
          value={tagsText}
          onChange={(event) => setTagsText(event.target.value)}
          placeholder="intro, stream, scene"
        />
      </label>

      <div className="th-form-field">
        <span className="th-form-label">Macro Steps</span>
        <MacroStepEditor steps={stepDrafts} onChange={setStepDrafts} />
      </div>

      {error ? <div className="th-form-error">{error}</div> : null}

      <div className="th-form-actions">
        <Button label={editing ? 'Save Macro' : 'Create Macro'} type="submit" variant="primary" />
        {editing && onCancel ? <Button label="Cancel Edit" onClick={onCancel} /> : null}
      </div>
    </form>
  )
}
