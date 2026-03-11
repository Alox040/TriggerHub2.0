import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppProvider, useAppContext, useAppFacade } from '../app/AppContext'
import { App } from '../App'
import { createAppModuleContainer } from '../app/bootstrap'

// Minimal components that call hooks synchronously in the render body.
// renderToStaticMarkup propagates synchronous throws, making this pattern
// a reliable way to test hook guard errors in a node (SSR) environment.

const ContextConsumer = (): JSX.Element => {
  useAppContext()
  return <span>ok</span>
}

const FacadeConsumer = (): JSX.Element => {
  useAppFacade()
  return <span>ok</span>
}

describe('AppContext hook guards', () => {
  it('useAppContext throws a descriptive error when rendered without AppProvider', () => {
    expect(() => renderToStaticMarkup(<ContextConsumer />)).toThrow(
      'useAppContext must be used inside <AppProvider>',
    )
  })

  it('useAppFacade throws the same error when rendered without AppProvider', () => {
    expect(() => renderToStaticMarkup(<FacadeConsumer />)).toThrow(
      'useAppContext must be used inside <AppProvider>',
    )
  })
})

describe('App inside AppProvider', () => {
  // Note: renderToStaticMarkup is SSR-only; useEffect does not run.
  // This test verifies that App correctly integrates with AppProvider and
  // renders the loading branch on initial mount (before getDashboardState resolves).
  // Full async data-loading behaviour (useEffect, state updates) requires a
  // jsdom environment and is covered at the facade level in app-facade.test.ts
  // and app-container.test.ts.

  it('renders a loading state on initial mount when inside AppProvider', async () => {
    const container = await createAppModuleContainer()
    await container.start()

    const html = renderToStaticMarkup(
      <AppProvider container={container}>
        <App />
      </AppProvider>
    )

    expect(html).toContain('Loading')

    await container.stop()
  })
})
