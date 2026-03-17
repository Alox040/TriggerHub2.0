export interface ButtonProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
  className?: string
}

const getVariantClass = (variant: ButtonProps['variant']): string => {
  switch (variant) {
    case 'primary':
      return 'th-button--primary'
    case 'danger':
      return 'th-button--danger'
    default:
      return 'th-button--ghost'
  }
}

export const Button = ({
  label,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'default',
  className,
}: ButtonProps): JSX.Element => {
  const classes = [
    'th-button',
    getVariantClass(variant),
    disabled ? 'th-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button onClick={onClick} type={type} disabled={disabled} className={classes}>
      {label}
    </button>
  )
}
