// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { AppProvider } from '../app/AppContext'
import type { MacroDefinition } from '../core/macro-system/macroTypes'
import type { GraphTrigger } from '../core/trigger-engine/triggerGraphTypes'
import type { EventBusPort, EventSubscription } from '../types'
import type { AppModuleContainer } from '../app/container'

interface MutableState {
  triggers: GraphTrigger[]
  macros: MacroDefinition[]
}

const createEventBusStub = (): EventBusPort => ({
  publish: async () => undefined,
  subscribe: (topic: string) => ({ id: topic, topic }),
  once: (topic: string) => ({ id: `${topic}-once`, topic }),
  unsubscribe: (_subscription: EventSubscription) => undefined,
  unsubscribeAll: (_topic: string) => undefined,
})

const createMockContainer = (): AppModuleContainer & {
  state: MutableState
  spies: {
    createTrigger: ReturnType<typeof vi.fn>
    updateTrigger: ReturnType<typeof vi.fn>
    deleteTrigger: ReturnType<typeof vi.fn>
    createMacro: ReturnType<typeof vi.fn>
    updateMacro: ReturnType<typeof vi.fn>
    deleteMacro: ReturnType<typeof vi.fn>
    runMacro: ReturnType<typeof vi.fn>
  }
} => {
  const state: MutableState = {
    triggers: [
      {
        id: 'existing-trigger',
        name: 'Existing Trigger',
        enabled: true,
        event: 'obs:connected',
        conditions: [],
        actions: [{ type: 'macro.run', payload: { macroId: 'existing-macro' } }],
      },
    ],
    macros: [
      {
        id: 'existing-macro',
        name: 'Existing Macro',
        enabled: true,
        steps: [{ id: 'step-1', type: 'delay', durationMs: 1000 }],
      },
    ],
  }

  const spies = {
    createTrigger: vi.fn(async (trigger: GraphTrigger) => {
      state.triggers = [...state.triggers, trigger]
    }),
    updateTrigger: vi.fn(async (trigger: GraphTrigger) => {
      state.triggers = state.triggers.map((entry) => (entry.id === trigger.id ? trigger : entry))
    }),
    deleteTrigger: vi.fn(async (triggerId: string) => {
      state.triggers = state.triggers.filter((trigger) => trigger.id !== triggerId)
    }),
    createMacro: vi.fn(async (macro: MacroDefinition) => {
      state.macros = [...state.macros, macro]
    }),
    updateMacro: vi.fn(async (macro: MacroDefinition) => {
      state.macros = state.macros.map((entry) => (entry.id === macro.id ? macro : entry))
    }),
    deleteMacro: vi.fn(async (macroId: string) => {
      state.macros = state.macros.filter((macro) => macro.id !== macroId)
    }),
    runMacro: vi.fn(async () => undefined),
  }

  const eventBus = createEventBusStub()

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
      getDashboardState: async () => ({
        connectedServices: { obs: false, spotify: false, clip: false, twitch: false },
        activeTriggers: state.triggers.map((trigger) => ({
          id: trigger.id,
          name: trigger.name,
          enabled: trigger.enabled,
        })),
        activeMacros: state.macros,
      }),
      getEditorState: async () => ({
        triggers: state.triggers,
        macros: state.macros,
      }),
      getPluginsState: async () => ({ plugins: [] }),
      getSettingsState: async () => ({
        connectedServices: { obs: false, spotify: false, clip: false, twitch: false },
        triggerCount: state.triggers.length,
        macroCount: state.macros.length,
      }),
      listTriggers: async () => state.triggers,
      getTrigger: async (triggerId: string) => state.triggers.find((trigger) => trigger.id === triggerId),
      executeTrigger: async () => undefined,
      updateTrigger: spies.updateTrigger,
      listMacros: async () => state.macros,
      getMacro: async (macroId: string) => state.macros.find((macro) => macro.id === macroId),
      runMacro: spies.runMacro,
      createTrigger: spies.createTrigger,
      deleteTrigger: spies.deleteTrigger,
      createMacro: spies.createMacro,
      updateMacro: spies.updateMacro,
      deleteMacro: spies.deleteMacro,
      activateRuntime: async () => undefined,
      deactivateRuntime: async () => undefined,
      connectTwitch: async () => undefined,
      disconnectTwitch: async () => undefined,
    },
    eventBus,
    state,
    spies,
  } as AppModuleContainer & { state: MutableState; spies: typeof spies }
}

