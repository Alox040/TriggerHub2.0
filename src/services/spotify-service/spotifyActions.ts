import type { SpotifyServicePort } from '../../types'
import { defaultOperationPolicy, runWithPolicy, type OperationPolicy } from '../shared'
import type { SpotifyTransport } from './spotifyClient'

export class SpotifyService implements SpotifyServicePort {
  private connected = false
  private readonly policy: OperationPolicy

  public constructor(
    private readonly transport: SpotifyTransport,
    policy?: Partial<OperationPolicy>,
  ) {
    this.policy = {
      ...defaultOperationPolicy,
      ...policy,
    }
  }

  public async connect(): Promise<void> {
    this.connected = true
  }

  public async disconnect(): Promise<void> {
    this.connected = false
  }

  public isConnected(): boolean {
    return this.connected
  }

  public async play(): Promise<void> {
    this.ensureConnected('play')

    await runWithPolicy('spotify.play', this.policy, async () => {
      await this.transport.play()
    })
  }

  public async pause(): Promise<void> {
    this.ensureConnected('pause')

    await runWithPolicy('spotify.pause', this.policy, async () => {
      await this.transport.pause()
    })
  }

  public async nextTrack(): Promise<void> {
    this.ensureConnected('nextTrack')

    await runWithPolicy('spotify.nextTrack', this.policy, async () => {
      await this.transport.nextTrack()
    })
  }

  private ensureConnected(action: 'play' | 'pause' | 'nextTrack'): void {
    if (!this.connected) {
      throw new Error(`Spotify service must be connected before ${action}`)
    }
  }
}
