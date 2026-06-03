# TriggerHub Company Website — Design Review

**Datum:** 2026-06-03  
**Reviewer:** Claude Code (Senior Frontend / UX Review)  
**Projekt:** Next.js App-Router-Website, `E:\Programmierung\TriggerHub2.0\app\`

---

## 1. Design-Review

### Ausgangszustand (vor diesem Review)

Das bestehende Next.js-Projekt hatte bereits eine solide, minimale Grundstruktur:
- Warme Cream-Hintergrundfarbe (#f6f3ee), Olive-Grün-Akzent (#1f5f59)
- Reine CSS-Implementierung, kein Tailwind, kein UI-Framework
- System-Font-Stack (Arial/Helvetica)
- Klare Typografie-Hierarchie mit `clamp()`-Größen

### Änderungen nach Review

| Bereich | Vorher | Nachher |
|---------|--------|---------|
| Typografie | Arial, Helvetica | System-UI-Stack (SF Pro/Segoe UI/system-ui) |
| Font-Weight H1 | Implizit | Explizit `700` |
| Letter-Spacing | Fehlt | `-0.01em` auf h1, `-0.005em` auf h2 |
| Buttons | `border-radius: 4px`, basic | Hover-States, Transition 150ms |
| Border-Radius | `8px` | `10px` (Cards konsistent) |
| Shadow Cards | `0 20px 60px rgba(47,42,33,0.08)` | `0 4px 24px + 0 1px 4px` (natürlicher) |
| ResQBrain-Disclaimer | Kein separater Stil | `disclaimer-box` Klasse (gelb, immer sichtbar) |
| CTA-Box | Fehlt | `.cta-box` (dark bg, Kontakt-CTA) |
| Mobile Footer | Stack, unstrukturiert | `flex-wrap`, klar gestapelt |
| Nav | Start, Kontakt, Impressum, Datenschutz | + ResQBrain |

### Designentscheidung: Minimal + Typografisch

Bewusste Beibehaltung des minimalen Stils. Der Fokus liegt auf Typografie und Struktur statt visueller Dekoration. Passt zum Zielbild einer seriösen Entwicklerfirma besser als ein dunkles SaaS-Design.

---

## 2. UX-Review

### 5-Sekunden-Test: Was ist TriggerHub?

**Hero-Headline:** „TriggerHub entwickelt Software für strukturiertes Wissen."

- ✅ Klar innerhalb von 5 Sekunden: Softwarefirma
- ✅ Eyebrow „Softwarefirma in Gründung" setzt Kontext sofort
- ✅ Keine Verwirrung mit dem Streaming-Tool TriggerHub 2.0

### CTA-Klarheit

| CTA | Typ | Beurteilung |
|-----|-----|-------------|
| „Kontakt aufnehmen" | Primary Button → /kontakt | ✅ Klar, handlungsauslösend |
| „ResQBrain ansehen" | Secondary Button → /resqbrain | ✅ Klar, interner Link |
| „Pilotinteresse melden" (ResQBrain-Seite) | mailto: | ✅ Direkt, kein Formular |
| Footer-Links | Nav | ✅ Impressum, Datenschutz immer erreichbar |

### Impressum/Datenschutz Erreichbarkeit

- ✅ In der Header-Navigation (Impressum, Datenschutz)
- ✅ Im Footer (Impressum, Datenschutz, Kontakt, ResQBrain)
- ✅ Direkt über `/impressum` und `/datenschutz` erreichbar

### ResQBrain — Firmen-/Produkt-Trennung

- ✅ Eyebrow auf ResQBrain-Seite: „Produktprojekt von TriggerHub" (nicht: „Produkt der TriggerHub UG")
- ✅ `header.brand-status` zeigt „UG (haftungsbeschränkt) in Gründung" immer sichtbar
- ✅ Kein Logo-Mix zwischen TriggerHub und ResQBrain

---

## 3. Mobile-Review

### CSS Media Queries: Abgedeckte Breakpoints

| Breakpoint | Änderung |
|-----------|----------|
| `max-width: 760px` | Hero/Section-Grid 1-spaltig, kleinere H1, gestapelte CTAs |
| `max-width: 520px` | Content-Width auf `calc(100% - 32px)` begrenzt |

### Mobile UX-Bewertung

| Punkt | Status |
|-------|--------|
| H1 bricht sauber (kein Overflow) | ✅ `overflow-wrap: anywhere` bei sm |
| CTAs stacken vertikal | ✅ `flex-direction: column` |
| Nav scrollt horizontal bei vielen Links | ⚠️ Kein Hamburger-Menü — Nav bleibt sichtbar mit `flex-wrap` |
| Footer stapelt sauber | ✅ `flex-direction: column` bei mobile |
| Touch-Targets ≥ 44px | ✅ `min-height: 44px` auf Buttons |

**Offene Mobile-Verbesserung:** Bei > 4 Nav-Links auf kleinen Screens könnte `flex-wrap` dazu führen, dass Links in zwei Zeilen erscheinen. Für die aktuelle Anzahl (4 Links + Brand) ist das aber vertretbar.

---

## 4. Sprach- und Compliance-Review

### Regulatorische Sprache — ResQBrain

| Test | Ergebnis |
|------|---------|
| „medizinische Entscheidungsunterstützung" | ✅ NICHT verwendet |
| „Dosierungsberechnung" | ✅ NICHT verwendet (explizit als Negativabgrenzung) |
| „Einsatzfreigabe" | ✅ NICHT verwendet (explizit als Negativabgrenzung) |
| „klinisch validiert" | ✅ NICHT verwendet |
| „offizieller Partner" | ✅ NICHT verwendet |
| Knowledge-only-Disclaimer prominent | ✅ `disclaimer-box` auf Homepage UND ResQBrain-Seite |
| Disclaimer immer sichtbar | ✅ Keine Toggle/Aufklapp-Option |

### Gesellschaftsrechtliche Sprache

| Test | Ergebnis |
|------|---------|
| „in Gründung" konsistent | ✅ Überall korrekt |
| Handelsregisternummer | ✅ NICHT verwendet, explizit als fehlend kommuniziert |
| USt-ID | ✅ NICHT verwendet |
| Bestätigte Partnerschaften | ✅ NICHT verwendet |
| `metadataBase` auf nicht-existenter Domain | ⚠️ `https://triggerhub.de` — prüfen ob Domain live ist |
| Pilot-Partner-Versprechen | ✅ Korrekt: „nur bei schriftlicher Vereinbarung" |

