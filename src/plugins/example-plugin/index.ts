import { ExamplePlugin } from './plugin'

export * from './plugin'
export * from './pluginActions'
export * from './pluginConfig'

export const createExamplePlugin = (): ExamplePlugin => {
  return new ExamplePlugin()
}
