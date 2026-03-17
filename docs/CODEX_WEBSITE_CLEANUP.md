# CODEX_WEBSITE_CLEANUP.md
# TriggerHub 2.0 — Website Cleanup & Repair Aufträge

**Erstellt:** 2026-03-17
**Basis:** Vollständige Analyse aller website/-Dateien
**Zweck:** Eigenständige Arbeitsgrundlage für Codex. Kein vorheriger Chat-Kontext nötig.
**Scope:** Nur `website/` — Desktop-App (`src/`, `electron/`) nicht anfassen.

---

## PROJEKT-KONTEXT

**Produkt:** TriggerHub 2.0 — Windows Desktop Automation App für Creator/Streamer
**Website:** SPA auf Vercel, React 18, TypeScript, Tailwind v4, i18next (de/en)
**Branch:** `release/v0.1.1-prep`
**Website-Root:** `website/`

```
website/
├── api/                          → Vercel Serverless Functions
│   └── _profile.ts
├── src/
│   ├── app/
│   │   ├── providers/            → AuthProvider.tsx, ProfileProvider.tsx
│   │   └── routing/              → AppRouter.tsx, routeManifest.ts, routeRenderer.tsx, navigation.ts, accessGuard.ts
│   ├── components/               → MarketingBlocks.tsx, LanguageSwitcher.tsx, DocumentHead.tsx
│   │                               + TOTE: Features.tsx, FeatureAccordion.tsx, AutomationExamples.tsx,
│   │                                         IntegrationLibrary.tsx, Pricing.tsx
│   ├── i18n/
│   │   ├── i18n.ts
│   │   └── locales/en/common.json + locales/de/common.json
│   ├── modules/
│   │   ├── auth/                 → AuthProvider nutzt dies
│   │   ├── profile/              → ProfileProvider nutzt dies
│   │   ├── access-control/       → Routing-Guards
│   │   └── identity/             → TOT: wird nirgendwo genutzt
│   ├── pages/                    → WebsiteLandingPage, LoginPage, DashboardPage, ProfilePage,
│   │                               SettingsPage, AppPage, ForbiddenPage, InternalPage, SignupPage
│   └── App.tsx, main.tsx
└── index.html
```

**Render-Pfad Landing Page:**
`main.tsx` → `App.tsx` → `AppRouter.tsx` → `renderRoute('/')` → `WebsiteLandingPage`
→ `MarketingShell` + `MarketingHero` + `MarketingSection` + `BenefitGrid` + `FeatureCardGrid`
  + `WorkflowSteps` + `TrustGrid` + `FaqSection` + `MarketingCta`
(alle in `MarketingBlocks.tsx`, Daten aus `i18n/locales/*/common.json`)

---

## AUFTRÄGE — GEORDNET NACH PRIORITÄT

---

### AP-W-01 — KI-Artefakte aus i18n entfernen (KRITISCH)

**Datei:** `website/src/i18n/locales/en/common.json`
**Datei:** `website/src/i18n/locales/de/common.json`

**Problem:** Mehrere i18n-Keys enthalten keine Produkttexte, sondern KI-generierte Meta-Kommentare
über die Intention des Inhalts. Diese werden live auf der Landing-Page gerendert.

**Betroffene Keys (EN):**

```json
"landing.sections.features.description":
  "This page keeps the message tied to what the repository actually supports today,
   without stretching into roadmap claims or generic automation language."
  → IST META-KOMMENTAR. Kein Nutzer soll das lesen.

"landing.sections.extensions.description":
  "These ideas are framed deliberately as possible extensions because the repository
   already supports the underlying direction..."
  → IST META-KOMMENTAR.

"landing.sections.trust.description":
  "The website should feel credible. These points stay close to the repository evidence
   instead of marketing claims the current codebase cannot support."
  → IST META-KOMMENTAR.

"landing.sections.faq.description":
  "These answers reflect the current repository state and keep the public message aligned
   with the actual product scope."
  → IST META-KOMMENTAR.

"landing.cta.title":
  "Follow the product direction without promising a public download yet."
  → IST EINE KI-INSTRUKTION, kein Headline. Wird als H2 auf der Seite angezeigt.

"landing.cta.description":
  "The current public site should frame TriggerHub as a focused desktop product in development.
   The next step is protected access or a review of the repository and product scope."
  → IST META-KOMMENTAR.

"cta.finalLabel":
  "Final CTA"
  → Literal Label-Name wird als eyebrow-Text gerendert.

"dashboard.description":
  "Protected dashboard route prepared for future user accounts."
  → Implementierungsnotiz, kein UI-Text.

"appPage.description":
  "Protected application shell. This route remains protected in all modes."
  → Implementierungsnotiz, kein UI-Text.

"profile.identityNote":
  "Identity is managed separately from auth/session. Current role: {{role}}"
  → Developer-Notiz, die Usern angezeigt wird.
```

