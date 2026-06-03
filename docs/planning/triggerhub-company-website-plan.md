# TriggerHub — Company Website Plan

**Erstellt:** 2026-06-03  
**Typ:** Konzept- und Planungsdokument (kein Code)  
**Scope:** `website/` — Transformation zur Unternehmenswebsite  
**Status:** Entwurf, noch keine Implementierung

---

## 1. Kurzdiagnose

### Was die aktuelle Website ist

Die bestehende `website/`-Codebasis ist eine **Closed-Alpha-Landing-Page für TriggerHub 2.0** — ein Windows-Desktop-Automatisierungstool für PC-Streamer. Sie enthält:

- Eine Single-Page-Application (Vite + React 18, Tailwind CSS v4, motion v12)
- Einen aufwendigen Auth-Layer (Owner-only Prelaunch-Gate, Session-Management via Vercel)
- Ein robustes Design-System (Dark Navy + Sky/Cyan, Sora + Manrope, StatusBadge, AnimatePresence)
- i18n via react-i18next (EN + DE)
- Rechtlich korrekte Impressum/Datenschutz-Seiten (Alexander Posdziech, Privatperson)
- Routing-Manifest mit Access-Control per Mode (`private_prelaunch`, `invite_only`, `public_product`)

### Was die neue Website sein soll

Eine **Unternehmenswebsite für TriggerHub** als Entwicklerfirma/-marke, mit ResQBrain als erstem prominenten Produktprojekt. Die Firma firmiert zukünftig als TriggerHub UG (haftungsbeschränkt) — aktuell noch nicht eingetragen.

### Kritische Diskrepanzen (Findings)

| # | Befund | Schwere |
|---|--------|---------|
| 1 | Die gesamte Website kommuniziert TriggerHub als **Streaming-Produkt**, nicht als Firma | Hoch |
| 2 | **ResQBrain existiert nicht** in der Codebasis — kein einziger Eintrag | Hoch |
| 3 | Impressum nennt „Privatperson (kein eingetragenes Unternehmen)" — muss bei UG-Gründung aktualisiert werden | Hoch |
| 4 | Kein `/projekte`, kein `/kontakt`, keine Firmendarstellung | Mittel |
| 5 | `Testimonials.tsx` enthält Fake-Reviews (bereinigt, aber Datei existiert noch) | Mittel |
| 6 | `ProblemSection.tsx` enthält gefälschte Nutzerzahlen | Mittel |
| 7 | `EarlyAccess.tsx` hat kaputtes E-Mail-Formular (console.log) | Mittel |
| 8 | Routenmanifest kennt `/features`, `/pricing`, `/about` — diese Seiten existieren inhaltlich nicht | Niedrig |
| 9 | Design-System und Animationsbasis sind **bereits sehr solide** — wiederverwendbar | Positiv |
| 10 | Auth-Layer ist gut abgeschirmt und kann für geschützten Pilotbereich verwendet werden | Positiv |

---

## 2. Zielbild der Website

### Positionierung

> **TriggerHub ist eine Softwareentwicklungs- und Produktinitiative, die digitale Werkzeuge für Fachleute in anspruchsvollen Arbeitskontexten baut.**

Die Startseite zeigt das Unternehmen. ResQBrain ist der prominente erste Schwerpunkt.

### Design-Persona

**„Precision Developer Studio"** — keine bunte Startup-Seite, kein generisches SaaS-Muster.

Vergleichsanker:
- **Linear.app** — klare Hierarchie, technische Präzision, sehr wenig Dekoration
- **Vercel** — Tiefenwirkung durch dunkle Flächen, strukturierte Informationsarchitektur
- **Raycast** — dense aber lesbar, Product-as-Craft-Ästhetik
- **shadcn/ui** — minimalistisch, trustworthy, developer-oriented

### Ton

- Sachlich, direkt, ohne Marketing-Buzzwords
- Keine Versprechen, die nicht gehalten werden können
- Keine erfundenen Partnerlogos oder Kundenlisten
- Alpha/In-Gründung klar kommunizieren, nicht verstecken
- ResQBrain: Knowledge-Tool, niemals Decision-Support

---

## 3. Informationsarchitektur

