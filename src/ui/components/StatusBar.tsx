interface StatusBarProps {
  obsConnected: boolean
  spotifyConnected: boolean
  clipConnected: boolean
  twitchConnected: boolean
}

const getStatusModifier = (connected: boolean): string =>
  connected ? 'th-status-pill--connected' : 'th-status-pill--disconnected'

export const StatusBar = ({
  obsConnected,
  spotifyConnected,
  clipConnected,
  twitchConnected,
}: StatusBarProps): JSX.Element => {
  return (
    <div className="th-status-pill-group">
      <span className={`th-status-pill ${getStatusModifier(obsConnected)}`}>OBS {obsConnected ? 'connected' : 'not connected'}</span>
      <span className={`th-status-pill ${getStatusModifier(spotifyConnected)}`}>
        Spotify {spotifyConnected ? 'connected' : 'not connected'}
      </span>
      <span className={`th-status-pill ${getStatusModifier(clipConnected)}`}>Clip {clipConnected ? 'connected' : 'not connected'}</span>
      <span className={`th-status-pill ${getStatusModifier(twitchConnected)}`}>
        Twitch {twitchConnected ? 'connected' : 'not connected'}
      </span>
    </div>
  )
}
