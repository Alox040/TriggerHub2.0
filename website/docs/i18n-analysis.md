# Internationalisierung (i18n) – Analyse website/

**Ziel:** Vorbereitung eines sauberen i18n-Systems (Deutsch + Englisch) ausschließlich auf Basis der vorhandenen Struktur.

**Stand:** Analyse ausschließlich anhand vorhandener Dateien im Ordner `website/`.

---

## 1. Technische Struktur der Website

| Aspekt | Befund |
|--------|--------|
| **Framework** | **React 18** (peer), **Vite 6** als Build-Tool (kein Next.js). Einstieg: `index.html` → `src/main.tsx` → `src/App.tsx`. |
| **Routing** | Eigenes SPA-Routing (kein React Router): `window.history.pushState` / `popstate`, Pathname-Hook `usePathname()` in `src/app/routing/navigation.ts`. Route-Definitionen in `src/app/routing/routeManifest.ts`, Page-Zuordnung in `src/app/routing/routeRenderer.tsx`. |
| **Layout** | Kein gemeinsames Root-Layout. **Marketing-Seiten:** `MarketingShell` (Header + Footer) in `MarketingBlocks.tsx`. **Auth/App-Seiten:** jeweils eigenes `<main>` pro Page, kein gemeinsamer Layout-Wrapper. |
| **Header / Navigation** | Nur in `MarketingShell` (MarketingBlocks.tsx): Logo „TRIGGERHUB“, Tagline „Desktop automation for creator workflows“, Section-Links (Benefits, Features, How it works, Extensions, FAQ), CTA „Protected access“. Footer: „Product“, „Links“, „GitHub repository“, „Protected access“, gleiche Section-Links. |

**Relevante Dateien:**

- Einstieg: `index.html` → `src/main.tsx` → `src/App.tsx` → `AppRouter` → `routeRenderer`
- Routen: `src/app/routing/routeManifest.ts` (Pfade), `src/app/routing/routeRenderer.tsx` (Page-Komponenten pro Pfad)
- Navigation: `src/app/routing/navigation.ts` (`navigateTo`, `replaceTo`, `usePathname`, `readNextPath`)
- Route `/internal`: wird in `routeRenderer.tsx` mit `null` gerendert (InternalPage aktuell nicht angebunden).

---

## 2. Alle Stellen mit direkt im Code stehendem Text

### 2.1 HTML / Meta (index.html)

| Stelle | Aktueller Text |
|--------|-----------------|
| `lang` | `de` |
| `<title>` | TriggerHub  Automation fuer Creator und Streaming Workflows |
| `meta name="description"` | TriggerHub automatisiert Streaming- und Creator-Workflows mit Triggern, Makros und Integrationen fuer OBS, Twitch und Spotify. |
| `og:title` / `twitter:title` | TriggerHub  Creator Automation Platform |
| `og:description` / `twitter:description` | Automatisiere deine Streaming-Workflows mit Triggern, Makros und Integrationen fuer OBS, Twitch und Spotify. |

**Hinweis:** Title/Description sind statisch in `index.html`. Für i18n müssten sie zur Laufzeit (z. B. in App/Root) gesetzt werden (document.title, meta-Tags per JS), da es nur eine HTML-Datei gibt.

---

### 2.2 Landing Page & Marketing

**Datei: `src/pages/WebsiteLandingPage.tsx`**

- Arrays: `heroProofPoints`, `benefits`, `featureCards`, `workflowSteps`, `trustItems`, `extensionCards`, `faqItems` (alle Einträge Titel/Beschreibung/Fragen/Antworten).
- Props an `MarketingHero`, `MarketingSection`, `MarketingCta`: `title`, `description`, `eyebrow`, `proofPoints`, `items` usw.

**Datei: `src/components/MarketingBlocks.tsx`**

