import type { TriggerPayload } from './triggerConditions'
import type { TriggerAction } from './triggerGraphTypes'
import type { ActionDispatcher } from './triggerTypes'

export class TriggerExecutorError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'TriggerExecutorError'
  }
}

export type ActionHandler = (action: TriggerAction, payload: TriggerPayload) => Promise<void>

export interface ActionRegistryPort {
  register(type: string, handler: ActionHandler): void
  unregister(type: string): void
}

export class TriggerExecutor implements ActionRegistryPort {
  private readonly registry = new Map<string, ActionHandler>()

  public register(type: string, handler: ActionHandler): void {
    this.registry.set(type, handler)
  }

  public unregister(type: string): void {
    this.registry.delete(type)
  }

  public hasHandler(type: string): boolean {
    return this.registry.has(type)
  }

  public async execute(action: TriggerAction, payload: TriggerPayload): Promise<void> {
    const handler = this.registry.get(action.type)
    if (!handler) {
      throw new TriggerExecutorError(`No handler registered for action type: "${action.type}"`)
    }

    await handler(action, payload)
  }

  public toDispatcher(): ActionDispatcher {
    return async (action, payload) => this.execute(action, payload)
  }
}
