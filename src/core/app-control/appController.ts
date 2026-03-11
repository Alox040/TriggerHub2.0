import type { AppControllerPort } from '../../types'
import { HotkeyManager } from './hotkeyManager'
import { WindowManager } from './windowManager'

export class AppController implements AppControllerPort {
  private running = false

  public constructor(
    private readonly hotkeyManager: HotkeyManager,
    private readonly windowManager: WindowManager,
  ) {}

  public async start(): Promise<void> {
    this.running = true

    this.hotkeyManager.register({
      key: 'F11',
      description: 'Toggle fullscreen',
      handler: async () => {
        await this.windowManager.execute({ type: 'toggle-fullscreen' })
      },
    })
  }

  public async stop(): Promise<void> {
    this.running = false
  }

  public isRunning(): boolean {
    return this.running
  }
}
