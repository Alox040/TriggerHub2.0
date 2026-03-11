export interface ButtonProps {
  label: string
  onClick?: () => void
}

export const Button = ({ label, onClick }: ButtonProps): JSX.Element => {
  return (
    <button onClick={onClick} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
      {label}
    </button>
  )
}
