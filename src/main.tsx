import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/styles/tokens.css'
import { App } from './App'
import { createAppModuleContainer } from './app/bootstrap'
import { AppProvider } from './app/AppContext'

async function main(): Promise<void> {
  const container = await createAppModuleContainer()
  await container.start()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProvider container={container}>
        <App />
      </AppProvider>
    </StrictMode>
  )
}

main().catch(console.error)
