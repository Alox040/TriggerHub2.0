import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DashboardPage } from '../ui/pages'
import type { DashboardViewModel } from '../ui/types'

describe('DashboardPage UI', () => {
  it('renders key figma-aligned sections from view model', () => {
    const vm: DashboardViewModel = {
      title: 'Main Dashboard',
      live: true,
      triggers: [
        { id: 't1', title: 'Starting Soon', category: 'Scene', active: true },
        { id: 't2', title: 'Mute Mic', category: 'Audio', active: false },
      ],
      automations: [{ id: 'a1', title: 'BRB Sequence', detail: 'Switch + Mute' }],
      status: {
        obsConnected: true,
        spotifyConnected: true,
      },
    }

    const html = renderToStaticMarkup(
      <DashboardPage
        viewModel={vm}
        activeNavId="dashboard"
        onSelectNav={() => undefined}
        onToggleTrigger={() => undefined}
      />,
    )

    expect(html).toContain('Main Dashboard')
    expect(html).toContain('Trigger Controls')
    expect(html).toContain('Active Automations')
    expect(html).toContain('Starting Soon')
    expect(html).toContain('BRB Sequence')
  })
})
