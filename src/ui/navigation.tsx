interface NavigationIconProps {
  size?: number
}

const iconStyle = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const DashboardIcon = ({ size = 16 }: NavigationIconProps): JSX.Element => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" rx="2" style={iconStyle} />
    <rect x="13" y="3" width="8" height="5" rx="2" style={iconStyle} />
    <rect x="13" y="10" width="8" height="11" rx="2" style={iconStyle} />
    <rect x="3" y="13" width="8" height="8" rx="2" style={iconStyle} />
  </svg>
)

const TriggerIcon = ({ size = 16 }: NavigationIconProps): JSX.Element => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" style={iconStyle} />
  </svg>
)

const MacroIcon = ({ size = 16 }: NavigationIconProps): JSX.Element => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M6 6h6v6" style={iconStyle} />
    <path d="M18 18h-6v-6" style={iconStyle} />
    <path d="M12 6 5 13" style={iconStyle} />
    <path d="m12 18 7-7" style={iconStyle} />
  </svg>
)

const PluginIcon = ({ size = 16 }: NavigationIconProps): JSX.Element => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M10 4.5V8" style={iconStyle} />
    <path d="M14 4.5V8" style={iconStyle} />
    <path d="M8 14H4.5" style={iconStyle} />
    <path d="M19.5 14H16" style={iconStyle} />
    <path d="M8 10h8v10H8z" style={iconStyle} />
    <path d="M10 14h4" style={iconStyle} />
  </svg>
)

const SettingsIcon = ({ size = 16 }: NavigationIconProps): JSX.Element => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <circle cx="12" cy="12" r="3" style={iconStyle} />
    <path
      d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z"
      style={iconStyle}
    />
  </svg>
)

export type AppViewId = 'dashboard' | 'triggers' | 'macros' | 'plugins' | 'settings'

export interface AppNavigationItem {
  id: AppViewId
  label: string
  description: string
  icon: (props: NavigationIconProps) => JSX.Element
}

export const appNavigationItems: AppNavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Runtime status and quick trigger actions', icon: DashboardIcon },
  { id: 'triggers', label: 'Triggers', description: 'Create, edit, and enable runtime triggers', icon: TriggerIcon },
  { id: 'macros', label: 'Macros', description: 'Build macro sequences and reorder their steps', icon: MacroIcon },
  { id: 'plugins', label: 'Plugins', description: 'Review installed plugin modules', icon: PluginIcon },
  { id: 'settings', label: 'Settings', description: 'Control runtime activation and refresh state', icon: SettingsIcon },
]
