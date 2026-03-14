import type { EventBusPort } from '../../types'
import type { TwitchTransport } from './twitchClient'
import {
  normalizeTwitchChannelName,
  type StreamStatus,
  type TwitchEvent,
  type TwitchServicePort,
} from './contracts'

export const TwitchActionTypes = {
  ON_STREAM_LIVE: 'twitch:stream-live',
  ON_STREAM_OFFLINE: 'twitch:stream-offline',
} as const satisfies Record<string, TwitchEvent>

export class TwitchService implements TwitchServicePort {
  private static readonly DEFAULT_POLL_INTERVAL_MS = 60_000

  private connected = false
  private readonly pollIntervalMs: number
  private channelName: string | null = null
  private currentStatus: StreamStatus | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private pollInFlight = false

  public constructor(
    private readonly transport: TwitchTransport,
    private readonly eventBus: EventBusPort,
    pollIntervalMs = TwitchService.DEFAULT_POLL_INTERVAL_MS,
  ) {
    this.pollIntervalMs = pollIntervalMs
  }

  public async connect(channelName: string): Promise<void> {
    const normalizedChannelName = normalizeTwitchChannelName(channelName)

    await this.transport.connect(normalizedChannelName)

    this.connected = true
    this.channelName = normalizedChannelName
    this.currentStatus = await this.loadStreamStatus(false)
    this.startPolling()
  }

  public async disconnect(): Promise<void> {
    this.stopPolling()

    if (!this.connected) {
      this.channelName = null
      this.currentStatus = null
      return
    }

    await this.transport.disconnect()

    this.connected = false
    this.channelName = null
    this.currentStatus = null
  }

  public async getStreamStatus(): Promise<StreamStatus> {
    if (!this.connected) {
      throw new Error('Twitch service must be connected before reading stream status')
    }

    return this.loadStreamStatus(false)
  }

  private startPolling(): void {
    this.stopPolling()
    this.pollTimer = setInterval(() => {
      void this.pollStreamStatus()
    }, this.pollIntervalMs)
  }

  private stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  private async pollStreamStatus(): Promise<void> {
    if (!this.connected || this.pollInFlight) {
      return
    }

    this.pollInFlight = true
    try {
      await this.loadStreamStatus(true)
    } finally {
      this.pollInFlight = false
    }
  }

  private async loadStreamStatus(emitTransition: boolean): Promise<StreamStatus> {
    if (this.channelName === null) {
      throw new Error('Twitch service must be connected before reading stream status')
    }

    const nextStatus = await this.transport.getStreamStatus(this.channelName)

    const previousStatus = this.currentStatus
    this.currentStatus = nextStatus

    if (emitTransition && previousStatus !== null && previousStatus.isLive !== nextStatus.isLive) {
      await this.eventBus.publish(
        nextStatus.isLive ? TwitchActionTypes.ON_STREAM_LIVE : TwitchActionTypes.ON_STREAM_OFFLINE,
        nextStatus,
      )
    }

    return nextStatus
  }
}
