export interface DeckButtonProps {
  title: string
  onClick?: () => void
}

export const DeckButton = ({ title, onClick }: DeckButtonProps): JSX.Element => {
  return (
    <button onClick={onClick} style={{ padding: '10px 12px', borderRadius: 12, cursor: 'pointer' }}>
      {title}
    </button>
  )
}
