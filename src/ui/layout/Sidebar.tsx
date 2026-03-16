import type { AppViewId } from '../navigation'

interface SidebarItem {
  id: AppViewId
  label: string
  description?: string
  icon?: (props: { size?: number }) => JSX.Element
}

interface SidebarProps {
  items: SidebarItem[]
  activeId: AppViewId
  onSelect: (id: AppViewId) => void
}

export const Sidebar = ({ items, activeId, onSelect }: SidebarProps): JSX.Element => {
  return (
    <aside className="th-sidebar">
      <div style={{ padding: '4px 8px 12px 8px', color: 'var(--th-text-secondary)', fontSize: 12 }}>Navigation</div>
      <nav style={{ display: 'grid', gap: 6 }}>
        {items.map((item) => {
          const active = item.id === activeId
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={item.description}
              style={{
                border: `1px solid ${active ? 'var(--th-border-weak)' : 'transparent'}`,
                borderRadius: 'var(--th-radius-md)',
                background: active ? 'var(--th-bg-panel)' : 'transparent',
                color: active ? 'var(--th-text-primary)' : 'var(--th-text-secondary)',
                textAlign: 'left',
                padding: '10px 12px',
                cursor: 'pointer',
              }}
              type="button"
              aria-current={active ? 'page' : undefined}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                {Icon ? (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: active ? 'var(--th-accent)' : 'currentColor',
                      flex: '0 0 auto',
                    }}
                  >
                    <Icon size={16} />
                  </span>
                ) : null}
                <span>{item.label}</span>
              </div>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