```
TriggerHub (Dachmarke / Firma)
├── Was wir bauen     → Firma + Vision
├── ResQBrain         → Flagship-Produkt
│   ├── Was es ist    → Knowledge-only Referenz
│   ├── Für wen       → Rettungsdienst, Ausbildung, Training
│   ├── Was es NICHT  → kein Med-Device, kein Decision-Support
│   └── Pilotinteresse
├── Kontakt           → E-Mail, kein Formular ohne Backend
├── Impressum         → § 5 TMG, Status-Angabe
└── Datenschutz       → DSGVO, Vercel-Hosting, keine Analytics
```

### Nutzertypen und ihre primären Journeys

| Nutzertyp | Ziel | Primäre Journey |
|-----------|------|-----------------|
| Rettungsdienstler / Ausbilder | ResQBrain verstehen, Zugang anfragen | `/` → `/resqbrain` → Kontakt |
| Journalist / Investor | Firma einschätzen | `/` → `/unternehmen` oder Impressum |
| Entwickler / Mitarbeiter | Mitarbeit, Produkt-Architektur | `/` → GitHub / Kontakt |
| Behörde / Datenschutzbehörde | Rechtliches prüfen | `/impressum` + `/datenschutz` |

---

## 4. Seitenstruktur

### Pflicht (Phase 1)

```
/                   → Company Landing Page
/resqbrain          → ResQBrain Produktseite
/kontakt            → Kontakt (E-Mail-Link, kein Formular)
/impressum          → Impressum (§ 5 TMG)
/datenschutz        → Datenschutzerklärung (DSGVO)
/imprint            → EN-Alias für /impressum (Redirect)
/privacy            → EN-Alias für /datenschutz (Redirect)
```

### Optional (Phase 2)

```
/unternehmen        → Firmenprofil, Vision, Entstehungsgeschichte
/status             → Projektstand (öffentlich oder owner-only)
/leistungen         → Falls Dienstleistungsangebote geplant sind
```

### Auth-Bereich (unveränderter Bestand)

```
/login              → Bestehendes Login (bleibt für Owner/Pilotnutzer)
/dashboard          → Geschützter Bereich (unverändert)
/profile            → Profilseite (unverändert)
/settings           → Einstellungen (unverändert)
/internal           → Owner-Area (unverändert)
```

### Zu entfernen / deprecieren

```
/features           → Kein Inhalt → entfernen oder umleiten
/pricing            → Kein Inhalt + irreführend → entfernen
/about              → Ersetzt durch /unternehmen
```

---

## 5. Komponentenliste

### Neue Komponenten (zu erstellen)

| Komponente | Seite | Zweck |
|------------|-------|-------|
| `CompanyHero` | `/` | Firmenpräsentation, Headline, Kurzprofil, CTA |
| `ProjectCard` | `/` | ResQBrain + ggf. weitere Projekte als Cards |
| `ResQBrainHero` | `/resqbrain` | Produktvorstellung mit Disziplin-Badge |
| `KnowledgeOnlyDisclaimer` | `/resqbrain` | Fester Hinweis: keine Entscheidungsunterstützung |
| `PilotInterestSection` | `/resqbrain` | Pilotzugang anfragen (E-Mail-Link, kein Formular) |
| `ContactSection` | `/kontakt` | E-Mail + Hinweis auf Datenschutz |
| `CompanyFooter` | global | Überarbeiteter Footer mit Firmenstatus-Hinweis |
| `LegalStatusBadge` | Footer/Header | „in Gründung" oder „Privatprojekt" Indikator |

### Wiederverwendbare Bestands-Komponenten

| Komponente | Aktuell | Neue Verwendung |
|------------|---------|-----------------|
| `MarketingShell` | Shell für Landing | Als Basis für Company Shell anpassen |
| `MarketingSection` | Alle Sektionen | Weiter verwenden (gut abstrahiert) |
| `StatusBadge` | Feature-Cards | Für Projektstatus-Kennzeichnung |
| `FeatureCard` / `darkGlassCard` | Features-Grid | Für ResQBrain-Feature-Übersicht |
| `TrustGrid` | Trust-Section | Für ResQBrain-Vertrauens-Section |
| `FaqSection` | Landing | Für ResQBrain FAQ |
| `LegalPage` | Impressum/Datenschutz | Unveränderter Bestand |
| `LanguageSwitcher` | Global | Beibehalten |

