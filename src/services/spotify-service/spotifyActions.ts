import type { SpotifyServicePort } from '../../types'
import { defaultOperationPolicy, runWithPolicy, type OperationPolicy } from '../shared'
import type { SpotifyTransport } from './spotifyClient'

export class SpotifyService implements SpotifyServicePort {
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

  public async play(): Promise<void> {
    await runWithPolicy('spotify.play', this.policy, async () => {
      await this.transport.play()
    })
  }

  public async pause(): Promise<void> {
    await runWithPolicy('spotify.pause', this.policy, async () => {
      await this.transport.pause()
    })
  }

  public async nextTrack(): Promise<void> {
    await runWithPolicy('spotify.nextTrack', this.policy, async () => {
      await this.transport.nextTrack()
    })
  }
}
