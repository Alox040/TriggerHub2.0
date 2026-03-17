import type { MacroStepType } from '../../core/macro-system/macroTypes'
import { Button } from './Button'

export interface MacroStepDraft {
  id: string
  type: MacroStepType
  configText: string
}

interface MacroStepEditorProps {
  steps: MacroStepDraft[]
  onChange: (steps: MacroStepDraft[]) => void
}

const createStepId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.()
  if (randomId) {
    return `step-${randomId.slice(0, 6)}`
  }

  return `step-${Math.random().toString(16).slice(2, 8)}`
}

const createDefaultConfig = (type: MacroStepType): string => {
  switch (type) {
    case 'delay':
      return JSON.stringify({ durationMs: 1000 }, null, 2)
    case 'service_call':
      return JSON.stringify({ service: 'obs', action: 'switchScene', params: { sceneName: 'Default' } }, null, 2)
    case 'plugin_action':
      return JSON.stringify({ plugin: 'example-plugin', action: 'run', params: {} }, null, 2)
    case 'macro_call':
      return JSON.stringify({ macroId: 'macro-id', options: {} }, null, 2)
    case 'conditional':
      return JSON.stringify({
        condition: { variable: 'isLive', operator: 'equals', value: true },
        then: [],
        else: [],
      }, null, 2)
    case 'parallel':
    case 'sequence':
      return JSON.stringify({ steps: [] }, null, 2)
  }
}

const moveItem = (steps: MacroStepDraft[], from: number, to: number): MacroStepDraft[] => {
  const next = [...steps]
  const [item] = next.splice(from, 1)
  if (!item) {
    return steps
  }

  next.splice(to, 0, item)
  return next
}

export const MacroStepEditor = ({ steps, onChange }: MacroStepEditorProps): JSX.Element => {
  const updateStep = (index: number, patch: Partial<MacroStepDraft>): void => {
    onChange(steps.map((step, stepIndex) => (stepIndex === index ? { ...step, ...patch } : step)))
  }

  return (
    <div className="th-step-editor">
      {steps.map((step, index) => (
        <article key={`${step.id}-${index}`} className="th-step-card">
          <div className="th-step-card__grid">
            <label className="th-form-field">
              <span className="th-form-label">Step ID</span>
              <input
                className="th-input"
                aria-label={`Step ID ${index + 1}`}
                value={step.id}
                onChange={(event) => updateStep(index, { id: event.target.value })}
              />
            </label>
            <label className="th-form-field">
              <span className="th-form-label">Step Type</span>
              <select
                className="th-input th-select"
                aria-label={`Step Type ${index + 1}`}
                value={step.type}
                onChange={(event) => {
                  const nextType = event.target.value as MacroStepType
                  updateStep(index, { type: nextType, configText: createDefaultConfig(nextType) })
                }}
              >
                <option value="delay">delay</option>
                <option value="service_call">service_call</option>
                <option value="plugin_action">plugin_action</option>
                <option value="macro_call">macro_call</option>
                <option value="conditional">conditional</option>
                <option value="parallel">parallel</option>
                <option value="sequence">sequence</option>
              </select>
            </label>
          </div>

          <label className="th-form-field">
            <span className="th-form-label">Step Config JSON</span>
            <textarea
              className="th-textarea"
              aria-label={`Step Config ${index + 1}`}
              value={step.configText}
              onChange={(event) => updateStep(index, { configText: event.target.value })}
            />
          </label>

          <div className="th-step-card__actions">
            <Button label="Move Up" disabled={index === 0} onClick={() => onChange(moveItem(steps, index, index - 1))} />
            <Button
              label="Move Down"
              disabled={index === steps.length - 1}
              onClick={() => onChange(moveItem(steps, index, index + 1))}
            />
            <Button
              label="Delete Step"
              variant="danger"
              onClick={() => onChange(steps.filter((_, stepIndex) => stepIndex !== index))}
            />
          </div>
        </article>
      ))}

      <Button
        label="Add Step"
        onClick={() =>
          onChange([
            ...steps,
            {
              id: createStepId(),
              type: 'delay',
              configText: createDefaultConfig('delay'),
            },
          ])
        }
      />
    </div>
  )
}
