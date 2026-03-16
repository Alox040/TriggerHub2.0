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
        <div style={{ display: 'grid', gap: 16 }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--th-text-primary)' }}>{macro.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--th-text-secondary)', marginTop: 4 }}>
                        {macro.id}
                        {macro.description ? ` · ${macro.description}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: macro.enabled ? 'var(--th-accent)' : 'var(--th-text-muted)' }}>
                      {macro.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--th-text-muted)' }}>
                    {macro.steps.length} steps
                    {macro.tags && macro.tags.length > 0 ? ` · ${macro.tags.join(', ')}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                </div>
              ))}
            </div>
          </PanelCard>
        </div>
      }
      rightPanel={
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <PanelCard title="Macro Summary">
            <div style={{ display: 'grid', gap: 8, fontSize: 12, color: 'var(--th-text-secondary)' }}>
              <div>{macros.length} macros are available for execution.</div>
              <div>Reorder steps with the built-in step editor controls.</div>
              <div>Nested step groups remain editable through JSON payloads.</div>
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
