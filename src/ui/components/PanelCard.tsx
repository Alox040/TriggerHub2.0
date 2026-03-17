import type { ReactNode } from 'react'

interface PanelCardProps {
  title: string
  children: ReactNode
}

export const PanelCard = ({ title, children }: PanelCardProps): JSX.Element => {
  return (
    <section className="th-panel">
      <div className="th-panel__title">{title}</div>
      <div className="th-panel__body">{children}</div>
    </section>
  )
}
