# i18n-Implementierungsplan (website/)

Konkreter Plan für die Umsetzung des Internationalisierungssystems mit **i18next** und **react-i18next**. Sprachen: **Deutsch (de)**, **Englisch (en)**. Formulierungen sind so gewählt, dass die Implementierung ohne Interpretation umsetzbar ist.

Basis: `website/docs/i18n-analysis.md`.

---

## 0. Abhängigkeiten

**Datei:** `website/package.json`

**Aktion:** In `dependencies` eintragen (keine Änderung an der Reihenfolge anderer Einträge):

```json
"i18next": "^23.16.0",
"react-i18next": "^14.0.5",
```

**Befehl (im Ordner `website/`):** `npm install i18next react-i18next`

**TypeScript:** In `website/tsconfig.json` muss `"resolveJsonModule": true` gesetzt sein (für JSON-Imports in `i18n/index.ts`). Falls nicht vorhanden, unter `compilerOptions` ergänzen.

---

## 1. Neue Ordnerstruktur

Unter `website/src/` folgende Verzeichnisse und Dateien anlegen (alle Pfade relativ zu `website/`):

```
src/
  i18n/
    index.ts
    constants.ts
    locales/
      de/
        common.json
        landing.json
        auth.json
        app.json
      en/
        common.json
        landing.json
        auth.json
        app.json
  components/
    LanguageSwitcher.tsx    (neu)
    DocumentHead.tsx        (neu)
```

Keine weiteren neuen Ordner. Bestehende Dateien bleiben an ihrem Ort.

---

## 2. Neue Dateien (Inhalt und Verantwortung)

### 2.1 `website/src/i18n/constants.ts`

**Zweck:** Zentrale Konstanten für Sprachen und Speicherung.

**Inhalt (exakt so):**

```ts
export const LOCALE_STORAGE_KEY = 'triggerhub_website_lang'

export const SUPPORTED_LOCALES = ['de', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'de'
```

---

### 2.2 `website/src/i18n/index.ts`

**Zweck:** i18next initialisieren, Sprache aus LocalStorage lesen/schreiben, Re-Export für Komponenten.

**Inhalt (exakt so; Vite-kompatibel mit JSON-Import):**

```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type SupportedLocale } from './constants'

import deCommon from './locales/de/common.json'
import deLanding from './locales/de/landing.json'
import deAuth from './locales/de/auth.json'
import deApp from './locales/de/app.json'
import enCommon from './locales/en/common.json'
import enLanding from './locales/en/landing.json'
import enAuth from './locales/en/auth.json'
import enApp from './locales/en/app.json'

const getStoredLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (raw === 'de' || raw === 'en') return raw
  return DEFAULT_LOCALE
}

export const getStoredLanguage = (): string => getStoredLocale()

export const setStoredLanguage = (lng: SupportedLocale): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCALE_STORAGE_KEY, lng)
}

const resources = {
  de: {
    common: deCommon,
    landing: deLanding,
    auth: deAuth,
    app: deApp,
  },
  en: {
    common: enCommon,
    landing: enLanding,
    auth: enAuth,
    app: enApp,
  },
}

i18n.use(initReactI18next).init({
  lng: getStoredLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  defaultNS: 'common',
  ns: ['common', 'landing', 'auth', 'app'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  resources,
})

export const changeLanguage = (lng: SupportedLocale): Promise<void> => {
  setStoredLanguage(lng)
  return i18n.changeLanguage(lng)
}

export { i18n }
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type SupportedLocale } from './constants'
```

---

### 2.3 `website/src/components/DocumentHead.tsx`

**Zweck:** Setzt `document.documentElement.lang`, `document.title` und die Meta-Tags `description`, `og:title`, `og:description`, `twitter:title`, `twitter:description` aus den Übersetzungen. Bei Sprachwechsel aktualisieren.

**Voraussetzung:** In `common.json` existieren die Keys `meta.title`, `meta.description`, `meta.ogTitle`, `meta.ogDescription` (siehe Abschnitt 4).

**Inhalt (exakt so):**