### Zu löschen / nicht deployments

| Komponente | Grund |
|------------|-------|
| `Testimonials.tsx` | Fake-Reviews — löschen |
| `ProblemSection.tsx` | Fake-Zahlen (`3,000+ creators`) — bereinigen oder löschen |
| `EarlyAccess.tsx` | Kaputtes Formular — parken |

---

## 6. Design-System-Empfehlung

Das bestehende Design-System ist **solide und wiederverwendbar**. Folgende Anpassungen für die Unternehmenswebsite:

### Farblogik (unveränderter Token-Stand)

```
Dark Background:  #0b0b0c / #0c1726  (beibehalten)
Accent:           #0EA5E9 / #22D3EE  (beibehalten)
Light Sections:   #f4f1ea / #f7f4ee  (beibehalten)
```

### Neue Farblogik für ResQBrain

ResQBrain ist ein medizin-nahes Referenzprodukt. Hier sollte ein **zweites, eigenständiges Akzentfarbregister** eingeführt werden, das sich vom TriggerHub-Blau abhebt:

```
ResQBrain-Primär: #059669  (Emerald 600 — Gesundheit, Seriosität, kein reines Medizin-Weiß)
ResQBrain-Sekundär: #10B981  (Emerald 500)
ResQBrain-Tint:   rgba(5, 150, 105, 0.08)  (Karten-Hintergrund)
ResQBrain-Border: rgba(5, 150, 105, 0.20)
```

**Begründung:** Grün signalisiert Medizin/Gesundheit ohne Neon-Effekt. Klar unterschiedlich von TriggerHub-Blau, so dass Produkt vs. Firma visuell trennbar ist.

### Typografie (unveränderter Stand)

```
Headings: Sora — beibehalten
Body:     Manrope — beibehalten
```

Neue Ergänzung für ResQBrain-Seite:
- Medizinische Fachbegriffe und Kategoriebezeichnungen: `font-mono text-xs tracking-wide` — signalisiert Präzision

### Card-Typen (Ergänzung)

```
Typ D — ResQBrain Knowledge Card:
  bg:      rgba(5, 150, 105, 0.06)
  border:  1px solid rgba(5, 150, 105, 0.18)
  border-radius: 1.5rem
  Hover:   border-color → rgba(5, 150, 105, 0.35)
  Einsatz: Inhaltsbereiche auf /resqbrain

Typ E — Project Showcase Card:
  bg:      #111827  (dunkel, für Projektübersicht auf /)
  border:  1px solid rgba(255,255,255,0.08)
  +        1px solid rgba(14,165,233,0.25) oben (Accent-Line)
  Einsatz: Projektcards auf der Company-Startseite
```

### Spacing (Anpassung)

Die Company-Landing-Page braucht mehr **vertikale Luft** als die aktuelle Streaming-Landing-Page:
```
Section-Padding:  py-32 md:py-44  (großzügiger als aktuell py-28)
Hero-Padding:     pt-24 pb-32 md:pt-32 md:pb-44
```

---

## 7. UX- / Conversion-Fluss

### Primärer Konversionspfad

```
Startseite (/)
  ↓ "Unser aktuelles Projekt" → ProjectCard: ResQBrain
  ↓ Click auf ResQBrain
/resqbrain
  ↓ Versteht: was es ist, für wen, was es nicht ist
  ↓ "Pilotinteresse bekunden"
/kontakt
  ↓ E-Mail schreiben (kein Formular, kein Tracking)
```

### Sekundäre Konversionspfade

```
Startseite (/) → "Über uns" → /unternehmen
Startseite (/) → "GitHub ansehen" → GitHub-Repo
Startseite (/) → Header-CTA "Kontakt" → /kontakt
```

### CTA-Hierarchie pro Seite

| Seite | Primary CTA | Secondary CTA |
|-------|-------------|---------------|
| `/` | „ResQBrain ansehen" | „Kontakt aufnehmen" |
| `/resqbrain` | „Pilotinteresse melden" | „Mehr über uns" |
| `/unternehmen` | „Kontakt" | GitHub |
| `/kontakt` | E-Mail-Link | — |

