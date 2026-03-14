import { describe, expect, it, vi } from 'vitest'
import { AppController, HotkeyManager, WindowManager } from '../core/app-control'

class TestHotkeyEventSource {
  private listener: ((event: { key: string; preventDefault(): void }) => void) | undefined

  public addEventListener(
    _type: 'keydown',
    listener: (event: { key: string; preventDefault(): void }) => void,
  ): void {
    this.listener = listener
  }

  public removeEventListener(
    _type: 'keydown',
    listener: (event: { key: string; preventDefault(): void }) => void,
  ): void {
    if (this.listener === listener) {
      this.listener = undefined
    }
  }

  public dispatch(key: string): { defaultPrevented: boolean } {
    let defaultPrevented = false
    this.listener?.({
      key,
      preventDefault: () => {
        defaultPrevented = true
      },
    })

    return { defaultPrevented }
  }
}

describe('AppController hotkey flow', () => {
  it('binds F11 to window fullscreen toggle through the manager chain', async () => {
    const eventSource = new TestHotkeyEventSource()
    const windowControlApi = {
      execute: vi.fn(async () => undefined),
    }
    const hotkeyManager = new HotkeyManager(eventSource)
    const windowManager = new WindowManager(windowControlApi)
    const controller = new AppController(hotkeyManager, windowManager)

    await controller.start()
    const keyboardEvent = eventSource.dispatch('f11')
    await Promise.resolve()

    expect(keyboardEvent.defaultPrevented).toBe(true)
    expect(windowControlApi.execute).toHaveBeenCalledWith({ type: 'toggle-fullscreen' })

    await controller.stop()
  })

  it('records commands locally when no Electron bridge is available', async () => {
    const windowManager = new WindowManager()

    await windowManager.execute({ type: 'minimize' })

    expect(windowManager.getExecutedCommands()).toEqual([{ type: 'minimize' }])
  })
})
