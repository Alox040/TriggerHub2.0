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
      <div className="th-sidebar__title">Navigation</div>
      <nav className="th-sidebar__nav">
        {items.map((item) => {
          const active = item.id === activeId
          const Icon = item.icon
          const classes = ['th-sidebar__item', active ? 'th-sidebar__item--active' : null]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={item.description}
              className={classes}
              type="button"
              aria-current={active ? 'page' : undefined}
            >
              {Icon ? (
                <span className="th-sidebar__icon">
                  <Icon size={16} />
                </span>
              ) : null}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
