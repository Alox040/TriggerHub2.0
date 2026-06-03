# TriggerHub — Company Website: Implementierungskontext

**Erstellt:** 2026-06-03  
**Scope:** `website/` — Company Website Grundstruktur  
**Build-Status:** ✓ Erfolgreich (1635 Module, Vite 6.3.5)

---

## Was implementiert wurde

### Neue Seiten

| Route | Datei | Beschreibung |
|-------|-------|-------------|
| `/` | `CompanyLandingPage.tsx` | Firmen-Startseite mit allen 6 Sektionen |
| `/resqbrain` | `ResQBrainPage.tsx` | ResQBrain-Produktseite mit Disclaimer |
| `/kontakt` | `ContactPage.tsx` | Kontaktseite (mailto-Link, kein Formular) |
| `/impressum` | `LegalPage` (variant=impressum) | Impressum gemäß § 5 TMG |
| `/datenschutz` | `LegalPage` (variant=datenschutz) | Datenschutzerklärung (DSGVO) |
| `/imprint` | Redirect → `/impressum` | EN-Alias |
| `/privacy` | Redirect → `/datenschutz` | EN-Alias |
| `/features`, `/pricing`, `/about` | Redirect → `/` | Legacy-Routen deaktiviert |

### Neue Komponenten

| Komponente | Datei | Zweck |
|------------|-------|-------|
| `CompanyShell` | `components/company/CompanyShell.tsx` | Header + Footer der Firmenwebsite |
| `HeroSection` | `components/company/HeroSection.tsx` | Firmen-Hero mit Status-Badge |
| `PrinciplesSection` | `components/company/PrinciplesSection.tsx` | 5 Arbeits-Prinzipien |
| `ProjectsSection` | `components/company/ProjectsSection.tsx` | ResQBrain + Platzhalter für künftige Projekte |
| `ServicesSection` | `components/company/ServicesSection.tsx` | 5 Leistungsbereiche |
| `ProcessSection` | `components/company/ProcessSection.tsx` | 5-stufiger Prozess mit Verbindern |
| `ContactCTASection` | `components/company/ContactCTASection.tsx` | CTA-Block mit mailto |
| `KnowledgeOnlyDisclaimer` | `components/company/KnowledgeOnlyDisclaimer.tsx` | Pflicht-Disclaimer für ResQBrain |

### Neue Konfiguration

| Datei | Inhalt |
|-------|--------|
| `src/config/site.ts` | Zentrale Texte, Links, Platzhalter-Markierungen |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/app/routing/routeManifest.ts` | +7 neue Routes im RoutePath-Typ und ROUTE_MANIFEST |
| `src/app/routing/AppRouter.tsx` | +Imports, +normalizeRoutePath, +rendererMap-Einträge |

---

## Designentscheidungen

### Farbsystem

```
Firmenhintergrund:    #09111d   (deep navy)
Footer-Hintergrund:   #060d18   (dunkleres Navy)
Dunkle Sections:      #060d18
Akzent (TriggerHub):  sky-400   (#38BDF8)
Akzent (ResQBrain):   emerald-400/500
Status-Badge:         amber-400  (Warnhinweise + Status "Unternehmen im Aufbau")
```

### Typografie
- **Headings:** `font-['Sora',sans-serif]` — bereits über `fonts.css` geladen
- **Body:** `Manrope` — Standard aus `theme.css`

### Card-Typen
- Standard: `bg-white/[0.03] border border-white/[0.08] rounded-2xl`
- ResQBrain: `bg-emerald-500/[0.04] border border-emerald-500/25`
- Disclaimer: `bg-amber-400/[0.06] border border-amber-400/30`

---

## Offene Platzhalter

Alle offenen Stellen sind in `src/config/site.ts` markiert:

| Feld | Aktueller Wert | Was fehlt |
|------|---------------|-----------|
| `company.hrb` | `null` | HRB-Nummer nach Handelsregistereintragung |
| `company.ustId` | `null` | USt-Id nach Vergabe durch Finanzamt |
| `company.legalName` | "in Gründung" | Nach Eintragung: "TriggerHub UG (haftungsbeschränkt)" ohne Zusatz |
| `owner.email` | Triggerhub@outlook.com | Ggf. auf Firmen-Domain umstellen |
| ResQBrain-Features | Keine Liste | Was genau sind die Inhalte? Plattform? |
| ResQBrain-Pilotpartner | Kein einziger | Erst nach schriftlicher Vereinbarung eintragen |

---

## Regulatorische Entscheidungen

### ResQBrain

- `KnowledgeOnlyDisclaimer` ist auf der ResQBrain-Seite **immer sichtbar** (kein Toggle, kein Aufklappen)
- Zusätzlich im `ProjectsSection`-Card ein kompakter Inline-Hinweis
- `site.ts` beinhaltet den Disclaimer-Text — Änderungen nur nach Überprüfung

### Unternehmensstatus

- Footer und Impressum verwenden konsistent: "TriggerHub UG (haftungsbeschränkt) in Gründung"
- Kein HRB, keine USt-Id — explizit als nicht vorhanden dokumentiert
- Bottom-Bar: "Keine Handelsregisternummer bis zur abgeschlossenen Eintragung"

---

## Bestehende Komponenten (unberührt)

- `MarketingBlocks.tsx` — unverändert (beinhaltet alten Streaming-Content)
- `WebsiteLandingPage.tsx` — unverändert (nicht mehr auf `/` geroutet, aber als Datei erhalten)
- `src/styles/*` — unverändert
- Auth-System (`providers/`, `modules/`) — unverändert
- `Testimonials.tsx`, `ProblemSection.tsx`, `EarlyAccess.tsx` — noch nicht gelöscht (separater Schritt empfohlen)

---

## Nächste empfohlene Schritte

1. **Fake-Content löschen:** `Testimonials.tsx`, `EarlyAccess.tsx` (kaputtes Formular)
2. **Impressum finalisieren:** Nach UG-Eintragung in `site.ts` ergänzen
3. **ResQBrain-Inhalt ausarbeiten:** Feature-Liste, Plattforminfo, Pilotplan
4. **`WebsiteLandingPage.tsx` entscheiden:** Behalten als "TriggerHub 2.0"-Seite (auf neuem Route `/triggerhub`) oder deprecieren
5. **OG-Meta-Tags:** DocumentHead.tsx für neue Routen anpassen
6. **Pilotkooperation dokumentieren:** Nur nach schriftlicher Vereinbarung in ProjectsSection eintragen