- **Navigation:** `sectionLinks`: „Benefits“, „Features“, „How it works“, „Extensions“, „FAQ“.
- **Header:** „TRIGGERHUB“, „Desktop automation for creator workflows“, „Protected access“.
- **Footer:** „TRIGGERHUB“, „Product information reflects…“, „Product“, „Links“, „GitHub repository“, „Protected access“.
- **Hero:** „Windows desktop software“, „Request access“, „See core capabilities“.
- **DesktopPreview:** „Workflow overview“, „Automation flow“, „Live stream startup“, „Local runtime“, Trigger/Condition/Macro/Action + Beschreibungen, „Connected surface“, „OBS control“, „Spotify actions“, „Clip export modules“, „Plugin-ready runtime“, „Why it matters“, Absatz-Text.
- **MarketingCta:** „Final CTA“, „Request protected access“, „View repository“.

---

### 2.3 Auth & App-Pages

| Datei | Art | Beispiele |
|-------|-----|-----------|
| `LoginPage.tsx` | Überschriften, Hinweise, Labels, Buttons, Fehler | „Owner Login“, „Access mode is … Public registration is currently disabled.“, „Owner authentication is fail-closed…“, „Username“, „Password“, „Signing in…“, „Sign in“, „Login failed unexpectedly“ |
| `SignupPage.tsx` | Überschrift, Hinweise, Button | „Account Registration“, „Public registration is not available…“, „Access is currently restricted…“, „Sign in instead“ |
| `DashboardPage.tsx` | Überschrift, Beschreibung, Buttons | „Dashboard“, „Protected dashboard route…“, „Profile“, „Settings“ |
| `ProfilePage.tsx` | Überschrift, Hinweise, Labels, Buttons, Erfolg/Fehler | „Profile“, „Identity is managed…“, „Loading profile…“, „Display name“, „Avatar URL“, „Bio“, „Save profile“, „Back“, „Profile saved“, „Failed to update profile“, Placeholder „https://…“ |
| `SettingsPage.tsx` | Überschrift, Beschreibung, Button | „Settings“, „Protected settings route…“, „Back to Dashboard“ |
| `ForbiddenPage.tsx` | Überschrift, Text, Button | „Access denied“, „Your current account is not allowed…“, „Back to login“ |
| `AppPage.tsx` | Überschrift, Beschreibung, Buttons | „App“, „Protected application shell…“, „Open Dashboard“, „Settings“ |
| `InternalPage.tsx` | Überschrift, Text, Buttons | „Internal Owner Area“, „Logged in as … with role …“, „Open Dashboard“, „Open Profile“, „Logout“ |

---

### 2.4 Fehlermeldungen & Backend-nahe Texte

**Frontend (werden Nutzern angezeigt):**

- `AuthProvider.tsx`: „Invalid username or password“, „Logout failed“, „Failed to validate owner session“, „Session refresh is not implemented in prelaunch auth mode“, „Backend login response did not include a session snapshot“, „Owner authentication is unavailable“, „useAuth must be used within AuthProvider“.
- `ProfileProvider.tsx`: „Failed to load profile“, „Cannot update profile without authenticated identity“, „useProfile must be used within ProfileProvider“.
- `profileService.ts`: „No authenticated profile session“, „Failed to load profile“, „Profile response did not include a profile payload“, „Profile input is invalid“, „Failed to update profile“, „Updated profile does not match the authenticated user“.
- `modules/profile/validation.ts`: „avatar_url exceeds maximum length“, „avatar_url must use http or https“, „avatar_url must be a valid absolute URL“, „display_name is required“, „display_name exceeds maximum length“, „bio exceeds maximum length“.

**API (JSON `message` für Frontend):**