**Aufgabe:**
Ersetze jeden dieser Keys mit echtem Produkttext. Halte dabei den bestehenden Ton:
ehrlich, kein Marketing-Hype, passend zu einem Desktop-Tool in Early Access.

**Vorgeschlagene Ersetzungen (EN):**

```json
"landing.sections.features.description":
  "TriggerHub ships with a trigger engine, macro system, and early service adapters for OBS and Spotify.
   The feature set is focused on the desktop runtime — not a broad integration catalogue."

"landing.sections.extensions.description":
  "The product foundation already supports plugin scaffolding, clip modules, and a local runtime.
   These directions show where TriggerHub can grow without changing its core focus."

"landing.sections.trust.description":
  "These signals are grounded in the current repository and release path, not marketing claims."

"landing.sections.faq.description":
  "Short answers about what TriggerHub is today and how early access works."

"landing.cta.title":
  "Get early access to TriggerHub."

"landing.cta.description":
  "TriggerHub is in active development. Request access to follow the release and try early builds
   when they are available."

"cta.finalLabel":
  "Early access"

"dashboard.description":
  "Your TriggerHub account dashboard."

"appPage.description":
  "TriggerHub app."

"profile.identityNote":
  "Role: {{role}}"
```

**DE analog:** Gleiche Keys in `de/common.json` mit sinngemäßer deutscher Übersetzung anpassen.

---

### AP-W-02 — Tote Komponenten löschen (SICHER)

**Problem:** 5 Komponenten sind nicht in die aktive Landing Page eingebunden.
Sie erhöhen Bundle-Size, enthalten inkonsistente Stile und sind teilweise reine KI-Template-Reste.

**Dateien löschen:**

```
website/src/components/Features.tsx           → nicht importiert, nutzt legacy.* i18n-Keys
website/src/components/FeatureAccordion.tsx   → nur von Features.tsx genutzt (auch tot)
website/src/components/AutomationExamples.tsx → nicht importiert, hardcoded englisch
website/src/components/IntegrationLibrary.tsx → nicht importiert, tote Buttons, hardcoded
website/src/components/Pricing.tsx            → nicht importiert, defektes SaaS-Template
```

**Sicherheitscheck vor dem Löschen:**
```bash
cd website
grep -r "Features" src --include="*.tsx" --include="*.ts" -l
grep -r "FeatureAccordion" src --include="*.tsx" --include="*.ts" -l
grep -r "AutomationExamples" src --include="*.tsx" --include="*.ts" -l
grep -r "IntegrationLibrary" src --include="*.tsx" --include="*.ts" -l
grep -r "Pricing" src --include="*.tsx" --include="*.ts" -l
```
Erwartet: Keine Treffer außer den Dateien selbst.

---

### AP-W-03 — Totes Modul löschen: identity/

**Problem:** `website/src/modules/identity/` enthält 3 Dateien die nirgendwo importiert werden.

**Dateien löschen:**
```
website/src/modules/identity/identityService.ts
website/src/modules/identity/types.ts
website/src/modules/identity/userStore.ts
```

**Sicherheitscheck:**
```bash
grep -r "from.*identity" website/src --include="*.tsx" --include="*.ts"
grep -r "identityService\|userStore\|UserRecord\|UserStore" website/src --include="*.tsx" --include="*.ts"
```
Erwartet: Keine Treffer außer den 3 Dateien selbst.

---

### AP-W-04 — Legacy-i18n-Block entfernen

**Problem:** Nach AP-W-02 (Löschung der 5 Komponenten) ist der gesamte `legacy.*`-Block
in den i18n-Dateien unused. Er enthält alte Feature-Inhalte, aufgeblasen mit KI-generiertem
Marketing-Text ("possibilities are endless", "sub-100ms latency", etc.).

**Datei:** `website/src/i18n/locales/en/common.json`
**Datei:** `website/src/i18n/locales/de/common.json`

**Aktion:** Den gesamten `"legacy"` Key inkl. aller Unterkeys aus beiden JSON-Dateien entfernen.

```json
// ENTFERNEN:
"legacy": {
  "featureAccordion": { ... },
  "features": { ... }
}
```

**Voraussetzung:** AP-W-02 muss abgeschlossen sein.

---

### AP-W-05 — AppRouter: replaceTo() aus Render-Body heraus

**Datei:** `website/src/app/routing/AppRouter.tsx`

**Problem:** `replaceTo('/dashboard')` wird direkt im Render-Body aufgerufen (Zeile 40-43),
nicht in einem `useEffect`. Das ist ein Side-Effect im Render — verletzt React-Regeln
und kann in StrictMode zu Doppel-Ausführungen führen.

