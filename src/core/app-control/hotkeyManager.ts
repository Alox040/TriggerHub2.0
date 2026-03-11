export interface HotkeyBinding {
  key: string
  description: string
  handler: () => Promise<void>
}

export class HotkeyManager {
  private readonly bindings = new Map<string, HotkeyBinding>()

  public register(binding: HotkeyBinding): void {
    this.bindings.set(binding.key, binding)
  }

  public async trigger(key: string): Promise<void> {
    const binding = this.bindings.get(key)
    if (!binding) {
      throw new Error(`No hotkey binding for key "${key}"`)
    }

    await binding.handler()
  }

  public list(): HotkeyBinding[] {
    return Array.from(this.bindings.values())
  }
}
