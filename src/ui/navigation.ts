export type AppViewId = 'dashboard' | 'editor' | 'plugins' | 'settings'

export interface AppNavigationItem {
  id: AppViewId
  label: string
  description: string
}

export const appNavigationItems: AppNavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Runtime status and quick trigger actions' },
  { id: 'editor', label: 'Editor', description: 'Inspect triggers and macros' },
  { id: 'plugins', label: 'Plugins', description: 'Review installed plugin modules' },
  { id: 'settings', label: 'Settings', description: 'Control runtime activation and refresh state' },
]
