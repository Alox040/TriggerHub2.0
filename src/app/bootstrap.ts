import { AppController, HotkeyManager, WindowManager } from '../core/app-control'
import { InMemoryEventBus } from '../core/event-bus'
import { MacroEngine } from '../core/macro-system'
import type { MacroExecutionContext, MacroStep } from '../core/macro-system'
import {
  TriggerEngine,
  TriggerExecutor,
  TriggerExecutorError,
  TriggerGraph,
} from '../core/trigger-engine'
import type { Macro } from '../types'
import { EventTopics } from '../types'
import type { AppModuleContainer } from './container'
import { createClipService, createObsService, createSpotifyService } from '../services'
import { createPluginRegistryWithDefaults, PluginRegistry } from '../plugins'
import { TriggerHubAppFacade } from './facade'
import { createConsoleLogger } from '../utils/logger'

const seedDefaultCoreData = async (
  triggerEngine: TriggerEngine,
  macroEngine: MacroEngine,
): Promise<void> => {
  const defaultMacro: Macro = {
    id: 'macro-default-scene',
    name: 'Default Scene Macro',
    enabled: true,
    steps: [
      {
        id: 'step-obs-scene',
        type: 'service_call',
        service: 'obs',
        action: 'switchScene',
        params: { sceneName: 'Main' },
      },
    ],
  }

  await macroEngine.registerMacro(defaultMacro)

  await triggerEngine.registerTrigger({
    id: 'trigger-main-scene',
    name: 'Switch To Main Scene',
    enabled: true,
    event: EventTopics.OBS_CONNECTED,
    conditions: [],
    actions: [
      {
        type: 'macro.run',
        payload: { macroId: defaultMacro.id },
      },
    ],
  })
}

export interface RuntimeContainer extends AppModuleContainer {
  start(): Promise<void>
  stop(): Promise<void>
}

export const createAppModuleContainer = async (): Promise<RuntimeContainer> => {
  const serviceState = {
    obs: false,
    spotify: false,
    clip: false,
  }

  const eventBus = new InMemoryEventBus()

  const obsService = createObsService()
  const spotifyService = createSpotifyService()
  const clipService = createClipService({ exporter: 'filesystem' })
  const executor = new TriggerExecutor()

  let macroEngine!: MacroEngine
  const executeMacroStep = async (step: MacroStep, ctx: MacroExecutionContext): Promise<void> => {
    switch (step.type) {
      case 'delay':
        await new Promise((resolve) => {
          setTimeout(resolve, step.durationMs)
        })
        break
      case 'service_call':
        await executor.execute(
          {
            type: `${step.service}.${step.action}`,
            payload: step.params,
          },
          {},
        )
        break
      case 'plugin_action':
        await executor.execute(
          {
            type: `${step.plugin}.${step.action}`,
            payload: step.params,
          },
          {},
        )
        break
      case 'macro_call': {
        const mergedOptions = {
          ...(step.options ?? {}),
          variables: {
            ...ctx.variables,
            ...(step.options?.variables ?? {}),
          },
        }
        await macroEngine.runMacroWithResult(
          step.macroId,
          mergedOptions,
          ctx.depth + 1,
          ctx.triggerPayload,
        )
        break
      }
      case 'conditional': {
        const variableValue = ctx.variables[step.condition.variable]
        const conditionResult = (() => {
          switch (step.condition.operator) {
            case 'equals':
              return variableValue === step.condition.value
            case 'not_equals':
              return variableValue !== step.condition.value
            case 'greater_than':
              return (
                typeof variableValue === 'number' &&
                typeof step.condition.value === 'number' &&
                variableValue > step.condition.value
              )
            case 'less_than':
              return (
                typeof variableValue === 'number' &&
                typeof step.condition.value === 'number' &&
                variableValue < step.condition.value
              )
            case 'contains':
              return Array.isArray(variableValue)
                ? variableValue.includes(step.condition.value)
                : typeof variableValue === 'string' && typeof step.condition.value === 'string'
                  ? variableValue.includes(step.condition.value)
                  : false
            case 'exists':
              return variableValue !== undefined
          }
        })()

        const selectedSteps = conditionResult ? step.then : (step.else ?? [])
        for (const nestedStep of selectedSteps) {
          await executeMacroStep(nestedStep, ctx)
        }
        break
      }
      case 'parallel':
        await Promise.all(step.steps.map((nestedStep) => executeMacroStep(nestedStep, ctx)))
        break
      case 'sequence':
        for (const nestedStep of step.steps) {
          await executeMacroStep(nestedStep, ctx)
        }
        break
    }
  }
  macroEngine = new MacroEngine(executeMacroStep, eventBus)

  executor.register('obs.switchScene', async (action) => {
    const sceneName = action.payload?.sceneName
    if (typeof sceneName !== 'string' || sceneName.length === 0) {
      throw new Error('obs.switchScene requires payload.sceneName')
    }

    await obsService.switchScene(sceneName)
  })

  executor.register('spotify.play', async () => {
    await spotifyService.play()
  })

  executor.register('spotify.pause', async () => {
    await spotifyService.pause()
  })

  executor.register('spotify.nextTrack', async () => {
    await spotifyService.nextTrack()
  })

  executor.register('clip.startCapture', async () => {
    await clipService.startCapture()
  })

  executor.register('clip.saveClip', async () => {
    await clipService.saveClip()
  })

  executor.register('macro.run', async (action) => {
    const macroId = action.payload?.macroId
    if (typeof macroId !== 'string' || macroId.length === 0) {
      throw new Error('macro.run requires payload.macroId')
    }

    await macroEngine.runMacro(macroId)
  })

  executor.register('macro', async (action) => {
    const name = action.payload?.name
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('macro requires payload.name')
    }

    const foundMacro = macroEngine.getAllMacros().find((macro) => macro.name === name)
    if (!foundMacro) {
      throw new TriggerExecutorError(`Macro not found by name: "${name}"`)
    }

    await macroEngine.runMacro(foundMacro.id)
  })

  const triggerGraph = new TriggerGraph()

  const triggerEngine = new TriggerEngine(
    eventBus,
    triggerGraph,
    executor.toDispatcher(),
    createConsoleLogger('TriggerEngine'),
  )

  await seedDefaultCoreData(triggerEngine, macroEngine)

  const appController = new AppController(new HotkeyManager(), new WindowManager())
  const pluginRegistry: PluginRegistry = await createPluginRegistryWithDefaults()

  const appFacade = new TriggerHubAppFacade(triggerEngine, macroEngine, serviceState)

  return {
    appController,
    triggerEngine,
    macroEngine,
    obsService,
    spotifyService,
    clipService,
    pluginRegistry,
    appFacade,
    eventBus,
    start: async () => {
      await appController.start()
      await obsService.connect()
      await spotifyService.play()
      await clipService.startCapture()

      serviceState.obs = true
      serviceState.spotify = true
      serviceState.clip = true

      await pluginRegistry.activateAll({
        appController,
        triggerEngine,
        macroEngine,
        eventBus,
        actionRegistry: executor,
      })
    },
    stop: async () => {
      triggerEngine.destroy()
      await pluginRegistry.deactivateAll()
      await obsService.disconnect()
      await spotifyService.pause()
      await appController.stop()

      serviceState.obs = false
      serviceState.spotify = false
      serviceState.clip = false
    },
  }
}
