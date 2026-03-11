interface SidebarItem {
  id: string
  label: string
}

interface SidebarProps {
  items: SidebarItem[]
  activeId: string
  onSelect: (id: string) => void
}

export const Sidebar = ({ items, activeId, onSelect }: SidebarProps): JSX.Element => {
  return (
    <aside className="th-sidebar">
      <div style={{ padding: '4px 8px 12px 8px', color: 'var(--th-text-secondary)', fontSize: 12 }}>Navigation</div>
      <nav style={{ display: 'grid', gap: 6 }}>
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                border: `1px solid ${active ? 'var(--th-border-weak)' : 'transparent'}`,
                borderRadius: 'var(--th-radius-md)',
                background: active ? 'var(--th-bg-panel)' : 'transparent',
                color: active ? 'var(--th-text-primary)' : 'var(--th-text-secondary)',
                textAlign: 'left',
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