**Aktueller Code (Zeilen 40-43):**
```tsx
if (identity && normalizedPath === '/login') {
  replaceTo('/dashboard')
  return null
}
```

**Fix:** In den bestehenden `useEffect` integrieren oder eigenen `useEffect` hinzufügen:
```tsx
useEffect(() => {
  if (isInitializing) return
  if (identity && normalizedPath === '/login') {
    replaceTo('/dashboard')
    return
  }
  if (!decision.allow && decision.redirectTo) {
    replaceTo(decision.redirectTo)
  }
}, [decision.allow, decision.redirectTo, identity, normalizedPath, isInitializing])
```
Der bestehende `useEffect` (Zeilen 19-31) muss dann entsprechend erweitert werden.
Den direkten `if`-Block im Render danach entfernen.

---

### AP-W-06 — routeRenderer: Map auf Modulebene heben

**Datei:** `website/src/app/routing/routeRenderer.tsx`

**Problem:** `const rendererMap = { ... }` wird bei jedem Aufruf von `renderRoute()` neu erzeugt.
Das Objekt mit ~13 Einträgen + JSX-Factories wird bei jedem Router-Render neu alloziert.

**Fix:** `rendererMap` als Modul-Level-Konstante deklarieren, die `renderRoute`-Funktion
bleibt bestehen und nutzt sie:

```tsx
const rendererMap: Record<RoutePath, () => ReactElement | null> = {
  '/access': () => null,
  '/': () => <WebsiteLandingPage />,
  // ... (alle anderen Routes unverändert)
}

export const renderRoute = (path: RoutePath): ReactElement | null => {
  return rendererMap[path]()
}
```

---

### AP-W-07 — SettingsPage & AppPage: Styling auf Token-System umstellen

**Dateien:**
- `website/src/pages/SettingsPage.tsx`
- `website/src/pages/AppPage.tsx`

**Problem:** Diese Pages nutzen Raw-Tailwind-Klassen (`bg-zinc-900/80`, `border-zinc-700`,
`text-zinc-300`, `bg-cyan-500`, `border-zinc-500`) während `DashboardPage` das semantische
Token-System nutzt (`bg-background`, `text-foreground`, `bg-primary`, `border-border`).

**Zielzustand (beide Pages):**

```tsx
// Container:
<main className="min-h-screen bg-background text-foreground p-6">

// Card:
<div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6">

// Sekundärer Text:
<p className="mt-2 text-muted-foreground">...</p>

// Primary Button:
<button className="rounded-md bg-primary px-4 py-2 text-primary-foreground font-semibold">

// Secondary Button:
<button className="rounded-md border border-border px-4 py-2">
```

`LanguageSwitcher` in beiden Pages ohne `variant` aufrufen oder `variant="light"` setzen
— konsistent mit `DashboardPage`.

---

### AP-W-08 — BenefitGrid: Differenzierte Icons

**Datei:** `website/src/components/MarketingBlocks.tsx`, Funktion `BenefitGrid` (ca. Zeile 355)

**Problem:** Alle 3 Benefit-Cards rendern dasselbe `<Sparkles>`-Icon.
Kein visueller Unterschied zwischen den drei Karten.

**Fix:** 3 unterschiedliche Icons aus `lucide-react` verwenden, die zum Inhalt passen:
- "Reduce live setup friction" → `<Zap className="size-5" />`
- "Keep control on your machine" → `<Monitor className="size-5" />`
- "Unify repeated routines" → `<Workflow className="size-5" />`

Die Icons als Array parallel zur i18n-Daten-Iteration übergeben (gleiche Technik wie `Features.tsx`):
```tsx
const benefitIcons = [Zap, Monitor, Workflow]

export const BenefitGrid = ({ items }: BenefitGridProps) => (
  <div className="grid gap-6 md:grid-cols-3">
    {items.map((item, index) => {
      const Icon = benefitIcons[index] ?? Sparkles
      return (
        <article key={item.title} ...>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Icon className="size-5" />
          </div>
          ...
        </article>
      )
    })}
  </div>
)
```
Imports in `MarketingBlocks.tsx` ergänzen: `Zap, Monitor, Workflow` aus `lucide-react`
(überprüfen ob bereits importiert).

---

### AP-W-09 — Mobile Menu: aria-expanded ergänzen

**Datei:** `website/src/components/MarketingBlocks.tsx`, `MarketingShell` (ca. Zeile 112)

**Problem:** Toggle-Button hat kein `aria-expanded`, Screen-Reader können Open/Close-Zustand
nicht erkennen.

**Fix:**
```tsx
<button
  className="..."
  onClick={toggleMobileMenu}
  type="button"
  aria-label="Toggle navigation"
  aria-expanded={isMobileMenuOpen}
  aria-controls="mobile-menu"
>
```
Dem Menu-Container eine passende `id` geben:
```tsx
<div id="mobile-menu" className="md:hidden ...">
```

