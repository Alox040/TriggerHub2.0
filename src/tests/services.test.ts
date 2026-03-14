import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  ClipExportValidationError,
  type ClipExporter,
  ClipService,
  createClipService,
  createObsService,
  createSpotifyService,
  createTwitchService,
  HttpRequestError,
  InMemoryObsTransport,
  InMemoryTwitchTransport,
  ObsSceneValidationError,
  ObsService,
  ResponseValidationError,
  type ObsTransport,
  runWithPolicy,
  ServiceOperationError,
  type OperationPolicy,
  SpotifyService,
  type SpotifyTransport,
  TwitchActionTypes,
  TwitchService,
} from '../services'
import { InMemoryEventBus } from '../core/event-bus'
import type { StreamStatus } from '../services/twitch-service/contracts'
import { FileSystemClipExporter } from '../services/clip-service/clipExporter.node'

class FlakyObsTransport implements ObsTransport {
  private attempts = 0

  public async connect(): Promise<void> {
    this.attempts += 1
    if (this.attempts < 2) {
      throw new Error('temporary obs failure')
    }
  }

  public async disconnect(): Promise<void> {
    return
  }

  public async setCurrentScene(): Promise<void> {
    return
  }
}

class SlowSpotifyTransport implements SpotifyTransport {
  public async play(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 50))
  }

  public async pause(): Promise<void> {
    return
  }

  public async nextTrack(): Promise<void> {
    return
  }
}

