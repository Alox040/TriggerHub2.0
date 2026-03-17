import type { TriggerCardViewModel } from '../types'

interface TriggerCardProps {
  trigger: TriggerCardViewModel
  onToggle: (triggerId: string) => void
}

export const TriggerCard = ({ trigger, onToggle }: TriggerCardProps): JSX.Element => {
  const className = ['th-trigger-card', trigger.active ? 'th-trigger-card--active' : null].filter(Boolean).join(' ')

  return (
    <button onClick={() => onToggle(trigger.id)} className={className} type="button">
      <div className="th-trigger-card__category">{trigger.category}</div>
      <div className="th-trigger-card__title">{trigger.title}</div>
    </button>
  )
}