### Anti-Patterns (nicht einbauen)

- ❌ Kein Fake-Countdown ("Nur noch 3 Plätze frei!")
- ❌ Kein social-proof ohne echte Daten ("1.200 Rettungsdienste vertrauen uns")
- ❌ Kein Popup bei Exit-Intent
- ❌ Kein Newsletter-Opt-in ohne funktionsfähiges Backend
- ❌ Kein "Jetzt kostenlos starten" wenn Zugang manuell vergeben wird

---

## 8. ResQBrain-Positionierung

### Was ResQBrain ist (erlaubte Kommunikation)

```
✓ Digitales Nachschlagewerk für Rettungsdienstpersonal
✓ Strukturierte Referenz für Ausbildung und Training
✓ Wissenshilfe zur Vorbereitung und Auffrischung
✓ Digitales Lernwerkzeug für Rettungssanitäter, Notfallsanitäter, Ausbilder
✓ Offline-fähige Referenzlösung (wenn technisch zutreffend)
✓ Klar als "in Entwicklung" / "Pilotphase" kennzeichnen
```

### Was ResQBrain NICHT ist (verbotene Kommunikation)

```
❌ Medizinisches Produkt im Sinne von MDR / MPG
❌ Klinische Entscheidungsunterstützung (Clinical Decision Support)
❌ Dosierungsrechner, Arzneimittel-Empfehlung
❌ SOP-Ersatz oder Leitlinien-Referenz mit Verbindlichkeit
❌ KI-gestützter Diagnosehelfer
❌ Einsatzfreigabe-Tool
❌ Patientenspezifische Handlungsempfehlung
❌ Empfohlen von [Rettungsorganisation X] (ohne nachweisliche Kooperation)
❌ Zertifiziert nach [Norm Y] (ohne tatsächliche Zertifizierung)
```

### Pflicht-Disclaimer auf der ResQBrain-Seite

Als **fest eingebettetes, nicht ausblendbare Komponente** — keine Checkbox, kein Cookie:

```
ResQBrain ist eine Lernhilfe und kein Ersatz für medizinische Ausbildung,
Leitlinien oder Einsatzentscheidungen. Die Inhalte dienen ausschließlich
der Wissensvorbereitung und ersetzen keine klinische Beurteilung.
```

Diese Komponente (`KnowledgeOnlyDisclaimer`) muss:
- Immer sichtbar sein (kein Aufklappen nötig)
- Einen visuell klar erkennbaren Stil haben (nicht klein und grau)
- In EN und DE verfügbar sein
- Semantisch korrekt sein (`<aside aria-label="Hinweis zum Nutzungskontext">`)

### Zielgruppen (für /resqbrain)

```
Primär:
- Rettungssanitäter (RS), Notfallsanitäter (NotSan)
- Ausbilder und Lehrgangsleiter in Hilfsorganisationen (DRK, MHD, JUH, ASB)
- Studenten / Auszubildende im Rettungsdienst

Sekundär:
- Leitstellen-Disponenten (Orientierung)
- Pflegepersonal mit Ersthelfer-Schnittmenge
- Medizinstudenten (Nachschlage-Kontext)
```

---

## 9. Rechtliche / kommunikative No-Gos

### Unternehmensstatus

| No-Go | Korrekte Alternative |
|-------|---------------------|
| „Betrieben von TriggerHub UG (haftungsbeschränkt)" | „Betrieben von TriggerHub UG (haftungsbeschränkt) in Gründung" ODER „Ein Projekt von Alexander Posdziech" |
| Handelsregisternummer (HRB XXXXX) | Weglassen bis tatsächliche Eintragung |
| USt-IdNr. DE XXXXXXXXX | Weglassen bis tatsächliche Vergabe |
| „Gegründet 202X" ohne Datum | Konkrete Jahreszahl eintragen oder weglassen |
| Investoren- / Partnerlogos | Nur bei tatsächlichen, bestätigten Partnerschaften |

### Medizinprodukte-Kommunikation

