export interface AppConfig {
  appName: string
  environment: 'development' | 'test' | 'production'
}

export const defaultConfig: AppConfig = {
  appName: 'TriggerHub',
  environment: 'development',
}
