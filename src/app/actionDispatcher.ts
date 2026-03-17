import { MacroEngine } from '../core/macro-system'
import type { MacroExecutionContext, MacroStep } from '../core/macro-system'
import { TriggerExecutor, TriggerExecutorError } from '../core/trigger-engine'
import type { ClipServicePort, ObsServicePort, SpotifyServicePort, TwitchServicePort } from '../types'

export interface ActionDispatcherDeps {
  obsService: ObsServicePort
  spotifyService: SpotifyServicePort
  clipService: ClipServicePort
  twitchService: TwitchServicePort
}

export const createActionDispatcher = (deps: ActionDispatcherDeps) => {
  const executor = new TriggerExecutor()
  let macroEngine: MacroEngine | undefined

  const getMacroEngine = (): MacroEngine => {
    if (!macroEngine) {
      throw new Error('Macro engine reference must be set before executing macro actions')
    }

    return macroEngine
  }

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
        await getMacroEngine().runMacroWithResult(
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

  executor.register('obs.switchScene', async (action) => {
    const sceneName = action.payload?.sceneName
    if (typeof sceneName !== 'string' || sceneName.length === 0) {
      throw new Error('obs.switchScene requires payload.sceneName')
    }

    await deps.obsService.switchScene(sceneName)
  })

  executor.register('spotify.play', async () => {
    await deps.spotifyService.play()
  })

  executor.register('spotify.pause', async () => {
    await deps.spotifyService.pause()
  })

  executor.register('spotify.nextTrack', async () => {
    await deps.spotifyService.nextTrack()
  })

  executor.register('clip.startCapture', async () => {
    await deps.clipService.startCapture()
  })

  executor.register('clip.saveClip', async () => {
    await deps.clipService.saveClip()
  })

  executor.register('twitch.connect', async (action) => {
    const channelName = action.payload?.channelName
    if (channelName !== undefined && typeof channelName !== 'string') {
      throw new Error('twitch.connect requires payload.channelName to be a string when provided')
    }

    await deps.twitchService.connect(channelName)
  })

  executor.register('twitch.disconnect', async () => {
    await deps.twitchService.disconnect()
  })

  executor.register('twitch.getStreamStatus', async () => {
    await deps.twitchService.getStreamStatus()
  })

  executor.register('macro.run', async (action) => {
    const macroId = action.payload?.macroId
    if (typeof macroId !== 'string' || macroId.length === 0) {
      throw new Error('macro.run requires payload.macroId')
    }

    await getMacroEngine().runMacro(macroId)
  })

  executor.register('macro', async (action) => {
    const name = action.payload?.name
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('macro requires payload.name')
    }

    const foundMacro = getMacroEngine().getAllMacros().find((macro) => macro.name === name)
    if (!foundMacro) {
      throw new TriggerExecutorError(`Macro not found by name: "${name}"`)
    }

    await getMacroEngine().runMacro(foundMacro.id)
  })

  return {
    executor,
    executeMacroStep,
    setMacroEngine: (engine: MacroEngine): void => {
      macroEngine = engine
    },
  }
}