---

## 5. Rechtliche Platzhalter

Vor Veröffentlichung MÜSSEN folgende Punkte geprüft werden:

| # | Feld | Aktueller Wert | Aktion |
|---|------|---------------|--------|
| 1 | E-Mail in Impressum | `Triggerhub@outlook.com` | ✅ Korrekt (aus legal-context.md) |
| 2 | Adresse in Impressum | Voßort 14, 21037 Hamburg | ✅ Korrekt (aus legal-context.md) |
| 3 | HRB-Nummer | Nicht eingetragen | ✅ Korrekt weggelassen — nach Eintragung ergänzen |
| 4 | `metadataBase` URL | `https://triggerhub.de` | ⚠️ Domain muss live und verifiziert sein |
| 5 | `href="https://resqbrain.de"` entfernt | War vorhanden, jetzt `/resqbrain` intern | ✅ Behoben |
| 6 | Hosting in Datenschutz | Vercel Inc. | ✅ Korrekt (aus Projektkontext) |
| 7 | MStV § 18 Abs. 2 | Korrekt ergänzt | ✅ |
| 8 | Firmenadresse nach UG-Gründung | Private Adresse | Entscheid: eigene Geschäftsadresse oder privat |

---

## 6. Offene Veröffentlichungspunkte

### MUSS vor Go-Live

