export interface ExamplePluginConfig {
  autoStartController: boolean
  initialTriggerId?: string
  initialMacroId?: string
}

export const defaultExamplePluginConfig: ExamplePluginConfig = {
  autoStartController: false,
}
