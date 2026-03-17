import { useMemo, useState } from 'react'
import type { GraphTrigger } from '../../core/trigger-engine/triggerGraphTypes'
import { Button, PanelCard, TriggerForm } from '../components'
import { Header } from '../layout/Header'
import { MainLayout } from '../layout/MainLayout'
import { Sidebar } from '../layout/Sidebar'
import type { AppNavigationItem, AppViewId } from '../navigation'

interface TriggerEditorPageProps {
  title: string
  live: boolean
  navItems: AppNavigationItem[]
  activeNavId: AppViewId
  onSelectNav: (id: AppViewId) => void
  triggers: GraphTrigger[]
  onCreateTrigger: (trigger: GraphTrigger) => Promise<void> | void
  onUpdateTrigger: (trigger: GraphTrigger) => Promise<void> | void
  onDeleteTrigger: (triggerId: string) => Promise<void> | void
  onToggleTriggerEnabled: (trigger: GraphTrigger) => Promise<void> | void
}

export const TriggerEditorPage = ({
  title,
  live,
  navItems,
  activeNavId,
  onSelectNav,
  triggers,
  onCreateTrigger,
  onUpdateTrigger,
  onDeleteTrigger,
  onToggleTriggerEnabled,
}: TriggerEditorPageProps): JSX.Element => {
  const [editingTriggerId, setEditingTriggerId] = useState<string | null>(null)

  const editingTrigger = useMemo(
    () => triggers.find((trigger) => trigger.id === editingTriggerId),
    [editingTriggerId, triggers],
  )

  return (
    <MainLayout
      sidebar={<Sidebar items={navItems} activeId={activeNavId} onSelect={onSelectNav} />}
      header={<Header title={title} live={live} />}
      main={
        <div style={{ display: 'grid', gap: 16 }}>
          <PanelCard title={editingTrigger ? 'Edit Trigger' : 'Create Trigger'}>
            <TriggerForm
              initialValue={editingTrigger}
              onSubmit={async (trigger) => {
                if (editingTrigger) {
                  await onUpdateTrigger(trigger)
                  setEditingTriggerId(null)
                  return
                }

                await onCreateTrigger(trigger)
              }}
              onCancel={() => setEditingTriggerId(null)}
            />
          </PanelCard>

          <PanelCard title="Existing Triggers">
            <div style={{ display: 'grid', gap: 10 }}>
              {triggers.map((trigger) => (
                <div
                  key={trigger.id}
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
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--th-text-primary)' }}>{trigger.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--th-text-secondary)', marginTop: 4 }}>
                        {trigger.id} · {trigger.event}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: trigger.enabled ? 'var(--th-accent)' : 'var(--th-text-muted)' }}>
                      {trigger.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--th-text-muted)' }}>
                    {trigger.actions.length} actions, {trigger.conditions.length} conditions
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button label="Edit Trigger" onClick={() => setEditingTriggerId(trigger.id)} />
                    <Button
                      label={trigger.enabled ? 'Disable Trigger' : 'Enable Trigger'}
                      onClick={() => void onToggleTriggerEnabled(trigger)}
                    />
                    <Button
                      label="Delete Trigger"
                      variant="danger"
                      onClick={() => {
                        if (editingTriggerId === trigger.id) {
                          setEditingTriggerId(null)
                        }
                        void onDeleteTrigger(trigger.id)
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
          <PanelCard title="Trigger Summary">
            <div style={{ display: 'grid', gap: 8, fontSize: 12, color: 'var(--th-text-secondary)' }}>
              <div>{triggers.length} triggers are available in the runtime.</div>
              <div>{triggers.filter((trigger) => trigger.enabled).length} triggers are currently enabled.</div>
              <div>Use JSON fields to configure complex conditions and actions.</div>
            </div>
          </PanelCard>
        </div>
      }
    />
  )
}
