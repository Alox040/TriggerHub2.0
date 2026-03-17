interface StatusBarProps {
  obsConnected: boolean
  spotifyConnected: boolean
  clipConnected: boolean
  twitchConnected: boolean
}

const getStatusColor = (connected: boolean): string => (connected ? 'var(--th-accent)' : 'var(--th-danger)')

export const StatusBar = ({
  obsConnected,
  spotifyConnected,
  clipConnected,
  twitchConnected,
}: StatusBarProps): JSX.Element => {
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
      <span style={{ color: getStatusColor(obsConnected) }}>
        OBS {obsConnected ? 'connected' : 'not connected'}
      </span>
      <span style={{ color: getStatusColor(spotifyConnected) }}>
        Spotify {spotifyConnected ? 'connected' : 'not connected'}
      </span>
      <span style={{ color: getStatusColor(clipConnected) }}>
        Clip {clipConnected ? 'connected' : 'not connected'}
      </span>
      <span style={{ color: getStatusColor(twitchConnected) }}>
        Twitch {twitchConnected ? 'connected' : 'not connected'}
      </span>
    </div>
  )
}
