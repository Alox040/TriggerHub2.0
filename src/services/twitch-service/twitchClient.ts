import {
  normalizeTwitchChannelName,
  type StreamStatus,
  type TwitchChannelInfo,
  type TwitchHelixChannelsResponse,
  type TwitchHelixStreamsResponse,
  type TwitchHelixUsersResponse,
} from './contracts'
import {
  defaultOperationPolicy,
  HttpClient,
  type HttpClientOptions,
  type OperationPolicy,
  runWithPolicy,
} from '../shared'
import {
  isTwitchHelixChannelsResponse,
  isTwitchHelixStreamsResponse,
  isTwitchHelixUsersResponse,
} from './contracts'

export interface TwitchTransport {
  connect(channelName: string): Promise<void>
  disconnect(): Promise<void>
  getStreamStatus(channelName: string): Promise<StreamStatus>
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

  public async getStreamStatus(channelName: string): Promise<StreamStatus> {
    const normalizedChannelName = normalizeTwitchChannelName(channelName)
    if (!this.connected || this.streamStatus === null || this.channelName !== normalizedChannelName) {
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

export interface TwitchApiTransportOptions extends HttpClientOptions {
  policy?: Partial<OperationPolicy>
}

export class TwitchApiTransport implements TwitchTransport {
  private readonly http: HttpClient
  private readonly policy: OperationPolicy
  private channelName: string | null = null

  public constructor(options: TwitchApiTransportOptions) {
    this.http = new HttpClient(options)
    this.policy = {
      ...defaultOperationPolicy,
      ...(options.policy ?? {}),
    }
  }

  public async connect(channelName: string): Promise<void> {
    const normalizedChannelName = normalizeTwitchChannelName(channelName)
    await runWithPolicy('twitch.connect', this.policy, async () => {
      await this.loadChannelInfo(normalizedChannelName)
    })
    this.channelName = normalizedChannelName
  }

  public async disconnect(): Promise<void> {
    await runWithPolicy('twitch.disconnect', this.policy, async () => undefined)
    this.channelName = null
  }

  public async getStreamStatus(channelName: string): Promise<StreamStatus> {
    const normalizedChannelName = normalizeTwitchChannelName(channelName)
    if (this.channelName !== normalizedChannelName) {
      throw new Error('Twitch transport is not connected')
    }

    return runWithPolicy('twitch.getStreamStatus', this.policy, async () => {
      const channelInfo = await this.loadChannelInfo(normalizedChannelName)
      const streamsResponse = await this.http.get<TwitchHelixStreamsResponse>(
        `/streams?user_login=${encodeURIComponent(normalizedChannelName)}`,
        isTwitchHelixStreamsResponse,
      )
      const stream = streamsResponse.data[0]

      return {
        channelName: normalizedChannelName,
        isLive: Boolean(stream),
        title: stream?.title ?? channelInfo.title,
        categoryName: stream?.game_name ?? channelInfo.categoryName,
        viewerCount: stream?.viewer_count ?? 0,
        startedAt: stream?.started_at ?? null,
      }
    })
  }

  private async loadChannelInfo(channelName: string): Promise<TwitchChannelInfo> {
    const usersResponse = await this.http.get<TwitchHelixUsersResponse>(
      `/users?login=${encodeURIComponent(channelName)}`,
      isTwitchHelixUsersResponse,
    )
    const user = usersResponse.data[0]
    if (!user) {
      throw new Error(`Twitch channel "${channelName}" was not found`)
    }

    const channelsResponse = await this.http.get<TwitchHelixChannelsResponse>(
      `/channels?broadcaster_id=${encodeURIComponent(user.id)}`,
      isTwitchHelixChannelsResponse,
    )
    const channel = channelsResponse.data[0]

    return {
      channelName,
      title: channel?.title ?? null,
      categoryName: channel?.game_name ?? null,
    }
  }
}
