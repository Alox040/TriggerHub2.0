// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { AppProvider } from '../app/AppContext'
import type { AppModuleContainer } from '../app/container'
import { EventTopics } from '../types'
import type { EventBusPort, EventSubscription } from '../types'

type EventHandler = (payload: unknown) => void | Promise<void>

const createEventBusStub = (): EventBusPort & { emit: (topic: string, payload?: unknown) => Promise<void> } => {
  const listeners = new Map<string, Map<string, EventHandler>>()
  let nextId = 0

  return {
    publish: async () => undefined,
    subscribe: (topic: string, handler: EventHandler): EventSubscription => {
      const id = `sub-${nextId++}`
      const topicListeners = listeners.get(topic) ?? new Map<string, EventHandler>()
      topicListeners.set(id, handler)
      listeners.set(topic, topicListeners)
      return { id, topic }
    },
    once: (topic: string, handler: EventHandler): EventSubscription => {
      const id = `once-${nextId++}`
      const wrappedHandler: EventHandler = async (payload) => {
        listeners.get(topic)?.delete(id)
        await handler(payload)
      }
      const topicListeners = listeners.get(topic) ?? new Map<string, EventHandler>()
      topicListeners.set(id, wrappedHandler)
      listeners.set(topic, topicListeners)
      return { id, topic }
    },
    unsubscribe: (subscription: EventSubscription) => {
      listeners.get(subscription.topic)?.delete(subscription.id)
    },
    unsubscribeAll: (topic: string) => {
      listeners.delete(topic)
    },
    emit: async (topic: string, payload?: unknown) => {
      const handlers = Array.from(listeners.get(topic)?.values() ?? [])
      for (const handler of handlers) {
        await handler(payload)
      }
    },
  }
}

const createMockContainer = (): AppModuleContainer & {
  eventBus: ReturnType<typeof createEventBusStub>
  facadeSpies: {
    getDashboardState: ReturnType<typeof vi.fn>
    getEditorState: ReturnType<typeof vi.fn>
    getPluginsState: ReturnType<typeof vi.fn>
    getSettingsState: ReturnType<typeof vi.fn>
  }
} => {
  const eventBus = createEventBusStub()

  const facadeSpies = {
    getDashboardState: vi.fn(async () => ({
      connectedServices: { obs: false, spotify: false, clip: false, twitch: false },
      activeTriggers: [{ id: 'trigger-1', name: 'Trigger One', enabled: true }],
      activeMacros: [{ id: 'macro-1', name: 'Macro One', enabled: true, steps: [] }],
    })),
    getEditorState: vi.fn(async () => ({
      triggers: [
        {
          id: 'trigger-1',
          name: 'Trigger One',
          enabled: true,
          event: 'obs:connected',
          conditions: [],
          actions: [{ type: 'macro.run', payload: { macroId: 'macro-1' } }],
        },
      ],
      macros: [{ id: 'macro-1', name: 'Macro One', enabled: true, steps: [] }],
    })),
    getPluginsState: vi.fn(async () => ({ plugins: [{ id: 'plugin-1', name: 'Plugin One' }] })),
    getSettingsState: vi.fn(async () => ({
      connectedServices: { obs: false, spotify: false, clip: false, twitch: false },
      triggerCount: 1,
      macroCount: 1,
    })),
  }

  return {
    appController: { start: async () => undefined, stop: async () => undefined },
    triggerEngine: {
      registerTrigger: async () => undefined,
      updateTrigger: async () => undefined,
      removeTrigger: async () => undefined,
      executeTrigger: async () => undefined,
      getTrigger: () => undefined,
      hasTrigger: () => false,
      getAll: () => [],
      destroy: () => undefined,
    },
    macroEngine: {
      registerMacro: async () => undefined,
      updateMacro: async () => undefined,
      removeMacro: () => false,
      getMacroById: () => undefined,
      getAllMacros: () => [],
      runMacro: async () => undefined,
    },
    obsService: { connect: async () => undefined, disconnect: async () => undefined, isConnected: () => false, switchScene: async () => undefined },
    spotifyService: {
      connect: async () => undefined,
      disconnect: async () => undefined,
      isConnected: () => false,
      play: async () => undefined,
      pause: async () => undefined,
      nextTrack: async () => undefined,
    },
    clipService: {
      connect: async () => undefined,
      disconnect: async () => undefined,
      isConnected: () => false,
      startCapture: async () => undefined,
      saveClip: async () => 'clip.mp4',
    },
    twitchService: {
      connect: async () => undefined,
      disconnect: async () => undefined,
      isConnected: () => false,
      getStreamStatus: async () => ({
        channelName: 'streamer',
        isLive: false,
        title: null,
        categoryName: null,
        viewerCount: 0,
        startedAt: null,
      }),
    },
    pluginRegistry: {
      register: async () => undefined,
      unregister: async () => undefined,
      list: async () => [],
    },
    appFacade: {
      ...facadeSpies,
      listTriggers: async () => [],
      getTrigger: async () => undefined,
      executeTrigger: async () => undefined,
      updateTrigger: async () => undefined,
      listMacros: async () => [],
      getMacro: async () => undefined,
      runMacro: async () => undefined,
      createTrigger: async () => undefined,
      deleteTrigger: async () => undefined,
      createMacro: async () => undefined,
      updateMacro: async () => undefined,
      deleteMacro: async () => undefined,
      activateRuntime: async () => undefined,
      deactivateRuntime: async () => undefined,
      connectTwitch: async () => undefined,
      disconnectTwitch: async () => undefined,
    },
    eventBus,
    facadeSpies,
  } as AppModuleContainer & { eventBus: typeof eventBus; facadeSpies: typeof facadeSpies }
}

