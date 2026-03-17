# CODEX_WORKING_CONTEXT.md
# TriggerHub 2.0 — Konsolidierter Projektkontext für Codex

**Erstellt:** 2026-03-16
**Aktualisiert:** 2026-03-17 (vollständige Revalidierung des gesamten Workspaces)
**Quellen:** Vollständige Codeanalyse aller geänderten Dateien (src/, electron/, website/)
**Zweck:** Arbeitsgrundlage für nachfolgende Codex-Agenten. Kein Chat-Kontext erforderlich.

---

## 1. PROJEKTÜBERBLICK

**Produkt:** TriggerHub 2.0 — Windows-Desktop-Automatisierungstool für Content-Creator (Streamer)
**Kernidee:** Nutzer verbinden OBS, Spotify, Twitch und Clip-Recording in einer Oberfläche und definieren Trigger/Makro-Regeln (z.B. „Wenn OBS verbindet → wechsle zur Hauptszene").

**Zwei getrennte Arbeitsflächen im selben Repository:**

| Bereich | Pfad | Stack | Deployment |
|---|---|---|---|
| Desktop-App | `src/`, `electron/` | Electron 36, React 18, TypeScript, Vite, Vitest | Windows-Installer via electron-builder |
| Website | `website/` | React 18, Tailwind v4, Vite, i18next (de/en), Vercel | Vercel SPA |

**Version:** 0.1.1
**Branch:** release/v0.1.1-prep
**Teststatus:** 28+ Testdateien — Snapshot nicht erneut verifiziert seit letzten Änderungen. Vor Architekturarbeiten `npm test` ausführen.

---

## 2. KONSOLIDIERTER IST-ZUSTAND

### 2.1 Desktop-App — Architektur (verifiziert 2026-03-17)

```
electron/main.cjs         → Electron Main Process (CJS)
  IPC: storage:load/save, clip-exporter:export, window:command

src/core/
  trigger-engine/         → TriggerEngine, TriggerGraph, TriggerExecutor, TriggerConditions
  macro-system/           → MacroEngine, MacroRunner (rekursiv, depth-guard)
  event-bus/              → InMemoryEventBus
  app-control/            → AppController, HotkeyManager (window.keydown), WindowManager (IPC)

src/services/
  obs-service/            → ObsService + InMemoryObsTransport | ObsHttpTransport
  spotify-service/        → SpotifyService + InMemorySpotifyTransport | SpotifyHttpTransport
  twitch-service/         → TwitchService + InMemoryTwitchTransport | TwitchApiTransport
  clip-service/           → ClipService + InMemoryClipExporter | NodeClipExporter
  shared/                 → HttpClient, OperationPolicy (retry/reliability)

src/app/
  bootstrap.ts            → Dependency-Komposition (Root Container, RuntimeContainer)
  facade.ts               → TriggerHubAppFacade (einzige UI-Grenze)
  actionDispatcher.ts     → Trigger-Action → Service routing + Macro-Step-Execution
  serviceActivation.ts    → activateRuntime / deactivateRuntime (mit Partial-Failure)
  storageBridge.ts        → loadOrSeedCoreData / persistCoreData / loadRuntimeConfig
                           / loadDesktopPreferences / persistDesktopPreferences
  storageValidation.ts    → Zod-basierte Payload-Validierung beim Laden
  runtimeConfig.ts        → RuntimeConfig, DEFAULT_TWITCH_CONFIG

src/storage/
  ipcStorageBridge.ts     → Electron IPC → StoragePort (Produktion)
  inMemoryStorage.ts      → StoragePort (Tests)

src/plugins/              → PluginRegistry + Example Plugin
src/runtime/              → RuntimeMonitor, Metrics, RuntimeErrorBoundary
src/ui/                   → Pages, Components, Layout, Styles, Navigation
```

### 2.2 Service-Transport-Status — aktuell

| Service | Default-Transport | Alt. Transport | bootstrap.ts-Wiring | Prod-ready? |
|---|---|---|---|---|
| OBS | `InMemoryObsTransport` | `ObsHttpTransport` | Nicht verkabelt | **Nein** |
| Spotify | `InMemorySpotifyTransport` | `SpotifyHttpTransport` | Nicht verkabelt | **Nein** — `connect()` ist No-Op |
| Twitch | `InMemoryTwitchTransport` | `TwitchApiTransport` (Helix) | **Verkabelt** — wählt HTTP wenn clientId+accessToken vorhanden | **Teilweise** |
| Clip | `InMemoryClipExporter` | `NodeClipExporter` (IPC) | Nicht verkabelt | **Nein** — `buildClipBuffer` Dummy |

**Twitch-Transport-Logik in bootstrap.ts (verifiziert):**
```typescript
const useHttpTwitch = Boolean(trimmedClientId && trimmedAccessToken)
const twitchService = createTwitchService({
  transport: useHttpTwitch ? 'http' : undefined,
  http: useHttpTwitch ? { baseUrl: ..., headers: { Authorization, 'Client-ID' } } : undefined,
})
```
Twitch ist der einzige Service mit konditioneller Transport-Auswahl. Credentials werden in `RuntimeConfig.twitch` gespeichert (via Settings-UI).

### 2.3 MacroEngine Circular-Dependency — GELÖST (verifiziert)

Das frühere Two-Phase-Init (`setMacroEngine()`) ist entfernt. Die Lösung in `bootstrap.ts`:
```typescript
let executeMacroStep!: ReturnType<typeof createActionDispatcher>['executeMacroStep']
const macroEngine = new MacroEngine((step, ctx) => executeMacroStep(step, ctx), eventBus)
const { executor, executeMacroStep: actionDispatcherExecuteMacroStep } = createActionDispatcher({...}, macroEngine)
executeMacroStep = actionDispatcherExecuteMacroStep
```
**Beurteilung:** Funktionsfähig durch JS-Closure. `macroEngine` hält eine Closure-Referenz auf `executeMacroStep`, die zur MacroEngine-Erstellungszeit noch `undefined!` ist — aber erst bei Runtime aufgerufen wird (nach der Zuweisung). Kein Crash-Risiko unter normalem Betrieb. Technisch korrekt, aber für Neulese schwer verständlich.

**`actionDispatcher.ts`-Signature (aktuell):**
```typescript
export const createActionDispatcher = (deps: ActionDispatcherDeps, macroEngine: MacroEngine) => { ... }
```

### 2.4 Desktop UI — Screens und Komponenten (verifiziert 2026-03-17)

**Screens (alle in Navigation):**
- `Dashboard.tsx` — TriggerCard-Grid + StatusBar (4 Services) + Runtime-Log im RightPanel ✓
- `TriggerEditor.tsx` — TriggerForm + Trigger-Liste; RightPanel zeigt Trigger-Details wenn Trigger editiert ✓
- `MacroEditor.tsx` — MacroForm + Macro-Liste; RightPanel zeigt Macro-Details wenn Macro editiert ✓
- `Plugins.tsx` — Installed Plugins (read-only Liste)
- `Settings.tsx` — Runtime Controls + Connected Services + Twitch Config (clientId/accessToken)

**Tote Dateien — gelöscht:**
- `src/ui/pages/Editor.tsx` ✓
- `src/ui/components/Modal.tsx` ✓
- `src/ui/components/DeckButton.tsx` ✓

**Layout-System:**
- `MainLayout`: Sidebar(240px) + Header(72px) + Main(1fr) + RightPanel(320px)
- CSS-Klassen in `dashboard.css`, Design-Tokens in `tokens.css`
- Responsive Breakpoint bei 1100px (RightPanel collapsed)
- Sidebar-Navigation: Icon + Label; Beschreibungstext nur als `title`-Attribut (nicht sichtbar)

### 2.5 Design-System Status (verifiziert)

```
tokens.css definiert:
  ✓ Backgrounds (3 Ebenen: shell / main / panel)
  ✓ Borders (2 Stärken: subtle 4% / weak 10%)
  ✓ Text (3 Ebenen: primary / secondary / muted)
  ✓ Accent: #0EA5E9 (Sky Blue)
  ✓ Accent-Subtokens: --th-accent-subtle / --th-accent-border
  ✓ Semantic: --th-success / --th-warning / --th-danger
  ✓ Radius: md(10px) / lg(16px)

  ✗ Keine Typografie-Tokens (fontSize hardcoded: 11/12/13/14/18px)
  ✗ Keine Spacing-Tokens
  ✗ Keine dedizierten Hover-/Focus-/Pressed-Tokens für Buttons
```

**Button.tsx (aktuell):** Variant-System `default | primary | danger` implementiert, inline-styles mit Token-Referenzen. `ghost`-Variant fehlt.

**⚠️ NEU GEFUNDEN — Settings.tsx Tailwind-Klassen:**
In `Settings.tsx` werden im Twitch-API-Panel (Zeilen 96–109) hardcodierte Tailwind-Klassen genutzt
(`className="text-xs text-slate-400"`, `className="w-full rounded-md border border-border bg-input-background ..."`)
— inkonsistent mit dem Token-basierten Inline-Style-Pattern der gesamten restlichen Desktop-UI.

### 2.6 App.tsx — State-Management (verifiziert)

**Granularer Refresh — implementiert:**
- `refreshDashboard()` / `refreshEditor()` / `refreshPlugins()` / `refreshSettings()` als separate Funktionen
- `refreshActiveViewState(viewId)` → nur den View-relevanten Getter bei Navigation
- EventBus-Handler (TRIGGER_EXECUTED, MACRO_COMPLETED) → rufen nur `refreshDashboard()`

**⚠️ VERBLEIBENDER ISSUE:** `runFacadeAction()` (für CRUD-Operationen) ruft intern `refreshApplicationState()` auf — das alle 4 Getter neu lädt. Für Create/Update/Delete-Aktionen ist das overdone; bei einer z.B. Trigger-Creation genügte `refreshEditor()` + `refreshDashboard()`.

**✔️ GELÖST — `live`-Badge spiegelt den echten Service-Status:**
In `toDashboardViewModel()` (App.tsx Zeile 15) wird `live` jetzt vom tatsächlichen Service-Status abgeleitet:
```typescript
function toDashboardViewModel(state: DashboardState): DashboardViewModel {
  return {
    live: state.connectedServices.obs || state.connectedServices.spotify,
    ...
```
Die Header-Badge zeigt damit zuverlässig an, wenn entweder OBS oder Spotify verbunden ist, und die weiter unten verwendete `live`-Berechnung bleibt konsistent für die anderen Seiten.

**Runtime Log:** Letzte 5 Entries in RightPanel des Dashboards (TRIGGER_EXECUTED, MACRO_COMPLETED Events). ✓

### 2.7 Website Status (verifiziert 2026-03-17)

**Neu seit letztem Kontext:**
- **i18n-System:** `i18next` + `react-i18next` integriert; Sprachen: `de` und `en`; Locale-Dateien in `website/src/i18n/locales/{de,en}/common.json`
- **LanguageSwitcher-Komponente:** vorhanden (`website/src/components/LanguageSwitcher.tsx`)
- **WebsiteLandingPage.tsx:** Vollständig i18n-isiert über `useTranslation()`-Hook; alle Text-Inhalte aus Locale-Keys
- **DocumentHead-Komponente:** vorhanden (`website/src/components/DocumentHead.tsx`)
- **Mobile-Navigation:** Hamburger-Menu implementiert ✓ (AP-15 erledigt)
- **LoginPage:** Nutzersprache bereinigt ✓ (AP-14 erledigt)

**Offene Website-Issues:**
- Marketing-Copy inhaltlich noch verbesserungsfähig (i18n-Texte sind die Inhalte, die jetzt im JSON liegen)
- i18n-Implementation-Plan liegt in `website/docs/i18n-implementation-plan.md` (vom IDE geöffnet)

### 2.8 Testabdeckung (verifiziert)

28+ Testdateien in `src/tests/`:
```
action-dispatcher.test.ts     ← AP-11 (Dispatcher-Refactor)
app-container.test.ts
app-context.test.tsx           ← NEU
app-facade.test.ts
app-refresh.test.tsx           ← NEU (AP-12 granularer Refresh)
core-macro.test.ts
core-trigger.test.ts
electron-window-control.test.ts
event-bus.test.ts
ipc-storage-bridge.e2e.test.ts
plugins.test.ts
runtime-hardening.test.ts
service-activation.test.ts     ← AP-13 (Partial-Failure)
services.test.ts
storage.test.ts
trigger-executor.test.ts
trigger-graph.test.ts
ui-dashboard.test.tsx
ui-editor-crud.test.tsx        ← NEU
ui-error-boundary.test.tsx     ← NEU
ui-navigation.test.tsx
website-auth-v1.test.ts
website-browser-guards.test.ts ← NEU
website-owner-only-access.test.ts ← NEU
website-prelaunch-gate.test.ts ← NEU
website-profile-v1.test.ts
```

### 2.9 Root-Ordner Hygiene

**Immer noch vorhanden (nicht bereinigt):**
- `cleanup-plan.json` (AI-Planungsartefakt)
- `PROJECT_AGENT_SYSTEM_SNAPSHOT.md`
- `PROJECT_CLEANUP_REPORT.md`, `change-log.md`, `architecture-decisions.md`, `migration-plan.md`, `project-analysis.md`, `dependency_report.txt`

---

## 3. KRITISCHE PROBLEME UND BLOCKER (aktuell validiert)

### Priorität KRITISCH

| ID | Problem | Datei(en) | Typ | Status |
|---|---|---|---|---|
| C-01 | `live: false` hardcoded in `toDashboardViewModel()` — Header-Badge zeigt permanent "Offline" | `App.tsx` Zeile 15 | Regression-Bug | **Erledigt (2026-03-17)** |
| C-02 | OBS/Spotify/Clip nutzen InMemory-Transport in Produktion (keine echte Verbindung möglich) | `bootstrap.ts` | Fehlende Wiring | Offen |
| C-03 | `SpotifyService.connect()` ist No-Op (auch mit HTTP-Transport) — kein OAuth | `spotifyActions.ts` | Fehlende Implementierung | Offen |
| C-04 | `buildClipBuffer()` erzeugt Dummy-Daten — kein echtes Capture | `clipProcessor.ts` | Fehlende Implementierung | Offen |
| C-05 | TriggerCard-Klick feuert `executeTrigger()` sofort ohne Confirm | `TriggerCard.tsx`, `App.tsx` | UX-Bug | Offen |
| C-06 | TriggerForm: Conditions und Actions als raw JSON-Textarea | `TriggerForm.tsx` | UX-Blocker | Offen (ID/Event verbessert) |

**Hinweis:** Der Dashboard-Header verwendet nun den echten Service-Status (`obs || spotify`), daher trägt dieser Blocker den **Erledigt**-Status.

### Priorität HOCH

| ID | Problem | Datei(en) | Typ | Status |
|---|---|---|---|---|
| H-01 | MacroEngine Circular-Dep via `!`-Forward-Reference — funktioniert, aber fragil für Refactors | `bootstrap.ts` | Architektur-Schuld | Funktionsfähig, Tech Debt |
| H-02 | Settings.tsx: Tailwind-Klassen im Twitch-API-Panel — inkonsistent mit Token-System | `Settings.tsx` Zeilen 96–109 | Design-System | **NEU GEFUNDEN** |
| H-03 | `runFacadeAction()` ruft `refreshApplicationState()` (alle 4 Getter) bei CRUD-Actions | `App.tsx` | Performance | Bekannt, offen |
| H-04 | MacroStepEditor: Step-Config als JSON-Textarea (obwohl Typ-Dropdown vorhanden) | `MacroStepEditor.tsx` | UX | Teilweise behoben |

### Priorität MITTEL

| ID | Problem | Datei(en) | Typ |
|---|---|---|---|
| M-01 | HotkeyManager nutzt window.keydown — keine globalen Hotkeys (App im Hintergrund) | `hotkeyManager.ts` | Feature-Lücke |
| M-02 | Twitch nutzt 60s-Polling statt EventSub/WebSocket | `twitchActions.ts` | Performance |
| M-03 | `live`-Semantik unklar — was bedeutet "live" in Header? (OBS? Twitch Stream? Irgendein Service?) | `App.tsx`, `Header.tsx` | UX/Semantik |
| M-04 | Root-Artefakte (AI-Planungsdateien) im Repository-Root | Root | Hygiene |
| M-05 | Kein Confirm-Dialog bei Delete-Operationen in Trigger/MacroEditor | `TriggerEditor.tsx`, `MacroEditor.tsx` | UX |
| M-06 | i18n-Texte (de/en) für Website müssen content-seitig reviewed werden | `website/src/i18n/locales/` | Content |
| M-07 | Sidebar-Icons als lokale SVG-Komponenten (nicht lucide-react) — `lucide-react` nicht in Root installiert | `navigation.tsx` | Tech Debt |

---

## 4. RISIKEN

| Risiko | W'keit | Impact | Mitigation |
|---|---|---|---|
| `live: false` Hardcode → Header zeigte fälschlich "Offline" | Hoch | Mittel | **Behoben (2026-03-17)** — `toDashboardViewModel` nutzt `state.connectedServices.obs \|\| state.connectedServices.spotify`. |
| OBS HTTP-Transport erfordert Middleware (kein nativer WS-v5-Client) | Hoch | Hoch | OBS-WebSocket-Library (`obs-websocket-js`) direkt einbinden |
| Spotify OAuth in Electron ist komplex (Redirect-URI, Token-Storage) | Hoch | Hoch | PKCE-Flow für Desktop, Token im userData-Pfad speichern |
| Twitch TwitchApiTransport: Auth-Credentials werden als Plaintext in Storage abgelegt | Mittel | Hoch | Electron `safeStorage` für sensitive Werte nutzen |
| `!`-Forward-Reference in bootstrap.ts: Aufruf von `executeMacroStep` vor Zuweisung wäre undefined | Niedrig | Kritisch | MacroEngine ruft Callback nur bei Runtime auf — nach Zuweisung. Kein direktes Risiko. |
| Settings.tsx Tailwind-Klassen: wenn Tailwind-Purge greift, verschwinden diese Styles in Production | Mittel | Niedrig | Auf Token-basierte Inline-Styles umstellen |
| Service-Partial-Failure: UI zeigt keine spezifische Meldung welche Services failed | Mittel | Mittel | `failedServices[]` in Facade/SettingsState sichtbar machen |
| Teststand nicht verifiziert nach lokalen Änderungen | Mittel | Mittel | `npm test` vor weiteren Architekturarbeiten ausführen |

---

## 5. ROADMAP NACH PHASEN

### Phase 0 — Stabilisierung (erledigt / fast erledigt)

| # | Task | Status |
|---|---|---|
| 1 | Tote UI-Dateien löschen (`Editor.tsx`, `Modal.tsx`, `DeckButton.tsx`) | ✓ Erledigt |
| 2 | `Button.tsx` — Token-basierte Styles + `variant`-Prop | ✓ Erledigt |
| 3 | Teal-Hardcodes durch Token ersetzen | ✓ Erledigt |
| 4 | `tokens.css` — fehlende Tokens ergänzt | ✓ Erledigt |
| 5 | Error-Toast — Dismiss-Button + 5s Auto-Close | ✓ Erledigt |
| 6 | Success-Feedback nach CRUD | ✓ Erledigt |
| 7 | StatusBar auf 4 Services erweitert | ✓ Erledigt |
| 8 | `void this.runtimeConfig` Dead Code entfernt | ✓ Erledigt |
| 9 | Root: `undefined`-Datei gelöscht, `website/package.json` Name korrigiert | ✓ Erledigt |
| 10 | **`live: false` Hardcode in `toDashboardViewModel()` fixen** | ✓ **Erledigt (2026-03-17)** |
| 11 | Settings.tsx Tailwind-Klassen → Token-basierte Inline-Styles | ✗ **Offen (H-02)** |

### Phase 1 — Architekturverbesserung (kurzfristig)

| # | Task | Status |
|---|---|---|
| 1 | MacroEngine Circular-Dep via `createActionDispatcher(deps, macroEngine)` | ✓ Erledigt |
| 2 | Sidebar-Icons implementiert (lokal, nicht lucide-react) | ✓ Erledigt (mit Abweichung) |
| 3 | TriggerForm: Auto-ID + Event-Topic-Picker | ✓ Erledigt |
| 4 | MacroForm + MacroStepEditor: Auto-IDs + Typ-Dropdown | ✓ Erledigt |
| 5 | serviceActivation.ts: Partial-Failure Handling | ✓ Erledigt |
| 6 | App.tsx: Granularer State-Refresh bei Navigation | ✓ Erledigt |
| 7 | Dashboard RightPanel: Runtime-Log (letzten 5 Einträge) | ✓ Erledigt |
| 8 | TriggerEditor/MacroEditor RightPanel: Detail des gewählten Eintrags | ✓ Erledigt |
| 9 | `runFacadeAction()`: CRUD-Actions granularer refreshen (nicht alle 4 Getter) | ✗ Offen (H-03) |
| 10 | TriggerCard-Confirm vor executeTrigger (C-05) | ✗ Offen |
| 11 | MacroStepEditor: Strukturierte Step-Config-Forms statt JSON-Textarea | ✗ Offen (H-04) |
| 12 | Root-Artefakt-Cleanup (M-04) | ✗ Offen |

### Phase 2 — Featureentwicklung (mittelfristig)

1. **OBS:** `obs-websocket-js` einbinden, nativen WS-Transport bauen, bootstrap konfigurierbar machen
2. **Twitch:** Token-Storage mit Electron `safeStorage`, Channel-Name konfigurierbar
3. **Spotify:** `SpotifyService.connect()` um echten OAuth PKCE-Flow erweitern
4. **Clip:** Entscheidung: OBS Replay Buffer API oder Electron `desktopCapturer` (⚠️ offen)
5. TriggerForm: Visueller Action-Builder (statt JSON-Textarea)
6. Globale Hotkeys: Electron `globalShortcut` in `main.cjs`
7. Plugin-Seite: Detail-Ansicht, Enable/Disable-Toggle
8. Website i18n: Content-Review der de/en-Locale-Texte
9. Website i18n: Weitere Sprachen bei Bedarf ergänzen

### Phase 3 — Produktreife (langfristig)

1. `electron-updater` + GitHub Releases (Infrastruktur bereits in `package.json`)
2. Onboarding-Flow (First-Run-Wizard)
3. Accessibility-Audit (aria-labels, Keyboard-Nav, Kontrast)
4. Performance: `React.memo`, `useCallback`, selektives Rendering
5. Monorepo-Konsolidierung (npm Workspaces, Shared Token Package) — optional

---

## 6. NÄCHSTE UMSETZBARE CODEX-ARBEITSPAKETE

### AP-17 — `live: false` Fix in toDashboardViewModel
**Priorität:** SOFORT | **Risiko:** Minimal
**Status:** Erledigt (2026-03-17)

**Problem:** `App.tsx` Zeile 15: `live` war hart auf `false` gesetzt, so dass die Header-Badge immer "Offline" zeigte, obwohl OBS oder Spotify verbunden waren.

**Fix:**
```typescript
// App.tsx — toDashboardViewModel
function toDashboardViewModel(state: DashboardState): DashboardViewModel {
  return {
    live: state.connectedServices.obs || state.connectedServices.spotify,
    // rest unverändert
  }
}
```

Die separate `live`-Berechnung auf Zeile 296 (`const live = dashboardState.connectedServices.obs || ...`) bleibt für TriggerEditor/MacroEditor/Settings bestehen, um den Zustand zwischen den Seiten konsistent zu halten.

**Betroffene Tests:** `src/tests/ui-dashboard.test.tsx` prüfen, ob `live`-Prop getestet wird.

---

### AP-18 — Settings.tsx: Tailwind-Klassen → Token-basierte Inline-Styles
**Priorität:** Kurzfristig | **Risiko:** Gering (nur CSS)
**Status:** Offen (neu gefunden 2026-03-17)

**Problem:** `Settings.tsx` Zeilen 96–109 (Twitch-API-Panel im RightPanel) nutzen Tailwind-Klassen (`text-xs text-slate-400`, `w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm text-white`, `text-xs text-slate-500`).

Diese stehen im Widerspruch zum Token-basierten Inline-Style-Pattern aller anderen Desktop-Komponenten. In Production-Build könnte Tailwind-Purge diese Klassen entfernen, wenn das Desktop-Build keine Tailwind-Pipeline hat.

**Fix:** Alle `className=`-Attribute in diesem Panel durch `style={{ ... }}`-Attribute mit `var(--th-*)` ersetzen:
- `label.text-xs.text-slate-400` → `style={{ fontSize: 11, color: 'var(--th-text-muted)' }}`
- `input.w-full.rounded-md.border...` → `style={{ ...inputStyle }}` (identisch zu anderen Formularen)
- `p.text-xs.text-slate-500` → `style={{ fontSize: 11, color: 'var(--th-text-muted)' }}`

---

### AP-19 — TriggerCard: Confirm vor executeTrigger
**Priorität:** Kurzfristig | **Risiko:** Gering
**Status:** Offen (C-05)

**Problem:** Klick auf `TriggerCard` feuert sofort `executeTrigger()`. Nutzer kann Trigger unbeabsichtigt ausführen.

**Optionen:**
1. `window.confirm()` vor `onToggle()` in TriggerCard — schnell, aber kein Custom-Styling
2. Kleiner Button "Run" in TriggerCard statt dem ganzen Card-Klick — bessere UX

**Empfehlung:** Option 2 (separate Run-Schaltfläche innerhalb der Card) — verhindert versehentliche Auslösung und ist konsistent mit der Macro-Liste ("Run Macro"-Button).

---

### AP-20 — runFacadeAction(): Granulares Refresh nach CRUD
**Priorität:** Mittel | **Risiko:** Mittel
**Status:** Offen (H-03)

**Problem:** `runFacadeAction(action, ..., successMsg)` ruft intern `refreshApplicationState()` — das sind alle 4 Getter (`getDashboardState`, `getEditorState`, `getPluginsState`, `getSettingsState`). Bei einer Trigger-Erstellung auf der Trigger-Seite sind davon nur `getEditorState` und `getDashboardState` relevant.

**Fix:**
```typescript
const runFacadeAction = async (
  action: () => Promise<void>,
  failureMessage: string,
  successMessageText?: string,
  refreshScope?: AppViewId | 'all',
): Promise<void> => {
  try {
    await action()
    if (refreshScope === 'all' || !refreshScope) {
      await refreshApplicationState()
    } else {
      await refreshActiveViewState(refreshScope)
      await refreshDashboard() // immer Trigger/Macro-Counts aktuell halten
    }
    // ...
  }
}
```

---

### AP-21 — Root-Artefakte bereinigen
**Priorität:** Mittel | **Risiko:** Minimal
**Status:** Offen (M-04)

**Dateien löschen:**
- `cleanup-plan.json`
- `PROJECT_AGENT_SYSTEM_SNAPSHOT.md`
- `PROJECT_CLEANUP_REPORT.md`
- `change-log.md`
- `architecture-decisions.md`
- `migration-plan.md`
- `project-analysis.md`
- `dependency_report.txt`

**Begründung:** Diese Dateien sind AI-Planungsartefakte und haben keinen Platz im Produktcode-Repository.

---

### AP-22 — MacroStepEditor: Strukturierte Step-Config-Forms (Phase 1 Rest)
**Priorität:** Mittel | **Risiko:** Mittel (UX-Umbau)
**Status:** Offen (H-04)

**Aktuell:** Typ-Dropdown + JSON-Textarea. Default-Templates werden beim Typ-Wechsel geladen.

**Ziel:** Pro Step-Typ ein strukturiertes Formular:
- `delay`: Numerisches Input für `durationMs`
- `service_call`: Dropdowns für `service` (`obs|spotify|clip|twitch`) und `action`; je nach Service die relevanten Actions zeigen
- `plugin_action`: Text-Inputs für `plugin` und `action`
- `macro_call`: Select aus vorhandenen Macro-IDs
- `conditional`: Variable + Operator-Dropdown + Value-Input + inline Then/Else-Step-Listen
- `parallel` / `sequence`: Eingebetteter Step-Editor

**Vorsicht:** `conditional`, `parallel`, `sequence` erfordern rekursive Komponenten — separat als eigenständigen Codex-Task planen.

---

### AP-23 — Twitch: safeStorage für Credentials
**Priorität:** Phase 2 | **Risiko:** Hoch (Electron IPC)

**Problem:** `RuntimeConfig.twitch.clientId` und `.accessToken` werden als Plaintext in `storage.save()` abgelegt — via IPC in `electron/main.cjs` als JSON-Datei gespeichert.

**Fix:**
- Electron `safeStorage.encryptString()` / `decryptString()` in `main.cjs` für Twitch-Credentials verwenden
- IPC-Handler `storage:save-secure` / `storage:load-secure` hinzufügen
- `storageBridge.ts` / `IpcStorageBridge` um secure-Variante erweitern

---

## 7. OFFENE FRAGEN / VALIDIERUNGSBEDARF

| # | Frage | Blocking für |
|---|---|---|
| F-01 | `live`-Prop-Semantik: `obs \|\| spotify` (aktuell Zeile 296) oder `obs \|\| spotify \|\| twitch \|\| clip`? | AP-17 |
| F-02 | Clip-Service: OBS Replay Buffer oder Electron `desktopCapturer`? | Phase 2 Clip |
| F-03 | OBS: `obs-websocket-js` direkt oder HTTP-Proxy? | Phase 2 OBS |
| F-04 | Spotify: PKCE direkt in Electron oder über Proxy-Backend auf Website? | Phase 2 Spotify |
| F-05 | Globale Hotkeys (Hintergrund) via `globalShortcut` — gewünscht oder In-App-Shortcuts ausreichend? | Phase 2 |
| F-06 | i18n im Desktop-Teil (Electron-App) gewünscht? Aktuell kein i18n im Desktop. | Roadmap |
| F-07 | Soll das Website-i18n (de/en) um weitere Sprachen erweitert werden? | Phase 2 |
| F-08 | `MacroForm.tsx` — Macro-ID ist immer `disabled` (auch im Edit-Modus). Ist das gewollt? | AP-22 |

---

## 8. AGENT-HINWEISE FÜR NACHFOLGENDE ARBEIT

### Korrekturen gegenüber älteren Kontext-Ständen

1. **MacroEngine Circular-Dep ist gelöst** — via `!`-Forward-Reference + JS-Closure. Der alte `setMacroEngine()`-Pfad ist vollständig entfernt.

2. **Twitch-Transport in bootstrap.ts ist verkabelt** — aber nur Twitch. OBS, Spotify, Clip bleiben auf InMemory.

3. **`live: false` ist ein Regression-Bug** — nicht dokumentiert, neu in 2026-03-17 Analyse entdeckt.

4. **Settings.tsx mischt Tailwind + Token** — nur in den Twitch-API-Feldern. Rest der Datei ist korrekt token-basiert.

5. **Website hat i18n** — `react-i18next`, de/en. `WebsiteLandingPage.tsx` ist vollständig i18n-isiert.

6. **28+ Testdateien** — deutlich mehr als dokumentiert. Neue Tests: `app-context`, `app-refresh`, `ui-editor-crud`, `ui-error-boundary`, `website-browser-guards`, `website-owner-only-access`, `website-prelaunch-gate`.

### Codekonventionen (Desktop-App)

- Alle Styles: `style={{ }}` mit `var(--th-*)` aus `tokens.css` — **keine Tailwind-Klassen** (Ausnahme: Settings.tsx Bug in H-02)
- Komponenten: Inline-Styles mit `CSSProperties`-Typisierung
- Kein React Router im Desktop — Navigation über `useState<AppViewId>` in `App.tsx`
- Tests: Vitest, `@testing-library/react`, InMemory-Storage für alle App-Tests
- Electron: Main Process CJS (`*.cjs`), Renderer ESM

### Nicht anfassen (stabile, korrekte Bereiche)

- `src/core/` — TriggerEngine, MacroEngine, EventBus sind vollständig und gut getestet
- `src/storage/` — IpcStorageBridge und InMemoryStorage sind korrekt
- `electron/main.cjs` — IPC-Handler sind sicher (Key-Validierung vorhanden)
- `website/src/modules/auth/` — Auth-System ist durchdacht und gut getestet
- `website/src/app/routing/` — Route-Manifest und Access-Control sind korrekt
- `src/app/serviceActivation.ts` — Partial-Failure korrekt implementiert
- `src/app/storageBridge.ts` — Desktop-Preferences und RuntimeConfig korrekt implementiert

### Testabdeckung beachten

- Änderungen an `App.tsx` → `src/tests/ui-dashboard.test.tsx`, `app-refresh.test.tsx` prüfen
- Änderungen an `Settings.tsx` → `src/tests/ui-dashboard.test.tsx` prüfen (Settings-Props werden dort getestet)
- Änderungen an `TriggerCard.tsx` / `TriggerForm.tsx` → `src/tests/ui-editor-crud.test.tsx`
- Vor und nach jeder Änderung: `npm test` ausführen
- **Neue Erkenntnis:** Lokaler `npm test`-Lauf scheitert aktuell mit `Error: spawn EPERM` beim Bündeln von `vitest.config.ts` (esbuild), solange der Prozess keine Berechtigung zum Spawn hat. Dies sollte dokumentiert oder mit erhöhten Rechten gelöst werden, bevor die Suite wieder regelmäßig ausgeführt wird.

---

## EMPFOHLENER NÄCHSTER CODEX-AUFTRAG

**Sofort-Fixes (ein Commit, geringes Risiko):**

1. **AP-17:** `App.tsx` Zeile 15 — `live: false` → `live: state.connectedServices.obs || state.connectedServices.spotify`. Danach die doppelte `live`-Berechnung auf Zeile 296 entfernen und `live` direkt aus `toDashboardViewModel()` nutzen.

2. **AP-18:** `Settings.tsx` Zeilen 96–109 — alle Tailwind-`className`-Attribute durch Token-basierte `style={{}}`-Attribute ersetzen. Styles aus anderen Formular-Komponenten ableiten (z.B. `inputStyle` aus `TriggerForm.tsx`).

3. `npm test` ausführen und sicherstellen, dass alle Tests grün bleiben.

**Nächster größerer Task (AP-19):** TriggerCard refactoren — `executeTrigger()` nicht mehr direkt beim Card-Klick, sondern über einen dedizierten "Run"-Button innerhalb der Card.