describe('App editor CRUD flows', () => {
  afterEach(() => {
    cleanup()
  })

  it('creates, edits, disables, and deletes triggers through AppFacade', async () => {
    const container = createMockContainer()

    render(
      <AppProvider container={container}>
        <App />
      </AppProvider>,
    )

    await screen.findByText('Trigger Controls')
    fireEvent.click(screen.getByRole('button', { name: /Triggers/i }))

    await screen.findByText('Existing Triggers')

    fireEvent.change(screen.getByLabelText('Trigger Name'), { target: { value: 'Chat Alert' } })
    fireEvent.change(screen.getByLabelText('Event Topic'), { target: { value: 'custom' } })
    fireEvent.change(screen.getByLabelText('Custom Event Topic'), { target: { value: 'twitch:chat-message' } })
    fireEvent.change(screen.getByLabelText('Actions JSON'), {
      target: { value: '[{"type":"spotify.play"}]' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Trigger' }))

    await waitFor(() => expect(screen.getByText('Chat Alert')).toBeTruthy())
    expect(container.spies.createTrigger).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Trigger' }).find((button) =>
      button.parentElement?.parentElement?.textContent?.includes('Chat Alert'),
    ) ?? (() => { throw new Error('Edit button not found') })())

    fireEvent.change(screen.getByLabelText('Trigger Name'), { target: { value: 'Chat Alert Updated' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Trigger' }))

    await waitFor(() => expect(screen.getByText('Chat Alert Updated')).toBeTruthy())
    expect(container.spies.updateTrigger).toHaveBeenCalled()

    fireEvent.click(screen.getAllByRole('button', { name: 'Disable Trigger' }).find((button) =>
      button.parentElement?.parentElement?.textContent?.includes('Chat Alert Updated'),
    ) ?? (() => { throw new Error('Disable button not found') })())

    await waitFor(() => expect(screen.getByText('Disabled')).toBeTruthy())

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Trigger' }).find((button) =>
      button.parentElement?.parentElement?.textContent?.includes('Chat Alert Updated'),
    ) ?? (() => { throw new Error('Delete button not found') })())

    await waitFor(() => expect(screen.queryByText('Chat Alert Updated')).toBeNull())
    expect(container.spies.deleteTrigger).toHaveBeenCalledWith(expect.any(String))
  })

  it('creates, reorders, updates, and deletes macros through AppFacade', async () => {
    const container = createMockContainer()

    render(
      <AppProvider container={container}>
        <App />
      </AppProvider>,
    )

    await screen.findByText('Trigger Controls')
    fireEvent.click(screen.getByRole('button', { name: /Macros/i }))

    await screen.findByText('Macro Library')

    fireEvent.change(screen.getByLabelText('Macro Name'), { target: { value: 'Intro Sequence' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Step' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create Macro' }))

    await waitFor(() => expect(screen.getByText('Intro Sequence')).toBeTruthy())
    expect(container.spies.createMacro).toHaveBeenCalledTimes(1)
    const createdMacroId = container.state.macros.find((macro) => macro.name === 'Intro Sequence')?.id
    expect(createdMacroId).toEqual(expect.any(String))

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Macro' }).find((button) =>
      button.parentElement?.parentElement?.textContent?.includes('Intro Sequence'),
    ) ?? (() => { throw new Error('Edit macro button not found') })())

    fireEvent.click(screen.getByRole('button', { name: 'Add Step' }))
    fireEvent.change(screen.getByLabelText('Step ID 2'), { target: { value: 'step-2' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Move Down' })[0] as HTMLElement)
    fireEvent.click(screen.getByRole('button', { name: 'Save Macro' }))

    await waitFor(() => {
      expect(container.state.macros.find((macro) => macro.id === createdMacroId)?.steps[0]?.id).toBe('step-2')
    })
    expect(container.spies.updateMacro).toHaveBeenCalled()

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Macro' }).find((button) =>
      button.parentElement?.parentElement?.textContent?.includes('Intro Sequence'),
    ) ?? (() => { throw new Error('Delete macro button not found') })())

    await waitFor(() => expect(screen.queryByText('Intro Sequence')).toBeNull())
    expect(container.spies.deleteMacro).toHaveBeenCalledWith(createdMacroId)
  })
})