| No-Go | Korrekte Alternative |
|-------|---------------------|
| „unterstützt bei der Entscheidungsfindung" | „dient der Wissensvorbereitung" |
| „hilft Leben zu retten" | „unterstützt das Lernen im Rettungsdienst" |
| „klinisch validiert" | Weglassen (kein Claim ohne Evidenz) |
| „empfohlen von [Org]" | Weglassen ohne konkrete, belegbare Empfehlung |
| „nach EN/ISO/MDR" | Weglassen ohne tatsächliche Konformität |
| „AI-powered diagnosis" | Weglassen, ResQBrain ist Knowledge-only |

### Conversion-Kommunikation

| No-Go | Begründung |
|-------|-----------|
| Fake-Nutzerzahlen | Keine Datenbasis, regulatorisch riskant |
| Countdown-Timer für Alpha-Zugang | Manipulativ, ohne tatsächlichen Ablauf bedeutungslos |
| Alle-5-Sterne-Testimonials | Fake Social Proof ohne echte Nutzer |
| „Kostenlos" ohne Klärung der Konditionen | Irreführend |

### DSGVO / TMG

- Impressum muss aktualisiert werden sobald UG eingetragen ist
- Keine Analytics-Tools ohne DSGVO-konforme Implementierung
- Kein E-Mail-Formular ohne Backend-Absicherung und Datenschutzhinweis
- Kontakt per E-Mail-Link (`mailto:`) ist DSGVO-kompatibel ohne Weiteres

---

## 10. Konkreter Implementierungsplan

### Phase 0 — Voraussetzungen (vor jeder Implementierung)

```
[ ] UG-Gründungsstatus klären (Zieldatum?)
[ ] ResQBrain-Konzept dokumentieren (was genau ist der Inhalt/Scope?)
[ ] Einigen auf ResQBrain-Primärfarbe (Vorschlag: Emerald 600)
[ ] E-Mail für Kontaktseite bestätigen (Triggerhub@outlook.com oder neue Firmenadresse?)
[ ] GitHub-Sichtbarkeit für ResQBrain klären (öffentlich / privat)
[ ] Klären: Bleibt TriggerHub 2.0 (Streaming) sichtbar oder wird es separate Seite?
```

### Phase 1 — Company Landing Page + ResQBrain Seite (Kern)

**Aufwand: ca. 2-3 Tage**

```
1.1  Neue Route /resqbrain im Routenmanifest registrieren
1.2  Neue Route /kontakt im Routenmanifest registrieren
1.3  CompanyHero — Firmenidentität, Vision, erster Eindruck
1.4  ProjectCard — ResQBrain als Projekt-Showcase auf /
1.5  ResQBrainPage.tsx — neue Seite
     - ResQBrainHero
     - KnowledgeOnlyDisclaimer (fest, immer sichtbar)
     - FeatureSection (Was ist drin)
     - ZielgruppenSection
     - PilotInterestSection
     - FAQ
1.6  ContactPage.tsx — /kontakt mit E-Mail-Link
1.7  Überarbeiteter Footer (CompanyFooter) mit korrektem Rechtsstatus
1.8  i18n-Keys (EN + DE) für alle neuen Inhalte
```

### Phase 2 — Routing-Bereinigung + Legacy-Seiten

**Aufwand: ca. 1 Tag**

```
2.1  /features → weglassen oder auf /resqbrain umleiten
2.2  /pricing → entfernen (kein Inhalt, irreführend)
2.3  /about → entfernen oder auf /unternehmen umleiten
2.4  Testimonials.tsx löschen
2.5  ProblemSection.tsx bereinigen (Fake-Zahlen entfernen)
2.6  EarlyAccess.tsx: Entscheidung (löschen oder richtiges Backend anschließen)
2.7  Impressum-Text auf neuen Rechtsstatus anpassen
2.8  Datenschutz-Text: ResQBrain-Kontext ergänzen
```

### Phase 3 — Unternehmensseite + Design-Polishing

**Aufwand: ca. 1-2 Tage**

