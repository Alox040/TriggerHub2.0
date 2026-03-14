import { describe, expect, it, vi } from 'vitest'
import { createAppModuleContainer } from '../app/bootstrap'
import { InMemoryStorage } from '../storage/inMemoryStorage'
import type { RuntimeConfig } from '../app/runtimeConfig'

const readPersistedItems = async (
  storage: InMemoryStorage,
  key: string,
): Promise<Array<{ id: string }> | null> => {
  const payload = await storage.load<{ items?: Array<{ id: string }> }>(key)
  return payload?.items ?? null
}

describe('storage-backed runtime startup', () => {
  it('seeds core data on first start and persists it on stop', async () => {
    const storage = new InMemoryStorage()
    const container = await createAppModuleContainer(storage)

    await container.start()

    const state = await container.appFacade.getDashboardState()
    expect(state.activeTriggers.some((trigger) => trigger.id === 'trigger-main-scene')).toBe(true)
    expect(state.activeMacros.some((macro) => macro.id === 'macro-default-scene')).toBe(true)

    const persistedDuringStart = await readPersistedItems(storage, 'triggers')
    expect(persistedDuringStart?.some((trigger) => trigger.id === 'trigger-main-scene')).toBe(true)

    await container.stop()

    const persistedTriggers = await readPersistedItems(storage, 'triggers')
    const persistedMacros = await readPersistedItems(storage, 'macros')

    expect(persistedTriggers?.some((trigger) => trigger.id === 'trigger-main-scene')).toBe(true)
    expect(persistedMacros?.some((macro) => macro.id === 'macro-default-scene')).toBe(true)
  })

  it('uses runtime-config storage keys for facade-triggered persistence', async () => {
    const storage = new InMemoryStorage()
    const runtimeConfig: RuntimeConfig = {
      storageKeys: {
        triggers: 'custom-triggers',
        macros: 'custom-macros',
      },
    }
    await storage.save('runtime-config', runtimeConfig)

    const container = await createAppModuleContainer(storage)
    await container.start()

    await container.appFacade.createTrigger({
      id: 'config-trigger',
      name: 'Config Trigger',
      enabled: true,
      event: 'test:config',
      conditions: [],
      actions: [],
    })
    await container.appFacade.createMacro({
      id: 'config-macro',
      name: 'Config Macro',
      enabled: true,
      steps: [{ id: 'config-step', type: 'delay', durationMs: 0 }],
    })

    const persistedTriggers = await readPersistedItems(storage, 'custom-triggers')
    const persistedMacros = await readPersistedItems(storage, 'custom-macros')

    expect(persistedTriggers?.some((trigger) => trigger.id === 'config-trigger')).toBe(true)
    expect(persistedMacros?.some((macro) => macro.id === 'config-macro')).toBe(true)

    await container.stop()
  })

  it('does not reseed when persisted state explicitly contains empty arrays', async () => {
    const storage = new InMemoryStorage()
    await storage.save('triggers', [])
    await storage.save('macros', [])

    const container = await createAppModuleContainer(storage)
    await container.start()

    const state = await container.appFacade.getDashboardState()
    expect(state.activeTriggers).toEqual([])
    expect(state.activeMacros).toEqual([])

    await container.stop()
  })

  it('falls back to seed data when persisted payloads are unusable', async () => {
    const storage = new InMemoryStorage()
    await storage.save('triggers', { broken: true })
    await storage.save('macros', { broken: true })

    const container = await createAppModuleContainer(storage)
    await container.start()

    const state = await container.appFacade.getDashboardState()
    expect(state.activeTriggers.some((trigger) => trigger.id === 'trigger-main-scene')).toBe(true)
    expect(state.activeMacros.some((macro) => macro.id === 'macro-default-scene')).toBe(true)

    const persistedTriggers = await storage.load<{ version: number; items: Array<{ id: string }> }>('triggers')
    const persistedMacros = await storage.load<{ version: number; items: Array<{ id: string }> }>('macros')
    expect(persistedTriggers?.version).toBe(1)
    expect(persistedMacros?.version).toBe(1)
    expect(Array.isArray(persistedTriggers?.items)).toBe(true)
    expect(Array.isArray(persistedMacros?.items)).toBe(true)

    await container.stop()
  })

  it('filters invalid persisted entries while keeping valid triggers and macros', async () => {
    const storage = new InMemoryStorage()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    await storage.save('triggers', [
      {
        id: 'valid-trigger',
        name: 'Valid Trigger',
        enabled: true,
        event: 'test:valid',
        conditions: [],
        actions: [],
      },
      {
        id: '',
        name: 'Invalid Trigger',
        enabled: true,
        event: 'test:invalid',
        conditions: [],
        actions: [],
      },
    ])
    await storage.save('macros', [
      {
        id: 'valid-macro',
        name: 'Valid Macro',
        enabled: true,
        steps: [{ id: 'step-1', type: 'delay', durationMs: 0 }],
      },
      {
        id: 'invalid-macro',
        name: 'Invalid Macro',
        enabled: true,
        steps: [{ id: 'step-2', type: 'delay' }],
      },
    ])

    const container = await createAppModuleContainer(storage)
    await container.start()

    const state = await container.appFacade.getDashboardState()
    expect(state.activeTriggers).toEqual([
      expect.objectContaining({ id: 'valid-trigger' }),
    ])
    expect(state.activeMacros).toEqual([
      expect.objectContaining({ id: 'valid-macro' }),
    ])
    expect(state.activeTriggers.some((trigger) => trigger.id === 'trigger-main-scene')).toBe(false)
    expect(state.activeMacros.some((macro) => macro.id === 'macro-default-scene')).toBe(false)
    expect(warnSpy).toHaveBeenCalled()

    await container.stop()
    warnSpy.mockRestore()
  })

  it('treats null and string persisted data as unusable and falls back cleanly', async () => {
    const storage = new InMemoryStorage()
    await storage.save('triggers', 'totally broken')
    await storage.save('macros', null)

    const container = await createAppModuleContainer(storage)
    await container.start()

    const state = await container.appFacade.getDashboardState()
    expect(state.activeTriggers.some((trigger) => trigger.id === 'trigger-main-scene')).toBe(true)
    expect(state.activeMacros.some((macro) => macro.id === 'macro-default-scene')).toBe(true)

    await container.stop()
  })

  it('migrates legacy array payloads into the versioned persistence envelope', async () => {
    const storage = new InMemoryStorage()
    await storage.save('triggers', [
      {
        id: 'legacy-trigger',
        name: 'Legacy Trigger',
        enabled: true,
        event: 'test:legacy',
        conditions: [],
        actions: [],
      },
    ])
    await storage.save('macros', [
      {
        id: 'legacy-macro',
        name: 'Legacy Macro',
        enabled: true,
        steps: [{ id: 'legacy-step', type: 'delay', durationMs: 0 }],
      },
    ])

    const container = await createAppModuleContainer(storage)
    await container.start()

    const migratedTriggers = await storage.load<{ schema: string; version: number; items: Array<{ id: string }> }>('triggers')
    const migratedMacros = await storage.load<{ schema: string; version: number; items: Array<{ id: string }> }>('macros')

    expect(migratedTriggers).toMatchObject({
      schema: 'triggerhub.collection',
      version: 1,
      items: [expect.objectContaining({ id: 'legacy-trigger' })],
    })
    expect(migratedMacros).toMatchObject({
      schema: 'triggerhub.collection',
      version: 1,
      items: [expect.objectContaining({ id: 'legacy-macro' })],
    })

    await container.stop()
  })

  it('falls back safely when persisted payload version is unsupported', async () => {
    const storage = new InMemoryStorage()
    await storage.save('triggers', {
      schema: 'triggerhub.collection',
      version: 99,
      kind: 'triggers',
      items: [],
    })
    await storage.save('macros', {
      schema: 'triggerhub.collection',
      version: 99,
      kind: 'macros',
      items: [],
    })

    const container = await createAppModuleContainer(storage)
    await container.start()

    const state = await container.appFacade.getDashboardState()
    expect(state.activeTriggers.some((trigger) => trigger.id === 'trigger-main-scene')).toBe(true)
    expect(state.activeMacros.some((macro) => macro.id === 'macro-default-scene')).toBe(true)

    await container.stop()
  })

  it('reloads persisted triggers and macros instead of reseeding defaults', async () => {
    const storage = new InMemoryStorage()

    const firstContainer = await createAppModuleContainer(storage)
    await firstContainer.start()
    await firstContainer.appFacade.createTrigger({
      id: 'persisted-trigger',
      name: 'Persisted Trigger',
      enabled: true,
      event: 'test:persisted',
      conditions: [],
      actions: [],
    })
    await firstContainer.appFacade.createMacro({
      id: 'persisted-macro',
      name: 'Persisted Macro',
      enabled: true,
      steps: [{ id: 'persisted-step', type: 'delay', durationMs: 0 }],
    })
    await firstContainer.stop()

    const secondContainer = await createAppModuleContainer(storage)
    await secondContainer.start()

    const state = await secondContainer.appFacade.getDashboardState()
    expect(state.activeTriggers.some((trigger) => trigger.id === 'persisted-trigger')).toBe(true)
    expect(state.activeMacros.some((macro) => macro.id === 'persisted-macro')).toBe(true)
    expect(state.activeTriggers.filter((trigger) => trigger.id === 'trigger-main-scene')).toHaveLength(1)
    expect(state.activeMacros.filter((macro) => macro.id === 'macro-default-scene')).toHaveLength(1)

    await secondContainer.stop()
  })

  it('persists facade CRUD mutations when storage is available', async () => {
    const storage = new InMemoryStorage()
    const container = await createAppModuleContainer(storage)

    await container.start()

    await container.appFacade.createTrigger({
      id: 'crud-trigger',
      name: 'CRUD Trigger',
      enabled: true,
      event: 'test:crud',
      conditions: [],
      actions: [],
    })
    await container.appFacade.createMacro({
      id: 'crud-macro',
      name: 'CRUD Macro',
      enabled: true,
      steps: [{ id: 'crud-step', type: 'delay', durationMs: 0 }],
    })
    await container.appFacade.updateTrigger({
      id: 'crud-trigger',
      name: 'CRUD Trigger Updated',
      enabled: false,
      event: 'test:crud-updated',
      conditions: [],
      actions: [],
    })
    await container.appFacade.updateMacro({
      id: 'crud-macro',
      name: 'CRUD Macro Updated',
      enabled: false,
      steps: [{ id: 'crud-step-updated', type: 'delay', durationMs: 1 }],
    })

    let persistedTriggers = await readPersistedItems(storage, 'triggers')
    let persistedMacros = await readPersistedItems(storage, 'macros')

    expect(persistedTriggers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'crud-trigger',
          name: 'CRUD Trigger Updated',
          enabled: false,
          event: 'test:crud-updated',
        }),
      ]),
    )
    expect(persistedMacros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'crud-macro',
          name: 'CRUD Macro Updated',
          enabled: false,
        }),
      ]),
    )

    await container.appFacade.deleteTrigger('crud-trigger')
    await container.appFacade.deleteMacro('crud-macro')

    persistedTriggers = await readPersistedItems(storage, 'triggers')
    persistedMacros = await readPersistedItems(storage, 'macros')

    expect(persistedTriggers?.some((trigger) => trigger.id === 'crud-trigger')).toBe(false)
    expect(persistedMacros?.some((macro) => macro.id === 'crud-macro')).toBe(false)

    await container.stop()
  })
})