describe('App state refresh behaviour', () => {
  afterEach(() => {
    cleanup()
  })

  it('refreshes only the required read-models for runtime events and navigation changes', async () => {
    const container = createMockContainer()

    render(
      <AppProvider container={container}>
        <App />
      </AppProvider>,
    )

    await screen.findByText('Trigger Controls')

    expect(container.facadeSpies.getDashboardState).toHaveBeenCalledTimes(1)
    expect(container.facadeSpies.getEditorState).toHaveBeenCalledTimes(1)
    expect(container.facadeSpies.getPluginsState).toHaveBeenCalledTimes(1)
    expect(container.facadeSpies.getSettingsState).toHaveBeenCalledTimes(1)

    await container.eventBus.emit(EventTopics.TRIGGER_EXECUTED, { triggerId: 'trigger-1' })

    await waitFor(() => {
      expect(container.facadeSpies.getDashboardState).toHaveBeenCalledTimes(2)
    })
    expect(container.facadeSpies.getEditorState).toHaveBeenCalledTimes(1)
    expect(container.facadeSpies.getPluginsState).toHaveBeenCalledTimes(1)
    expect(container.facadeSpies.getSettingsState).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /Macros/i }))

    await screen.findByText('Macro Library')
    await waitFor(() => {
      expect(container.facadeSpies.getEditorState).toHaveBeenCalledTimes(2)
    })
    expect(container.facadeSpies.getDashboardState).toHaveBeenCalledTimes(2)
    expect(container.facadeSpies.getPluginsState).toHaveBeenCalledTimes(1)
    expect(container.facadeSpies.getSettingsState).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /Settings/i }))

    await screen.findByText('Runtime Controls')
    await waitFor(() => {
      expect(container.facadeSpies.getSettingsState).toHaveBeenCalledTimes(2)
    })
    expect(container.facadeSpies.getDashboardState).toHaveBeenCalledTimes(2)
    expect(container.facadeSpies.getEditorState).toHaveBeenCalledTimes(2)
    expect(container.facadeSpies.getPluginsState).toHaveBeenCalledTimes(1)
  })
})