---

### AP-W-10 — sessionStore.ts: Modul durch Inline-Cleanup ersetzen

**Datei:** `website/src/modules/auth/sessionStore.ts`

**Problem:** Das Modul existiert ausschließlich um zwei Legacy-LocalStorage-Keys zu löschen.
`createLocalSessionStore()` gibt immer `null` zurück. Die Session-Store-Logik ist dauerhaft deaktiviert.
Das ist ein totes Interface-Konzept das echten Code simuliert.

**Fix:**
1. In `AuthProvider.tsx` direkt beim Mount einmalig die Legacy-Keys bereinigen:
```tsx
useEffect(() => {
  // clear legacy session storage keys
  localStorage.removeItem('th.website.auth.session.v1')
  localStorage.removeItem('th.website.auth.session.guard.v1')
}, [])
```
2. `website/src/modules/auth/sessionStore.ts` löschen.
3. Den `import { createLocalSessionStore }` aus `AuthProvider.tsx` entfernen.

**Prüfen ob sessionStore woanders importiert wird:**
```bash
grep -r "sessionStore\|createLocalSessionStore" website/src --include="*.ts" --include="*.tsx"
```

---

## NICHT ANFASSEN (Out of Scope)

- `src/`, `electron/` — Desktop-App, separater Kontext
- `website/src/modules/auth/` — AuthProvider und Backend-Client funktionieren korrekt
- `website/src/modules/profile/` — ProfileService funktioniert korrekt
- `website/src/modules/access-control/` — Route-Guards funktionieren korrekt
- `website/src/app/routing/routeManifest.ts` — Route-Definitionen korrekt
- `website/vercel.json` — Deployment-Config korrekt
- `website/api/_profile.ts` — Serverless Function korrekt
- i18n-Struktur, Sprachauswahl, LanguageSwitcher — funktioniert korrekt
- `fileProfileStorage.ts` — Node.js-Code in src/ ist ein bekanntes Problem
  aber betrifft nur das Server-Side-Rendering Szenario; nicht in diesem Scope

---

## REIHENFOLGE DER AUSFÜHRUNG

```
AP-W-02  →  AP-W-03  →  AP-W-04   (Löschungen zuerst — Voraussetzung für saubere i18n-Bereinigung)
AP-W-01                             (i18n-Texte bereinigen, parallel möglich nach AP-W-04)
AP-W-05  →  AP-W-06                (Routing-Fixes, unabhängig)
AP-W-07  →  AP-W-08  →  AP-W-09   (UI-Fixes, unabhängig voneinander)
AP-W-10                             (sessionStore-Cleanup, unabhängig)
```

---

## ABSCHLUSSPRÜFUNG

Nach allen Aufträgen:

```bash
cd website
npm run build         # muss fehlerfrei durchlaufen
npm run typecheck     # falls vorhanden
```

Manuelle Checks:
- [ ] Landing Page lädt ohne Fehler im Browser
- [ ] Keine Meta-Kommentare sichtbar auf der Seite
- [ ] Abschnitte Benefits/Features/Workflow/Extensions/Trust/FAQ/CTA zeigen echten Produkttext
- [ ] Innere Pages (Dashboard, Settings, App) sind visuell konsistent
- [ ] Mobile Menu öffnet/schließt korrekt
- [ ] Login-Page erreichbar via CTA-Button
- [ ] Deutsche Sprachversion zeigt keine englischen Fallbacks

---

## BEKANNTE NICHT-REGRESSIONS-RISIKEN

- **i18n-Keys**: Beim Umbenennen von Keys immer beide Locales (en + de) gleichzeitig ändern.
  Die App crasht nicht bei fehlendem Key (i18next gibt Key-Name zurück), aber es entstehen
  sichtbare Key-Strings auf der Seite.

- **MarketingBlocks.tsx**: Alle Marketing-Komponenten (BenefitGrid, FeatureCardGrid, etc.)
  sind in einer Datei. Beim Bearbeiten sicherstellen dass keine anderen Exporte versehentlich
  verändert werden. Die Datei exportiert: `useHashSectionSync`, `MarketingShell`, `MarketingHero`,
  `MarketingSection`, `BenefitGrid`, `FeatureCardGrid`, `WorkflowSteps`, `TrustGrid`,
  `FaqSection`, `MarketingCta` — alle werden von `WebsiteLandingPage.tsx` genutzt.

- **Tailwind v4**: Das Projekt nutzt Tailwind v4. Token-Klassen (`bg-background`, `text-foreground`
  etc.) sind in den CSS-Theme-Dateien unter `website/src/styles/` definiert, nicht in
  `tailwind.config.js`. Keine Config-Datei nötig.
