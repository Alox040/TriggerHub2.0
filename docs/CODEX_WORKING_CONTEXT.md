# CODEX_WORKING_CONTEXT.md
# TriggerHub 2.0 — Konsolidierter Projektkontext für Codex

**Erstellt:** 2026-03-16
**Quellen:** Vollständige Codeanalyse (src/, electron/, website/), UI/UX-Analyse, Architekturanalyse, Roadmap-Session
**Zweck:** Arbeitsgrundlage für nachfolgende Codex-Agenten. Kein Chat-Kontext erforderlich.

---

## 1. PROJEKTÜBERBLICK

**Produkt:** TriggerHub 2.0 — Windows-Desktop-Automatisierungstool für Content-Creator (Streamer)
**Kernidee:** Nutzer verbinden OBS, Spotify, Twitch und Clip-Recording in einer Oberfläche und definieren Trigger/Makro-Regeln (z.B. „Wenn OBS verbindet → wechsle zur Hauptszene").

**Zwei getrennte Arbeitsflächen im selben Repository:**

| Bereich | Pfad | Stack | Deployment |
|---|---|---|---|
| Desktop-App | `src/`, `electron/` | Electron 36, React 18, TypeScript, Vite, Vitest | Windows-Installer via electron-builder |
| Website | `website/` | React 18, Tailwind v4, Vite, Vercel | Vercel SPA |

**Version:** 0.1.1
**Branch:** release/v0.1.1-prep
**Teststatus:** 26 Testdateien, 179 Tests — **Snapshot vom 2026-03-16: alle grün**. Nach den lokalen UI-/UX-Anpassungen in diesem Arbeitsstand **nicht erneut verifiziert**.

---

## 2. KONSOLIDIERTER IST-ZUSTAND

### 2.1 Desktop-App — Architektur

Die Architektur folgt einem klaren Schichtenmodell (Port/Adapter-Pattern):

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
  serviceActivation.ts    → activateRuntime / deactivateRuntime
  storageBridge.ts        → loadOrSeedCoreData / persistCoreData
  storageValidation.ts    → Zod-basierte Payload-Validierung beim Laden

src/storage/
  ipcStorageBridge.ts     → Electron IPC → StoragePort (Produktion)
  inMemoryStorage.ts      → StoragePort (Tests)

src/plugins/              → PluginRegistry + Example Plugin
src/runtime/              → RuntimeMonitor, Metrics, RuntimeErrorBoundary
src/ui/                   → Pages, Components, Layout, Styles, Navigation
```

### 2.2 Service-Transport-Status — KORREKTUR zur initialen Analyse

**Wichtige Korrektur:** Die Services sind NICHT reine Stubs. Das Pattern ist Port/Adapter mit expliziter Transport-Auswahl:

| Service | Default-Transport | Alternativer Transport | Produktions-ready? |
|---|---|---|---|
| OBS | `InMemoryObsTransport` | `ObsHttpTransport` (HTTP-Proxy-Ansatz) | **Nein** — HTTP-Proxy zu OBS-WebSocket fehlt |
| Spotify | `InMemorySpotifyTransport` | `SpotifyHttpTransport` (HTTP-Proxy-Ansatz) | **Nein** — Proxy + OAuth fehlen; `connect()` ist auch mit HTTP-Transport ein No-Op |
| Twitch | `InMemoryTwitchTransport` | `TwitchApiTransport` (Helix API direkt) | **Teilweise** — Helix-API-Calls sind implementiert, Auth (OAuth Bearer Token im HttpClient) und baseUrl-Config fehlen |
| Clip | `InMemoryClipExporter` | `NodeClipExporter` (Electron IPC) | **Teilweise** — IPC-Kanal existiert, echter Capture-Buffer (`buildClipBuffer`) ist Dummy |

**In `bootstrap.ts` werden alle Services ohne transport-Argument erstellt → alle nutzen InMemory.**
Die HTTP/API-Transports sind gebaut aber nicht verkabelt.

**⚠️ UNSICHERHEIT:** `SpotifyService.connect()` setzt nur `this.connected = true`, unabhängig vom Transport. Eine echte Spotify-Auth-Integration erfordert Änderungen in `spotifyActions.ts` (connect-Methode) und einen OAuth-Flow — nicht nur Transport-Swapping.

### 2.3 HotkeyManager — KORREKTUR

`HotkeyManager` ist implementiert und funktionsfähig — nutzt `window.addEventListener('keydown')`. Das sind **In-App-Hotkeys** (Fenster muss fokussiert sein), **keine** Electron `globalShortcut`-Bindings. Für globale Hotkeys (App im Hintergrund) wäre `electron.globalShortcut` in `main.cjs` erforderlich.

### 2.4 Desktop UI — Screens und Komponenten

**Screens (alle in Navigation):**
- `Dashboard.tsx` — TriggerCard-Grid + Active Automations + StatusBar
- `TriggerEditor.tsx` — TriggerForm (Create/Edit) + Trigger-Liste
- `MacroEditor.tsx` — MacroForm + MacroStepEditor + Macro-Liste
- `Plugins.tsx` — Installed Plugins (read-only Liste)
- `Settings.tsx` — Runtime Controls + Connected Services + Twitch Connect/Disconnect

**Bereits bereinigt:**
- `src/ui/pages/Editor.tsx` — gelöscht
- `src/ui/components/Modal.tsx` — gelöscht
- `src/ui/components/DeckButton.tsx` — gelöscht

**Layout-System:**
- `MainLayout`: Sidebar(240px) + Header(72px) + Main(1fr) + RightPanel(320px)
- CSS-Klassen in `dashboard.css`, Design-Tokens in `tokens.css`
- Responsive Breakpoint bei 1100px (RightPanel collapsed)
- Sidebar-Navigation zeigt jetzt nur noch Label + Icon; Beschreibungstexte sind aus der sichtbaren Navigation entfernt und nur noch als `title` vorhanden

### 2.5 Design-System Status

```
tokens.css definiert:
  ✓ Backgrounds (3 Ebenen: shell / main / panel)
  ✓ Borders (2 Stärken: subtle 4% / weak 10%)
  ✓ Text (3 Ebenen: primary / secondary / muted)
  ✓ Accent: #0EA5E9 (Sky Blue)
  ✓ Accent-Subtokens: --th-accent-subtle / --th-accent-border
  ✓ Semantic: --th-success / --th-warning / --th-danger
  ✓ Radius: md(10px) / lg(16px)

  ✗ Keine Typografie-Tokens (fontSize weiterhin hardcoded: 11/12/13/14/18px)
  ✗ Keine Spacing-Tokens
  ✗ Keine dedizierten Hover-/Focus-/Pressed-Tokens für Buttons
```

**Aktueller Stand:** `Button.tsx` rendert nicht mehr als Browser-Default. Es existiert jetzt ein minimales Variant-System (`default | primary | danger`) auf Basis der `--th-*`-Tokens.

### 2.6 Website Status

- Vollständiges Auth-System: Owner-Login, Session-Management, CSRF, Rate-Limiting
- Access-Mode-System: `private_prelaunch | invite_only | public_product` (aktuell: `public_product`)
- Route-Manifest mit Policy-Overrides pro AccessMode
- Marketing: `WebsiteLandingPage`, `MarketingPage` (/features, /pricing, /about)
- **Problem:** Marketing-Copy beschreibt das Repository statt das Produkt aus Nutzerperspektive
- **Problem:** LoginPage zeigt technische Meldungen ("Owner authentication is fail-closed", "Access mode is public_product")
- **Problem:** Kein Mobile-Navigation-Menu (nav ist `hidden md:flex` ohne Hamburger-Fallback)

### 2.7 Root-Ordner Hygiene

Dateien am Root die nicht in den Produktbau gehören:
- `cleanup-plan.json` (353 KB, AI-Planungsartefakt)
- `PROJECT_AGENT_SYSTEM_SNAPSHOT.md` (47 KB)
- `PROJECT_CLEANUP_REPORT.md`, `change-log.md`, `architecture-decisions.md`, `migration-plan.md`, `project-analysis.md`, `dependency_report.txt`

**Bereits bereinigt:**
- `/undefined` — gelöscht
- `website/package.json` — Name auf `@triggerhub/website` korrigiert

---

## 3. KRITISCHE PROBLEME UND BLOCKER

### Priorität KRITISCH (Blocker für Nutzbarkeit)

| ID | Problem | Datei(en) | Typ |
|---|---|---|---|
| C-02 | Alle Services nutzen InMemory-Transport in Produktion (bootstrap.ts ohne transport-Config) | `bootstrap.ts` | Fehlende Wiring |
| C-03 | `SpotifyService.connect()` ist No-Op (auch mit HTTP-Transport) — kein OAuth | `spotifyActions.ts` | Fehlende Implementierung |
| C-04 | `buildClipBuffer()` erzeugt Dummy-Daten — kein echtes Capture | `clipProcessor.ts` | Fehlende Implementierung |
| C-05 | TriggerCard-Klick feuert `executeTrigger()` sofort ohne Confirm | `TriggerCard.tsx`, `App.tsx` | UX-Bug |
| C-06 | TriggerForm: Conditions und Actions weiterhin als raw JSON-Textarea; ID/Event-Eingabe wurde verbessert, der eigentliche Action-/Condition-Builder fehlt aber noch | `TriggerForm.tsx` | UX-Blocker |

### Priorität HOCH (Tech Debt / UX-Degradierung)

| ID | Problem | Datei(en) | Typ |
|---|---|---|---|
| H-01 | Deferred Circular Dependency: `setMacroEngine()` muss nach Bootstrap manuell aufgerufen werden | `actionDispatcher.ts`, `bootstrap.ts` | Architekturrisiko |
| H-09 | RightPanel auf allen Seiten nur statischer Zähler-Text ohne Mehrwert | Alle Pages | UX-Leerinhalt |
| H-10 | MacroStepEditor: Step-Config als JSON-Textarea pro Step | `MacroStepEditor.tsx` | UX |
| H-11 | `runtimeConfig` wird in `TriggerHubAppFacade` weiterhin als Konstruktor-Dependency gehalten, aber im aktuellen Codepfad nicht mehr verwendet | `facade.ts` | Tech Debt |

### Priorität MITTEL

| ID | Problem | Datei(en) | Typ |
|---|---|---|---|
| M-06 | Marketing-Copy beschreibt Repo statt Produkt für Nutzer | `WebsiteLandingPage.tsx`, `MarketingPage.tsx` | Produktkommunikation |
| M-07 | LoginPage zeigt technische Developer-Meldungen | `LoginPage.tsx` | UX |
| M-08 | Kein Mobile-Navigation-Menu auf Website | `MarketingBlocks.tsx` | UX |
| M-09 | HotkeyManager nutzt window.keydown — keine globalen Hotkeys (App im Hintergrund) | `hotkeyManager.ts` | Feature-Lücke |
| M-10 | Twitch nutzt 60s-Polling statt EventSub/WebSocket | `twitchActions.ts` | Performance/Reaktivität |
| M-11 | Full-State-Refresh (alle 4 Getter) bei jedem TRIGGER_EXECUTED/MACRO_COMPLETED-Event | `App.tsx` | Performance |
| M-12 | Sidebar-Icons wurden mit lokalen SVG-Komponenten umgesetzt, weil `lucide-react` im Root-Workspace nicht installiert ist; Dokumentation und Root-Dependency-Plan sind hier nicht mehr synchron | `navigation.ts`, `Sidebar.tsx`, `package.json` | Implementierungsabweichung |

---

## 4. RISIKEN

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| OBS HTTP-Transport erfordert Middleware (kein nativer WS-v5-Client) | Hoch | Hoch | OBS-WebSocket-Library (`obs-websocket-js`) direkt einbinden statt HTTP-Proxy |
| Spotify OAuth in Electron ist komplex (Redirect-URI, Token-Storage) | Hoch | Hoch | PKCE-Flow für Desktop, Token im userData-Pfad speichern |
| Twitch TwitchApiTransport benötigt Bearer-Token im HttpClient (Auth-Header-Wiring fehlt) | Mittel | Hoch | Bearer-Token-Injection in HttpClient-Options bei bootstrap |
| `setMacroEngine()` vergessen → Runtime-Crash bei `macro.run`-Action | Mittel | Kritisch | Refactor zu direkter Injection (H-01) |
| Service-Transport-Umstellung in bootstrap.ts bricht Tests (Tests nutzen InMemory) | Mittel | Niedrig | Tests weiterhin InMemory, Produktions-bootstrap via Config |
| Lokale UI-/UX-Änderungen wurden in diesem Arbeitsstand nicht erneut per `npm test` validiert | Mittel | Mittel | Vor weiteren Refactors den Snapshot mit `npm test` erneuern |
| Sidebar-Icon-Plan und tatsächliche Umsetzung driften auseinander (`lucide-react` geplant, lokale SVGs umgesetzt) | Niedrig | Niedrig | Entweder Root-Dependency nachziehen oder Dokumentation/Plan final auf lokale Icons anpassen |

---

## 5. ROADMAP NACH PHASEN

### Phase 0 — Stabilisierung (sofort, kein Feature-Risiko)

**Ziel:** Bekannte Bugs, toten Code und inkonsistentes Verhalten bereinigen.

1. ✓ Tote UI-Dateien gelöscht (`Editor.tsx`, `Modal.tsx`, `DeckButton.tsx`)
2. ✓ `Button.tsx` — minimale Token-basierte Styles + `variant`-Prop
3. ✓ Teal-Hardcodes durch Token ersetzt (`Header.tsx`, `TriggerCard.tsx`)
4. ✓ `tokens.css` — fehlende Tokens ergänzt (`--th-success`, `--th-warning`, `--th-accent-subtle`, `--th-accent-border`)
5. ✓ Error-Toast — Dismiss-Button + 5s Auto-Close (`App.tsx`)
6. ✓ Success-Feedback nach CRUD (`App.tsx`)
7. ✓ Header-Badge-Semantik und -Farbe korrigiert
8. ✓ StatusBar auf 4 Services erweitert
9. ✓ `void this.runtimeConfig` entfernt
10. ✓ Root-Artefakte: `undefined`-Datei gelöscht, `website/package.json` Name korrigiert

### Phase 1 — Architekturverbesserung (kurzfristig)

**Ziel:** Design-System vollständig, UX-Blocking-Issues in Editoren lösen, Core-Schulden abbauen.

1. ◐ Button-Variant-System (`primary` / `danger` umgesetzt, `ghost` noch offen)
2. ◐ Icons in Sidebar und Beschreibungstext entfernt; umgesetzt mit lokalen SVG-Icons statt `lucide-react`
3. ✓ TriggerForm: Auto-generierte ID + Event-Topic-Picker (Dropdown aus `EventTopics`)
4. ✓ MacroForm + MacroStepEditor: Auto-generierte IDs
5. MacroEngine Circular-Dependency beheben: `createActionDispatcher(deps, macroEngine)` direkt statt `setMacroEngine()`
6. `App.tsx`: Granularer State-Refresh (pro Seite gezielt, nicht alle 4 Getter bei jedem Event)
7. `serviceActivation.ts`: Partial-Failure — einzelne fehlgeschlagene Services blockieren nicht den Rest
8. RightPanel: Context-Driven (Dashboard → Runtime-Log, Trigger/MacroEditor → Detail des gewählten Eintrags)
9. MacroStepEditor: Strukturierte Step-Config-Forms statt JSON-Textarea (pro Step-Typ)

### Phase 2 — Featureentwicklung (mittelfristig)

**Ziel:** Echte Service-Integrationen, Hotkeys, Plugin-UI.

1. **OBS:** `obs-websocket-js` einbinden, nativen WS-Transport bauen, bootstrap konfigurierbar machen
2. **Twitch:** `TwitchApiTransport` in bootstrap verdrahten, OAuth/Client-Credentials-Token-Flow, baseUrl konfigurierbar
3. **Spotify:** `SpotifyService.connect()` um echten OAuth PKCE-Flow erweitern, `SpotifyHttpTransport` auf Spotify Web API zeigen
4. **Clip:** Entscheidung: OBS Replay Buffer API oder Electron `desktopCapturer` (⚠️ offen)
5. TriggerForm: Visueller Action-Builder (statt JSON-Textarea)
6. Globale Hotkeys: `HotkeyManager` um Electron `globalShortcut`-Pfad erweitern
7. Plugin-Seite: Detail-Ansicht (Actions, Events), Enable/Disable-Toggle
8. Website: Marketing-Copy überarbeiten, Mobile-Navigation, LoginPage-Sprache

### Phase 3 — Produktreife (langfristig)

**Ziel:** Auto-Update, Onboarding, a11y, Performance.

1. `electron-updater` + GitHub Releases
2. Onboarding-Flow (First-Run-Wizard)
3. Accessibility-Audit (aria-labels, Keyboard-Nav, Kontrast)
4. Performance: `React.memo`, `useCallback`, selektives Rendering
5. Monorepo-Konsolidierung (npm Workspaces, Shared Token Package) — optional

---

## 6. NÄCHSTE UMSETZBARE CODEX-ARBEITSPAKETE

Priorisiert, logisch sortiert, umsetzungsnah.

---

### AP-01 — Tote UI-Dateien löschen
**Priorität:** Sofort | **Risiko:** Minimal
**Status:** Erledigt

**Ziel:** Repository-Größe reduzieren, irreführende Komponenten entfernen.

**Dateien:**
- `src/ui/pages/Editor.tsx` — löschen
- `src/ui/components/Modal.tsx` — löschen
- `src/ui/components/DeckButton.tsx` — löschen
- `src/ui/components/index.ts` — Export-Einträge für Modal und DeckButton entfernen
- `src/ui/pages/index.ts` — Export-Eintrag für EditorPage entfernen
- `/undefined` — löschen (Root)
- `website/package.json` — `"name"` von `"@figma/my-make-file"` auf `"@triggerhub/website"` ändern

**Begründung:** Keine dieser Dateien hat Imports oder Tests. Keine Seiteneffekte.

---

### AP-02 — Design-Tokens vervollständigen + Teal-Hardcodes bereinigen
**Priorität:** Sofort | **Risiko:** Nur CSS
**Status:** Erledigt

**Ziel:** Konsistentes Token-System, Teal-Inkonsistenz eliminieren.

**Änderungen:**
- `src/ui/styles/tokens.css` — neue Tokens hinzufügen:
  ```css
  --th-success: #10B981;
  --th-warning: #F59E0B;
  --th-accent-subtle: rgba(14, 165, 233, 0.1);
  --th-accent-border: rgba(14, 165, 233, 0.3);
  ```
- `src/ui/layout/Header.tsx` — beide `rgba(45,212,191,...)` durch neue Token ersetzen
- `src/ui/components/TriggerCard.tsx` — `rgba(45,212,191,0.1)` durch `var(--th-accent-subtle)` ersetzen

**Begründung:** Teal (#2dd4bf) und Sky-Blue (#0EA5E9) werden aktuell inkonsistent verwendet. Das Token `--th-accent` ist Sky-Blue, aber mehrere Komponenten verwenden Teal-Hardcodes.

---

### AP-03 — Button.tsx: Visuelle Styles + Variant-System
**Priorität:** Sofort | **Risiko:** Mittel (visuell sichtbar auf allen 5 Seiten)
**Status:** Erledigt (aktueller Stand: `default | primary | danger`; `ghost` bleibt offen)

**Ziel:** Button rendert nicht mehr als Browser-Default.

**Änderungen:**
- `src/ui/components/Button.tsx` — `variant: 'default' | 'primary' | 'danger'` Prop; Inline-Styles mit Token-Referenzen; default = `bg-panel + border-weak`; primary = `accent-bg + dark-text`; danger = `accent-subtle-red + danger-text`
- `src/ui/pages/TriggerEditor.tsx` — Delete → `variant="danger"`, Create/Save → `variant="primary"`
- `src/ui/pages/MacroEditor.tsx` — Delete → `variant="danger"`, Create/Save → `variant="primary"`
- `src/ui/pages/Settings.tsx` — Activate → `variant="primary"`
- `src/ui/components/MacroStepEditor.tsx` — Delete Step → `variant="danger"`

**Begründung:** Größtes visuelles Problem der App. Alle Aktionen sehen gleich aus, Delete ist nicht von Create unterscheidbar.

---

### AP-04 — App.tsx: Error-Toast + Success-Feedback
**Priorität:** Sofort | **Risiko:** Gering
**Status:** Erledigt

**Ziel:** Nutzer erhält Feedback ob eine Aktion erfolgreich war oder fehlgeschlagen ist.

**Änderungen:**
- `src/App.tsx`:
  - Error-Toast: `×`-Dismiss-Button + `useEffect` mit `setTimeout(5000)` zum Auto-Clear
  - Neuer `successMessage: string | null`-State
  - `runFacadeAction` nach Erfolg `setSuccessMessage(message)` aufrufen
  - Grünes Success-Banner (analog zum Error-Toast), Auto-Clear nach 3s

**Begründung:** Aktuell kein Feedback nach Create/Update/Delete. Error bleibt ewig stehen ohne Dismiss-Möglichkeit.

---

### AP-05 — Header-Semantik + Badge-Farbe
**Priorität:** Sofort | **Risiko:** Minimal
**Status:** Erledigt

**Ziel:** "Stream Live"-Badge zeigt semantisch korrekten Zustand.

**Änderungen:**
- `src/ui/layout/Header.tsx` — Badge-Text: `live ? 'Services Active' : 'Offline'`; inaktiv-Farbe: `var(--th-text-muted)` statt `var(--th-danger)` (Offline ist kein Fehler)
- `src/App.tsx` — `live`-Prop-Berechnung: unverändert (obs || spotify) oder auf alle 4 Services erweitern — **Entscheidung erforderlich** (siehe Offene Fragen)

**Begründung:** "Stream Live" bei OBS-Verbindung ist semantisch falsch. "Offline" in Danger-Rot suggeriert einen Fehler.

---

### AP-06 — StatusBar: alle 4 Services anzeigen
**Priorität:** Sofort | **Risiko:** Gering
**Status:** Erledigt

**Ziel:** Vollständige Service-Statusanzeige.

**Änderungen:**
- `src/ui/components/StatusBar.tsx` — Props `clipConnected` und `twitchConnected` ergänzen; 4 Status-Dots rendern
- `src/ui/pages/Dashboard.tsx` — neue Props aus `DashboardViewModel.status` weiterleiten
- `src/ui/pages/Settings.tsx` — separaten Twitch-Status-Block durch erweiterte StatusBar ersetzen
- `src/ui/types.ts` — `DashboardViewModel.status` um `clipConnected` und `twitchConnected` erweitern
- `src/App.tsx` — `toDashboardViewModel()` entsprechend erweitern

---

### AP-07 — facade.ts: Dead Code entfernen
**Priorität:** Sofort | **Risiko:** Minimal
**Status:** Erledigt

**Änderungen:**
- `src/app/facade.ts` — Zeile 187: `void this.runtimeConfig` entfernen

---

### AP-08 — Sidebar: Icons + Beschreibungstext-Cleanup
**Priorität:** Kurzfristig | **Risiko:** Gering
**Status:** Erledigt mit Abweichung

**Ziel:** Sauberere Navigation, professionelleres Erscheinungsbild.

**Änderungen:**
- `package.json` (Root) — `lucide-react` als Dependency hinzufügen
- `src/ui/navigation.ts` — `AppNavigationItem` um `icon: LucideIcon`-Prop erweitern; Icons zuweisen (Dashboard→`LayoutDashboard`, Triggers→`Zap`, Macros→`GitBranch`, Plugins→`Puzzle`, Settings→`Settings2`)
- `src/ui/layout/Sidebar.tsx` — Icon-Slot vor Label rendern; `description`-Text entfernen (optional als `title`-Attribut behalten)

**Aktueller Stand:** Beschreibungstext wurde entfernt und die Sidebar rendert Icons, allerdings als lokale SVG-Komponenten. `lucide-react` wurde im Root-Projekt nicht hinzugefügt.

---

### AP-09 — TriggerForm: Auto-ID + Event-Topic-Picker
**Priorität:** Kurzfristig | **Risiko:** Gering
**Status:** Erledigt

**Ziel:** Trigger erstellen ohne Kenntnis interner IDs und Event-String-Syntax.

**Änderungen:**
- `src/ui/components/TriggerForm.tsx`:
  - `createBlankTrigger()` → `id: crypto.randomUUID().slice(0, 8)` vorausfüllen
  - ID-Input: `disabled={!isEditing}` bei Create, `disabled={isEditing}` aufheben via "Advanced"-Checkbox
  - Event-Topic-Feld: `<select>` mit allen `EventTopics`-Werten aus `src/types/domain.ts`; letzte Option "Custom" öffnet `<input>`

---

### AP-10 — MacroForm + MacroStepEditor: Auto-IDs
**Priorität:** Kurzfristig | **Risiko:** Gering
**Status:** Erledigt

**Änderungen:**
- `src/ui/components/MacroForm.tsx` — `createBlankMacro()` → `id: crypto.randomUUID().slice(0, 8)`; ID-Feld bei Create gesperrt
- `src/ui/components/MacroStepEditor.tsx` — "Add Step" → `id: \`step-${crypto.randomUUID().slice(0, 6)}\``

---

### AP-11 — MacroEngine Circular-Dependency Refactor
**Priorität:** Kurzfristig | **Risiko:** Mittel (Bootstrap-Reihenfolge ändert sich)

**Ziel:** Fragiles Two-Phase-Init (`setMacroEngine()`) durch direkte Dependency-Injection ersetzen.

**Änderungen:**
- `src/app/actionDispatcher.ts` — Signature: `createActionDispatcher(deps: ActionDispatcherDeps, macroEngine: MacroEngine)`; `getMacroEngine()`-Closure und `setMacroEngine`-Return entfernen; `macroEngine`-Parameter direkt nutzen
- `src/app/bootstrap.ts` — MacroEngine vor ActionDispatcher instanziieren; direkt als Parameter übergeben; `setMacroEngine(macroEngine)` Call entfernen
- `src/tests/action-dispatcher.test.ts` — Test-Setup entsprechend anpassen

---

### AP-12 — App.tsx: Granularer State-Refresh
**Priorität:** Mittel | **Risiko:** Mittel

**Ziel:** Nicht alle 4 State-Getter bei jedem Event aufrufen.

**Änderungen:**
- `src/App.tsx` — `refreshApplicationState()` aufteilen in `refreshDashboard()` (nur `getDashboardState()`) und `refreshEditorState()` (nur `getEditorState()`); EventBus-Subscriptions (`TRIGGER_EXECUTED`, `MACRO_COMPLETED`) → nur `refreshDashboard()`; Navigation zu Seite → gezielter Refresh

---

### AP-13 — serviceActivation.ts: Partial-Failure Handling
**Priorität:** Mittel | **Risiko:** Mittel

**Ziel:** Ein fehlgeschlagener Service-Connect blockiert nicht die anderen.

**Änderungen:**
- `src/app/serviceActivation.ts` — In `activateRuntime()`: jeden Service-Connect (`obsService.connect()`, `spotifyService.connect()`, etc.) in eigenem try/catch; fehlgeschlagene Services in `failedServices[]` protokollieren; nach allen Verbindungsversuchen: `setRuntimeActivated(true)` trotzdem ausführen; `failedServices` loggen; ggf. in Facade/State sichtbar machen

---

### AP-14 — Website LoginPage: Nutzersprache
**Priorität:** Mittel | **Risiko:** Minimal

**Änderungen:**
- `website/src/pages/LoginPage.tsx` — Titel: `"Owner Login"` → `"Sign in"`; `!isAuthAvailable`-Block: technische Meldung durch einfaches "Login is currently unavailable." ersetzen; `appAccessMode`-Anzeige entfernen

---

### AP-15 — Website: Mobile Navigation
**Priorität:** Mittel | **Risiko:** Gering

**Änderungen:**
- `website/src/components/MarketingBlocks.tsx` — `MarketingShell`: `useState<boolean>` für Mobile-Menu-State; Hamburger-Button (`Menu`/`X` Icon) für `< md`; Mobile-Dropdown mit denselben `navItems`

---

### AP-16 — TwitchApiTransport in bootstrap.ts verdrahten (Phase 2)
**Priorität:** Hoch (Phase 2) | **Risiko:** Hoch

**Ziel:** Echte Twitch-Helix-API-Verbindung in Produktion nutzen.

**Voraussetzungen:** Twitch App registriert (Client ID), Client-Credentials-OAuth-Flow, Bearer-Token verfügbar

**Änderungen:**
- `src/services/shared/http.ts` — `Authorization: Bearer <token>` Header in `HttpClientOptions` ergänzen
- `src/app/runtimeConfig.ts` — Twitch-Konfiguration (`clientId`, `accessToken`, `baseUrl`) in `RuntimeConfig` aufnehmen
- `src/app/bootstrap.ts` — `createTwitchService` mit `transport: 'http'`, `http.baseUrl: 'https://api.twitch.tv/helix'`, Auth-Header aufrufen wenn Config vorhanden
- `src/ui/pages/Settings.tsx` — Twitch Client-ID + Token Konfigurationsfelder

---

## 7. OFFENE FRAGEN / VALIDIERUNGSBEDARF

| # | Frage | Blocking für |
|---|---|---|
| F-01 | `live`-Prop-Semantik in Header: Soll `live` Twitch-Stream-Status, OBS-Verbindung oder "irgendein Service connected" bedeuten? | AP-05 |
| F-02 | Clip-Service: OBS Replay Buffer oder Electron `desktopCapturer`? Entscheidung hat erhebliche Architekturauswirkungen. | Phase 2 Clip |
| F-03 | OBS HTTP-Transport nutzt HTTP-Proxy-Ansatz (`/connect`, `/scene`-Endpoints) — kein nativer OBS-WebSocket-Client. Soll eine Middleware bereitgestellt werden oder soll `obs-websocket-js` direkt genutzt werden? | Phase 2 OBS |
| F-04 | Spotify: PKCE direkt in Electron oder über Proxy-Backend auf Website? Token-Storage: Electron `safeStorage` oder einfache JSON-Datei? | Phase 2 Spotify |
| F-05 | Soll der `RightPanel`-Slot als Runtime-Log (letzte N Executions) genutzt werden? Benötigt persistente Event-History im RuntimeMonitor. | AP in Phase 1.8 |
| F-06 | Globale Hotkeys (Hintergrund) via Electron `globalShortcut` — gewünscht oder reichen In-App-Shortcuts? | Phase 2 Hotkeys |
| F-07 | Marketing-Copy: Soll die Überarbeitung von einem KI-Agenten oder manuell erfolgen? Content erfordert Produktvision-Input. | AP-14 Website |

---

## 8. AGENT-HINWEISE FÜR NACHFOLGENDE ARBEIT

### Wichtige Korrekturen gegenüber initialer Analyse

1. **Services sind KEINE reinen Stubs** — sie folgen dem Port/Adapter-Pattern. InMemory-Transports sind bewusst für Tests und Development. HTTP-Transports existieren und sind teilweise real implementiert (TwitchApiTransport ruft echte Helix-Endpoints auf). Das Problem ist die fehlende Transport-Konfiguration in `bootstrap.ts`.

2. **HotkeyManager funktioniert** — aber nur für In-App-Hotkeys (Fenster muss Fokus haben). Für globale Hotkeys (Electron `globalShortcut`) wäre `main.cjs` anzupassen.

3. **SpotifyService.connect() ist ein No-Op** unabhängig vom Transport-Typ — dies ist ein echter Bug in `spotifyActions.ts`, nicht nur eine fehlende Konfiguration.

4. **`runtimeConfig` in der Facade ist aktuell eine tote Konstruktor-Dependency** — der frühere Dummy-Zugriff wurde entfernt, aber das Feld wird im verbleibenden Codepfad nicht mehr genutzt.

5. **Sidebar-Icons sind lokal implementiert** — der ursprüngliche Plan mit `lucide-react` wurde im Desktop-Root nicht umgesetzt, weil die Dependency dort fehlt. Neue Arbeiten sollten diese Abweichung bewusst beibehalten oder gezielt konsolidieren.

### Codekonventionen

- Alle neuen Styles: CSS Custom Properties (`var(--th-*)`) aus `tokens.css` nutzen, keine Hardcodes
- Komponenten: Inline-Styles mit `CSSProperties`-Typisierung (bestehender Pattern)
- Kein React Router im Desktop-Teil — Navigation über `useState<AppViewId>` in `App.tsx`
- Tests: Vitest, `@testing-library/react`. InMemory-Storage für alle App-Tests.
- Electron: Main Process ist CJS (`*.cjs`), Renderer ist ESM

### Nicht anfassen (stabile, korrekte Bereiche)

- `src/core/` — TriggerEngine, MacroEngine, EventBus sind vollständig und gut getestet
- `src/storage/` — IpcStorageBridge und InMemoryStorage sind korrekt
- `electron/main.cjs` — IPC-Handler sind sicher (Key-Validierung vorhanden)
- `website/src/modules/auth/` — Auth-System ist durchdacht und gut getestet
- `website/src/app/routing/` — Route-Manifest und Access-Control sind korrekt

### Testabdeckung beachten

- Alle Änderungen an `actionDispatcher.ts` und `bootstrap.ts` erfordern Anpassung in `src/tests/action-dispatcher.test.ts` und `src/tests/app-container.test.ts`
- Alle Änderungen an `StatusBar.tsx` / `Dashboard.tsx` erfordern Anpassung in `src/tests/ui-dashboard.test.tsx`
- Vor und nach jeder Änderung: `npm test` ausführen
- Der dokumentierte Snapshot-Stand der Tests ist derzeit älter als der aktuelle UI-Arbeitsstand; vor Architekturarbeiten sollte die Suite erneut ausgeführt werden

---

## EMPFOHLENER NÄCHSTER CODEX-AUFTRAG

Führe folgende Aufgaben als einzelnen, zusammenhängenden Commit durch:

1. Refactore `src/app/actionDispatcher.ts` auf direkte MacroEngine-Injection: `createActionDispatcher(deps, macroEngine)` statt nachträglichem `setMacroEngine()`.

2. Passe `src/app/bootstrap.ts` an, sodass `MacroEngine` vor dem ActionDispatcher erstellt und direkt übergeben wird. Entferne den gesamten `setMacroEngine(...)`-Pfad.

3. Aktualisiere die betroffenen Tests in `src/tests/action-dispatcher.test.ts` und `src/tests/app-container.test.ts` auf das neue Initialisierungsmuster.

4. Führe danach `npm test` aus und verifiziere den lokalen Snapshot neu, weil der aktuell dokumentierte Teststand noch auf dem Stand vom 2026-03-16 beruht.

**Ziel:** Entfernen des fragilen Two-Phase-Init in der Runtime-Komposition, damit `macro.run`-Actions nicht mehr von einem nachträglichen Setter abhängen.
