import { Button, PanelCard, StatusBar } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { AppNavigationItem, AppViewId } from '../navigation'
import type { RuntimeStatusViewModel } from '../types'
import { useEffect, useState } from 'react'

interface SettingsPageProps {
  title: string
  live: boolean
  navItems: AppNavigationItem[]
  activeNavId: AppViewId
  onSelectNav: (id: AppViewId) => void
  runtimeStatus: RuntimeStatusViewModel
  triggerCount: number
  macroCount: number
  onActivateRuntime: () => void
  onDeactivateRuntime: () => void
  onConnectTwitch: () => void
  onDisconnectTwitch: () => void
  onRefreshState: () => void
  twitchConfig: {
    clientId?: string
    accessToken?: string
  }
  onUpdateTwitchConfig: (config: { clientId?: string; accessToken?: string }) => void
  obsConfig: {
    host?: string
    port?: number
    password?: string
  }
  onUpdateObsConfig: (config: { host?: string; port?: number; password?: string }) => void
}

export const SettingsPage = ({
  title,
  live,
  navItems,
  activeNavId,
  onSelectNav,
  runtimeStatus,
  triggerCount,
  macroCount,
  onActivateRuntime,
  onDeactivateRuntime,
  onConnectTwitch,
  onDisconnectTwitch,
  onRefreshState,
  twitchConfig,
  onUpdateTwitchConfig,
  obsConfig,
  onUpdateObsConfig,
}: SettingsPageProps): JSX.Element => {
  const [clientId, setClientId] = useState(twitchConfig.clientId ?? '')
  const [accessToken, setAccessToken] = useState(twitchConfig.accessToken ?? '')
  const [obsHost, setObsHost] = useState(obsConfig.host ?? '')
  const [obsPort, setObsPort] = useState(obsConfig.port?.toString() ?? '')
  const [obsPassword, setObsPassword] = useState(obsConfig.password ?? '')

  useEffect(() => {
    setClientId(twitchConfig.clientId ?? '')
    setAccessToken(twitchConfig.accessToken ?? '')
  }, [twitchConfig])

  const handleSaveTwitchConfig = (): void => {
    onUpdateTwitchConfig({
      clientId: clientId.trim() || undefined,
      accessToken: accessToken.trim() || undefined,
    })
  }

  const handleSaveObsConfig = (): void => {
    const trimmedHost = obsHost.trim()
    const parsedPort = Number.parseInt(obsPort, 10)
    onUpdateObsConfig({
      host: trimmedHost || undefined,
      port: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : undefined,
      password: obsPassword.trim() || undefined,
    })
  }

  return (
    <MainLayout
      sidebar={<Sidebar items={navItems} activeId={activeNavId} onSelect={onSelectNav} />}
      header={<Header title={title} live={live} />}
      main={
        <div className="th-stack">
          <PanelCard title="Runtime Controls">
            <div className="th-card-list__actions">
              <Button label="Activate Runtime" variant="primary" onClick={onActivateRuntime} />
              <Button label="Deactivate Runtime" onClick={onDeactivateRuntime} />
              <Button label="Refresh State" onClick={onRefreshState} />
            </div>
          </PanelCard>
          <PanelCard title="Connected Services">
            <StatusBar
              obsConnected={runtimeStatus.obsConnected}
              spotifyConnected={runtimeStatus.spotifyConnected}
              clipConnected={runtimeStatus.clipConnected}
              twitchConnected={runtimeStatus.twitchConnected}
            />
            <div className="th-section-heading__subtext">Twitch Controls</div>
            <div className="th-card-list__actions">
              <Button label="Connect Twitch" onClick={onConnectTwitch} />
              <Button label="Disconnect Twitch" onClick={onDisconnectTwitch} />
            </div>
          </PanelCard>
        </div>
      }
      rightPanel={
        <div className="th-right-panel-stack">
          <PanelCard title="OBS WebSocket">
            <div className="th-form">
              <label className="th-form-field">
                <span className="th-form-label">Host</span>
                <input
                  className="th-input"
                  value={obsHost}
                  onChange={(event) => setObsHost(event.target.value)}
                />
              </label>
              <label className="th-form-field">
                <span className="th-form-label">Port</span>
                <input
                  className="th-input"
                  value={obsPort}
                  onChange={(event) => setObsPort(event.target.value)}
                />
              </label>
              <label className="th-form-field">
                <span className="th-form-label">Password</span>
                <input
                  className="th-input"
                  type="password"
                  value={obsPassword}
                  onChange={(event) => setObsPassword(event.target.value)}
                />
              </label>
              <div className="th-form-actions">
                <Button label="Save OBS Config" variant="primary" onClick={handleSaveObsConfig} />
              </div>
              <p className="th-form-help">
                OBS WebSocket requires a running OBS instance with WebSocket server enabled.
              </p>
            </div>
          </PanelCard>
          <PanelCard title="Twitch API">
            <div className="th-form">
              <label className="th-form-field">
                <span className="th-form-label">Client ID</span>
                <input className="th-input" value={clientId} onChange={(event) => setClientId(event.target.value)} />
              </label>
              <label className="th-form-field">
                <span className="th-form-label">Access Token</span>
                <input
                  className="th-input"
                  value={accessToken}
                  onChange={(event) => setAccessToken(event.target.value)}
                />
              </label>
              <div className="th-form-actions">
                <Button label="Save Twitch Config" variant="primary" onClick={handleSaveTwitchConfig} />
              </div>
              <p className="th-form-help">
                Twitch HTTP transport requires both a client ID and access token. Changes persist for the next restart.
              </p>
            </div>
          </PanelCard>
          <PanelCard title="Configuration Snapshot">
            <div className="th-card-list__meta">
              <div>{triggerCount} triggers currently loaded.</div>
              <div>{macroCount} macros currently loaded.</div>
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
