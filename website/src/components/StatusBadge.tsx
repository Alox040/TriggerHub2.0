import { cn } from './ui/utils'

export type StatusBadgeStatus = 'live' | 'in-dev' | 'planned'

const statusConfig: Record<StatusBadgeStatus, { label: string; className: string }> = {
  live: {
    label: 'Live',
    className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  },
  'in-dev': {
    label: 'In Entwicklung',
    className: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  },
  planned: {
    label: 'Roadmap',
    className: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
  },
}

type StatusBadgeProps = {
  status: StatusBadgeStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
