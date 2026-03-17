import type { ObsServicePort } from '../../types'
import { defaultOperationPolicy, runWithPolicy, type OperationPolicy } from '../shared'
import type { ObsTransport } from './obsClient'
import { normalizeObsSceneName } from './contracts'

export class ObsService implements ObsServicePort {
  private connected = false
  private readonly policy: OperationPolicy

  public constructor(
    private readonly transport: ObsTransport,
    policy?: Partial<OperationPolicy>,
  ) {
    this.policy = {
      ...defaultOperationPolicy,
      ...policy,
    }
  }

  public async connect(): Promise<void> {
    await runWithPolicy('obs.connect', this.policy, async () => {
      await this.transport.connect()
    })

    this.connected = true
  }

  public async disconnect(): Promise<void> {
    await runWithPolicy('obs.disconnect', this.policy, async () => {
      await this.transport.disconnect()
    })

    this.connected = false
  }

  public isConnected(): boolean {
    return this.connected
  }

  public async switchScene(sceneName: string): Promise<void> {
    if (!this.connected) {
      throw new Error('OBS service must be connected before switching scenes')
    }

    const normalizedSceneName = normalizeObsSceneName(sceneName)

    await runWithPolicy('obs.switchScene', this.policy, async () => {
      await this.transport.setCurrentScene(normalizedSceneName)
    })
  }
}
