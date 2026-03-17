import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MacroEditorPage, PluginsPage, SettingsPage, TriggerEditorPage } from '../ui/pages'
import { appNavigationItems } from '../ui/navigation'

describe('Desktop multi-view pages', () => {
  it('renders trigger and macro editors with shared desktop navigation', () => {
    const triggerHtml = renderToStaticMarkup(
      <TriggerEditorPage
        title="Trigger Editor"
        live={false}
        navItems={appNavigationItems}
        activeNavId="triggers"
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
        onCreateTrigger={() => undefined}
        onUpdateTrigger={() => undefined}
        onDeleteTrigger={() => undefined}
        onToggleTriggerEnabled={() => undefined}
      />,
    )

    const macroHtml = renderToStaticMarkup(
      <MacroEditorPage
        title="Macro Editor"
        live={false}
        navItems={appNavigationItems}
        activeNavId="macros"
        onSelectNav={() => undefined}
        macros={[
          {
            id: 'macro-1',
            name: 'Intro Macro',
            enabled: true,
            steps: [{ id: 'step-1', type: 'delay', durationMs: 0 }],
          },
        ]}
        onCreateMacro={() => undefined}
        onUpdateMacro={() => undefined}
        onDeleteMacro={() => undefined}
        onRunMacro={() => undefined}
      />,
    )

    expect(triggerHtml).toContain('Dashboard')
    expect(triggerHtml).toContain('Existing Triggers')
    expect(triggerHtml).toContain('Create Trigger')
    expect(triggerHtml).toContain('Delete Trigger')

    expect(macroHtml).toContain('Triggers')
    expect(macroHtml).toContain('Macro Library')
    expect(macroHtml).toContain('Create Macro')
    expect(macroHtml).toContain('Run Macro')
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
        runtimeStatus={{ obsConnected: false, spotifyConnected: true, clipConnected: false, twitchConnected: true }}
        triggerCount={2}
        macroCount={3}
        onActivateRuntime={activateRuntime}
        onDeactivateRuntime={deactivateRuntime}
        onConnectTwitch={() => undefined}
        onDisconnectTwitch={() => undefined}
        onRefreshState={refreshState}
        twitchConfig={{ clientId: '', accessToken: '' }}
        onUpdateTwitchConfig={() => undefined}
        obsConfig={{ host: '', port: 4455, password: '' }}
        onUpdateObsConfig={() => undefined}
      />,
    )

    expect(pluginsHtml).toContain('Installed Plugins')
    expect(pluginsHtml).toContain('Example Plugin')
    expect(pluginsHtml).toContain('Settings')

    expect(settingsHtml).toContain('Runtime Controls')
    expect(settingsHtml).toContain('Activate Runtime')
    expect(settingsHtml).toContain('Refresh State')
    expect(settingsHtml).toContain('Twitch Controls')
    expect(settingsHtml).toContain('Twitch connected')
    expect(settingsHtml).toContain('Clip not connected')
    expect(settingsHtml).toContain('2 triggers currently loaded.')
  })
})
