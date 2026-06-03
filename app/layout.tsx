import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";
import { NavLinks } from "./_components/NavLinks";

// Inter: recommended by UI/UX Pro Max for "Trust & Authority / Precision Studio"
// weights 400 (body), 500 (labels), 600 (headings), 700 (display)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "TriggerHub UG (haftungsbeschränkt) in Gründung",
    template: "%s | TriggerHub",
  },
  description:
    "Softwareentwicklung für digitale Wissens- und Referenzprodukte. TriggerHub UG (haftungsbeschränkt) in Gründung.",
  metadataBase: new URL("https://triggerhub.de"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de" className={inter.variable}>
      <body>
        <div className="site-shell">
          {/* Skip-to-content: visible only on keyboard focus (a11y) */}
          <a className="skip-link" href="#main-content">
            Zum Inhalt springen
          </a>
          <header className="site-header">
            <div className="header-inner">
              <Link className="brand" href="/">
                <span className="brand-name">TriggerHub</span>
                <span className="brand-status">
                  UG (haftungsbeschränkt) in Gründung
                </span>
              </Link>
              {/* NavLinks is "use client" — only this nav reads usePathname() */}
              <NavLinks />
            </div>
          </header>
          <main className="main-content" id="main-content" tabIndex={-1}>
            {children}
          </main>
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
