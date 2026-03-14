export interface WindowCommand {
  type: 'focus' | 'minimize' | 'toggle-fullscreen'
}

export interface WindowControlApi {
  execute(command: WindowCommand): Promise<void>
}

type TriggerHubWindowControlApi = TriggerHubElectron['windowControl']
type TriggerHubWindow = Window & { triggerHubElectron?: TriggerHubElectron }

const getWindowControlApi = (
  targetWindow: TriggerHubWindow | undefined =
    typeof window === 'undefined' ? undefined : (window as TriggerHubWindow),
): TriggerHubWindowControlApi | undefined => {
  if (!targetWindow) {
    return undefined
  }

  return targetWindow.triggerHubElectron?.windowControl
}

export class WindowManager {
  private readonly commands: WindowCommand[] = []

  public constructor(private readonly windowControlApi?: WindowControlApi) {}

  public async execute(command: WindowCommand): Promise<void> {
    this.commands.push(command)

    const windowControlApi = this.windowControlApi ?? getWindowControlApi()
    if (!windowControlApi) {
      return
    }

    await windowControlApi.execute(command)
  }

  public getExecutedCommands(): WindowCommand[] {
    return [...this.commands]
  }
}
