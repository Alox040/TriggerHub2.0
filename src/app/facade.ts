import type { DashboardState, EditorState, PluginsState, SettingsState } from '../types'
import { MacroEngine } from '../core/macro-system'
import type { MacroDefinition } from '../core/macro-system/macroTypes'
import { TriggerEngine } from '../core/trigger-engine'
import type { GraphTrigger } from '../core/trigger-engine/triggerGraphTypes'
import { DashboardReadModelValidationError, isDashboardState } from './readModel'
import type { RuntimeConfig } from './runtimeConfig'
import { stripMacroRecord, stripTriggerRecord } from './storageHelpers'
import type { PluginRegistryPort } from '../types/ports'

export interface AppFacadePersistence {
  persist(): Promise<void>
}

export interface AppFacadeRuntimeCommands {
  activateRuntime(): Promise<void>
  deactivateRuntime(): Promise<void>
  connectTwitch(channelName?: string): Promise<void>
  disconnectTwitch(): Promise<void>
}

export class TriggerHubAppFacade {
  public constructor(
    private readonly triggerEngine: TriggerEngine,
    private readonly macroEngine: MacroEngine,
    private readonly serviceState: { obs: boolean; spotify: boolean; clip: boolean; twitch: boolean },
    private readonly pluginRegistry?: PluginRegistryPort,
    private readonly persistence?: AppFacadePersistence,
    private readonly runtimeConfig?: RuntimeConfig,
    private readonly runtimeCommands?: AppFacadeRuntimeCommands,
  ) {}

  public async getDashboardState(): Promise<DashboardState> {
    const candidate: unknown = {
      connectedServices: {
        obs: this.serviceState.obs,
        spotify: this.serviceState.spotify,
        clip: this.serviceState.clip,
        twitch: this.serviceState.twitch,
      },
      activeTriggers: this.triggerEngine.getAll().map((trigger) => ({
        id: trigger.id,
        name: trigger.name,
        enabled: trigger.enabled,
      })),
      activeMacros: this.macroEngine.getAllMacros().map((macro) => ({
        id: macro.id,
        name: macro.name,
        steps: macro.steps,
        enabled: macro.enabled,
      })),
    }

    if (!isDashboardState(candidate)) {
      throw new DashboardReadModelValidationError(candidate)
    }

    return candidate
  }

  public async listTriggers(): Promise<GraphTrigger[]> {
    return this.triggerEngine.getAll().map((trigger) => stripTriggerRecord(trigger))
  }

  public async getEditorState(): Promise<EditorState> {
    return {
      triggers: await this.listTriggers(),
      macros: await this.listMacros(),
    }
  }

  public async getPluginsState(): Promise<PluginsState> {
    const plugins = await this.pluginRegistry?.list()

    return {
      plugins: (plugins ?? []).map((plugin) => ({
        id: plugin.id,
        name: plugin.name,
      })),
    }
  }

  public async getSettingsState(): Promise<SettingsState> {
    const editorState = await this.getEditorState()

    return {
      connectedServices: {
        obs: this.serviceState.obs,
        spotify: this.serviceState.spotify,
        clip: this.serviceState.clip,
        twitch: this.serviceState.twitch,
      },
      triggerCount: editorState.triggers.length,
      macroCount: editorState.macros.length,
      twitchConfig: this.runtimeConfig?.twitch ?? {},
      obsConfig: this.runtimeConfig?.obs ?? {},
    }
  }

  public async getTrigger(triggerId: string): Promise<GraphTrigger | undefined> {
    const trigger = this.triggerEngine.getTrigger(triggerId)
    return trigger ? stripTriggerRecord(trigger) : undefined
  }

  public async executeTrigger(triggerId: string): Promise<void> {
    await this.triggerEngine.executeTrigger(triggerId)
  }

  public async updateTrigger(trigger: GraphTrigger): Promise<void> {
    await this.triggerEngine.updateTrigger(trigger)
    await this.persistIfAvailable()
  }

  public async listMacros(): Promise<MacroDefinition[]> {
    return this.macroEngine.getAllMacros().map((macro) => stripMacroRecord(macro))
  }

  public async getMacro(macroId: string): Promise<MacroDefinition | undefined> {
    const macro = this.macroEngine.getMacroById(macroId)
    return macro ? stripMacroRecord(macro) : undefined
  }

  public async runMacro(macroId: string): Promise<void> {
    await this.macroEngine.runMacro(macroId)
  }

  public async createTrigger(trigger: GraphTrigger): Promise<void> {
    await this.triggerEngine.registerTrigger(trigger)
    await this.persistIfAvailable()
  }

  public async deleteTrigger(triggerId: string): Promise<void> {
    await this.triggerEngine.removeTrigger(triggerId)
    await this.persistIfAvailable()
  }

  public async createMacro(macro: MacroDefinition): Promise<void> {
    await this.macroEngine.registerMacro(macro)
    await this.persistIfAvailable()
  }

  public async updateMacro(macro: MacroDefinition): Promise<void> {
    await this.macroEngine.updateMacro(macro)
    await this.persistIfAvailable()
  }

  public async deleteMacro(macroId: string): Promise<void> {
    this.macroEngine.removeMacro(macroId)
    await this.persistIfAvailable()
  }

  public async activateRuntime(): Promise<void> {
    if (!this.runtimeCommands) {
      return
    }

    await this.runtimeCommands.activateRuntime()
    await this.persistIfAvailable()
  }

  public async deactivateRuntime(): Promise<void> {
    if (!this.runtimeCommands) {
      return
    }

    await this.runtimeCommands.deactivateRuntime()
    await this.persistIfAvailable()
  }

  public async connectTwitch(channelName?: string): Promise<void> {
    if (!this.runtimeCommands) {
      return
    }

    await this.runtimeCommands.connectTwitch(channelName)
    await this.persistIfAvailable()
  }

  public async disconnectTwitch(): Promise<void> {
    if (!this.runtimeCommands) {
      return
    }

    await this.runtimeCommands.disconnectTwitch()
    await this.persistIfAvailable()
  }

  public async updateRuntimeConfig(updates: Partial<RuntimeConfig>): Promise<void> {
    if (!this.runtimeConfig) {
      return
    }

    if (updates.twitch) {
      this.runtimeConfig.twitch = {
        ...(this.runtimeConfig.twitch ?? {}),
        ...updates.twitch,
      }
    }

    if (updates.obs) {
      this.runtimeConfig.obs = {
        ...(this.runtimeConfig.obs ?? {}),
        ...updates.obs,
      }
    }

    await this.persistIfAvailable()
  }

  private async persistIfAvailable(): Promise<void> {
    if (!this.persistence) {
      return
    }

    await this.persistence.persist()
  }
}
