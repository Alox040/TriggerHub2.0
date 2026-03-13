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

async function main(): Promise<void> {
  installRuntimeProcessGuards()
  const storage = new IpcStorageBridge()
  const container = await createAppModuleContainer(storage)
  await container.start()

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
})
