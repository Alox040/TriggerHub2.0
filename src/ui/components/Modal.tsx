import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
}

export const Modal = ({ title, children }: ModalProps): JSX.Element => {
  return (
    <div style={{ border: '1px solid var(--th-border-subtle)', borderRadius: 12, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  )
}