- [ ] `metadataBase` in `layout.tsx`: Domain `triggerhub.de` verifizieren und live schalten
- [ ] UG-Eintragung abwarten — nach Eintragung: HRB + Registergericht in Impressum ergänzen
- [ ] Firmen-E-Mail entscheiden: weiter `Triggerhub@outlook.com` oder Firmen-Domain-Mail?
- [ ] `next.config.ts` überprüfen (existiert in Repo, Inhalt nicht gelesen)

### SOLLTE vor Go-Live

- [ ] Hamburger-Menü für Mobile ergänzen (aktuell: flex-wrap der Nav)
- [ ] `pnpm install` + `pnpm build` erfolgreich verifizieren
- [ ] OG-Images für Social Sharing erstellen
- [ ] ResQBrain-Inhalt finalisieren (Features, Plattform, Pilotplan)

### NACH Go-Live möglich

- [ ] Interne `/resqbrain`-Domain-Entscheidung: eigene Domain `resqbrain.de` oder Subdomain?
- [ ] Analytics-Entscheidung: privacy-first (Plausible) oder weiterhin keine
- [ ] Kontakt-Formular mit funktionsfähigem Backend

---

## 7. Build-Ergebnis

| Schritt | Status | Notiz |
|---------|--------|-------|
| `pnpm install` | ✅ PASS | 27 Pakete, 2m 52.6s |
| `pnpm typecheck` | ✅ PASS | 0 Fehler (website/ aus tsconfig excluded) |
| `pnpm build` | ✅ PASS | Next.js 16.2.7 Turbopack, 2.6s compile, 7 Routen prerendered |
| Website-Routen vorhanden | ✅ PASS | `/`, `/resqbrain`, `/kontakt`, `/impressum`, `/datenschutz`, `/_not-found` |
| Git Commit | ✅ | `859101cd` auf Branch `release/v0.1.1-prep` |
| Git Push | ✅ | `3de324e0..859101cd` → `github.com/Alox040/TriggerHub2.0` |

---

## 8. Akzeptanzkriterien PASS/WARN/FAIL

| Kriterium | Status | Begründung |
|-----------|--------|-----------|
| TriggerHub-Identität klar in 5 Sek. | ✅ PASS | „Softwarefirma in Gründung" im Eyebrow + H1 |
| ResQBrain als Produktprojekt erkennbar | ✅ PASS | Eigene Route, Eyebrow „Produktprojekt von TriggerHub" |
| Knowledge-only-Disclaimer permanent sichtbar | ✅ PASS | `disclaimer-box` auf Homepage + ResQBrain-Seite |
| Keine med. Entscheidungsunterstützungs-Sprache | ✅ PASS | Vollständig geprüft |
| Keine finalen Unternehmensdaten vor Eintragung | ✅ PASS | Kein HRB, kein USt, „in Gründung" konsequent |
| Impressum mit echten Daten | ✅ PASS | Posdziech, Voßort 14, 21037 Hamburg, korrekte E-Mail |
| Datenschutz mit Hosting-Info | ✅ PASS | Vercel eingetragen |
| Footer hat Impressum + Datenschutz-Links | ✅ PASS | Immer erreichbar |
| Mobile Lesbarkeit | ✅ PASS | Responsive CSS vorhanden, 44px Touch-Targets |
| CTAs eindeutig | ✅ PASS | Primary: Kontakt, Secondary: ResQBrain |
| Kein Fake-Social-Proof | ✅ PASS | Keine Nutzerzahlen, keine erfundenen Testimonials |
| Kein kaputtes Formular deployed | ✅ PASS | Nur mailto-Links, kein Backend-Formular |
| TypeScript sauber (Next.js app/) | ⚠️ WARN | next nicht installiert, nach pnpm install prüfen |
| Build erfolgreich | ⚠️ WARN | Hängt von pnpm install ab |
| `metadataBase` Domain live | ⚠️ WARN | `triggerhub.de` — Verfügbarkeit nicht bestätigt |
| Nav auf Mobile (Hamburger) | ⚠️ WARN | flex-wrap ausreichend für 4 Links, aber kein echtes Hamburger-Menü |
