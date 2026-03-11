import { isSpotifyApiResponse, type SpotifyApiResponse } from './contracts'
import { HttpClient, type HttpClientOptions } from '../shared'

export interface SpotifyTransport {
  play(): Promise<void>
  pause(): Promise<void>
  nextTrack(): Promise<void>
}

export class InMemorySpotifyTransport implements SpotifyTransport {
  private playing = false
  private trackIndex = 0

  public async play(): Promise<void> {
    this.playing = true
  }

  public async pause(): Promise<void> {
    this.playing = false
  }

  public async nextTrack(): Promise<void> {
    this.trackIndex += 1
  }

  public getSnapshot(): { playing: boolean; trackIndex: number } {
    return {
      playing: this.playing,
      trackIndex: this.trackIndex,
    }
  }
}

export interface SpotifyHttpTransportOptions extends HttpClientOptions {}

export class SpotifyHttpTransport implements SpotifyTransport {
  private readonly http: HttpClient

  public constructor(options: SpotifyHttpTransportOptions) {
    this.http = new HttpClient(options)
  }

  public async play(): Promise<void> {
    await this.http.post<SpotifyApiResponse>('/play', undefined, isSpotifyApiResponse)
  }

  public async pause(): Promise<void> {
    await this.http.post<SpotifyApiResponse>('/pause', undefined, isSpotifyApiResponse)
  }

  public async nextTrack(): Promise<void> {
    await this.http.post<SpotifyApiResponse>('/next', undefined, isSpotifyApiResponse)
  }
}
