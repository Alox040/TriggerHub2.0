import { useMemo, useState } from 'react'
import type { MacroDefinition } from '../../core/macro-system/macroTypes'
import { Button, MacroForm, PanelCard } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { AppNavigationItem, AppViewId } from '../navigation'

interface MacroEditorPageProps {
  title: string
  live: boolean
  navItems: AppNavigationItem[]
  activeNavId: AppViewId
  onSelectNav: (id: AppViewId) => void
  macros: MacroDefinition[]
  onCreateMacro: (macro: MacroDefinition) => Promise<void> | void
  onUpdateMacro: (macro: MacroDefinition) => Promise<void> | void
  onDeleteMacro: (macroId: string) => Promise<void> | void
  onRunMacro: (macroId: string) => Promise<void> | void
}

export const MacroEditorPage = ({
  title,
  live,
  navItems,
  activeNavId,
  onSelectNav,
  macros,
  onCreateMacro,
  onUpdateMacro,
  onDeleteMacro,
  onRunMacro,
}: MacroEditorPageProps): JSX.Element => {
  const [editingMacroId, setEditingMacroId] = useState<string | null>(null)

  const editingMacro = useMemo(
    () => macros.find((macro) => macro.id === editingMacroId),
    [editingMacroId, macros],
  )

  return (
    <MainLayout
      sidebar={<Sidebar items={navItems} activeId={activeNavId} onSelect={onSelectNav} />}
      header={<Header title={title} live={live} />}
      main={
        <div className="th-stack">
          <PanelCard title={editingMacro ? 'Edit Macro' : 'Create Macro'}>
            <MacroForm
              initialValue={editingMacro}
              onSubmit={async (macro) => {
                if (editingMacro) {
                  await onUpdateMacro(macro)
                  setEditingMacroId(null)
                  return
                }

                await onCreateMacro(macro)
              }}
              onCancel={() => setEditingMacroId(null)}
            />
          </PanelCard>

          <PanelCard title="Macro Library">
            <div className="th-card-list">
              {macros.map((macro) => (
                <article className="th-card-list__item" key={macro.id}>
                  <div className="th-card-list__row">
                    <div>
                      <div className="th-card-list__title">{macro.name}</div>
                      <div className="th-card-list__meta">
                        {macro.id}
                        {macro.description ? ` · ${macro.description}` : ''}
                      </div>
                    </div>
                    <span
                      className={`th-card-list__status ${
                        macro.enabled ? 'th-card-list__status--active' : 'th-card-list__status--inactive'
                      }`}
                    >
                      {macro.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="th-card-list__meta">
                    {macro.steps.length} steps
                    {macro.tags && macro.tags.length > 0 ? ` · ${macro.tags.join(', ')}` : ''}
                  </div>
                  <div className="th-card-list__actions">
                    <Button label="Edit Macro" onClick={() => setEditingMacroId(macro.id)} />
                    <Button label="Run Macro" onClick={() => void onRunMacro(macro.id)} />
                    <Button
                      label="Delete Macro"
                      variant="danger"
                      onClick={() => {
                        if (editingMacroId === macro.id) {
                          setEditingMacroId(null)
                        }
                        void onDeleteMacro(macro.id)
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </PanelCard>
        </div>
      }
      rightPanel={
        <div className="th-right-panel-stack">
          {editingMacro ? (
            <PanelCard title="Macro Details">
              <div className="th-card-list__meta">
                <div>
                  <span className="th-card-list__title">{editingMacro.name}</span> · {editingMacro.id}
                </div>
                <div>Status: {editingMacro.enabled ? 'Enabled' : 'Disabled'}</div>
                <div>Steps: {editingMacro.steps.length}</div>
                <div className="th-runtime-log__message">
                  {editingMacro.steps.map((step) => `${step.type}: ${step.id}`).join(', ') ||
                    'No steps defined yet.'}
                </div>
              </div>
            </PanelCard>
          ) : (
            <PanelCard title="Macros Info">
              <div className="th-card-list__meta">
                <div>{macros.length} macros are available for execution.</div>
                <div>Use the editor above to create or edit macros.</div>
                <div>Running a macro triggers the runtime log entries on the dashboard.</div>
              </div>
            </PanelCard>
          )}
        </div>
      }
    />
  )
}
