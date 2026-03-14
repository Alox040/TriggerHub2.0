import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const {
  assertValidWindowCommand,
  executeWindowCommand,
  registerWindowCommandHandler,
} = require('../../electron/main.cjs') as {
  assertValidWindowCommand(command: unknown): void
  executeWindowCommand(
    targetWindow: {
      focus(): void
      minimize(): void
      isFullScreen(): boolean
      setFullScreen(value: boolean): void
    } | undefined,
    command: { type: 'focus' | 'minimize' | 'toggle-fullscreen' },
  ): Promise<void>
  registerWindowCommandHandler(targetIpcMain: {
    handle(channel: string, handler: (event: { sender: unknown }, command: unknown) => Promise<void>): void
  }): void
}

describe('electron window command handling', () => {
  it('validates supported window commands', () => {
    expect(() => assertValidWindowCommand({ type: 'focus' })).not.toThrow()
    expect(() => assertValidWindowCommand({ type: 'unsupported' })).toThrow('Invalid window command')
  })

  it('toggles fullscreen on the target window', async () => {
    let fullscreen = false
    const targetWindow = {
      focus: () => undefined,
      minimize: () => undefined,
      isFullScreen: () => fullscreen,
      setFullScreen: (value: boolean) => {
        fullscreen = value
      },
    }

    await executeWindowCommand(targetWindow, { type: 'toggle-fullscreen' })
    expect(fullscreen).toBe(true)

    await executeWindowCommand(targetWindow, { type: 'toggle-fullscreen' })
    expect(fullscreen).toBe(false)
  })

  it('registers an IPC handler for window commands', async () => {
    let registeredChannel = ''
    let registeredHandler:
      | ((event: { sender: unknown }, command: unknown) => Promise<void>)
      | undefined

    registerWindowCommandHandler({
      handle: (channel, handler) => {
        registeredChannel = channel
        registeredHandler = handler
      },
    })

    expect(registeredChannel).toBe('window:command')
    expect(registeredHandler).toBeTypeOf('function')
  })
})
