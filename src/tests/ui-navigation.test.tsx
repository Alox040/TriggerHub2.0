import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { EditorPage, PluginsPage, SettingsPage } from '../ui/pages'
import { appNavigationItems } from '../ui/navigation'

describe('Desktop multi-view pages', () => {
  it('renders editor content with shared desktop navigation', () => {
    const html = renderToStaticMarkup(
      <EditorPage
        title="Trigger Editor"
        live={false}
        navItems={appNavigationItems}
        activeNavId="editor"
        onSelectNav={() => undefined}
        triggers={[
          {
            id: 'trigger-1',
            name: 'Go Live',
            enabled: true,
            event: 'obs:connected',
            conditions: [],
            actions: [{ type: 'macro.run', payload: { macroId: 'macro-1' } }],
          },
        ]}
        macros={[
          {
            id: 'macro-1',
            name: 'Intro Macro',
            enabled: true,
            steps: [{ id: 'step-1', type: 'delay', durationMs: 0 }],
          },
        ]}
        onRunMacro={() => undefined}
      />,
    )

    expect(html).toContain('Dashboard')
    expect(html).toContain('Trigger Definitions')
    expect(html).toContain('Macro Library')
    expect(html).toContain('Run Macro')
  })

  it('renders plugin inventory and settings controls with active navigation targets', () => {
    const activateRuntime = vi.fn(() => undefined)
    const deactivateRuntime = vi.fn(() => undefined)
    const refreshState = vi.fn(() => undefined)

    const pluginsHtml = renderToStaticMarkup(
      <PluginsPage
        title="Plugin Inventory"
        live={false}
        navItems={appNavigationItems}
        activeNavId="plugins"
        onSelectNav={() => undefined}
        plugins={[{ id: 'example-plugin', name: 'Example Plugin' }]}
      />,
    )

    const settingsHtml = renderToStaticMarkup(
      <SettingsPage
        title="Runtime Settings"
        live={false}
        navItems={appNavigationItems}
        activeNavId="settings"
        onSelectNav={() => undefined}
        runtimeStatus={{ obsConnected: false, spotifyConnected: true, clipConnected: false }}
        triggerCount={2}
        macroCount={3}
        onActivateRuntime={activateRuntime}
        onDeactivateRuntime={deactivateRuntime}
        onRefreshState={refreshState}
      />,
    )

    expect(pluginsHtml).toContain('Installed Plugins')
    expect(pluginsHtml).toContain('Example Plugin')
    expect(pluginsHtml).toContain('Settings')

    expect(settingsHtml).toContain('Runtime Controls')
    expect(settingsHtml).toContain('Activate Runtime')
    expect(settingsHtml).toContain('Refresh State')
    expect(settingsHtml).toContain('2 triggers currently loaded.')
  })
})
