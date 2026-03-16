import type { CSSProperties } from 'react'
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
    <div style={{ display: 'grid', gap: 12 }}>
      {steps.map((step, index) => (
        <div
          key={`${step.id}-${index}`}
          style={{
            border: '1px solid var(--th-border-subtle)',
            borderRadius: 'var(--th-radius-md)',
            padding: 12,
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'minmax(160px, 1fr) minmax(140px, 180px)' }}>
            <label style={fieldStyle}>
              <span>Step ID</span>
              <input
                aria-label={`Step ID ${index + 1}`}
                value={step.id}
                onChange={(event) => updateStep(index, { id: event.target.value })}
                style={inputStyle}
              />
            </label>
            <label style={fieldStyle}>
              <span>Step Type</span>
              <select
                aria-label={`Step Type ${index + 1}`}
                value={step.type}
                onChange={(event) => {
                  const nextType = event.target.value as MacroStepType
                  updateStep(index, { type: nextType, configText: createDefaultConfig(nextType) })
                }}
                style={inputStyle}
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

          <label style={fieldStyle}>
            <span>Step Config JSON</span>
            <textarea
              aria-label={`Step Config ${index + 1}`}
              value={step.configText}
              onChange={(event) => updateStep(index, { configText: event.target.value })}
              style={textareaStyle}
            />
          </label>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        </div>
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