```tsx
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function DocumentHead() {
  const { i18n, t } = useTranslation('common')

  useEffect(() => {
    const lang = i18n.language
    if (document.documentElement) document.documentElement.lang = lang
    document.title = t('meta.title')
    const desc = t('meta.description')
    const ogTitle = t('meta.ogTitle')
    const ogDesc = t('meta.ogDescription')
    const metaDesc = document.querySelector('meta[name="description"]')
    const metaOgTitle = document.querySelector('meta[property="og:title"]')
    const metaOgDesc = document.querySelector('meta[property="og:description"]')
    const metaTwTitle = document.querySelector('meta[name="twitter:title"]')
    const metaTwDesc = document.querySelector('meta[name="twitter:description"]')
    if (metaDesc) metaDesc.setAttribute('content', desc)
    if (metaOgTitle) metaOgTitle.setAttribute('content', ogTitle)
    if (metaOgDesc) metaOgDesc.setAttribute('content', ogDesc)
    if (metaTwTitle) metaTwTitle.setAttribute('content', ogTitle)
    if (metaTwDesc) metaTwDesc.setAttribute('content', ogDesc)
  }, [i18n.language, t])

  return null
}
```

---

### 2.4 `website/src/components/LanguageSwitcher.tsx`

**Zweck:** Sprachumschalter für Header. Zeigt die aktuelle Sprache und erlaubt Wechsel zu der anderen. Speicherung über `changeLanguage` (schreibt in LocalStorage).

**Inhalt (exakt so):**

```tsx
import { useTranslation } from 'react-i18next'
import { changeLanguage, SUPPORTED_LOCALES, type SupportedLocale } from '../i18n'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const current = (i18n.language === 'en' ? 'en' : 'de') as SupportedLocale
  const other: SupportedLocale = current === 'de' ? 'en' : 'de'
  const label = current === 'de' ? 'DE' : 'EN'

  return (
    <div className="flex items-center gap-1 rounded-md border border-white/14 bg-white/5 px-2 py-1">
      <span className="text-xs text-slate-400">{label}</span>
      <button
        type="button"
        className="text-sm font-medium text-white hover:text-sky-200"
        onClick={() => changeLanguage(other)}
        aria-label={current === 'de' ? 'Switch to English' : 'Switch to German'}
      >
        {SUPPORTED_LOCALES.find((l) => l !== current) === 'en' ? 'EN' : 'DE'}
      </button>
    </div>
  )
}
```

**Einsatzort:** Siehe Abschnitt 3.2 (MarketingShell Header).

---

## 3. Struktur der Translation-Dateien (JSON)

Alle JSON-Dateien unter `website/src/i18n/locales/{de|en}/*.json`. Keys hierarchisch mit Punkten (z. B. `header.tagline`). Keine leeren Werte; jeder Key muss in `de` und `en` vorhanden sein.

### 3.1 Namespace: `common.json`

Verwendung: Header, Footer, generische Begriffe, Meta, Language-Switcher-Labels.

**Struktur (Keys; Werte siehe bestehende Texte in MarketingBlocks und index.html):**

```json
{
  "meta": {
    "title": "...",
    "description": "...",
    "ogTitle": "...",
    "ogDescription": "..."
  },
  "header": {
    "logo": "TRIGGERHUB",
    "tagline": "Desktop automation for creator workflows",
    "protectedAccess": "Protected access"
  },
  "nav": {
    "benefits": "Benefits",
    "features": "Features",
    "howItWorks": "How it works",
    "extensions": "Extensions",
    "faq": "FAQ"
  },
  "footer": {
    "logo": "TRIGGERHUB",
    "productDisclaimer": "Product information reflects the current desktop scope available in this repository and public release path.",
    "product": "Product",
    "links": "Links",
    "githubRepo": "GitHub repository",
    "protectedAccess": "Protected access"
  },
  "hero": {
    "badge": "Windows desktop software",
    "requestAccess": "Request access",
    "seeCapabilities": "See core capabilities"
  },
  "desktopPreview": {
    "workflowOverview": "Workflow overview",
    "automationFlow": "Automation flow",
    "liveStreamStartup": "Live stream startup",
    "localRuntime": "Local runtime",
    "trigger": "Trigger",
    "triggerDesc": "Detect a source event in your setup",
    "condition": "Condition",
    "conditionDesc": "Decide when the workflow should continue",
    "macro": "Macro",
    "macroDesc": "Group repeated steps into one reusable sequence",
    "action": "Action",
    "actionDesc": "Run the connected tool change locally",
    "connectedSurface": "Connected surface",
    "obsControl": "OBS control",
    "spotifyActions": "Spotify actions",
    "clipExport": "Clip export modules",
    "pluginRuntime": "Plugin-ready runtime",
    "whyItMatters": "Why it matters",
    "whyItMattersText": "Keep repetitive actions out of your live setup, reduce manual switching, and run workflows from one desktop control layer."
  },
  "cta": {
    "finalCta": "Final CTA",
    "requestProtectedAccess": "Request protected access",
    "viewRepository": "View repository"
  },
  "generic": {
    "profile": "Profile",
    "settings": "Settings",
    "back": "Back",
    "save": "Save",
    "signIn": "Sign in"
  }
}
```

