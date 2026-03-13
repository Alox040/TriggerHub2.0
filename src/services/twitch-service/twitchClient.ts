import {
  isStreamStatus,
  isTwitchApiResponse,
  normalizeTwitchChannelName,
  type StreamStatus,
  type TwitchApiResponse,
  type TwitchConnectRequest,
} from './contracts'
import { HttpClient, type HttpClientOptions } from '../shared'

export interface TwitchTransport {
  connect(channelName: string): Promise<void>
  disconnect(): Promise<void>
  getStreamStatus(): Promise<StreamStatus>
}

const buildDefaultStreamStatus = (channelName: string): StreamStatus => ({
  channelName,
  isLive: false,
  title: null,
  categoryName: null,
  viewerCount: 0,
  startedAt: null,
})

export class InMemoryTwitchTransport implements TwitchTransport {
  private connected = false
  private channelName: string | null = null
  private streamStatus: StreamStatus | null = null

  public async connect(channelName: string): Promise<void> {
    const normalizedChannelName = normalizeTwitchChannelName(channelName)
    this.connected = true
    this.channelName = normalizedChannelName
    this.streamStatus = buildDefaultStreamStatus(normalizedChannelName)
  }

  public async disconnect(): Promise<void> {
    this.connected = false
  }

  public async getStreamStatus(): Promise<StreamStatus> {
    if (!this.connected || this.streamStatus === null) {
      throw new Error('Twitch transport is not connected')
    }

    return { ...this.streamStatus }
  }

  public setStreamStatus(status: Omit<StreamStatus, 'channelName'>): void {
    if (this.channelName === null) {
      throw new Error('Twitch transport must be connected before setting stream status')
    }

    this.streamStatus = {
      channelName: this.channelName,
      ...status,
    }
  }

  public getSnapshot(): { connected: boolean; channelName: string | null; streamStatus: StreamStatus | null } {
    return {
      connected: this.connected,
      channelName: this.channelName,
      streamStatus: this.streamStatus ? { ...this.streamStatus } : null,
    }
  }
}

export interface TwitchApiTransportOptions extends HttpClientOptions {}

export class TwitchApiTransport implements TwitchTransport {
  private readonly http: HttpClient
  private channelName: string | null = null

  public constructor(options: TwitchApiTransportOptions) {
    this.http = new HttpClient(options)
  }

  public async connect(channelName: string): Promise<void> {
    const payload: TwitchConnectRequest = {
      channelName: normalizeTwitchChannelName(channelName),
    }
    await this.http.post<TwitchApiResponse>('/connect', payload, isTwitchApiResponse)
    this.channelName = payload.channelName
  }

  public async disconnect(): Promise<void> {
    await this.http.post<TwitchApiResponse>('/disconnect', undefined, isTwitchApiResponse)
    this.channelName = null
  }

  public async getStreamStatus(): Promise<StreamStatus> {
    return this.http.post<StreamStatus>(
      '/stream-status',
      this.channelName ? { channelName: this.channelName } : undefined,
      isStreamStatus,
    )
  }
}
