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
        <div className="th-stack">
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
            <div className="th-card-list">
              {triggers.map((trigger) => (
                <article className="th-card-list__item" key={trigger.id}>
                  <div className="th-card-list__row">
                    <div>
                      <div className="th-card-list__title">{trigger.name}</div>
                      <div className="th-card-list__meta">
                        {trigger.id} · {trigger.event}
                      </div>
                    </div>
                    <span
                      className={`th-card-list__status ${
                        trigger.enabled ? 'th-card-list__status--active' : 'th-card-list__status--inactive'
                      }`}
                    >
                      {trigger.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="th-card-list__meta">
                    {trigger.actions.length} actions · {trigger.conditions.length} conditions
                  </div>
                  <div className="th-card-list__actions">
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
                </article>
              ))}
            </div>
          </PanelCard>
        </div>
      }
      rightPanel={
        <div className="th-right-panel-stack">
          {editingTrigger ? (
            <PanelCard title="Trigger Details">
              <div className="th-card-list__meta">
                <div>
                  <span className="th-card-list__title">{editingTrigger.name}</span> · {editingTrigger.id}
                </div>
                <div>Event: {editingTrigger.event}</div>
                <div>Status: {editingTrigger.enabled ? 'Enabled' : 'Disabled'}</div>
                <div>
                  Conditions: {editingTrigger.conditions.length} · Actions: {editingTrigger.actions.length}
                </div>
                <div className="th-runtime-log__message">
                  {editingTrigger.actions.length > 0
                    ? editingTrigger.actions.map((action, index) => `${index + 1}. ${action.type}`).join(', ')
                    : 'No actions configured yet.'}
                </div>
              </div>
            </PanelCard>
          ) : (
            <PanelCard title="Triggers Info">
              <div className="th-card-list__meta">
                <div>{triggers.length} triggers are available in the runtime.</div>
                <div>{triggers.filter((trigger) => trigger.enabled).length} triggers are currently enabled.</div>
                <div>Select an existing trigger to edit its details.</div>
              </div>
            </PanelCard>
          )}
        </div>
      }
    />
  )
}