Deutsche Datei `locales/de/common.json`: gleiche Keys, Werte auf Deutsch (z. B. `"nav.benefits": "Vorteile"`, `"meta.title": "TriggerHub – Automation für Creator- und Streaming-Workflows"`).

---

### 3.2 Namespace: `landing.json`

Verwendung: WebsiteLandingPage und MarketingSection-Props (eyebrow, title, description), Hero-Titel/Beschreibung, Benefits, Features, Workflow-Steps, Trust, Extensions, FAQ, CTA-Texte.

**Struktur (nur Key-Struktur; Inhalte aus WebsiteLandingPage.tsx und MarketingBlocks übernehmen):**

```json
{
  "hero": {
    "title": "...",
    "description": "...",
    "proofPoints": ["...", "...", "..."]
  },
  "sections": {
    "benefits": {
      "eyebrow": "Why it matters",
      "title": "...",
      "description": "..."
    },
    "features": { "eyebrow": "...", "title": "...", "description": "..." },
    "workflow": { "eyebrow": "...", "title": "...", "description": "..." },
    "extensions": { "eyebrow": "...", "title": "...", "description": "..." },
    "trust": { "eyebrow": "...", "title": "...", "description": "..." },
    "faq": { "eyebrow": "...", "title": "...", "description": "..." }
  },
  "benefits": {
    "items": [
      { "title": "...", "description": "..." },
      ...
    ]
  },
  "featureCards": {
    "items": [
      { "title": "...", "description": "...", "bullets": ["...", ...] },
      ...
    ]
  },
  "workflowSteps": {
    "items": [
      { "title": "...", "description": "..." },
      ...
    ]
  },
  "trustItems": {
    "items": [
      { "title": "...", "description": "..." },
      ...
    ]
  },
  "extensionCards": {
    "items": [
      { "title": "...", "description": "...", "bullets": ["...", ...] },
      ...
    ]
  },
  "faq": {
    "items": [
      { "question": "...", "answer": "..." },
      ...
    ]
  },
  "cta": {
    "title": "...",
    "description": "..."
  }
}
```

Die genauen Texte sind in `WebsiteLandingPage.tsx` und `MarketingBlocks.tsx` vorgegeben; 1:1 in die JSON-Werte übernehmen (de: deutsche Übersetzung, en: vorhandener englischer Text).

---

### 3.3 Namespace: `auth.json`

Verwendung: LoginPage, SignupPage, alle im UI angezeigten Auth-Fehlermeldungen (inkl. aus AuthProvider/Backend).

**Struktur:**

```json
{
  "login": {
    "title": "Owner Login",
    "accessModeNote": "Access mode is {{mode}}. Public registration is currently disabled.",
    "authUnavailable": "Owner authentication is fail-closed because runtime config is incomplete.",
    "username": "Username",
    "password": "Password",
    "signingIn": "Signing in...",
    "submit": "Sign in",
    "errorUnexpected": "Login failed unexpectedly"
  },
  "signup": {
    "title": "Account Registration",
    "notAvailable": "Public registration is not available in {{mode}} mode.",
    "restricted": "Access is currently restricted to the site owner.",
    "signInInstead": "Sign in instead"
  },
  "errors": {
    "invalid_credentials": "Invalid username or password",
    "logout_failed": "Logout failed",
    "validate_session_failed": "Failed to validate owner session",
    "refresh_not_implemented": "Session refresh is not implemented in prelaunch auth mode",
    "no_session_snapshot": "Backend login response did not include a session snapshot",
    "auth_unavailable": "Owner authentication is unavailable"
  }
}
```