- `api/auth/login.ts`: „Owner auth server config is incomplete“, „Username and password are required“, „Invalid username or password“.
- `api/auth/me.ts`: „Owner auth server config is incomplete“, „No active owner session“, „Insufficient role for this resource“.
- `api/auth/logout.ts` (falls verwendet): ggf. Fehlermeldungen.
- `api/_middleware.ts`: „Method not allowed“, „Owner auth server config is incomplete“, „No active owner session“, „Insufficient role for this resource“, „A valid CSRF token is required“.
- `api/_security.ts`: „Too many login attempts. Please retry later.“
- `api/_prelaunchGate.ts`: „Prelaunch access gate config is incomplete“, „Prelaunch access gate authorization is required“.
- `api/prelaunch-gate/login.ts`: „Prelaunch access gate config is incomplete“, „A valid CSRF token is required“, „Access key is required“, „Invalid access key“.
- `api/prelaunch-gate/me.ts`: „Prelaunch access gate config is incomplete“, „Prelaunch access gate authorization is required“.
- `api/profile/me.ts`: „Profile service is unavailable“ (+ Validierungsfehler von `validation.ts`).

---

## 3. Komponenten, die Text enthalten (Übersicht)

| Komponente | Ort | Art |
|------------|-----|-----|
| **MarketingShell** | MarketingBlocks.tsx | Header, Footer, Nav-Labels |
| **MarketingHero** | MarketingBlocks.tsx | Badge, Buttons (wenn nicht nur über Props) |
| **DesktopPreview** | MarketingBlocks.tsx | Alle Labels und Listen im Mock |
| **MarketingSection** | MarketingBlocks.tsx | Nur Props (eyebrow, title, description) |
| **BenefitGrid, FeatureCardGrid, WorkflowSteps, TrustGrid, FaqSection** | MarketingBlocks.tsx | Nur Daten aus Props |
| **MarketingCta** | MarketingBlocks.tsx | „Final CTA“, Buttons |
| **WebsiteLandingPage** | WebsiteLandingPage.tsx | Alle Daten-Arrays + Section-Props |
| **LoginPage** | LoginPage.tsx | Formular, Hinweise, Fehler |
| **SignupPage** | SignupPage.tsx | Überschrift, Hinweise, Button |
| **DashboardPage** | DashboardPage.tsx | Überschrift, Beschreibung, Buttons |
| **ProfilePage** | ProfilePage.tsx | Formular, Erfolg/Fehler |
| **SettingsPage** | SettingsPage.tsx | Überschrift, Beschreibung, Button |
| **ForbiddenPage** | ForbiddenPage.tsx | Überschrift, Text, Button |
| **AppPage** | AppPage.tsx | Überschrift, Beschreibung, Buttons |
| **InternalPage** | InternalPage.tsx | Überschrift, Text, Buttons |

**Hinweis:** `routeRenderer.tsx` rendert für `/internal` explizit `null`; `InternalPage` ist im Projekt vorhanden, wird aber von keiner Route aus gerendert (z. B. für spätere Nutzung). Für i18n dennoch erfassen, falls die Route später aktiviert wird.

---

## 4. Vorgeschlagene i18n-Architektur

### 4.1 Prinzip

