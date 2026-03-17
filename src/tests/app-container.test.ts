import { describe, expect, it } from 'vitest'
import { createAppModuleContainer } from '../app/bootstrap'

describe('createAppModuleContainer', () => {
  it('bootstraps seeded trigger and macro without activating runtime services', async () => {
    const container = await createAppModuleContainer()

    await container.start()
    const state = await container.appFacade.getDashboardState()

    expect(state.connectedServices.obs).toBe(false)
    expect(state.connectedServices.spotify).toBe(false)
    expect(state.connectedServices.clip).toBe(false)
    expect(state.connectedServices.twitch).toBe(false)

    expect(state.activeTriggers.some((t) => t.id === 'trigger-main-scene')).toBe(true)
    expect(state.activeMacros.some((m) => m.id === 'macro-default-scene')).toBe(true)

    await container.stop()
  })

  it('activates runtime services explicitly through the app facade', async () => {
    const container = await createAppModuleContainer()

    await container.start()
    await container.appFacade.activateRuntime()

    const state = await container.appFacade.getDashboardState()
    expect(state.connectedServices.obs).toBe(true)
    expect(state.connectedServices.spotify).toBe(true)
    expect(state.connectedServices.clip).toBe(true)
    expect(state.connectedServices.twitch).toBe(true)
    await expect(container.clipService.saveClip()).rejects.toThrow('not active')

    await container.stop()
  })

  it('executes seeded trigger through app facade after explicit runtime activation', async () => {
    const container = await createAppModuleContainer()

    await container.start()
    await container.appFacade.activateRuntime()

    await expect(container.appFacade.executeTrigger('trigger-main-scene')).resolves.toBeUndefined()

    await container.stop()
  })

  it('disconnects twitch on stop after a manual twitch connection', async () => {
    const container = await createAppModuleContainer()

    await container.start()
    await container.appFacade.connectTwitch()

    expect((await container.appFacade.getSettingsState()).connectedServices.twitch).toBe(true)

    await container.stop()

    expect(container.twitchService.isConnected()).toBe(false)
  })
})