In den Seiten: bei bekannten Backend-Meldungen den passenden Key aus `errors` verwenden (z. B. `t('auth:errors.invalid_credentials')`), sonst die vom Backend gelieferte Nachricht anzeigen.

---

### 3.4 Namespace: `app.json`

Verwendung: Dashboard, Profile, Settings, Forbidden, App, Internal; alle Fehler von ProfileProvider, profileService, validation.

**Struktur (Auszug):**

```json
{
  "dashboard": {
    "title": "Dashboard",
    "description": "Protected dashboard route prepared for future user accounts."
  },
  "profile": {
    "title": "Profile",
    "identityNote": "Identity is managed separately from auth/session. Current role: {{role}}",
    "loading": "Loading profile...",
    "displayName": "Display name",
    "avatarUrl": "Avatar URL",
    "avatarPlaceholder": "https://...",
    "bio": "Bio",
    "save": "Save profile",
    "back": "Back",
    "saved": "Profile saved",
    "updateFailed": "Failed to update profile"
  },
  "settings": {
    "title": "Settings",
    "description": "Protected settings route for account and application preferences.",
    "backToDashboard": "Back to Dashboard"
  },
  "forbidden": {
    "title": "Access denied",
    "description": "Your current account is not allowed to access this page.",
    "backToLogin": "Back to login"
  },
  "appPage": {
    "title": "App",
    "description": "Protected application shell. This route remains protected in all modes.",
    "openDashboard": "Open Dashboard",
    "settings": "Settings"
  },
  "internal": {
    "title": "Internal Owner Area",
    "loggedInAs": "Logged in as {{userId}} with role {{role}}.",
    "openDashboard": "Open Dashboard",
    "openProfile": "Open Profile",
    "logout": "Logout"
  },
  "errors": {
    "profile_load_failed": "Failed to load profile",
    "profile_update_identity": "Cannot update profile without authenticated identity",
    "profile_no_session": "No authenticated profile session",
    "profile_load_failed_fallback": "Failed to load profile",
    "profile_no_payload": "Profile response did not include a profile payload",
    "profile_input_invalid": "Profile input is invalid",
    "profile_update_failed": "Failed to update profile",
    "profile_user_mismatch": "Updated profile does not match the authenticated user",
    "validation_avatar_length": "avatar_url exceeds maximum length",
    "validation_avatar_http": "avatar_url must use http or https",
    "validation_avatar_url": "avatar_url must be a valid absolute URL",
    "validation_display_name_required": "display_name is required",
    "validation_display_name_length": "display_name exceeds maximum length",
    "validation_bio_length": "bio exceeds maximum length"
  }
}
```

In den Seiten und in ProfileProvider: bei bekannten Fehlermeldungen den passenden Key aus `app.errors` verwenden; wo die Meldung aus einem Service kommt, im UI eine Zuordnung von `error.message` zu diesem Key vornehmen (oder später die Services Error-Codes liefern und im UI mappen).

---

## 4. Integration in die Root-Komponente

### 4.1 `website/src/main.tsx`

**Aktion:** Vor dem Import von `App` und vor `createRoot` den i18n-Init importieren, damit die Sprache (inkl. aus LocalStorage) vor dem ersten Render gesetzt ist.

**Änderung:** Erste Zeile nach den bestehenden Imports einfügen:

```ts
import './i18n'
```

**Konkret:** Die Datei beginnt mit:

```ts
import './i18n'
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

---

### 4.2 `website/src/App.tsx`

**Aktion:** Die Komponente `DocumentHead` einbinden, damit Title und Meta bei Sprachwechsel aktualisiert werden. Kein zusätzlicher Provider nötig (react-i18next nutzt die globale i18n-Instanz).

**Änderung:** Import hinzufügen und `DocumentHead` als erstes Kind innerhalb des bestehenden Baums rendern.

**Vorher:**

```tsx
import { AuthProvider } from './app/providers/AuthProvider'
import { ProfileProvider } from './app/providers/ProfileProvider'
import { AppRouter } from './app/routing/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <AppRouter />
      </ProfileProvider>
    </AuthProvider>
  )
}
```

**Nachher:**

```tsx
import { AuthProvider } from './app/providers/AuthProvider'
import { ProfileProvider } from './app/providers/ProfileProvider'
import { AppRouter } from './app/routing/AppRouter'
import { DocumentHead } from './components/DocumentHead'

