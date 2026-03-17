import { PanelCard, StatusBar, TriggerCard } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { AppNavigationItem, AppViewId } from '../navigation'
import type { DashboardViewModel, RuntimeLogEntry } from '../types'

interface DashboardPageProps {
  viewModel: DashboardViewModel
  navItems: AppNavigationItem[]
  activeNavId: AppViewId
  onSelectNav: (id: AppViewId) => void
  onToggleTrigger: (triggerId: string) => void
  runtimeLog: RuntimeLogEntry[]
}

export const DashboardPage = ({
  viewModel,
  navItems,
  activeNavId,
  onSelectNav,
  onToggleTrigger,
  runtimeLog,
}: DashboardPageProps): JSX.Element => {
  return (
    <MainLayout
      sidebar={<Sidebar items={navItems} activeId={activeNavId} onSelect={onSelectNav} />}
      header={<Header title={viewModel.title} live={viewModel.live} />}
      main={
        <>
          <div className="th-section-heading">
            <h2 className="th-section-heading__title">Trigger Controls</h2>
            <p className="th-section-heading__subtext">Toggle and manage triggers without leaving the dashboard.</p>
          </div>
          <div className="th-grid">
            {viewModel.triggers.map((trigger) => (
              <TriggerCard key={trigger.id} trigger={trigger} onToggle={onToggleTrigger} />
            ))}
          </div>
          <div className="th-statusbar">
            <StatusBar
              obsConnected={viewModel.status.obsConnected}
              spotifyConnected={viewModel.status.spotifyConnected}
              clipConnected={viewModel.status.clipConnected}
              twitchConnected={viewModel.status.twitchConnected}
            />
          </div>
        </>
      }
      rightPanel={
        <div className="th-right-panel-stack">
          <PanelCard title="Runtime Log">
            <div className="th-runtime-log">
              {runtimeLog.length === 0 ? (
                <div className="th-runtime-log__entry th-runtime-log__empty">No recent activity yet.</div>
              ) : (
                runtimeLog.map((entry) => (
                  <div className="th-runtime-log__entry" key={entry.id}>
                    <div className="th-runtime-log__timestamp">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="th-runtime-log__message">{entry.message}</div>
                  </div>
                ))
              )}
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
