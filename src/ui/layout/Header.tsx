interface HeaderProps {
  title: string
  live: boolean
}

export const Header = ({ title, live }: HeaderProps): JSX.Element => {
  return (
    <header className="th-header">
      <h1 style={{ margin: 0, fontSize: 18 }}>{title}</h1>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid rgba(45,212,191,0.3)',
          background: 'rgba(45,212,191,0.1)',
          borderRadius: 'var(--th-radius-md)',
          padding: '4px 10px',
          color: 'var(--th-accent)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 99,
            background: live ? 'var(--th-accent)' : 'var(--th-danger)',
          }}
        />
        {live ? 'Stream Live' : 'Offline'}
      </div>
    </header>
  )
}