export default function App() {
  return (
    <>
      <DocumentHead />
      <AuthProvider>
        <ProfileProvider>
          <AppRouter />
        </ProfileProvider>
      </AuthProvider>
    </>
  )
}
```

---

## 5. Language Switcher im Header

**Datei:** `website/src/components/MarketingBlocks.tsx`

**Stelle:** Im Header, im gleichen `<div>` wie der Button „Protected access“ (Zeile mit `className="flex items-center gap-3"`). Vor dem Button „Protected access“ das Language-Switcher-Element einfügen.

**Aktion:**

1. Am Dateianfang (nach den bestehenden Imports) hinzufügen:
   ```ts
   import { useTranslation } from 'react-i18next'
   import { LanguageSwitcher } from './LanguageSwitcher'
   ```
2. Die Komponente `MarketingShell` von einer reinen Funktion zu einer Komponente machen, die `useTranslation` nutzt (weil die Nav-Labels aus Übersetzungen kommen).
3. Die Konstante `sectionLinks` durch ein Array ersetzen, dessen `label` per `t('common:nav.benefits')` usw. kommt. Dazu `MarketingShell` so anpassen, dass sie `const { t } = useTranslation('common')` verwendet und z. B. `sectionLinks` als `[{ id: 'benefits', labelKey: 'nav.benefits' }, ...]` definiert; beim Rendern `t(\`common:${item.labelKey}\`)` verwenden (oder die Keys direkt in der Reihenfolge benefits, features, workflow, extensions, faq mit den Keys aus 3.1).
4. Im Header-`<div className="flex items-center gap-3">`: zuerst `<LanguageSwitcher />`, dann den bestehenden Button „Protected access“ (dessen Text durch `t('common:header.protectedAccess')` ersetzt wird).
5. Logo-Text: `t('common:header.logo')`, Tagline: `t('common:header.tagline')`.
6. Footer: alle sichtbaren Texte (TRIGGERHUB, Product, Links, GitHub repository, Protected access, Section-Links) durch Aufrufe von `t('common:...')` ersetzen, mit den Keys aus Abschnitt 3.1.
7. Hero-Bereich (MarketingHero): Badge, Buttons „Request access“ / „See core capabilities“ aus `common` (hero.badge, hero.requestAccess, hero.seeCapabilities).
8. DesktopPreview: alle Strings aus `common.desktopPreview.*`.
9. MarketingCta: „Final CTA“, „Request protected access“, „View repository“ aus `common.cta.*`.

Da `MarketingShell` und die darin verwendeten Blöcke dann `useTranslation` brauchen, müssen alle diese Teile in Komponenten sein, die den Hook aufrufen (MarketingShell selbst, MarketingHero, DesktopPreview, MarketingCta). Konkret: In `MarketingShell` einmal `useTranslation('common')` und die sectionLinks als Liste von Keys; in `MarketingHero` und `MarketingCta` jeweils `useTranslation('common')` und Ersetzen der festen Texte durch `t('common:...')`; DesktopPreview entweder als Teil von MarketingHero mit `t` oder eigene Komponente mit `useTranslation('common')`.

---

## 6. Speicherung der Sprache im Browser

- **Wo:** `localStorage` (Browser).
- **Key:** `triggerhub_website_lang` (Konstante `LOCALE_STORAGE_KEY` in `website/src/i18n/constants.ts`).
- **Erlaubte Werte:** `"de"` | `"en"`.
- **Wann lesen:** Beim Start der App in `website/src/i18n/index.ts` vor `i18n.init()`: aktuelle Sprache mit `getStoredLocale()` ermitteln und als `lng` an `i18n.init({ lng: getStoredLocale(), ... })` übergeben.
- **Wann schreiben:** Bei jedem Sprachwechsel über den Language Switcher: in `changeLanguage(lng)` zuerst `setStoredLanguage(lng)` aufrufen (schreibt `localStorage.setItem(LOCALE_STORAGE_KEY, lng)`), danach `i18n.changeLanguage(lng)`.
- **Fallback:** Wenn kein Eintrag vorhanden oder Wert weder `de` noch `en`, dann `DEFAULT_LOCALE` (`'de'`) verwenden.

---

## 7. Änderungen an bestehenden Komponenten (Kurzreferenz)

| Datei | Änderung |
|-------|----------|
| `website/package.json` | Dependencies `i18next`, `react-i18next` hinzufügen. |
| `website/src/main.tsx` | Ganz oben `import './i18n'` einfügen. |
| `website/src/App.tsx` | `DocumentHead` importieren und als erstes Kind rendern. |
| `website/src/components/MarketingBlocks.tsx` | `useTranslation('common')`, `LanguageSwitcher` im Header einbauen; alle festen Texte in Header, Footer, Hero, DesktopPreview, MarketingCta durch `t('common:...')` ersetzen; sectionLinks-Labels aus common.nav.*. |
| `website/src/pages/WebsiteLandingPage.tsx` | `useTranslation('landing')`; alle Section-Texte und Daten-Arrays (heroProofPoints, benefits, featureCards, …) aus `landing.json` beziehen (entweder Keys durchiterieren oder Struktur aus JSON laden und als Props übergeben). |
| `website/src/pages/LoginPage.tsx` | `useTranslation('auth')`; alle sichtbaren Texte durch `t('auth:login.*')`; bei Fehleranzeige bekannte Backend-Meldungen auf `t('auth:errors.*')` mappen. |
| `website/src/pages/SignupPage.tsx` | `useTranslation('auth')`; Texte durch `t('auth:signup.*')`. |
| `website/src/pages/DashboardPage.tsx` | `useTranslation('app')`; Texte durch `t('app:dashboard.*')`, Buttons `t('app:generic.profile')` / `t('app:generic.settings')` oder aus app.json. |
| `website/src/pages/ProfilePage.tsx` | `useTranslation('app')`; alle Labels, Platzhalter, Erfolg/Fehler aus `app.profile` bzw. `app.errors`; bei angezeigten Fehlern von validation/profileService Key-Zuordnung verwenden. |
| `website/src/pages/SettingsPage.tsx` | `useTranslation('app')`; Texte aus `app.settings`. |
| `website/src/pages/ForbiddenPage.tsx` | `useTranslation('app')`; Texte aus `app.forbidden`. |
| `website/src/pages/AppPage.tsx` | `useTranslation('app')`; Texte aus `app.appPage`. |
| `website/src/pages/InternalPage.tsx` | `useTranslation('app')`; Texte aus `app.internal` (Interpolation für userId/role). |
| `website/index.html` | Optional: `<title>` und `meta description` auf Platzhalter setzen; `lang` kann leer oder `de` bleiben – `DocumentHead` setzt `lang` und Meta zur Laufzeit. |

AuthProvider, ProfileProvider, profileService, validation: **Nicht** ändern (weiterhin englische oder bestehende Meldungen werfen). Die **Seiten**, die Fehler anzeigen (LoginPage, ProfilePage, ProfileProvider-Nutzung), mappen die empfangene `error.message` auf einen Key in `auth.json` bzw. `app.json` und rufen `t('auth:errors.xyz')` bzw. `t('app:errors.xyz')` auf, wo die Zuordnung eindeutig ist.

---

## 8. Reihenfolge der Umsetzung (für Codex)

1. Abhängigkeiten in `website/package.json` eintragen und `npm install` ausführen.
2. `website/src/i18n/constants.ts` anlegen.
3. Alle 8 JSON-Dateien unter `website/src/i18n/locales/de/` und `website/src/i18n/locales/en/` anlegen (Inhalte aus Analyse und bestehenden Komponenten übernehmen).
4. `website/src/i18n/index.ts` anlegen (Vite-kompatible Version mit direkten JSON-Imports).
5. `website/src/components/DocumentHead.tsx` und `website/src/components/LanguageSwitcher.tsx` anlegen.
6. `website/src/main.tsx` um `import './i18n'` ergänzen.
7. `website/src/App.tsx` um `DocumentHead` erweitern.
8. `website/src/components/MarketingBlocks.tsx` anpassen (Language Switcher, alle Texte auf common).
9. `website/src/pages/WebsiteLandingPage.tsx` auf landing umstellen.
10. Auth- und App-Seiten nacheinander auf auth/app umstellen (Login, Signup, Dashboard, Profile, Settings, Forbidden, App, Internal).
11. Optional: `website/index.html` Title/Meta auf Platzhalter setzen.

Damit ist die Implementierung ohne weitere Interpretation umsetzbar.
