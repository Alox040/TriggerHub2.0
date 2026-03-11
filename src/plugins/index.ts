import { createExamplePlugin } from './example-plugin'
import { PluginRegistry } from './pluginRegistry'

export * from './pluginRegistry'
export * from './example-plugin'

export const createPluginRegistryWithDefaults = async (): Promise<PluginRegistry> => {
  const registry = new PluginRegistry()
  await registry.register(createExamplePlugin())
  return registry
}
