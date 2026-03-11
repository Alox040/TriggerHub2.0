import { isObsApiResponse, type ObsApiResponse, type ObsSetSceneRequest } from './contracts'
import { HttpClient, type HttpClientOptions } from '../shared'

export interface ObsTransport {
  connect(): Promise<void>
  disconnect(): Promise<void>
  setCurrentScene(sceneName: string): Promise<void>
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

    this.currentScene = sceneName
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
    const payload: ObsSetSceneRequest = { sceneName }
    await this.http.post<ObsApiResponse>('/scene', payload, isObsApiResponse)
  }
}
