import type { ReactNode } from 'react'

interface MainLayoutProps {
  sidebar: ReactNode
  header: ReactNode
  main: ReactNode
  rightPanel: ReactNode
}

export const MainLayout = ({ sidebar, header, main, rightPanel }: MainLayoutProps): JSX.Element => {
  return (
    <div className="th-shell">
      {sidebar}
      <div className="th-main-column">
        {header}
        <div className="th-main-grid">
          <main className="th-main">{main}</main>
          <aside className="th-right-panel">{rightPanel}</aside>
        </div>
      </div>
    </div>
  )
}
