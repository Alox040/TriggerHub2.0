import { describe, expect, it, vi } from 'vitest'
import { InMemoryEventBus } from '../core/event-bus'
import { TriggerExecutor } from '../core/trigger-engine'
import { createRuntimeActivation } from '../app/serviceActivation'
import type {
  ClipServicePort,
  ObsServicePort,
  SpotifyServicePort,
  TwitchServicePort,
} from '../types'

const createObsServiceStub = (): ObsServicePort & {
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  switchScene: ReturnType<typeof vi.fn>
} => {
  let connected = false

  return {
    connect: vi.fn(async () => {
      connected = true
    }),
    disconnect: vi.fn(async () => {
      connected = false
    }),
    isConnected: () => connected,
    switchScene: vi.fn(async () => undefined),
  }
}

const createSpotifyServiceStub = (): SpotifyServicePort & {
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  nextTrack: ReturnType<typeof vi.fn>
} => {
  let connected = false

  return {
    connect: vi.fn(async () => {
      connected = true
    }),
    disconnect: vi.fn(async () => {
      connected = false
    }),
    isConnected: () => connected,
    play: vi.fn(async () => undefined),
    pause: vi.fn(async () => undefined),
    nextTrack: vi.fn(async () => undefined),
  }
}

const createClipServiceStub = (): ClipServicePort & {
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  startCapture: ReturnType<typeof vi.fn>
  saveClip: ReturnType<typeof vi.fn>
} => {
  let connected = false

  return {
    connect: vi.fn(async () => {
      connected = true
    }),
    disconnect: vi.fn(async () => {
      connected = false
    }),
    isConnected: () => connected,
    startCapture: vi.fn(async () => undefined),
    saveClip: vi.fn(async () => 'clip.mp4'),
  }
}

const createTwitchServiceStub = (): TwitchServicePort & {
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  getStreamStatus: ReturnType<typeof vi.fn>
} => {
  let connected = false

  return {
    connect: vi.fn(async () => {
      connected = true
    }),
    disconnect: vi.fn(async () => {
      connected = false
    }),
    isConnected: () => connected,
    getStreamStatus: vi.fn(async () => ({
      channelName: 'triggerhubchannel',
      isLive: false,
      title: null,
      categoryName: null,
      viewerCount: 0,
      startedAt: null,
    })),
  }
}

describe('createRuntimeActivation', () => {
  it('activates runtime by connecting services without invoking business actions', async () => {
    const serviceState = { obs: false, spotify: false, clip: false, twitch: false }
    const appController = {
      start: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
    }
    const pluginRegistry = {
      activateAll: vi.fn(async () => undefined),
      deactivateAll: vi.fn(async () => undefined),
    }
    const obsService = createObsServiceStub()
    const spotifyService = createSpotifyServiceStub()
    const clipService = createClipServiceStub()
    const twitchService = createTwitchServiceStub()
    let runtimeActivated = false

    const { activateRuntime } = createRuntimeActivation({
      appController: appController as never,
      triggerEngine: {} as never,
      macroEngine: {} as never,
      eventBus: new InMemoryEventBus(),
      actionRegistry: new TriggerExecutor(),
      pluginRegistry,
      obsService,
      spotifyService,
      clipService,
      twitchService,
      serviceState,
      isRuntimeStarted: () => true,
      isRuntimeActivated: () => runtimeActivated,
      setRuntimeActivated: (value) => {
        runtimeActivated = value
      },
    })

    await activateRuntime()

    expect(appController.start).toHaveBeenCalledTimes(1)
    expect(obsService.connect).toHaveBeenCalledTimes(1)
    expect(spotifyService.connect).toHaveBeenCalledTimes(1)
    expect(clipService.connect).toHaveBeenCalledTimes(1)
    expect(twitchService.connect).toHaveBeenCalledTimes(1)
    expect(pluginRegistry.activateAll).toHaveBeenCalledTimes(1)
    expect(spotifyService.play).not.toHaveBeenCalled()
    expect(clipService.startCapture).not.toHaveBeenCalled()
    expect(serviceState).toEqual({ obs: true, spotify: true, clip: true, twitch: true })
    expect(runtimeActivated).toBe(true)
  })

  it('deactivates runtime by disconnecting services without issuing operational commands', async () => {
    const serviceState = { obs: true, spotify: true, clip: true, twitch: true }
    const appController = {
      start: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
    }
    const pluginRegistry = {
      activateAll: vi.fn(async () => undefined),
      deactivateAll: vi.fn(async () => undefined),
    }
    const obsService = createObsServiceStub()
    const spotifyService = createSpotifyServiceStub()
    const clipService = createClipServiceStub()
    const twitchService = createTwitchServiceStub()
    let runtimeActivated = true

    await obsService.connect()
    await spotifyService.connect()
    await clipService.connect()

    const { deactivateRuntime } = createRuntimeActivation({
      appController: appController as never,
      triggerEngine: {} as never,
      macroEngine: {} as never,
      eventBus: new InMemoryEventBus(),
      actionRegistry: new TriggerExecutor(),
      pluginRegistry,
      obsService,
      spotifyService,
      clipService,
      twitchService,
      serviceState,
      isRuntimeStarted: () => true,
      isRuntimeActivated: () => runtimeActivated,
      setRuntimeActivated: (value) => {
        runtimeActivated = value
      },
    })

    await deactivateRuntime()

    expect(pluginRegistry.deactivateAll).toHaveBeenCalledTimes(1)
    expect(obsService.disconnect).toHaveBeenCalledTimes(1)
    expect(spotifyService.disconnect).toHaveBeenCalledTimes(1)
    expect(clipService.disconnect).toHaveBeenCalledTimes(1)
    expect(twitchService.disconnect).toHaveBeenCalledTimes(1)
    expect(appController.stop).toHaveBeenCalledTimes(1)
    expect(spotifyService.pause).not.toHaveBeenCalled()
    expect(serviceState).toEqual({ obs: false, spotify: false, clip: false, twitch: false })
    expect(runtimeActivated).toBe(false)
  })
})
