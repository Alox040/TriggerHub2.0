import type { PluginContext, PluginModule, PluginRegistryPort } from '../types'

export class PluginRegistry implements PluginRegistryPort {
  private readonly plugins = new Map<string, PluginModule>()

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
      await plugin.activate(context)
    }
  }

  public async deactivateAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.deactivate()
    }
  }
}