```
3.1  /unternehmen — Firmenprofil, Entstehungsgeschichte, Vision
3.2  Header-Nav aktualisieren (neue Navigationsstruktur)
3.3  ResQBrain-Farbsystem in theme.css ergänzen
3.4  KnowledgeOnlyDisclaimer als permanente Komponente fertigstellen
3.5  Animationen auf neuen Seiten einrichten (Scroll-Reveal etc.)
3.6  Mobile-Optimierung aller neuen Seiten
3.7  SEO-Meta-Tags für neue Routen (DocumentHead.tsx)
```

### Phase 4 — Optional / Post-Launch

```
4.1  /status — Projektstatus-Seite (öffentlich oder owner-only)
4.2  E-Mail-Formular mit funktionsfähigem Backend
4.3  ResQBrain-Pilotbereich (auth-geschützt, für echte Tester)
4.4  OG-Bilder für Social Sharing
4.5  Mehrsprachiges Favicon / Manifest
```

---

## 11. Offene Platzhalterdaten

Diese Daten sind noch unbekannt oder müssen bestätigt werden, bevor sie auf der Website erscheinen:

| Feld | Status | Hinweis |
|------|--------|---------|
| Handelsregisternummer | ⚠️ nicht vorhanden | Nur nach tatsächlicher HRB-Vergabe eintragen |
| USt-IdNr. | ⚠️ nicht vorhanden | Nur nach Vergabe durch Finanzamt eintragen |
| Gründungsdatum UG | ⚠️ offen | Nur nach tatsächlicher Notartermin/Eintragung eintragen |
| Firmenadresse UG | ⚠️ offen | Aktuell: private Adresse (Voßort 14, 21037 Hamburg) |
| Geschäftsführer offiziell | ⚠️ offen | Aktuell: Alexander Posdziech — OK als Privatperson |
| Firmen-E-Mail | ⚠️ offen | Aktuell: Triggerhub@outlook.com — sollte bei UG-Gründung auf Firmen-Domain |
| ResQBrain-Feature-Set | ⚠️ konzeptionell | Was genau ist drin? Welche Fachgebiete? Offline? App oder Web? |
| ResQBrain-Pilotpartner | ⚠️ nicht bestätigt | Kein Logo, keine Erwähnung ohne unterschriebene Vereinbarung |
| ResQBrain-Plattform | ⚠️ offen | iOS / Android / Web / Desktop? |
| ResQBrain-Verfügbarkeit | ⚠️ offen | Zeitplan für erste Pilotversion? |
| ResQBrain-Zertifizierung | ⚠️ nicht vorhanden | Kein Zertifizierungs-Claim ohne tatsächliche Zertifizierung |
| TriggerHub 2.0 Streaming-App | ⚠️ offen | Weiter auf der Website oder eigene Seite / Archivierung? |

---

## 12. Akzeptanzkriterien

Die neue Website ist **bereit für öffentliches Deployment**, wenn alle Pflichtkriterien erfüllt sind:

### Pflicht (muss vor Go-Live)

- [ ] `/resqbrain` enthält prominenten, immer sichtbaren `KnowledgeOnlyDisclaimer`
- [ ] Keine Formulierungen, die ResQBrain als Medizinprodukt positionieren
- [ ] Impressum nennt korrekten Rechtsstatus (Privatperson ODER UG nach Eintragung)
- [ ] Datenschutz deckt alle genutzten Dienste ab (Vercel, ggf. neue)
- [ ] Keine Fake-Nutzerzahlen, keine erfundenen Testimonials
- [ ] Keine bestätigten Partnerlogos ohne nachweisliche Kooperation
- [ ] Kein kaputtes Formular live (EarlyAccess.tsx entweder entfernen oder reparieren)
- [ ] TypeScript: 0 Fehler (`tsc --noEmit`)
- [ ] Build: erfolgreich (`npm run build`)
- [ ] `/datenschutz` + `/impressum`: korrekte deutsche Texte
- [ ] `/privacy` + `/imprint`: korrekte englische Texte
- [ ] Mobile-Layout: kein Text-Overflow, kein überladenes Hero auf 375px

### Empfohlen (sollte vor Go-Live)

