interface HeaderProps {
  title: string
  live: boolean
}

export const Header = ({ title, live }: HeaderProps): JSX.Element => {
  const badgeBorder = live ? 'var(--th-accent-border)' : 'var(--th-border-weak)'
  const badgeBackground = live ? 'var(--th-accent-subtle)' : 'var(--th-bg-panel)'
  const badgeColor = live ? 'var(--th-accent)' : 'var(--th-text-muted)'

  return (
    <header className="th-header">
      <h1 style={{ margin: 0, fontSize: 18 }}>{title}</h1>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          border: `1px solid ${badgeBorder}`,
          background: badgeBackground,
          borderRadius: 'var(--th-radius-md)',
          padding: '4px 10px',
          color: badgeColor,
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
            background: badgeColor,
          }}
        />
        {live ? 'Services Active' : 'Offline'}
      </div>
    </header>
  )
}
