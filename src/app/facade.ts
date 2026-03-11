import type { DashboardState } from '../types'
import { MacroEngine } from '../core/macro-system'
import { TriggerEngine } from '../core/trigger-engine'
import { DashboardReadModelValidationError, isDashboardState } from './readModel'

export class TriggerHubAppFacade {
  public constructor(
    private readonly triggerEngine: TriggerEngine,
    private readonly macroEngine: MacroEngine,
    private readonly serviceState: { obs: boolean; spotify: boolean; clip: boolean },
  ) {}

  public async getDashboardState(): Promise<DashboardState> {
    const candidate: unknown = {
      connectedServices: {
        obs: this.serviceState.obs,
        spotify: this.serviceState.spotify,
        clip: this.serviceState.clip,
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

  public async executeTrigger(triggerId: string): Promise<void> {
    await this.triggerEngine.executeTrigger(triggerId)
  }

  public async runMacro(macroId: string): Promise<void> {
    await this.macroEngine.runMacro(macroId)
  }
}
