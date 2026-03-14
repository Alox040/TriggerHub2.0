import { useEffect, useState } from 'react'
import { DashboardPage, EditorPage, PluginsPage, SettingsPage } from './ui/pages'
import { EventTopics } from './types'
import type { DashboardState, EditorState, PluginsState, SettingsState } from './types'
import type { DashboardViewModel, RuntimeStatusViewModel } from './ui/types'
import { useAppContext } from './app/AppContext'
import { appNavigationItems, type AppViewId } from './ui/navigation'

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

  const refreshApplicationState = (): Promise<void> => {
    return Promise.all([
      facade.getDashboardState(),
      facade.getEditorState(),
      facade.getPluginsState(),
      facade.getSettingsState(),
    ])
      .then(([nextDashboardState, nextEditorState, nextPluginsState, nextSettingsState]) => {
        setDashboardState(nextDashboardState)
        setEditorState(nextEditorState)
        setPluginsState(nextPluginsState)
        setSettingsState(nextSettingsState)
        setError(null)
      })
  }

  useEffect(() => {
    let cancelled = false

    refreshApplicationState()
      .then(() => {
        if (!cancelled) {
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
    const refresh = (): void => {
      refreshApplicationState()
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
    facade
      .executeTrigger(triggerId)
      .then(() => refreshApplicationState())
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to execute trigger')
      })
  }

  const handleRunMacro = (macroId: string): void => {
    facade
      .runMacro(macroId)
      .then(() => refreshApplicationState())
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to run macro')
      })
  }

  const handleActivateRuntime = (): void => {
    facade
      .activateRuntime()
      .then(() => refreshApplicationState())
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to activate runtime')
      })
  }

  const handleDeactivateRuntime = (): void => {
    facade
      .deactivateRuntime()
      .then(() => refreshApplicationState())
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to deactivate runtime')
      })
  }

  const handleRefreshState = (): void => {
    refreshApplicationState().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard')
    })
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

  if (error !== null || dashboardState === null || editorState === null || pluginsState === null || settingsState === null) {
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
      case 'editor':
        return (
          <EditorPage
            title="Trigger Editor"
            live={live}
            navItems={appNavigationItems}
            activeNavId={activeNavId}
            onSelectNav={setActiveNavId}
            triggers={editorState.triggers}
            macros={editorState.macros}
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
            onRefreshState={handleRefreshState}
          />
        )
    }
  })()

  return (
    <div className="th-ui-root">
      {renderedPage}
    </div>
  )
}
