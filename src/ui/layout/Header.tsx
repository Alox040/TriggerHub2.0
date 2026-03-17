interface HeaderProps {
  title: string
  live: boolean
}

export const Header = ({ title, live }: HeaderProps): JSX.Element => {
  const statusModifier = live ? 'th-header__status--live' : 'th-header__status--offline'
  const badgeModifier = live ? 'th-badge-indicator--live' : 'th-badge-indicator--offline'

  return (
    <header className="th-header">
      <h1 className="th-header__title">{title}</h1>
      <div className={`th-header__status ${statusModifier}`}>
        <span className={`th-badge-indicator ${badgeModifier}`} />
        {live ? 'Services Active' : 'Offline'}
      </div>
    </header>
  )
}
