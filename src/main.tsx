import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/styles/tokens.css'
import { App } from './App'
import { createAppModuleContainer } from './app/bootstrap'
import { AppProvider } from './app/AppContext'
import { RuntimeErrorBoundary } from './runtime/RuntimeErrorBoundary'
import { installRuntimeProcessGuards } from './runtime/runtimeMonitor'
import { IpcStorageBridge } from './storage/ipcStorageBridge'
import { createConsoleLogger } from './utils/logger'

const logger = createConsoleLogger('DesktopMain')

function renderBootstrapFailure(error: unknown): void {
  const root = document.getElementById('root')
  if (!root) {
    return
  }

  const message = error instanceof Error ? error.message : 'Unknown bootstrap failure'
  root.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;background:#0e0e11;color:#f4f4f5;font-family:Inter,Segoe UI,sans-serif;padding:24px;">
      <main style="max-width:560px;width:100%;background:#18181b;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;box-shadow:0 18px 48px rgba(0,0,0,0.28);">
        <h1 style="margin:0 0 12px;font-size:24px;">TriggerHub failed to start</h1>
        <p style="margin:0 0 12px;color:#a1a1aa;line-height:1.5;">
          The desktop renderer could not finish bootstrapping. Check the application logs for the structured error entry.
        </p>
        <pre style="margin:0;padding:12px;border-radius:10px;background:#09090b;color:#fda4af;white-space:pre-wrap;">${message}</pre>
      </main>
    </div>
  `
}

async function main(): Promise<void> {
  logger.info('Renderer bootstrap start', {
    href: window.location.href,
    hasElectronBridge: Boolean(window.triggerHubElectron),
    electronBridgeKeys: window.triggerHubElectron ? Object.keys(window.triggerHubElectron) : [],
  })
  installRuntimeProcessGuards()
  const storage = new IpcStorageBridge()
  const container = await createAppModuleContainer(storage)
  await container.start()
  logger.info('Renderer runtime ready')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RuntimeErrorBoundary>
        <AppProvider container={container}>
          <App />
        </AppProvider>
      </RuntimeErrorBoundary>
    </StrictMode>
  )
}

main().catch((error: unknown) => {
  logger.error('Desktop bootstrap failed', {
    error: error instanceof Error ? error : new Error(String(error)),
  })
  renderBootstrapFailure(error)
})
