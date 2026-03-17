export interface TriggerCardViewModel {
  id: string
  title: string
  category: string
  active: boolean
}

export interface AutomationItemViewModel {
  id: string
  title: string
  detail: string
}

export interface DashboardViewModel {
  title: string
  live: boolean
  triggers: TriggerCardViewModel[]
  automations: AutomationItemViewModel[]
  status: {
    obsConnected: boolean
    spotifyConnected: boolean
    clipConnected: boolean
    twitchConnected: boolean
  }
}

export interface RuntimeStatusViewModel {
  obsConnected: boolean
  spotifyConnected: boolean
  clipConnected: boolean
  twitchConnected: boolean
}

export interface RuntimeLogEntry {
  id: string
  message: string
  timestamp: number
}
