import { Button, PanelCard } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { AppNavigationItem, AppViewId } from '../navigation'
import type { GraphTrigger } from '../../core/trigger-engine/triggerGraphTypes'
import type { MacroDefinition } from '../../core/macro-system/macroTypes'

interface EditorPageProps {
  title: string
  live: boolean
  navItems: AppNavigationItem[]
  activeNavId: AppViewId
  onSelectNav: (id: AppViewId) => void
  triggers: GraphTrigger[]
  macros: MacroDefinition[]
  onRunMacro: (macroId: string) => void
}

export const EditorPage = ({
  title,
  live,
  navItems,
  activeNavId,
  onSelectNav,
  triggers,
  macros,
  onRunMacro,
}: EditorPageProps): JSX.Element => {
  return (
    <MainLayout
      sidebar={<Sidebar items={navItems} activeId={activeNavId} onSelect={onSelectNav} />}
      header={<Header title={title} live={live} />}
      main={
        <div style={{ display: 'grid', gap: 16 }}>
          <PanelCard title="Trigger Definitions">
            <div style={{ display: 'grid', gap: 10 }}>
              {triggers.map((trigger) => (
                <div
                  key={trigger.id}
                  style={{
                    border: '1px solid var(--th-border-subtle)',
                    borderRadius: 'var(--th-radius-md)',
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 14, color: 'var(--th-text-primary)', fontWeight: 600 }}>{trigger.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--th-text-secondary)', marginTop: 6 }}>
                    Event: {trigger.event}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--th-text-muted)', marginTop: 4 }}>
                    {trigger.actions.length} actions, {trigger.conditions.length} conditions, {trigger.enabled ? 'enabled' : 'disabled'}
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
          <PanelCard title="Macro Library">
            <div style={{ display: 'grid', gap: 10 }}>
              {macros.map((macro) => (
                <div
                  key={macro.id}
                  style={{
                    border: '1px solid var(--th-border-subtle)',
                    borderRadius: 'var(--th-radius-md)',
                    padding: 12,
                    display: 'grid',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 14, color: 'var(--th-text-primary)', fontWeight: 600 }}>{macro.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--th-text-secondary)' }}>
                    {macro.steps.length} steps, {macro.enabled ? 'enabled' : 'disabled'}
                  </div>
                  <div>
                    <Button label="Run Macro" onClick={() => onRunMacro(macro.id)} />
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>
      }
      rightPanel={
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <PanelCard title="Editing Focus">
            <div style={{ display: 'grid', gap: 8, color: 'var(--th-text-secondary)', fontSize: 12 }}>
              <div>{triggers.length} triggers are available for inspection.</div>
              <div>{macros.length} macros can be reviewed or executed from this view.</div>
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