- [ ] `Testimonials.tsx` gelöscht
- [ ] `ProblemSection.tsx` bereinigt (Fake-Zahlen entfernt)
- [ ] `/pricing`, `/features`, `/about` ohne Inhalt: entfernt oder umgeleitet
- [ ] Header-Navigation zeigt neue Seitenstruktur
- [ ] Footer zeigt `TriggerHub UG (haftungsbeschränkt) in Gründung` ODER `Ein Projekt von Alexander Posdziech`
- [ ] EN + DE vollständig synchron für alle neuen i18n-Keys
- [ ] OG-Meta-Tags für Homepage und ResQBrain-Seite gesetzt

### Optional (nach Go-Live möglich)

- [ ] /unternehmen-Seite vorhanden
- [ ] Animierter ResQBrain-Bereich
- [ ] ResQBrain-Farbsystem vollständig in `theme.css` integriert
- [ ] `LegalStatusBadge`-Komponente im Header sichtbar

---

## Anhang A — Technische Bestandsaufnahme

### Framework-Stack (unverändert nutzbar)

```
Runtime:     React 18.3.1 + Vite 6.3.5
Styling:     Tailwind CSS v4.1.12
Animation:   motion (Framer Motion) v12.23.24
i18n:        react-i18next v16 + i18next v25
UI-Library:  Radix UI (vollständige Suite installiert)
Icons:       lucide-react v0.487
Routing:     Eigenes SPA-Routing (AppRouter.tsx + routeManifest.ts)
Auth:        Eigener Prelaunch-Auth-Layer (Vercel Serverless)
Deployment:  Vercel (vercel.json vorhanden)
```

### Routing-System

Das bestehende Routing-System (`routeManifest.ts`) ist gut strukturiert. Neue Routen müssen:
1. In `RoutePath` Type-Union eingetragen werden
2. In `KNOWN_ROUTE_PATHS` Set eingetragen werden
3. In `ROUTE_MANIFEST` mit Gruppe und Policy eingetragen werden
4. In `AppRouter.tsx` mit Page-Komponente verknüpft werden

### Bestehende Stärken (nicht anfassen)

- Design-Tokens in `theme.css` / `colors.css` — solide Basis
- `motion.ts` lib mit `useMotionConfig` + `useReducedMotion` — vollständig
- `StatusBadge.tsx` — wiederverwendbar für Projektstatus
- `LegalPage.tsx` + i18n-Struktur für Impressum/Datenschutz — korrekt
- Auth-Guard-System — für zukünftige Pilot-Bereiche nutzbar

---

## Anhang B — Dateiindex der betroffenen Dateien

### Neue Dateien (zu erstellen)

```
website/src/pages/ResQBrainPage.tsx
website/src/pages/ContactPage.tsx
website/src/pages/CompanyPage.tsx                    (Phase 3)
website/src/components/marketing/CompanyHero.tsx
website/src/components/marketing/ProjectCard.tsx
website/src/components/marketing/ResQBrainHero.tsx
website/src/components/marketing/KnowledgeOnlyDisclaimer.tsx
website/src/components/marketing/PilotInterestSection.tsx
docs/planning/triggerhub-company-website-plan.md     ← diese Datei
```

### Zu modifizierende Dateien

```
website/src/app/routing/routeManifest.ts             (+3 neue Routen)
website/src/app/routing/AppRouter.tsx (oder Renderer) (+3 neue Pages)
website/src/styles/theme.css                         (+ResQBrain-Farbtokens)
website/src/i18n/locales/en/common.json              (+neue i18n-Keys)
website/src/i18n/locales/de/common.json              (+neue i18n-Keys)
website/src/components/MarketingBlocks.tsx           (Footer-Update)
```

### Zu löschende Dateien

```
website/src/components/Testimonials.tsx              (Fake-Reviews)
```

### Zu bereinigende Dateien

```
website/src/components/ProblemSection.tsx            (Fake-Zahlen entfernen)
website/src/components/EarlyAccess.tsx               (Kaputtes Formular)
```

### Unberührt lassen

```
website/src/styles/fonts.css
website/src/styles/animations.css
website/src/lib/motion.ts
website/src/components/StatusBadge.tsx
website/src/components/LanguageSwitcher.tsx
website/src/components/ui/*                          (Radix-Basis)
website/src/app/providers/*                          (Auth-System)
website/src/pages/LegalPage.tsx                      (Inhalt via i18n aktualisieren)
```
