import { PanelCard } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { AppNavigationItem, AppViewId } from '../navigation'

interface PluginSummary {
  id: string
  name: string
}

interface PluginsPageProps {
  title: string
  live: boolean
  navItems: AppNavigationItem[]
  activeNavId: AppViewId
  onSelectNav: (id: AppViewId) => void
  plugins: PluginSummary[]
}

export const PluginsPage = ({
  title,
  live,
  navItems,
  activeNavId,
  onSelectNav,
  plugins,
}: PluginsPageProps): JSX.Element => {
  return (
    <MainLayout
      sidebar={<Sidebar items={navItems} activeId={activeNavId} onSelect={onSelectNav} />}
      header={<Header title={title} live={live} />}
      main={
        <PanelCard title="Installed Plugins">
          <div style={{ display: 'grid', gap: 10 }}>
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                style={{
                  border: '1px solid var(--th-border-subtle)',
                  borderRadius: 'var(--th-radius-md)',
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--th-text-primary)' }}>{plugin.name}</div>
                <div style={{ fontSize: 12, color: 'var(--th-text-secondary)', marginTop: 6 }}>ID: {plugin.id}</div>
              </div>
            ))}
          </div>
        </PanelCard>
      }
      rightPanel={
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <PanelCard title="Plugin Status">
            <div style={{ fontSize: 12, color: 'var(--th-text-secondary)' }}>
              {plugins.length} plugin modules are currently registered in the desktop runtime.
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
