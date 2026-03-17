import { useEffect, useState } from 'react'

const getUpdaterApi = (): TriggerHubElectronUpdaterApi | undefined => {
  return window.triggerHubElectron?.updater
}

const initialState: TriggerHubElectronUpdaterState = {
  status: 'disabled',
  message: 'Auto-update is not available in this environment',
  progressPercent: 0,
}

export const UpdateNotification = (): JSX.Element | null => {
  const [state, setState] = useState<TriggerHubElectronUpdaterState>(initialState)
  const updater = getUpdaterApi()

  useEffect(() => {
    if (!updater) {
      return
    }

    let mounted = true
    const unsubscribe = updater.onStateChange((nextState) => {
      if (mounted) {
        setState(nextState)
      }
    })

    void updater
      .getState()
      .then((nextState) => {
        if (mounted) {
          setState(nextState)
        }
      })
      .catch(() => {
        if (mounted) {
          setState({
            status: 'error',
            message: 'Failed to read update status',
            progressPercent: 0,
          })
        }
      })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [updater])

  if (!updater || state.status === 'disabled' || state.status === 'idle' || state.status === 'not-available') {
    return null
  }

  const canDownload = state.status === 'available'
  const canInstall = state.status === 'downloaded'
  const isBusy = state.status === 'checking' || state.status === 'downloading'

  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 12,
        width: 340,
        padding: 14,
        borderRadius: 'var(--th-radius-md)',
        border: '1px solid var(--th-accent-border)',
        background: 'rgba(14, 18, 24, 0.96)',
        boxShadow: '0 18px 48px rgba(0, 0, 0, 0.28)',
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ display: 'grid', gap: 4 }}>
        <strong style={{ fontSize: 13 }}>Desktop Update</strong>
        <div style={{ color: 'var(--th-text-secondary)', fontSize: 12 }}>{state.message ?? 'Update status changed'}</div>
        {typeof state.progressPercent === 'number' && state.status === 'downloading' ? (
          <div style={{ color: 'var(--th-text-muted)', fontSize: 12 }}>{state.progressPercent}% downloaded</div>
        ) : null}
      </div>

      {state.status === 'downloading' ? (
        <div
          aria-hidden="true"
          style={{
            height: 6,
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${state.progressPercent ?? 0}%`,
              height: '100%',
              background: 'var(--th-accent)',
            }}
          />
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {canDownload ? (
          <button
            type="button"
            onClick={() => {
              void updater.downloadUpdate()
            }}
            style={buttonStyle('primary')}
          >
            Download
          </button>
        ) : null}
        {canInstall ? (
          <button
            type="button"
            onClick={() => {
              void updater.installUpdate()
            }}
            style={buttonStyle('primary')}
          >
            Install & Restart
          </button>
        ) : null}
        {state.status === 'error' ? (
          <button
            type="button"
            onClick={() => {
              void updater.checkForUpdates()
            }}
            style={buttonStyle('secondary')}
          >
            Retry
          </button>
        ) : null}
        {isBusy ? (
          <button type="button" disabled style={buttonStyle('secondary')}>
            Working...
          </button>
        ) : null}
      </div>
    </div>
  )
}

function buttonStyle(variant: 'primary' | 'secondary') {
  if (variant === 'primary') {
    return {
      border: '1px solid var(--th-accent-border)',
      background: 'var(--th-accent)',
      color: '#04131a',
      borderRadius: 'var(--th-radius-md)',
      padding: '8px 12px',
      cursor: 'pointer',
      font: 'inherit',
      fontSize: 12,
      fontWeight: 600,
    } as const
  }

  return {
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'transparent',
    color: 'var(--th-text-primary)',
    borderRadius: 'var(--th-radius-md)',
    padding: '8px 12px',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 12,
  } as const
}
