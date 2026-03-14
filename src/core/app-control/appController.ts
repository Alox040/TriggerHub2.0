import type { AppControllerPort } from '../../types'
import { HotkeyManager } from './hotkeyManager'
import { WindowManager } from './windowManager'

export class AppController implements AppControllerPort {
  private running = false
  private hotkeysRegistered = false

  public constructor(
    private readonly hotkeyManager: HotkeyManager,
    private readonly windowManager: WindowManager,
  ) {}

  public async start(): Promise<void> {
    if (this.running) {
      return
    }

    this.running = true

    if (!this.hotkeysRegistered) {
      this.hotkeyManager.register({
        key: 'F11',
        description: 'Toggle fullscreen',
        handler: async () => {
          await this.windowManager.execute({ type: 'toggle-fullscreen' })
        },
      })
      this.hotkeysRegistered = true
    }

    this.hotkeyManager.start()
  }

  public async stop(): Promise<void> {
    if (!this.running) {
      return
    }

    this.running = false
    this.hotkeyManager.stop()
  }

  public isRunning(): boolean {
    return this.running
  }
}
