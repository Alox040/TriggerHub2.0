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
          <div className="th-card-list">
            {plugins.map((plugin) => (
              <article className="th-card-list__item" key={plugin.id}>
                <div className="th-card-list__title">{plugin.name}</div>
                <div className="th-card-list__meta">ID: {plugin.id}</div>
              </article>
            ))}
          </div>
        </PanelCard>
      }
      rightPanel={
        <div className="th-right-panel-stack">
          <PanelCard title="Plugin Status">
            <div className="th-card-list__meta">
              {plugins.length} plugin modules are currently registered in the desktop runtime.
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