const jsonResponse = (status: number, data: unknown): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('Services', () => {
  it('OBS service requires connect before scene switch', async () => {
    const obs = createObsService()

    await expect(obs.switchScene('Main')).rejects.toThrow('must be connected')

    await obs.connect()
    await expect(obs.switchScene('Main')).resolves.toBeUndefined()
  })

  it('OBS service rejects empty scene names', async () => {
    const obs = createObsService()
    await obs.connect()

    await expect(obs.switchScene('   ')).rejects.toBeInstanceOf(ObsSceneValidationError)
  })

  it('Spotify service methods resolve', async () => {
    const spotify = createSpotifyService()

    await expect(spotify.play()).resolves.toBeUndefined()
    await expect(spotify.nextTrack()).resolves.toBeUndefined()
    await expect(spotify.pause()).resolves.toBeUndefined()
  })

  it('Clip service requires startCapture before saveClip', async () => {
    const clip = new ClipService()

    await expect(clip.saveClip()).rejects.toThrow('not active')

    await clip.startCapture()
    await expect(clip.saveClip()).resolves.toMatch(/^clips\/.+\.mp4$/)
  })

  it('retries flaky obs connect and eventually succeeds', async () => {
    const obs = new ObsService(new FlakyObsTransport(), {
      retries: 2,
      retryDelayMs: 1,
      timeoutMs: 100,
    })

    await expect(obs.connect()).resolves.toBeUndefined()
  })

  it('fails with ServiceOperationError on timeout policy breach', async () => {
    const spotify = new SpotifyService(new SlowSpotifyTransport(), {
      retries: 0,
      retryDelayMs: 1,
      timeoutMs: 10,
    })

    await expect(spotify.play()).rejects.toBeInstanceOf(ServiceOperationError)
  })

  it('creates clip files with filesystem exporter option', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'triggerhub-clip-test-'))
    const clip = new ClipService(new FileSystemClipExporter({ outputDir: dir }))

    await clip.startCapture()
    const path = await clip.saveClip()

    expect(path.startsWith(dir)).toBe(true)
    expect(path.endsWith('.json')).toBe(true)
  })

  it('fails when clip exporter returns invalid payload shape', async () => {
    const invalidExporter: ClipExporter = {
      export: async () => ({ bad: true } as unknown as { clipId: string; path: string }),
    }

    const clip = new ClipService(invalidExporter, {
      retries: 0,
      retryDelayMs: 1,
      timeoutMs: 100,
    })

    await clip.startCapture()

    await expect(clip.saveClip()).rejects.toBeInstanceOf(ServiceOperationError)
    try {
      await clip.saveClip()
      throw new Error('expected failure')
    } catch (error) {
      const serviceError = error as ServiceOperationError
      expect(serviceError.cause).toBeInstanceOf(ClipExportValidationError)
    }
  })

  it('maps obs http errors to HttpRequestError via policy wrapper', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse(500, { error: 'boom' })
    })

    const obs = createObsService({
      transport: 'http',
      http: { baseUrl: 'http://obs.test', fetchImpl },
      policy: { retries: 0, timeoutMs: 100, retryDelayMs: 1 },
    })

    await expect(obs.connect()).rejects.toBeInstanceOf(ServiceOperationError)

    try {
      await obs.connect()
      throw new Error('expected failure')
    } catch (error) {
      const serviceError = error as ServiceOperationError
      expect(serviceError.cause).toBeInstanceOf(HttpRequestError)
      const httpError = serviceError.cause as HttpRequestError
      expect(httpError.status).toBe(500)
      expect(httpError.url).toContain('/connect')
    }
  })

  it('maps invalid obs payloads to ResponseValidationError via policy wrapper', async () => {
    const fetchImpl = vi.fn(async () => {
      return jsonResponse(200, { ok: true })
    })

    const obs = createObsService({
      transport: 'http',
      http: { baseUrl: 'http://obs.test', fetchImpl },
      policy: { retries: 0, timeoutMs: 100, retryDelayMs: 1 },
    })

    await expect(obs.connect()).rejects.toBeInstanceOf(ServiceOperationError)

    try {
      await obs.connect()
      throw new Error('expected failure')
    } catch (error) {
      const serviceError = error as ServiceOperationError
      expect(serviceError.cause).toBeInstanceOf(ResponseValidationError)
    }
  })

  it('requires http.baseUrl for OBS http transport', () => {
    expect(() => createObsService({ transport: 'http' })).toThrow('OBS HTTP transport requires http.baseUrl')
  })

  it('trims scene names before sending them through the OBS http transport', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { success: true }))
    const obs = createObsService({
      transport: 'http',
      http: { baseUrl: 'http://obs.test', fetchImpl },
    })

    await obs.connect()
    await obs.switchScene('  Main Scene  ')

    const calls = fetchImpl.mock.calls as unknown[][]
    expect(calls).toHaveLength(2)
    expect(JSON.parse(String(calls[1]?.[1] && (calls[1][1] as RequestInit).body))).toEqual({
      sceneName: 'Main Scene',
    })
  })

  it('calls spotify http endpoints with expected routes', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { success: true }))

    const spotify = createSpotifyService({
      transport: 'http',
      http: { baseUrl: 'http://spotify.test', fetchImpl },
    })

    await spotify.play()
    await spotify.nextTrack()
    await spotify.pause()

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    const calls = fetchImpl.mock.calls as unknown[][]
    const urls = calls.map((call) => String(call[0] ?? ''))
    expect(urls[0]).toContain('/play')
    expect(urls[1]).toContain('/next')
    expect(urls[2]).toContain('/pause')
  })

  it('fails spotify http calls on invalid response payload', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { foo: 'bar' }))

    const spotify = createSpotifyService({
      transport: 'http',
      http: { baseUrl: 'http://spotify.test', fetchImpl },
      policy: { retries: 0, timeoutMs: 100, retryDelayMs: 1 },
    })

    await expect(spotify.play()).rejects.toBeInstanceOf(ServiceOperationError)
  })

  it('supports twitch connect and disconnect lifecycle', async () => {
    const eventBus = new InMemoryEventBus()
    const transport = new InMemoryTwitchTransport()
    const twitch = new TwitchService(transport, eventBus)

    await twitch.connect('TriggerHubChannel')

    expect(transport.getSnapshot()).toMatchObject({
      connected: true,
      channelName: 'triggerhubchannel',
    })
    await expect(twitch.getStreamStatus()).resolves.toMatchObject({
      channelName: 'triggerhubchannel',
      isLive: false,
    })

    await twitch.disconnect()

    expect(transport.getSnapshot()).toMatchObject({
      connected: false,
      channelName: 'triggerhubchannel',
    })
    await expect(twitch.getStreamStatus()).rejects.toThrow('must be connected')
  })

  it('emits twitch stream status events while polling', async () => {
    vi.useFakeTimers()

    try {
      const eventBus = new InMemoryEventBus()
      const transport = new InMemoryTwitchTransport()
      const twitch = new TwitchService(transport, eventBus, 30_000)
      const streamEvents: Array<{ topic: string; isLive: boolean }> = []

      eventBus.subscribe<StreamStatus>(TwitchActionTypes.ON_STREAM_LIVE, async (payload: StreamStatus) => {
        streamEvents.push({ topic: TwitchActionTypes.ON_STREAM_LIVE, isLive: payload.isLive })
      })
      eventBus.subscribe<StreamStatus>(TwitchActionTypes.ON_STREAM_OFFLINE, async (payload: StreamStatus) => {
        streamEvents.push({ topic: TwitchActionTypes.ON_STREAM_OFFLINE, isLive: payload.isLive })
      })

      await twitch.connect('streamer')

      transport.setStreamStatus({
        isLive: true,
        title: 'Going Live',
        categoryName: 'Gaming',
        viewerCount: 42,
        startedAt: '2026-03-13T10:00:00.000Z',
      })
      await vi.advanceTimersByTimeAsync(30_000)

      transport.setStreamStatus({
        isLive: false,
        title: null,
        categoryName: null,
        viewerCount: 0,
        startedAt: null,
      })
      await vi.advanceTimersByTimeAsync(30_000)

      expect(streamEvents).toEqual([
        { topic: TwitchActionTypes.ON_STREAM_LIVE, isLive: true },
        { topic: TwitchActionTypes.ON_STREAM_OFFLINE, isLive: false },
      ])

      await twitch.disconnect()
    } finally {
      vi.useRealTimers()
    }
  })

  it('calls twitch helix endpoints through the http client', async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)

      if (url.includes('/users?login=streamer')) {
        return jsonResponse(200, { data: [{ id: '42', login: 'streamer' }] })
      }

      if (url.includes('/channels?broadcaster_id=42')) {
        return jsonResponse(200, {
          data: [{ broadcaster_login: 'streamer', title: 'Going Live', game_name: 'Gaming' }],
        })
      }

      if (url.includes('/streams?user_login=streamer')) {
        return jsonResponse(200, {
          data: [
            {
              user_login: 'streamer',
              title: 'Going Live',
              game_name: 'Gaming',
              viewer_count: 42,
              started_at: '2026-03-13T10:00:00.000Z',
            },
          ],
        })
      }

      return jsonResponse(404, { error: 'not found' })
    })

    const twitch = createTwitchService({
      eventBus: new InMemoryEventBus(),
      transport: 'http',
      http: { baseUrl: 'https://api.twitch.tv/helix', fetchImpl },
      policy: { retries: 0, timeoutMs: 100, retryDelayMs: 1 },
    })

    await twitch.connect('Streamer')

    await expect(twitch.getStreamStatus()).resolves.toMatchObject({
      channelName: 'streamer',
      isLive: true,
      title: 'Going Live',
      categoryName: 'Gaming',
      viewerCount: 42,
    })

    const urls = (fetchImpl.mock.calls as unknown[][]).map((call) => String(call[0] ?? ''))
    expect(urls.some((url) => url.includes('/users?login=streamer'))).toBe(true)
    expect(urls.some((url) => url.includes('/channels?broadcaster_id=42'))).toBe(true)
    expect(urls.some((url) => url.includes('/streams?user_login=streamer'))).toBe(true)
  })
})

describe('runWithPolicy', () => {
  it('wraps repeated failure with ServiceOperationError metadata', async () => {
    const policy: OperationPolicy = {
      retries: 1,
      retryDelayMs: 1,
      timeoutMs: 20,
    }

    const task = async (): Promise<void> => {
      throw new Error('always fails')
    }

    try {
      await runWithPolicy('test.operation', policy, task)
      throw new Error('expected failure')
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceOperationError)
      const opError = error as ServiceOperationError
      expect(opError.operation).toBe('test.operation')
      expect(opError.attempts).toBe(2)
    }
  })

  it('can still use memory obs transport defaults', async () => {
    const obs = new ObsService(new InMemoryObsTransport())
    await obs.connect()
    await expect(obs.switchScene('Scene X')).resolves.toBeUndefined()
  })
})
