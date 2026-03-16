import { describe, expect, it, vi } from 'vitest'
import { InMemoryEventBus } from '../core/event-bus'
import { MacroEngine } from '../core/macro-system'
import { createActionDispatcher } from '../app/actionDispatcher'

describe('createActionDispatcher', () => {
  it('executes twitch service_call macro steps through the registered service actions', async () => {
    const twitchService = {
      connect: vi.fn(async (_channelName?: string) => undefined),
      disconnect: vi.fn(async () => undefined),
      isConnected: vi.fn(() => false),
      getStreamStatus: vi.fn(async () => ({
        channelName: 'streamer',
        isLive: false,
        title: null,
        categoryName: null,
        viewerCount: 0,
        startedAt: null,
      })),
    }

    const { executeMacroStep, setMacroEngine } = createActionDispatcher({
      obsService: {
        connect: async () => undefined,
        disconnect: async () => undefined,
        isConnected: () => false,
        switchScene: async () => undefined,
      },
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
      twitchService,
    })
    setMacroEngine(new MacroEngine(async () => undefined, new InMemoryEventBus()))

    await executeMacroStep(
      {
        id: 'step-connect',
        type: 'service_call',
        service: 'twitch',
        action: 'connect',
        params: { channelName: 'Streamer' },
      },
      { macroId: 'macro-1', variables: {}, depth: 0 },
    )
    await executeMacroStep(
      {
        id: 'step-disconnect',
        type: 'service_call',
        service: 'twitch',
        action: 'disconnect',
      },
      { macroId: 'macro-1', variables: {}, depth: 0 },
    )

    expect(twitchService.connect).toHaveBeenCalledWith('Streamer')
    expect(twitchService.disconnect).toHaveBeenCalledTimes(1)
  })
})
