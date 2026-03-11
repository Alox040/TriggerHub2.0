import { describe, expect, it } from 'vitest'
import { createAppModuleContainer } from '../app/bootstrap'

describe('createAppModuleContainer', () => {
  it('returns dashboard state with seeded trigger and macro after start', async () => {
    const container = await createAppModuleContainer()

    await container.start()
    const state = await container.appFacade.getDashboardState()

    expect(state.connectedServices.obs).toBe(true)
    expect(state.connectedServices.spotify).toBe(true)
    expect(state.connectedServices.clip).toBe(true)

    expect(state.activeTriggers.some((t) => t.id === 'trigger-main-scene')).toBe(true)
    expect(state.activeMacros.some((m) => m.id === 'macro-default-scene')).toBe(true)

    await container.stop()
  })

  it('executes seeded trigger through app facade without throwing', async () => {
    const container = await createAppModuleContainer()

    await container.start()

    await expect(container.appFacade.executeTrigger('trigger-main-scene')).resolves.toBeUndefined()

    await container.stop()
  })
})
