import { useEffect, useRef, useState } from 'react'
import { DashboardPage, MacroEditorPage, PluginsPage, SettingsPage, TriggerEditorPage } from './ui/pages'
import { EventTopics } from './types'
import type { DashboardState, EditorState, PluginsState, SettingsState } from './types'
import { ErrorBoundary, UpdateNotification } from './ui/components'
import type { DashboardViewModel, RuntimeStatusViewModel } from './ui/types'
import { useAppContext } from './app/AppContext'
import { appNavigationItems, type AppViewId } from './ui/navigation'
import type { GraphTrigger } from './core/trigger-engine/triggerGraphTypes'
import type { MacroDefinition } from './core/macro-system/macroTypes'

function toDashboardViewModel(state: DashboardState): DashboardViewModel {
  return {
    title: 'TriggerHub 2.0',
    live: false,
    triggers: state.activeTriggers.map((t) => ({
      id: t.id,
      title: t.name,
      category: '',
      active: t.enabled,
    })),
    automations: state.activeMacros.map((m) => ({
      id: m.id,
      title: m.name,
      detail: '',
    })),
    status: {
      obsConnected: state.connectedServices.obs,
      spotifyConnected: state.connectedServices.spotify,
      clipConnected: state.connectedServices.clip,
      twitchConnected: state.connectedServices.twitch,
    },
  }
}

