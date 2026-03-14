import { PanelCard, StatusBar, TriggerCard } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { DashboardViewModel } from '../types'
import type { AppNavigationItem, AppViewId } from '../navigation'

interface DashboardPageProps {
  viewModel: DashboardViewModel
  navItems: AppNavigationItem[]
  activeNavId: AppViewId
  onSelectNav: (id: AppViewId) => void
  onToggleTrigger: (triggerId: string) => void
}

export const DashboardPage = ({
  viewModel,
  navItems,
  activeNavId,
  onSelectNav,
  onToggleTrigger,
}: DashboardPageProps): JSX.Element => {
  return (
    <MainLayout
      sidebar={<Sidebar items={navItems} activeId={activeNavId} onSelect={onSelectNav} />}
      header={<Header title={viewModel.title} live={viewModel.live} />}
      main={
        <>
          <h2 className="th-section-title">Trigger Controls</h2>
          <div className="th-grid">
            {viewModel.triggers.map((trigger) => (
              <TriggerCard key={trigger.id} trigger={trigger} onToggle={onToggleTrigger} />
            ))}
          </div>
          <div className="th-statusbar">
            <StatusBar
              obsConnected={viewModel.status.obsConnected}
              spotifyConnected={viewModel.status.spotifyConnected}
            />
          </div>
        </>
      }
      rightPanel={
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <PanelCard title="Active Automations">
            <div style={{ display: 'grid', gap: 8 }}>
              {viewModel.automations.map((item) => (
                <div key={item.id} style={{ border: '1px solid var(--th-border-subtle)', borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--th-text-primary)' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--th-text-muted)' }}>{item.detail}</div>
                </div>
              ))}
            </div>
          </PanelCard>
          <PanelCard title="Operations Overview">
            <div style={{ display: 'grid', gap: 8, color: 'var(--th-text-secondary)', fontSize: 12 }}>
              <div>{viewModel.triggers.length} trigger actions available from the dashboard.</div>
              <div>{viewModel.automations.length} macros currently registered in the runtime.</div>
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