- **Eine Quelle pro Sprache:** JSON-Dateien pro Namespace (z. B. `common`, `landing`, `auth`, `app`).
- **Kein Framework vorgeschrieben:** Da kein Next.js, bietet sich eine schlanke Lösung an (z. B. `react-i18next` + `i18next` oder eigenes kleines Modul mit Hooks).
- **Sprachwahl:** URL-basiert (z. B. `/de/…`, `/en/…) oder Subdomain/Query; Persistenz in `localStorage` optional.
- **SSR:** Nicht relevant (reine Vite-SPA).

### 4.2 Ordnerstruktur (Vorschlag mit vorhandener Struktur)

```
website/
  src/
    i18n/
      index.ts              # init, changeLanguage, useTranslation (oder Re-Export)
      locales/
        de/
          common.json       # Buttons, Nav, Footer, generische Begriffe
          landing.json      # Hero, Sections, FAQ, CTA, alle Landing-Texte
          auth.json         # Login, Signup, Fehler
          app.json          # Dashboard, Profile, Settings, Forbidden, App, Internal
        en/
          common.json
          landing.json
          auth.json
          app.json
```

Alternativ flach pro Sprache:

```
src/
  i18n/
    locales/
      de.json   # oder de/index.ts mit verschachtelten Objekten
      en.json
```

Empfehlung: **Namespace-Dateien** (`common`, `landing`, `auth`, `app`), um Seiten zuzuordnen und Bundling pro Route zu erleichtern.

### 4.3 Integration ins „Root Layout“

- Es gibt kein gemeinsames Layout für alle Routen. **Integration daher:**
  - **Einmalig:** In `App.tsx` oder `main.tsx` den i18n-Provider/Init aufrufen (Sprache aus URL/localStorage, Laden der passenden Namespaces).
  - **Pro Route-Gruppe:** Entweder in `AppRouter` / `routeRenderer` die benötigten Namespaces vor dem Rendern laden (falls lazy) oder zentral alle beim Start laden.
- **Meta/Title:** In einer kleinen Komponente oder in `App.tsx` nach Sprachwechsel und Route `document.title` und meta-Tags setzen (z. B. `document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'))`).

### 4.4 Routing und Sprache

- **Option A:** Pfadpräfix: `/de/`, `/en/`; dann `routeManifest` und `navigation.ts` so anpassen, dass der führende Segment „de“/“en“ abgezogen wird und die Route wie bisher entschieden wird.
- **Option B:** Kein Pfadpräfix; Sprache nur über UI (Dropdown) + `localStorage`; Meta/Title trotzdem per i18n.

Für saubere URLs und klare Trennung empfohlen: **Option A** mit Präfix; Fallback z. B. auf `de` wenn keine Sprache im Pfad.

---

## 5. Liste aller betroffenen Dateien

### 5.1 Frontend (Texte ersetzen / Keys nutzen)

| # | Datei | Priorität |
|---|--------|-----------|
| 1 | `website/index.html` | Hoch (Meta, lang) |
| 2 | `website/src/pages/WebsiteLandingPage.tsx` | Hoch |
| 3 | `website/src/components/MarketingBlocks.tsx` | Hoch |
| 4 | `website/src/pages/LoginPage.tsx` | Hoch |
| 5 | `website/src/pages/SignupPage.tsx` | Hoch |
| 6 | `website/src/pages/DashboardPage.tsx` | Mittel |
| 7 | `website/src/pages/ProfilePage.tsx` | Hoch |
| 8 | `website/src/pages/SettingsPage.tsx` | Mittel |
| 9 | `website/src/pages/ForbiddenPage.tsx` | Mittel |
| 10 | `website/src/pages/AppPage.tsx` | Mittel |
| 11 | `website/src/pages/InternalPage.tsx` | Niedrig (Route aktuell nicht genutzt) |
| 12 | `website/src/app/providers/AuthProvider.tsx` | Hoch (Fehlermeldungen) |
| 13 | `website/src/app/providers/ProfileProvider.tsx` | Hoch (Fehlermeldungen) |
| 14 | `website/src/modules/profile/profileService.ts` | Hoch (Fehlermeldungen) |
| 15 | `website/src/modules/profile/validation.ts` | Hoch (Validierungsmeldungen) |

### 5.2 API (optional für i18n; Backend gibt oft Codes, Frontend übersetzt)

Falls Backend-Texte 1:1 angezeigt werden, sollten sie durch strukturierte Codes ersetzt und im Frontend übersetzt werden. Dateien mit Nutzer-sichtbaren `message`-Strings:

- `website/api/auth/login.ts`
- `website/api/auth/me.ts`
- `website/api/_middleware.ts`
- `website/api/_security.ts`
- `website/api/_prelaunchGate.ts`
- `website/api/prelaunch-gate/login.ts`
- `website/api/prelaunch-gate/me.ts`
- `website/api/profile/me.ts`

---

## 6. Implementierungsplan

### Phase 1: i18n-Grundgerüst

1. **Paket:** `i18next`, `react-i18next` (oder vergleichbar) installieren; oder minimale Eigenlösung (Key → JSON-Lookup, Context für aktuelle Sprache).
2. **Ordner:** `src/i18n/` anlegen, `locales/de/` und `locales/en/` mit z. B. `common.json`, `landing.json`, `auth.json`, `app.json`.
3. **Init:** In `main.tsx` oder `App.tsx` i18n initialisieren (Standardsprache, Fallback), Provider um die App legen.
4. **Sprachwahl:** Helper für Sprache lesen/setzen (z. B. aus Pfad `/de`/`/en` oder aus `localStorage`); ggf. Routing anpassen (Pfadpräfix + Normalisierung in `routeManifest`/`navigation.ts`).

### Phase 2: Übersetzungsdateien anlegen

1. **common:** Header/Footer-Texte aus `MarketingBlocks.tsx`, generische Begriffe („Profile“, „Settings“, „Back“, „Save“, „Sign in“, „Protected access“, „GitHub repository“ usw.).
2. **landing:** Alle Texte aus `WebsiteLandingPage.tsx` (Arrays + Section-Props) und aus `MarketingBlocks.tsx` (Hero, DesktopPreview, Cta, Section-Labels).
3. **auth:** Alle Texte aus `LoginPage`, `SignupPage`, `AuthProvider` (Fehlermeldungen).
4. **app:** Alle Texte aus `DashboardPage`, `ProfilePage`, `SettingsPage`, `ForbiddenPage`, `AppPage`, `InternalPage` sowie aus `profileService.ts` und `validation.ts`.

Keys sinnvoll hierarchisch (z. B. `landing.hero.title`, `auth.login.error.invalid_credentials`).

### Phase 3: Komponenten umstellen

1. **Root:** In `App.tsx` (oder einer kleinen Layout-Komponente) Meta/Title aus i18n setzen; `index.html` nur noch Platzhalter oder Standardwerte.
2. **Marketing:** `MarketingBlocks.tsx` und `WebsiteLandingPage.tsx` auf `t('key')` umstellen; Daten-Arrays aus Übersetzungsdateien oder weiter als Props mit übersetzten Werten.
3. **Auth/App-Pages:** Login, Signup, Dashboard, Profile, Settings, Forbidden, App, Internal nacheinander auf Keys umstellen.
4. **Auth/Profile-Layer:** `AuthProvider` und `profileService`/`validation`: Fehlermeldungen entweder als Key zurückgeben und in der UI übersetzen oder in den Modulen über eine zentrale `t()`-Funktion (mit passendem Scope).

### Phase 4: API (optional)

- API-Antworten auf feste **error codes** umstellen (z. B. `AUTH_INVALID_CREDENTIALS`); Frontend mappt Codes auf `t('auth.errors.invalid_credentials')`. Dann können API-Texte auf Englisch bleiben oder entfallen.

### Phase 5: Test & Abnahme

- Sprachwechsel (DE/EN) durchklicken: Landing, Login, Signup, Dashboard, Profile, Settings, Forbidden.
- Meta-Tags und Title bei Sprachwechsel prüfen.
- Fehlerfälle (falsches Passwort, Validierungsfehler Profil) in beiden Sprachen prüfen.

---

## Kurzfassung

- **Struktur:** Vite + React, eigenes History-Routing, kein gemeinsames Layout; Marketing-Layout in `MarketingShell`.
- **Betroffene Dateien:** 15 Frontend-Dateien (inkl. Auth/Profile-Layer), 1 `index.html`, optional 8 API-Dateien.
- **i18n-Vorschlag:** Namespace-JSON pro Sprache unter `src/i18n/locales/{de,en}/`, Init in `App`/`main`, Meta/Title per JS; Routing optional mit Präfix `/de`/`/en`.
- **Reihenfolge:** Grundgerüst → Übersetzungsdateien (common, landing, auth, app) → Komponenten nacheinander umstellen → optional API auf Codes → Test.

Alle Angaben basieren ausschließlich auf dem vorhandenen Stand im Ordner `website/`.
