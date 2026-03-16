import type { TriggerCardViewModel } from '../types'

interface TriggerCardProps {
  trigger: TriggerCardViewModel
  onToggle: (triggerId: string) => void
}

export const TriggerCard = ({ trigger, onToggle }: TriggerCardProps): JSX.Element => {
  const borderColor = trigger.active ? 'var(--th-accent)' : 'var(--th-border-subtle)'
  const background = trigger.active ? 'var(--th-accent-subtle)' : 'var(--th-bg-panel)'

  return (
    <button
      onClick={() => onToggle(trigger.id)}
      style={{
        border: `1px solid ${borderColor}`,
        background,
        color: 'var(--th-text-primary)',
        borderRadius: 'var(--th-radius-lg)',
        padding: '14px',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--th-text-muted)', marginBottom: 8 }}>{trigger.category}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{trigger.title}</div>
    </button>
  )
}
