import { useState } from 'react'
import type { ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { SITE } from '../../config/site'

interface CompanyShellProps {
  children: ReactNode
  onNavigate: (path: string) => void
}

const navLinks = [
  { label: 'ResQBrain', path: '/resqbrain' },
  { label: 'Leistungen', anchor: 'leistungen' },
  { label: 'Prozess', anchor: 'prozess' },
  { label: 'Kontakt', path: '/kontakt' },
] as const

type NavItem = typeof navLinks[number]

export const CompanyShell = ({ children, onNavigate }: CompanyShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const scrollToAnchor = (anchor: string) => {
    const el = document.getElementById(anchor)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleNavClick = (item: NavItem) => {
    setMobileOpen(false)
    if ('path' in item) {
      onNavigate(item.path)
    } else {
      if (window.location.pathname !== '/') {
        onNavigate('/')
        setTimeout(() => scrollToAnchor(item.anchor), 80)
      } else {
        scrollToAnchor(item.anchor)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#09111d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#09111d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          {/* Logo */}
          <button
            aria-label="Zur Startseite"
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            onClick={() => onNavigate('/')}
            type="button"
          >
            <div className="font-['Sora',sans-serif] text-sm font-semibold tracking-[0.2em] text-sky-300">
              {SITE.company.name}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">{SITE.company.statusLabel}</div>
          </button>

          {/* Desktop nav */}
          <nav aria-label="Hauptnavigation" className="hidden items-center gap-5 md:flex">
            {navLinks.map((item) => (
              <button
                key={item.label}
                className="rounded px-1 py-0.5 text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                onClick={() => handleNavClick(item)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Header CTA — always visible */}
            <a
              className="hidden min-h-9 items-center rounded-full border border-sky-400/40 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:inline-flex"
              href={SITE.links.mailto}
            >
              Kontakt
            </a>

            {/* Mobile menu toggle */}
            <button
              aria-controls="mobile-nav"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Navigation schließen' : 'Navigation öffnen'}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/[0.1] text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              type="button"
            >
              {mobileOpen
                ? <X aria-hidden="true" className="size-4" />
                : <Menu aria-hidden="true" className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <nav
            aria-label="Mobile Navigation"
            className="border-t border-white/[0.07] bg-[#09111d] px-6 pb-4 pt-3 md:hidden"
            id="mobile-nav"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  onClick={() => handleNavClick(item)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
              <a
                className="mt-2 rounded-lg px-3 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-white/[0.06] focus-visible:outline-none"
                href={SITE.links.mailto}
                onClick={() => setMobileOpen(false)}
              >
                E-Mail schreiben →
              </a>
            </div>
          </nav>
        )}
      </header>

      {children}

      {/* Footer */}
      <footer className="border-t border-white/[0.07] bg-[#060d18]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-[1.8fr_1fr_1fr]">
            {/* Brand block */}
            <div>
              <div className="font-['Sora',sans-serif] text-sm font-semibold tracking-[0.2em] text-sky-300">
                {SITE.company.name}
              </div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                {SITE.company.legalName}. Fokussierte Softwareentwicklung für
                anspruchsvolle Arbeitskontexte.
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Verantwortlich: {SITE.owner.name}
              </p>
            </div>

            {/* Projekte */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Projekte
              </h3>
              <div className="mt-4 space-y-2">
                <button
                  className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white focus-visible:outline-none"
                  onClick={() => onNavigate(SITE.links.resqbrain)}
                  type="button"
                >
                  {SITE.resqbrain.name}
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    {SITE.resqbrain.status}
                  </span>
                </button>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Rechtliches
              </h3>
              <div className="mt-4 space-y-2">
                <button
                  className="block text-sm text-slate-400 transition hover:text-white focus-visible:outline-none"
                  onClick={() => onNavigate(SITE.links.imprint)}
                  type="button"
                >
                  Impressum
                </button>
                <button
                  className="block text-sm text-slate-400 transition hover:text-white focus-visible:outline-none"
                  onClick={() => onNavigate(SITE.links.privacy)}
                  type="button"
                >
                  Datenschutz
                </button>
                <a
                  className="block text-sm text-slate-400 transition hover:text-white focus-visible:outline-none"
                  href={SITE.links.mailto}
                >
                  {SITE.owner.email}
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col gap-1 border-t border-white/[0.06] pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} {SITE.owner.name} — {SITE.company.legalName}
            </span>
            <span className="text-slate-700">
              Keine Handelsregisternummer vor Abschluss der Eintragung
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
