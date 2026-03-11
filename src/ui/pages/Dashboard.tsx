import { PanelCard, StatusBar, TriggerCard } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { DashboardViewModel } from '../types'

interface DashboardPageProps {
  viewModel: DashboardViewModel
  activeNavId: string
  onSelectNav: (id: string) => void
  onToggleTrigger: (triggerId: string) => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'scenes', label: 'Scenes & Sources' },
  { id: 'triggers', label: 'Quick Triggers' },
  { id: 'automations', label: 'Automations' },
]

export const DashboardPage = ({
  viewModel,
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
        </div>
      }
    />
  )
}
