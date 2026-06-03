"use client";

/**
 * NavLinks — minimal client component for navigation active-state.
 *
 * This is the ONLY "use client" component in the layout.
 * The rest of RootLayout remains a Server Component.
 *
 * Active-state logic:
 *  - "/#unternehmen"  → active on /   (anchor on home page)
 *  - "/resqbrain"     → active on /resqbrain and sub-paths
 *  - "/kontakt"       → active on /kontakt
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/#unternehmen", label: "Unternehmen" },
  { href: "/resqbrain", label: "ResQBrain" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

function isActive(href: string, pathname: string): boolean {
  // Home-page anchor links are "active" when on /
  if (href === "/" || href.startsWith("/#")) {
    return pathname === "/";
  }
  // Other pages: exact match or sub-path
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Hauptnavigation">
      {navItems.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "nav-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
