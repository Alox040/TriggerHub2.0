import type { ReactNode } from 'react'

interface PanelCardProps {
  title: string
  children: ReactNode
}

export const PanelCard = ({ title, children }: PanelCardProps): JSX.Element => {
  return (
    <section
      style={{
        border: '1px solid var(--th-border-subtle)',
        borderRadius: 'var(--th-radius-lg)',
        background: 'var(--th-bg-panel)',
        padding: 14,
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: 13, color: 'var(--th-text-secondary)' }}>{title}</h3>
      {children}
    </section>
  )
}
