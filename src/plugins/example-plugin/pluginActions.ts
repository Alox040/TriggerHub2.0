import type { PluginContext } from '../../types'
import type { ExamplePluginConfig } from './pluginConfig'

export const runExampleAutomation = async (
  context: PluginContext,
  config: ExamplePluginConfig,
): Promise<void> => {
  if (config.autoStartController) {
    await context.appController.start()
  }

  if (config.initialTriggerId) {
    await context.triggerEngine.executeTrigger(config.initialTriggerId)
  }

  if (config.initialMacroId) {
    await context.macroEngine.runMacro(config.initialMacroId)
  }
}
