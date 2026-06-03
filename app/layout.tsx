import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TriggerHub UG (haftungsbeschränkt) in Gründung",
    template: "%s | TriggerHub"
  },
  description:
    "Softwareentwicklung für digitale Wissens- und Referenzprodukte. TriggerHub UG (haftungsbeschränkt) in Gründung.",
  metadataBase: new URL("https://triggerhub.de")
};

// Primäre Navigation — nur Firmen- und Produkt-Inhalte.
// Impressum und Datenschutz bleiben im Footer (rechtlich erreichbar,
// aber nicht als gleichwertige Navigation inszeniert).
const navigation = [
  { href: "/#unternehmen", label: "Unternehmen" },
  { href: "/resqbrain", label: "ResQBrain" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="header-inner">
              <Link className="brand" href="/">
                <span className="brand-name">TriggerHub</span>
                <span className="brand-status">
                  UG (haftungsbeschränkt) in Gründung
                </span>
              </Link>
              <nav className="nav" aria-label="Hauptnavigation">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="main-content">{children}</main>
          <footer className="site-footer">
            <div className="footer-inner">
              <span className="footer-copy">
                © {new Date().getFullYear()} Alexander Posdziech —
                TriggerHub UG (haftungsbeschränkt) in Gründung.
                Keine Handelsregisternummer vor Abschluss der Eintragung.
              </span>
              <div className="footer-links">
                <Link href="/resqbrain">ResQBrain</Link>
                <Link href="/impressum">Impressum</Link>
                <Link href="/datenschutz">Datenschutz</Link>
                <Link href="/kontakt">Kontakt</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
