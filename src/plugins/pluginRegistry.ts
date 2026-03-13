import type { PluginContext, PluginModule, PluginRegistryPort } from '../types'
import { createConsoleLogger, type Logger } from '../utils/logger'

export class PluginRegistry implements PluginRegistryPort {
  private readonly plugins = new Map<string, PluginModule>()
  private readonly logger: Logger

  public constructor(logger: Logger = createConsoleLogger('PluginRegistry')) {
    this.logger = logger
  }

  public async register(plugin: PluginModule): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id "${plugin.id}" is already registered`)
    }

    this.plugins.set(plugin.id, plugin)
  }

  public async unregister(pluginId: string): Promise<void> {
    this.plugins.delete(pluginId)
  }

  public async list(): Promise<PluginModule[]> {
    return Array.from(this.plugins.values())
  }

  public async activateAll(context: PluginContext): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.activate(context)
        this.logger.info('Plugin activated', {
          pluginId: plugin.id,
          pluginName: plugin.name,
        })
      } catch (error) {
        this.logger.error('Plugin activation failed in isolation guard', {
          pluginId: plugin.id,
          pluginName: plugin.name,
          error,
        })
      }
    }
  }

  public async deactivateAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.deactivate()
        this.logger.info('Plugin deactivated', {
          pluginId: plugin.id,
          pluginName: plugin.name,
        })
      } catch (error) {
        this.logger.error('Plugin deactivation failed in isolation guard', {
          pluginId: plugin.id,
          pluginName: plugin.name,
          error,
        })
      }
    }
  }
}
