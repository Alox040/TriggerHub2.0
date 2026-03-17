import { useEffect, useState } from 'react'
import { Button } from './Button'

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
    <div className="th-update-toast">
      <div className="th-update-toast__body">
        <strong className="th-update-toast__title">Desktop Update</strong>
        <div className="th-toast__message">{state.message ?? 'Update status changed'}</div>
        {typeof state.progressPercent === 'number' && state.status === 'downloading' ? (
          <div className="th-toast__message">{state.progressPercent}% downloaded</div>
        ) : null}
      </div>

      {state.status === 'downloading' ? (
        <div aria-hidden="true" className="th-update-toast__progress">
          <div className="th-update-toast__progress-bar" style={{ width: `${state.progressPercent ?? 0}%` }} />
        </div>
      ) : null}

      <div className="th-update-toast__actions">
        {canDownload ? (
          <Button
            label="Download"
            variant="primary"
            className="th-button--compact"
            onClick={() => {
              void updater.downloadUpdate()
            }}
          />
        ) : null}
        {canInstall ? (
          <Button
            label="Install & Restart"
            variant="primary"
            className="th-button--compact"
            onClick={() => {
              void updater.installUpdate()
            }}
          />
        ) : null}
        {state.status === 'error' ? (
          <Button
            label="Retry"
            className="th-button--compact"
            onClick={() => {
              void updater.checkForUpdates()
            }}
          />
        ) : null}
        {isBusy ? (
          <Button label="Working..." disabled className="th-button--compact" />
        ) : null}
      </div>
    </div>
  )
}
