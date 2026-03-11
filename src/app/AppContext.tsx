import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { AppModuleContainer } from './container'
import type { AppFacadePort } from '../types/ports'

const AppContext = createContext<AppModuleContainer | null>(null)

interface AppProviderProps {
  container: AppModuleContainer
  children: ReactNode
}

export const AppProvider = ({ container, children }: AppProviderProps): JSX.Element => (
  <AppContext.Provider value={container}>{children}</AppContext.Provider>
)

export const useAppContext = (): AppModuleContainer => {
  const ctx = useContext(AppContext)
  if (ctx === null) {
    throw new Error('useAppContext must be used inside <AppProvider>')
  }
  return ctx
}

export const useAppFacade = (): AppFacadePort => useAppContext().appFacade
