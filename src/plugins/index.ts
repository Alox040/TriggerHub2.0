import { createExamplePlugin } from './example-plugin'
import { PluginRegistry } from './pluginRegistry'
import { createConsoleLogger } from '../utils/logger'

export * from './pluginRegistry'
export * from './example-plugin'

export const createPluginRegistryWithDefaults = async (): Promise<PluginRegistry> => {
  const registry = new PluginRegistry(createConsoleLogger('PluginRegistry'))
  await registry.register(createExamplePlugin())
  return registry
}
