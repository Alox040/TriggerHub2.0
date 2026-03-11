export interface WindowCommand {
  type: 'focus' | 'minimize' | 'toggle-fullscreen'
}

export class WindowManager {
  private readonly commands: WindowCommand[] = []

  public async execute(command: WindowCommand): Promise<void> {
    this.commands.push(command)
  }

  public getExecutedCommands(): WindowCommand[] {
    return [...this.commands]
  }
}
