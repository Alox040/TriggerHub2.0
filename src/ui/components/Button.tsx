import type { CSSProperties } from 'react'

export interface ButtonProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
}

const baseStyle: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 'var(--th-radius-md)',
  border: '1px solid var(--th-border-weak)',
  background: 'var(--th-bg-panel)',
  color: 'var(--th-text-primary)',
  font: 'inherit',
  lineHeight: 1.2,
  cursor: 'pointer',
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, CSSProperties> = {
  default: {
    borderColor: 'var(--th-border-weak)',
    background: 'var(--th-bg-panel)',
    color: 'var(--th-text-primary)',
  },
  primary: {
    borderColor: 'var(--th-accent)',
    background: 'var(--th-accent)',
    color: 'var(--th-bg-shell)',
  },
  danger: {
    borderColor: 'var(--th-danger)',
    background: 'var(--th-bg-panel)',
    color: 'var(--th-danger)',
  },
}

export const Button = ({
  label,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'default',
}: ButtonProps): JSX.Element => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        borderColor: disabled ? 'var(--th-border-subtle)' : variantStyles[variant].borderColor,
        color: disabled ? 'var(--th-text-muted)' : variantStyles[variant].color,
      }}
    >
      {label}
    </button>
  )
}
