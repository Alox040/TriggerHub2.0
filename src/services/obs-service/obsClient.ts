import {
  isObsApiResponse,
  normalizeObsSceneName,
  type ObsApiResponse,
  type ObsSetSceneRequest,
} from './contracts'
import type { EventBusPort } from '../../types'
import { HttpClient, type HttpClientOptions } from '../shared'
import OBSWebSocket from 'obs-websocket-js'

export interface ObsTransport {
  connect(): Promise<void>
  disconnect(): Promise<void>
  setCurrentScene(sceneName: string): Promise<void>
}

export interface ObsWebSocketTransportOptions {
  host: string
  port: number
  password?: string
  eventBus: EventBusPort
}

export class InMemoryObsTransport implements ObsTransport {
  private connected = false
  private currentScene = 'Default'

  public async connect(): Promise<void> {
    this.connected = true
  }

  public async disconnect(): Promise<void> {
    this.connected = false
  }

  public async setCurrentScene(sceneName: string): Promise<void> {
    if (!this.connected) {
      throw new Error('OBS transport is not connected')
    }

    this.currentScene = normalizeObsSceneName(sceneName)
  }

  public getSnapshot(): { connected: boolean; currentScene: string } {
    return {
      connected: this.connected,
      currentScene: this.currentScene,
    }
  }
}

export interface ObsHttpTransportOptions extends HttpClientOptions {}

export class ObsHttpTransport implements ObsTransport {
  private readonly http: HttpClient

  public constructor(options: ObsHttpTransportOptions) {
    this.http = new HttpClient(options)
  }

  public async connect(): Promise<void> {
    await this.http.post<ObsApiResponse>('/connect', undefined, isObsApiResponse)
  }

  public async disconnect(): Promise<void> {
    await this.http.post<ObsApiResponse>('/disconnect', undefined, isObsApiResponse)
  }

  public async setCurrentScene(sceneName: string): Promise<void> {
    const payload: ObsSetSceneRequest = { sceneName: normalizeObsSceneName(sceneName) }
    await this.http.post<ObsApiResponse>('/scene', payload, isObsApiResponse)
  }
}

export class ObsWebSocketTransport implements ObsTransport {
  private readonly client: OBSWebSocket
  private connected = false

  public constructor(private readonly options: ObsWebSocketTransportOptions) {
    this.client = new OBSWebSocket()
  }

  public async connect(): Promise<void> {
    if (this.connected) {
      return
    }

    const url = `ws://${this.options.host}:${this.options.port}`

    try {
      await this.client.connect(url, this.options.password ? { password: this.options.password } : undefined)
      this.connected = true

      await this.options.eventBus.publish('obs:connected', {
        host: this.options.host,
        port: this.options.port,
      })

      this.registerEventHandlers()
    } catch (error) {
      this.connected = false
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) {
      return
    }

    try {
      await this.client.disconnect()
    } finally {
      this.connected = false
      await this.options.eventBus.publish('obs:disconnected', {})
    }
  }

  public async setCurrentScene(sceneName: string): Promise<void> {
    if (!this.connected) {
      throw new Error('OBS transport is not connected')
    }

    const normalizedSceneName = normalizeObsSceneName(sceneName)
    await this.client.call('SetCurrentProgramScene', { sceneName: normalizedSceneName })
  }

  private registerEventHandlers(): void {
    this.client.on('CurrentProgramSceneChanged', async (data: { sceneName?: string }) => {
      const sceneName = typeof data.sceneName === 'string' ? data.sceneName : ''
      const normalizedSceneName = normalizeObsSceneName(sceneName)
      await this.options.eventBus.publish('obs:scene-changed', { sceneName: normalizedSceneName })
    })

    this.client.on('StreamStateChanged', async (data: { outputActive?: boolean }) => {
      await this.options.eventBus.publish('obs:stream-state-changed', {
        outputActive: Boolean(data.outputActive),
      })
    })

    this.client.on('ConnectionClosed', async () => {
      this.connected = false
      await this.options.eventBus.publish('obs:disconnected', {})
    })
  }
}