export const App = (): JSX.Element => {
  const { appFacade: facade, eventBus } = useAppContext()
  const [activeNavId, setActiveNavId] = useState<AppViewId>('dashboard')
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null)
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [pluginsState, setPluginsState] = useState<PluginsState | null>(null)
  const [settingsState, setSettingsState] = useState<SettingsState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const hasLoadedInitialState = useRef(false)

  const refreshDashboard = async (): Promise<void> => {
    const nextDashboardState = await facade.getDashboardState()
    setDashboardState(nextDashboardState)
  }

  const refreshEditor = async (): Promise<void> => {
    const nextEditorState = await facade.getEditorState()
    setEditorState(nextEditorState)
  }

  const refreshPlugins = async (): Promise<void> => {
    const nextPluginsState = await facade.getPluginsState()
    setPluginsState(nextPluginsState)
  }

  const refreshSettings = async (): Promise<void> => {
    const nextSettingsState = await facade.getSettingsState()
    setSettingsState(nextSettingsState)
  }

  const refreshApplicationState = async (): Promise<void> => {
    await Promise.all([refreshDashboard(), refreshEditor(), refreshPlugins(), refreshSettings()])
    setError(null)
  }

  const refreshActiveViewState = async (viewId: AppViewId): Promise<void> => {
    switch (viewId) {
      case 'dashboard':
        await refreshDashboard()
        break
      case 'triggers':
      case 'macros':
        await refreshEditor()
        break
      case 'plugins':
        await refreshPlugins()
        break
      case 'settings':
        await refreshSettings()
        break
    }

    setError(null)
  }

  const runFacadeAction = async (
    action: () => Promise<void>,
    failureMessage: string,
    successMessageText?: string,
  ): Promise<void> => {
    try {
      await action()
      await refreshApplicationState()
      setError(null)
      if (successMessageText) {
        setSuccessMessage(successMessageText)
      }
    } catch (err) {
      setSuccessMessage(null)
      setError(err instanceof Error ? err.message : failureMessage)
    }
  }

  useEffect(() => {
    if (!error) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setError(null)
    }, 5000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [error])

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [successMessage])

  useEffect(() => {
    let cancelled = false

    refreshApplicationState()
      .then(() => {
        if (!cancelled) {
          hasLoadedInitialState.current = true
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [facade])

  useEffect(() => {
    if (!hasLoadedInitialState.current) {
      return
    }

    void refreshActiveViewState(activeNavId).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to refresh view')
    })
  }, [activeNavId, facade])

  useEffect(() => {
    const refresh = (): void => {
      void refreshDashboard()
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Failed to refresh dashboard')
        })
    }

    const subTrigger = eventBus.subscribe(EventTopics.TRIGGER_EXECUTED, refresh)
    const subMacro = eventBus.subscribe(EventTopics.MACRO_COMPLETED, refresh)

    return () => {
      eventBus.unsubscribe(subTrigger)
      eventBus.unsubscribe(subMacro)
    }
  }, [eventBus, facade])

  const handleToggleTrigger = (triggerId: string): void => {
    void runFacadeAction(() => facade.executeTrigger(triggerId), 'Failed to execute trigger')
  }

  const handleRunMacro = (macroId: string): void => {
    void runFacadeAction(() => facade.runMacro(macroId), 'Failed to run macro')
  }

  const handleActivateRuntime = (): void => {
    void runFacadeAction(() => facade.activateRuntime(), 'Failed to activate runtime')
  }

  const handleDeactivateRuntime = (): void => {
    void runFacadeAction(() => facade.deactivateRuntime(), 'Failed to deactivate runtime')
  }

  const handleRefreshState = (): void => {
    void refreshActiveViewState(activeNavId).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard')
    })
  }

  const handleCreateTrigger = async (trigger: GraphTrigger): Promise<void> => {
    await runFacadeAction(() => facade.createTrigger(trigger), 'Failed to create trigger', 'Trigger created')
  }

  const handleUpdateTrigger = async (trigger: GraphTrigger): Promise<void> => {
    await runFacadeAction(() => facade.updateTrigger(trigger), 'Failed to update trigger', 'Trigger updated')
  }

  const handleDeleteTrigger = async (triggerId: string): Promise<void> => {
    await runFacadeAction(() => facade.deleteTrigger(triggerId), 'Failed to delete trigger', 'Trigger deleted')
  }

  const handleToggleTriggerEnabled = async (trigger: GraphTrigger): Promise<void> => {
    await runFacadeAction(
      () => facade.updateTrigger({ ...trigger, enabled: !trigger.enabled }),
      'Failed to update trigger',
    )
  }

  const handleCreateMacro = async (macro: MacroDefinition): Promise<void> => {
    await runFacadeAction(() => facade.createMacro(macro), 'Failed to create macro', 'Macro created')
  }

  const handleUpdateMacro = async (macro: MacroDefinition): Promise<void> => {
    await runFacadeAction(() => facade.updateMacro(macro), 'Failed to update macro', 'Macro updated')
  }

  const handleDeleteMacro = async (macroId: string): Promise<void> => {
    await runFacadeAction(() => facade.deleteMacro(macroId), 'Failed to delete macro', 'Macro deleted')
  }

  if (loading) {
    return (
      <div
        className="th-ui-root"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--th-text-secondary)' }}
      >
        Loading…
      </div>
    )
  }

  if (dashboardState === null || editorState === null || pluginsState === null || settingsState === null) {
    return (
      <div
        className="th-ui-root"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--th-danger)' }}
      >
        {error ?? 'Unexpected error'}
      </div>
    )
  }

  const live = dashboardState.connectedServices.obs || dashboardState.connectedServices.spotify
  const runtimeStatus: RuntimeStatusViewModel = {
    obsConnected: settingsState.connectedServices.obs,
    spotifyConnected: settingsState.connectedServices.spotify,
    clipConnected: settingsState.connectedServices.clip,
    twitchConnected: settingsState.connectedServices.twitch,
  }

  const renderedPage = (() => {
    switch (activeNavId) {
      case 'dashboard':
        return (
          <DashboardPage
            viewModel={toDashboardViewModel(dashboardState)}
            navItems={appNavigationItems}
            activeNavId={activeNavId}
            onSelectNav={setActiveNavId}
            onToggleTrigger={handleToggleTrigger}
          />
        )
      case 'triggers':
        return (
          <TriggerEditorPage
            title="Trigger Editor"
            live={live}
            navItems={appNavigationItems}
            activeNavId={activeNavId}
            onSelectNav={setActiveNavId}
            triggers={editorState.triggers}
            onCreateTrigger={handleCreateTrigger}
            onUpdateTrigger={handleUpdateTrigger}
            onDeleteTrigger={handleDeleteTrigger}
            onToggleTriggerEnabled={handleToggleTriggerEnabled}
          />
        )
      case 'macros':
        return (
          <MacroEditorPage
            title="Macro Editor"
            live={live}
            navItems={appNavigationItems}
            activeNavId={activeNavId}
            onSelectNav={setActiveNavId}
            macros={editorState.macros}
            onCreateMacro={handleCreateMacro}
            onUpdateMacro={handleUpdateMacro}
            onDeleteMacro={handleDeleteMacro}
            onRunMacro={handleRunMacro}
          />
        )
      case 'plugins':
        return (
          <PluginsPage
            title="Plugin Inventory"
            live={live}
            navItems={appNavigationItems}
            activeNavId={activeNavId}
            onSelectNav={setActiveNavId}
            plugins={pluginsState.plugins}
          />
        )
      case 'settings':
        return (
          <SettingsPage
            title="Runtime Settings"
            live={live}
            navItems={appNavigationItems}
            activeNavId={activeNavId}
            onSelectNav={setActiveNavId}
            runtimeStatus={runtimeStatus}
            triggerCount={settingsState.triggerCount}
            macroCount={settingsState.macroCount}
            onActivateRuntime={handleActivateRuntime}
            onDeactivateRuntime={handleDeactivateRuntime}
            onConnectTwitch={() => {
              void runFacadeAction(() => facade.connectTwitch(), 'Failed to connect Twitch')
            }}
            onDisconnectTwitch={() => {
              void runFacadeAction(() => facade.disconnectTwitch(), 'Failed to disconnect Twitch')
            }}
            onRefreshState={handleRefreshState}
          />
        )
    }
  })()

  return (
    <div className="th-ui-root">
      {successMessage ? (
        <div
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 11,
            maxWidth: 320,
            border: '1px solid rgba(16, 185, 129, 0.35)',
            background: 'rgba(6, 78, 59, 0.94)',
            color: '#d1fae5',
            padding: '10px 12px',
            borderRadius: 'var(--th-radius-md)',
            fontSize: 12,
          }}
        >
          {successMessage}
        </div>
      ) : null}
      {error ? (
        <div
          style={{
            position: 'fixed',
            top: 12,
            right: successMessage ? 344 : 12,
            zIndex: 10,
            maxWidth: 320,
            border: '1px solid rgba(239, 68, 68, 0.35)',
            background: 'rgba(127, 29, 29, 0.92)',
            color: '#fecaca',
            padding: '10px 12px',
            borderRadius: 'var(--th-radius-md)',
            fontSize: 12,
            display: 'grid',
            gap: 8,
          }}
        >
          <div>{error}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{
                border: '1px solid rgba(254, 202, 202, 0.25)',
                background: 'transparent',
                color: '#fecaca',
                borderRadius: 'var(--th-radius-md)',
                padding: '4px 8px',
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      <UpdateNotification />
      <ErrorBoundary
        fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--th-danger)' }}>
            Dieser Bereich konnte nicht geladen werden.
          </div>
        }
      >
        {renderedPage}
      </ErrorBoundary>
    </div>
  )
}
