interface StatusBarProps {
  obsConnected: boolean
  spotifyConnected: boolean
}

export const StatusBar = ({ obsConnected, spotifyConnected }: StatusBarProps): JSX.Element => {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 16,
        alignItems: 'center',
        border: '1px solid var(--th-border-subtle)',
        borderRadius: 999,
        padding: '8px 16px',
        background: 'rgba(24,24,27,0.9)',
        fontSize: 12,
        color: 'var(--th-text-secondary)',
      }}
    >
      <span style={{ color: obsConnected ? 'var(--th-accent)' : 'var(--th-danger)' }}>
        OBS {obsConnected ? 'connected' : 'not connected'}
      </span>
      <span style={{ color: spotifyConnected ? 'var(--th-accent)' : 'var(--th-danger)' }}>
        Spotify {spotifyConnected ? 'connected' : 'not connected'}
      </span>
    </div>
  )
}
