export interface HotkeyBinding {
  key: string
  description: string
  handler: () => Promise<void>
}

export interface HotkeyEvent {
  key: string
  preventDefault(): void
}

export interface HotkeyEventSource {
  addEventListener(type: 'keydown', listener: (event: HotkeyEvent) => void): void
  removeEventListener(type: 'keydown', listener: (event: HotkeyEvent) => void): void
}

export class HotkeyManager {
  private readonly bindings = new Map<string, HotkeyBinding>()
  private listening = false
  private readonly onKeyDown = (event: HotkeyEvent): void => {
    const binding = this.bindings.get(HotkeyManager.normalizeKey(event.key))
    if (!binding) {
      return
    }

    event.preventDefault()
    void binding.handler()
  }

  public constructor(
    private readonly eventSource: HotkeyEventSource | undefined =
      typeof window === 'undefined' ? undefined : window,
  ) {}

  public register(binding: HotkeyBinding): void {
    this.bindings.set(HotkeyManager.normalizeKey(binding.key), binding)
  }

  public start(): void {
    if (this.listening || !this.eventSource) {
      return
    }

    this.eventSource.addEventListener('keydown', this.onKeyDown)
    this.listening = true
  }

  public stop(): void {
    if (!this.listening || !this.eventSource) {
      return
    }

    this.eventSource.removeEventListener('keydown', this.onKeyDown)
    this.listening = false
  }

  public async trigger(key: string): Promise<void> {
    const binding = this.bindings.get(HotkeyManager.normalizeKey(key))
    if (!binding) {
      throw new Error(`No hotkey binding for key "${key}"`)
    }

    await binding.handler()
  }

  public list(): HotkeyBinding[] {
    return Array.from(this.bindings.values())
  }

  private static normalizeKey(key: string): string {
    return key.trim().toUpperCase()
  }
}
