import { Button, PanelCard, StatusBar } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { AppNavigationItem, AppViewId } from '../navigation'
import type { RuntimeStatusViewModel } from '../types'

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
}: SettingsPageProps): JSX.Element => {
  return (
    <MainLayout
      sidebar={<Sidebar items={navItems} activeId={activeNavId} onSelect={onSelectNav} />}
      header={<Header title={title} live={live} />}
      main={
        <div style={{ display: 'grid', gap: 16 }}>
          <PanelCard title="Runtime Controls">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--th-text-secondary)' }}>Twitch Controls</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button label="Connect Twitch" onClick={onConnectTwitch} />
                <Button label="Disconnect Twitch" onClick={onDisconnectTwitch} />
              </div>
            </div>
          </PanelCard>
        </div>
      }
      rightPanel={
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <PanelCard title="Configuration Snapshot">
            <div style={{ display: 'grid', gap: 8, fontSize: 12, color: 'var(--th-text-secondary)' }}>
              <div>{triggerCount} triggers currently loaded.</div>
              <div>{macroCount} macros currently loaded.</div>
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
