import { useEffect, useState } from 'react'
import { DashboardPage } from './ui/pages/Dashboard'
import { EventTopics } from './types'
import type { DashboardState } from './types'
import type { DashboardViewModel } from './ui/types'
import { useAppContext } from './app/AppContext'

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
  const [activeNavId, setActiveNavId] = useState('dashboard')
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    facade
      .getDashboardState()
      .then((state) => {
        if (!cancelled) {
          setDashboardState(state)
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
      facade
        .getDashboardState()
        .then((state) => { setDashboardState(state) })
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
      .then(() => facade.getDashboardState())
      .then((state) => { setDashboardState(state) })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to execute trigger')
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

  if (error !== null || dashboardState === null) {
    return (
      <div
        className="th-ui-root"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--th-danger)' }}
      >
        {error ?? 'Unexpected error'}
      </div>
    )
  }

  return (
    <div className="th-ui-root">
      <DashboardPage
        viewModel={toDashboardViewModel(dashboardState)}
        activeNavId={activeNavId}
        onSelectNav={setActiveNavId}
        onToggleTrigger={handleToggleTrigger}
      />
    </div>
  )
}
