import type { PluginContext, PluginModule } from '../../types'
import type { ExamplePluginConfig } from './pluginConfig'
import { defaultExamplePluginConfig } from './pluginConfig'
import { runExampleAutomation } from './pluginActions'

export class ExamplePlugin implements PluginModule {
  public readonly id = 'example-plugin'
  public readonly name = 'Example Plugin'

  private active = false

  public constructor(private readonly config: ExamplePluginConfig = defaultExamplePluginConfig) {}

  public async activate(context: PluginContext): Promise<void> {
    if (this.active) {
      return
    }

    this.active = true
    await runExampleAutomation(context, this.config)
  }

  public async deactivate(): Promise<void> {
    this.active = false
  }
}
