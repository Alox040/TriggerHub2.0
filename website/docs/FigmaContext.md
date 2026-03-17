## PROJECT ANALYSIS

### 1. Overview

- **Produkt**: TriggerHub 2.0 – Windows-Desktop-Automatisierungstool für Streamer und Creator.
- **Hauptartefakte**:
  - **Desktop-App**: `src/`, `electron/`, `index.html`, `vite.config.ts`, `tsconfig.json`.
  - **Website**: `website/` (Vite+React+Tailwind, i18n mit i18next), `website/vite.config.ts`, `website/index.html`.
  - **Tools**: `tools/exe-builder/` (separate Electron-UI zum Bauen von EXE-Projekten).
  - **Design-Demo**: `design/` (Make/Figma-Demo-App, nicht Teil des Produkts).
  - **Docs & Kontext**: `docs/`, `project-context/`, diverse Audit-/Status- und Architektur-Dokumente.
  - **Build-/Release-Infrastruktur**: `.github/workflows/*.yml`, `scripts/*.ts|mjs|ps1`, `electron-builder`-Konfiguration in `package.json`.
- **Technologie-Stand**:
  - Desktop: React 18.3.1, TypeScript 5.8, Vite 6.x, Electron 36, Vitest 3, `electron-builder` 26.
  - Website: React 18.3, Tailwind v4, Vite 6.3.5, i18next + react-i18next.
  - Architektur: Ports/Adapter, Event-Bus, Trigger-Engine, Macro-Engine, Services (OBS/Spotify/Twitch/Clip), Plugin-System.

### 2. System Architecture

- **Top-Level-Struktur (Root)**:
  - `src/` – Desktop-Anwendung (UI, Core, Services, Runtime, Tests).
  - `electron/` – Electron Main Process (`main.cjs`, `preload.cjs`, Storage & Clip-Exporter Bridge).
  - `website/` – Marketing- & Access-Control-Website (SPA, Auth-System, i18n-Plan).
  - `tools/` – Hilfstools, v.a. `tools/exe-builder` (eigene Electron-Anwendung).
  - `design/` – Figma/Make-Beispielprojekt, kein produktiver Client.
  - `scripts/` – Node/TS/PowerShell-Skripte für Release, Website-Sync, Artefakt-Tests, Kontext-Generierung.
  - `docs/` – Architektur-, Audit-, Security-, Workflow- und Roadmap-Dokumentation.
  - `.github/workflows/` – CI/CD-Pipelines (`ci.yml`, `quality-gate.yml`, `release.yml`, `website-update.yml` etc.).
  - `project-context/` – Zusammengefasste Status- und Security-Reports.

- **Desktop-App (src/ + electron/)**:
  - **Electron Main** (`electron/main.cjs`):
    - Erzeugt `BrowserWindow` mit Renderer-Entry `dist/index.html`.
    - IPC-Handler:
      - Storage (`storage:load`/`storage:save`) via `jsonFileStorage.cjs` und `appData`/`userData`-Pfad.
      - Clip-Export (`clip-exporter:export`) via nativer `clipExporter.node.cjs`.
      - Window-Commands (`window:command`) für Focus/Minimize/Fullscreen.
      - Auto-Update-Steuerung (`updater:*`) via `electron-updater`.
    - Robustheitsmaßnahmen:
      - Strukturierte Logs (JSON) via `log()`-Funktion.
      - Fallback-HTML (`loadFatalRendererFallback`) bei Fehlern beim Laden von `dist/index.html`.
      - `uncaughtException` und `unhandledRejection`-Handler.
  - **Renderer-Bootstrap** (`src/main.tsx`):
    - Installiert Runtime-Guards (`installRuntimeProcessGuards()`).
    - Erstellt `IpcStorageBridge` (`src/storage/ipcStorageBridge.ts`) als `StoragePort` gegen Electron-IPC.
    - Baut den `RuntimeContainer` via `createAppModuleContainer(storage)` (`src/app/bootstrap.ts`).
    - Startet Runtime (`container.start()`), wrapped UI in `AppProvider` + `RuntimeErrorBoundary`.
  - **App-Container** (`src/app/bootstrap.ts`):
    - Komposition:
      - Event-Bus: `InMemoryEventBus` (`src/core/event-bus/inMemoryEventBus.ts`).
      - Trigger-Engine + Graph: `TriggerEngine`, `TriggerGraph` (`src/core/trigger-engine/*`).
      - Macro-Engine: `MacroEngine` (`src/core/macro-system/macroEngine.ts`).
      - Services:
        - `createObsService()` (`src/services/obs-service`).
        - `createSpotifyService()` (`src/services/spotify-service`).
        - `createClipService()` (`src/services/clip-service`).
        - `createTwitchService()` (`src/services/twitch-service`), inkl. HTTP-Transport-Konfiguration bei vorhandenen Twitch-Creds.
      - `createActionDispatcher()` (`src/app/actionDispatcher.ts`) – koppelt Macro-Steps an Trigger-Executor und Services.
      - App-Control: `AppController`/`HotkeyManager`/`WindowManager` (`src/core/app-control/*`).
      - Plugin-Registry: `createPluginRegistryWithDefaults()` (`src/plugins/*`).
    - Runtime-Management:
      - `createRuntimeActivation()` (`src/app/serviceActivation.ts`) für Activate/Deactivate, Service-State, Event-Bus-Konnektivität.
      - Persistenz: `loadOrSeedCoreData`, `persistCoreData`, `load/persistDesktopPreferences`, `load/persistRuntimeConfig` (`src/app/storageBridge.ts`).
      - Fehlerrobustheit beim Start (Rollback von fehlerhaften Runtimes, Reset von Präferenzen).
  - **Core-Domänen**:
    - Trigger-System:
      - `src/core/trigger-engine/triggerEngine.ts` – Verwaltung von Triggern, Subscribes auf Events, Condition-Evaluation, Action-Dispatch.
      - `src/core/trigger-engine/triggerGraph.ts` + `triggerGraphTypes.ts` – Graph-Modell der Trigger, Speicherung und Queries.
      - `src/core/trigger-engine/triggerExecutor.ts` – Ausführung von Trigger-Actions (Dispatch an Services/Plugins).
      - `src/core/trigger-engine/triggerConditions.ts` – Condition-Evaluierung.
      - `src/core/event-bus/*` – Event-Bus-Implementierung mit Topics (`EventTopics` in `src/types/*`).
    - Macro-System:
      - `src/core/macro-system/macroEngine.ts` – Lebenszyklus von Makros (Register, Update, Remove, Run).
      - `src/core/macro-system/macroRunner.ts` – rekursive Ausführung mit Depth-Guard und Standard-Schritten.
      - `src/core/macro-system/macroTypes.ts` – Typen, Invarianten, Fehlerklassen.
      - Makro-Ausführung integriert mit Trigger-Engine via `createActionDispatcher`.
    - Services:
      - OBS: `src/services/obs-service/*` – Contracts, Client, Actions (connect, setScene, etc.), InMemory- und HTTP-Tranports vorgesehen.
      - Spotify: `src/services/spotify-service/*` – Contracts, Client, Actions (play/pause/skip), HTTP-Transport vorgesehen.
      - Twitch: `src/services/twitch-service/*` – API-Client (Helix), Actions, Polling-basierte Events.
      - Clip: `src/services/clip-service/*` – ClipExporter-Port (Node, Browser, Shared-Contracts), `clipProcessor.ts`.
      - Shared: `src/services/shared/http.ts`, `reliability.ts` – HttpClient mit Retry/Timeout/Policies.
    - UI:
      - Seiten: `src/ui/pages/*.tsx` (Dashboard, TriggerEditor, MacroEditor, Plugins, Settings).
      - Layout: `src/ui/layout/MainLayout.tsx`, `Sidebar.tsx`, `Header.tsx`.
      - Komponenten: `src/ui/components/*` (TriggerCard, TriggerForm, MacroForm/MacroStepEditor, StatusBar, PanelCard, Button, UpdateNotification, ErrorBoundary).
      - Navigation & View-Model-Typen: `src/ui/navigation.tsx`, `src/ui/types.ts`.

- **Website (website/)**:
  - Vite-Konfiguration (`website/vite.config.ts`) mit React + Tailwind und `@`-Alias.
  - i18n-Plan (`website/docs/i18n-implementation-plan.md`), lokalisierte Ressourcen-JSONs unter `website/src/i18n/locales/{de,en}` (bereits vorhanden).
  - Auth/Access-Model-Architektur in `docs/WEBSITE_AUTH_V1.md`, `WEBSITE_BACKEND_AUTH_CONTRACT.md`, `WEBSITE_OWNER_ONLY_PRELAUNCH_SETUP.md`.
  - Komponentenseitig: Landing Page, Marketing-Sections, Login/Signup, Owner-Only-Access (Details in `docs/WEBSITE_*` und `website/src/pages/*`).

- **Tools & Hilfssysteme**:
  - `tools/exe-builder/` – eigenständige Electron-App zum lokalen Bauen/Packen von Desktop-Apps (`tools/exe-builder/package.json`, `src/ui/main.js`).
  - Skripte:
    - Release-Validierung: `scripts/release-orchestrator.ts`, `scripts/run-release.ts`.
    - Desktop-Artefakte: `scripts/collect-desktop-artifacts.mjs`, `scripts/test-artifact-collection.mjs`, `scripts/test-uninstaller-detection.mjs`, `scripts/test-installer.ps1`.
    - Website: `scripts/generate-website-content.ts`, `website/scripts/verify-prelaunch-security.mjs`.
    - Kontext/Audit: `scripts/generate-ai-context.ts`, `scripts/export-website-status.mjs`, diverse PDF/DOCX-Generierungsskripte.

### 3. Major Issues

**Priorität: kritisch**

1. **Nicht produktionsfertige Service-Transports (OBS/Spotify/Twitch/Clip)**  
   - **Dateien**: `src/app/bootstrap.ts`, `src/services/*`, `src/services/clip-service/clipProcessor.ts`.  
   - **Befund**:  
     - Alle Services werden in `createAppModuleContainer` aktuell ohne expliziten Transport konfiguriert; es existieren zwar HTTP-/API-Transports (z.B. `SpotifyHttpTransport`, `TwitchApiTransport`), diese sind aber nur teilweise verkabelt und benötigen zusätzliche Infrastruktur (z.B. HTTP-Proxy für OBS-WebSocket, OAuth für Spotify).  
     - `clipProcessor.ts` arbeitet mit Dummy-Daten und baut kein echtes Capture der letzten x Sekunden auf.  
   - **Auswirkung**:  
     - Der "Happy Path" der Desktop-App ist für Endnutzer in Bezug auf echte OBS-/Spotify-/Twitch-Integration noch nicht vollständig realisiert.  
   - **Priorität**: **kritisch** (funktionale Lücke gegenüber Produktversprechen).

2. **Makro-/Trigger-UX noch nicht produktionsreif**  
   - **Dateien**: `src/ui/components/TriggerForm.tsx`, `src/ui/components/MacroStepEditor.tsx`, `src/ui/components/MacroForm.tsx`.  
   - **Befund**:  
     - Conditions und Actions werden überwiegend als JSON-Text gepflegt (Textarea-basiert).  
     - Kein vollwertiger visueller Builder für Triggergraphen und Makro-Schritte (nur rudimentäre Formulare).  
   - **Auswirkung**:  
     - Für Nicht-Techniker ist die Konfiguration fehleranfällig und schwer zugänglich.  
   - **Priorität**: **kritisch** für UX, **mittel** technisch.

3. **Service-Integration semantisch teilweise unvollständig**  
   - **Dateien**: `src/services/spotify-service/spotifyActions.ts`, `src/services/obs-service/obsActions.ts`, `src/services/twitch-service/twitchActions.ts`, `src/services/clip-service/*`.  
   - **Befund**:  
     - Twitch setzt auf Polling statt auf echte EventSub/WebSocket-Events.  
     - Spotify-Connect/Disconnect bildet noch keinen vollständigen OAuth-Flow ab (Token-Management, Refresh).  
     - Clip-Service verlässt sich auf einen nativen Exporter, der zwar eingebunden, aber im Frontend nur über vereinfachte Dummy-Buffer getestet ist.  
   - **Auswirkung**:  
     - Semantik stimmt nicht 1:1 mit dem Marketing-Versprechen „nahtlos integrierte Services“ überein.  
   - **Priorität**: **kritisch** (für echtes Creator-Setup).

4. **Trigger-/Macro-Graph Persistenzfehler gefährden Datenintegrität bei Migrationen**  
   - **Dateien**: `src/app/storageBridge.ts`, `src/app/storageValidation.ts`, `src/app/readModel.ts`.  
   - **Befund**:  
     - Zod-basierte Validation ist vorhanden, aber Migrations- und Fallback-Wege hängen stark von der korrekten Pflege der Schemata ab.  
     - Fehler in den Schemas oder in eventuellen Migrations-Pipes führen zu stillem Seed-Fallback (Reset von Nutzerdaten).  
   - **Auswirkung**:  
     - Potenzieller Datenverlust bei schema-in-kompatiblen Updates.  
   - **Priorität**: **kritisch** (Datenintegrität).

**Priorität: hoch**

5. **Makro- und Trigger-Ausführung: Komplexität & Performance**  
   - **Dateien**: `src/core/macro-system/macroEngine.ts`, `src/core/macro-system/macroRunner.ts`, `src/core/trigger-engine/triggerEngine.ts`, `src/core/trigger-engine/triggerExecutor.ts`.  
   - **Befund**:  
     - Tief geschachtelte Makros mit `macro_call`, `parallel` und `sequence` werden rekursiv abgearbeitet; es gibt Depth-Limits, aber kein Budget-basiertes Guarding (z.B. Zeit/Steps).  
     - Trigger reagieren über Event-Bus auf Events und können bei vielen Registrierungen in enge Schleifen geraten.  
   - **Auswirkung**:  
     - Potenzielle Performance-Probleme bei großen Konfigurationen; schwer zu debuggen.  
   - **Priorität**: **hoch**.

6. **Desktop-UI: Teilweise leere/platzhalterartige Bereiche**  
   - **Dateien**: `src/ui/pages/Dashboard.tsx`, `src/ui/pages/Plugins.tsx`, `src/ui/components/PanelCard.tsx`, `src/ui/layout/MainLayout.tsx`.  
   - **Befund**:  
     - RightPanel-Contents sind teilweise noch generische Zähler/Placeholder.  
     - Plugins-Page ist read-only und zeigt primär das Example-Plugin.  
   - **Auswirkung**:  
     - Produkt wirkt unfertig / Preview-Status.  
   - **Priorität**: **hoch** (Produktreife & UX).

7. **Website-Marketingtexte nicht konsistent mit Produktstatus**  
   - **Dateien**: `website/src/pages/WebsiteLandingPage.tsx`, `website/src/components/MarketingBlocks.tsx`, `docs/website/product-website-plan.md`.  
   - **Befund**:  
     - Fokus teilweise mehr auf Repo/Architektur als auf Endnutzer-Mehrwert.  
     - Einzelne Claims implizieren vollwertige OBS-/Spotify-/Twitch-Integrationen, die im Code noch nicht vollständig umgesetzt sind.  
   - **Auswirkung**:  
     - Erwartungsmanagement gegenüber Alpha-Testern problematisch.  
   - **Priorität**: **hoch**.

8. **Abhängigkeit auf nativen Clip-Exporter ohne Fallback**  
   - **Dateien**: `electron/clipExporter.node.cjs`, `src/services/clip-service/clipExporter.node.ts`, `src/services/clip-service/clipExporter.shared.ts`.  
   - **Befund**:  
     - Produktion erwartet vorhandenen nativen Exporter; bei Fehlen oder ABI-Mismatch bricht die Clip-Funktion ohne UI-Fallback weg.  
   - **Auswirkung**:  
     - Instabile Clip-Funktion auf Systemen ohne korrekte Native-Builds.  
   - **Priorität**: **hoch**.

### 4. Code Quality Problems

**4.1 Dead Code / verwaiste Pfade**

- **Design-App**:  
  - `design/` inkl. eigenem Vite-Setup und Tailwind – explizit als „Make/Figma-Demo“ gedacht, nicht als aktiver Client. Kein direkter Schaden, aber erhöht Projektkomplexität.  
  - **Priorität**: **gering** – darf als separater Playground bleiben, sollte aber klarer als „nicht produktiv“ gekennzeichnet werden.

- **Tools-Overlap**:  
  - `tools/exe-builder/` ist unabhängig, aber im Root-Release-Pfad (`cleanup-plan.json`, `docs/ai-context/DEV_RUN_BUILD_RELEASE.md`) erwähnt. Kein echter Dead Code, aber ein weiteres Subsystem mit eigenem Lebenszyklus.  
  - **Priorität**: **mittel** – klarere Trennung bzw. eigenes Repo wäre langfristig hilfreich.

**4.2 Duplicate Logic**

- **Trigger- und Macro-Ausführung**:  
  - Parallele Konzepte von „Sequenzen“, „Bedingungen“ und „Parallelisierung“ existieren sowohl in Macro-Engine (`MacroStep`-Typen) als auch in Trigger-Engine (Conditions in `triggerConditions.ts`).  
  - Nicht direkt duplizierter Code, aber doppelte Modellierung von Kontrollfluss.  
  - **Priorität**: **mittel** – Refactoring denkbar, aber aktuell hinreichend gekapselt.

- **Release-Pipeline-Checks**:  
  - `scripts/release-orchestrator.ts` und `.github/workflows/release.yml` sowie `docs/devops/release-pipeline.md` beschreiben weitgehend dieselben Pipeline-Schritte (Typecheck, Tests, Audit, Website-Build, Artefakt-Validierung).  
  - Unterschied ist beabsichtigt (lokal vs. CI), aber Änderungen müssen an drei Stellen synchron gehalten werden.  
  - **Priorität**: **mittel** – potentiell fehleranfällig bei Anpassungen.

**4.3 Unused / Schwergewichtige Dependencies**

- **Root (`package.json`)**:
  - `chokidar` – wird aktuell nur in `scripts/feature-change-watcher.ts` verwendet (Watch auf Feature-Dateien). Das ist legitim, aber das Script ist optional.  
  - `electron-updater` – produktiv eingebunden in `electron/main.cjs`; Verwendung ist konsistent.
  - **Keine klar unbenutzte Dependency** im Root identifizierbar.

- **Website (`website/package.json`)**:  
  - Umfangreicher Radix-UI- und Motion-Stack (`@radix-ui/*`, `motion`, `cmdk`, `react-resizable-panels`, `react-dnd`, `recharts`, etc.).  
  - Auf Basis des i18n-Plans und der vorhandenen Komponenten ist davon auszugehen, dass nicht alle Libraries voll genutzt werden; genaue Code-Referenzierung wäre ein separater Task.  
  - **Priorität**: **mittel** – Optimierung der Bundle-Größe und Vereinfachung des Stacks angeraten, aber kein Blocker.

**4.4 Lesbarkeit und Struktur**

- **Positiv**:
  - Klare Trennung von Domänenschichten (`core/`, `services/`, `app/`, `ui/`, `storage/`, `runtime/`, `plugins/`).
  - Umfangreiche Typisierung mit klaren Ports/Interfaces (`src/types/*`, `src/types/ports.ts`).
  - Tests decken zentrale Pfade zuverlässig ab (`src/tests/*`).
  - Logging ist einheitlich strukturiert (`src/utils/logger.ts`, strukturierte JSON-Logs in `electron/main.cjs`).
- **Negativ / Verbesserbar**:
  - Teilweise sehr lange Dateien (z.B. `electron/main.cjs`, `scripts/collect-desktop-artifacts.mjs`) mit mehreren Verantwortlichkeiten; könnten stärker modularisiert werden.  
  - UI-Komponenten enthalten Stellen mit überladenen Props und Inline-Logik, v.a. `TriggerForm.tsx`, `MacroStepEditor.tsx` und `Dashboard.tsx`.  
  - **Priorität**: **mittel** – technische Schulden, aber kein akuter Blocker.

### 5. Runtime / Build Issues

- **Desktop Dev**:
  - Start-Skript: `"dev": "vite"` im Root (`package.json`), `index.html` lädt `src/main.tsx`.  
  - Electron Dev: kein dediziertes `electron:dev`-Script; Desktop-Development setzt aktuell auf Build+Start-Setup (Renderer via Vite-Dev-Server + manuelles Starten von `electron/main.cjs` wäre möglicher, aber nicht codierter Weg).  
  - `desktop:dev` aliasiert nur auf `npm run dev` (Renderer), kein automatischer Electron-Start.  
  - **Risiko**: Setup ist nicht „one command“ für Desktop-Dev, aber Build- und Prod-Pfade sind klar.

- **Desktop Build**:
  - `npm run desktop:build` → Renderer-Build via Vite + Installer/Portable via `electron-builder`.  
  - `electron/main.cjs` lädt `../dist/index.html` – konsistent mit `vite.config.ts` (`outDir: 'dist'`).  
  - Installer-Artefakte:
    - NSIS-Installer `TriggerHubSetup.exe` in `release/` (per `electron-builder`-Config in `package.json`).  
    - `scripts/collect-desktop-artifacts.mjs` kopiert in `dist/Setup.exe`, `dist/App.exe`, `dist/Uninstall.exe` etc., wie in `docs/windows-installer-complete-analysis.md` beschrieben.  
  - `scripts/test-installer.ps1` führt einen Smoke-Test (Silent Install, Start, Uninstall) auf Windows durch.  
  - **Einschätzung**: Build-Pipeline ist realistisch lauffähig und detailliert getestet.

- **Website Build**:
  - `website/package.json`:
    - `"prebuild": "node --env-file-if-exists=.env.local scripts/verify-prelaunch-security.mjs"` – Security-Gate (Access-Mode, Owner-Creds etc.).  
    - `"build": "vite build"` – standard SPA-Build.  
  - CI (`.github/workflows/quality-gate.yml`, Job `website-check`):
    - Setzt Dummy-Sicherheitswerte per Env-Variablen (keine Secrets im Code), läuft `tsc --project website/tsconfig.json` und `npm --prefix website run build`.  
  - **Einschätzung**: Website-Build ist sicherheitsgehärtet und CI-validiert; Reproduzierbarkeit ist hoch.

- **Release-Pipeline**:
  - `.github/workflows/release.yml`:
    - Validierungsjob (`validate`): Root+Website-Typecheck, Tests, Desktop-Artefakt-Tests, Dependency-Audit, Content-Sync, Release-Validation.  
    - Desktop-Build-Job (`build_desktop`): Windows-Build inkl. optionaler Code-Signing-Integration, Smoke-Test des Installers, Artefakt-Upload.  
    - Release-Publish (`publish_release`): Nutzt `softprops/action-gh-release@v2` und angehängte Artefakte.  
    - Website-Deploy (`deploy_website`): Optionaler Vercel-Deploy via Secret-Hook.  
  - Lokale Validierung:
    - `npm run release:validate` → `scripts/release-orchestrator.ts` (Content Sync, Quality Gates, Security Gate, Website-Build, Release-Vorbereitung).  
    - `npm run desktop:release` → `desktop:build` + `desktop:artifacts`.  
  - **Einschätzung**: End-to-end-Release ist realistisch möglich, erfordert aber:
    - Konfigurierte GitHub-Secrets (Code-Signing, Vercel).  
    - Pflege der Projekt-Metadaten (`releases/`, `project-meta/status/*`, `project-context/security-reports/*`).

### 6. Documentation Gaps

- **Positiv**:
  - `docs/CODEX_WORKING_CONTEXT.md` – sehr aktuelle, konsolidierte Projektbeschreibung (Stand 2026-03-17).  
  - `docs/PROJECT_SNAPSHOT.md`, `docs/DEV_STATUS.md` – klarer Snapshot zu Build-, Test- und Architektursituation.  
  - Spezifische Audits:
    - `docs/audits/obs-integration-gap-analysis.md` – OBS-Integrationslücken.  
    - `docs/audits/release-path-audit.md` – Release-Pfad-Analyse.  
    - `docs/audits/ipc-surface-audit.md` – IPC-Angriffsfläche.  
  - Security:
    - `project-context/security-reports/*` – Security-Review, Hardening-Plan, Rebuild-Input.  
  - Website:
    - `docs/WEBSITE_*` – Auth, Owner-Access, Routing, Profile.

- **Lücken / Widersprüche**:
  - Einige ältere Dokumente (z.B. frühe Architekturinventare, Roadmaps) sind vom aktuellen Stand überholt, werden aber bereits durch aktuellere Dokumente in `docs/ai-context/*` und `CODEX_WORKING_CONTEXT.md` korrigiert.  
  - Die Dokumentation zur Service-Integration (OBS/Spotify/Twitch) beschreibt teilweise einen Zielzustand, der im Code noch nicht umgesetzt ist:
    - Gilt insbesondere für echte OBS-WebSocket-Integration und Spotify-OAuth-Flows.  
  - Marketing-Dokumente und Website-Text stehen etwas optimistischer da als der tatsächliche Funktionsumfang in `src/services/*`.  
  - **Priorität**:  
    - **mittel** für technische Doku (großteils aktuell).  
    - **hoch** für öffentlich sichtbare Produkt-Claims (Website & Marketing).

### 7. Risks

**7.1 Kritische Bugs / Fehlerrisiken**

- **Datenmigration & Persistenz**:  
  - Fehlerhafte Schema-Änderungen oder Migrationsstrategien in `storageBridge.ts` und `storageValidation.ts` können zum Zurücksetzen von Trigger-/Macro-Konfigurationen führen.  
  - Risiko: **kritisch**, aber mitigiert durch Tests; erfordert dennoch disziplinierte Änderungen.

- **Service-Transports nicht final**:  
  - OBS/Spotify/Twitch/Clip sind architektonisch vorbereitet, aber produktionsreife End-to-End-Pfade fehlen (WebSocket, OAuth, EventSub, robustes Clip-Capturing).  
  - Risiko: **kritisch** für jede Form von „Produktiv“-Einsatz.

- **Makro-/Trigger-Rekursion & Performance**:  
  - Tief geschachtelte Makros + Trigger können trotz Depth-Limits zu langen Ausführungszeiten führen.  
  - Risiko: **hoch**, insbesondere bei komplexen Workflows.

**7.2 Architekturprobleme**

- **Verteilung der Verantwortlichkeiten in Main + Renderer**:  
  - Electron-Main (`electron/main.cjs`) ist relativ monolithisch (Update-Handling, Storage, Clip-Export, Window-Management).  
  - Renderer-seitig ist `App.tsx` Dreh- und Angelpunkt für State-Refresh, Navigation und Event-Subscription.  
  - Risiko: **mittel** – für zukünftige Erweiterungen/Refactors, aber derzeit beherrschbar.

- **Mehrere Clients im gleichen Repo** (`src/`, `website/`, `design/`, `tools/exe-builder/`):  
  - Erhöht mentale Last; `design/` und `tools/exe-builder/` sind nicht klar als „nicht Produkt“ abgekoppelt.  
  - Risiko: **mittel** – Verwechslungsgefahr und kompliziertere CI-Pfade.

**7.3 Skalierungsprobleme**

- **Große Trigger-/Macro-Mengen**:  
  - Aktuelle In-Memory-Strukturen (`Map`, Graph-Implementierung) sind nicht für Tausende von Triggern/Makros optimiert.  
  - Kein Persistenz-Backend mit Indexen (z.B. SQLite) eingebunden.  
  - Risiko: **mittel** – für typisches Creator-Setups vermutlich ok, für große Automationsbibliotheken limitierend.

- **Website-Stack**:  
  - Viele UI-Dependencies erhöhen Bundle-Größe und potenzielle Cold-Start-Latenzen auf schwächeren Devices.  
  - Risiko: **mittel** – Performance-Tuning früher oder später nötig.

**7.4 Security-Risiken**

- **Website-Security**:
  - Prebuild-Security-Guard (`website/scripts/verify-prelaunch-security.mjs`) stellt sicher, dass kritische Env-Variablen gesetzt sind und das Access-Model korrekt konfiguriert ist.  
  - Security-Reports in `project-context/security-reports/*` dokumentieren bekannten Stand und Hardening-Plan.  
  - Offene Punkte (z.B. Brute-Force-Protection jenseits Rate-Limits, Audit-Logging, CSP-Finetuning) bleiben bestehen, sind aber dokumentiert.  
  - Risiko: **mittel** – vor GA-Release explizit adressieren.

- **Electron-Surface**:
  - IPC-Surface-Audit (`docs/audits/ipc-surface-audit.md`) beschreibt, welche IPC-Kanäle offen sind; `preload.cjs` setzt einen relativ engen Bridge-Surface.  
  - Kein Node-Integration im Renderer, `contextIsolation: true`.  
  - Risiko: **niedrig** bis **mittel**, abhängig von zukünftigen IPC-Erweiterungen.

### 8. Quick Wins

- **Quick Win 1 – Website-Texte auf Ist-Stand bringen**  
  - **Pfad**: `website/src/pages/WebsiteLandingPage.tsx`, `website/src/components/MarketingBlocks.tsx`.  
  - **Maßnahme**: Claims auf „Closed Alpha“, „v0.1“, „OBS/Spotify/Twitch-Integration im Aufbau“ anpassen.  
  - **Impact**: reduziert Erwartungs-/Realitäts-Gap, schnell umsetzbar.

- **Quick Win 2 – Readme für Subsysteme ergänzen**  
  - **Pfad**: `tools/exe-builder/`, `design/`.  
  - **Maßnahme**: Kurze `README.md` in den Verzeichnissen, die Status („Demo“, „Experimental Tool“) klar stellt.  
  - **Impact**: senkt kognitive Last für neue Contributor und CI-Konfiguration.

- **Quick Win 3 – UI-Placeholder im RightPanel entfernen oder sinnvoll füllen**  
  - **Pfad**: `src/ui/pages/*.tsx`, `src/ui/components/PanelCard.tsx`.  
  - **Maßnahme**: RightPanel nur anzeigen, wenn es relevante Inhalte gibt (z.B. Logs, zuletzt ausgeführte Trigger/Macros, Service-Health).  
  - **Impact**: Desktop-UI wirkt deutlich reifer bei geringem Aufwand.

- **Quick Win 4 – Makro-/Trigger-Builder minimal verbessern**  
  - **Pfad**: `TriggerForm.tsx`, `MacroStepEditor.tsx`.  
  - **Maßnahme**:  
    - Hilfetexte/Validierung für JSON-Felder.  
    - Vorlagen für typische Aktionen (OBS-Szene wechseln, Spotify-Play/Pause, Twitch-Chat-Nachricht).  
  - **Impact**: bessere Nutzbarkeit ohne tiefen Architektureingriff.

### 9. Blocking Issues

- **B1 – Echte OBS-/Spotify-/Twitch-Integration**  
  - Produktversprechen setzt funktionierende, getestete End-to-End-Flows voraus (inkl. Auth, Reconnect, Fehlerbehandlung).  
  - Aktuell nur teilweise implementiert; darf nicht als „fertig“ vermarktet werden.

- **B2 – Clip-Capture-Implementierung**  
  - `clipProcessor.ts` und nativer Exporter müssen belastbar sein (Buffer, Dateisystemrechte, Fehlerhandling).  
  - Ohne das ist der Kerngedanke „Clip-Recording als Trigger-Aktion“ eingeschränkt.

- **B3 – Datenintegrität bei Updates/Migrationen**  
  - Jede Änderung an Trigger-/Macro-Schemata muss durchdacht migriert und getestet werden; sonst Datenverlust-Risiko.  
  - Release-Pipeline sollte Schema-Migrationen explizit prüfen (z.B. separate Migration-Tests).

- **B4 – Konsistenz von Code und öffentlicher Doku**  
  - Solange wesentliche Features (Service-Transports, vollwertiger Macro-/Trigger-Builder) nicht abgeschlossen sind, müssen Website, Marketing-Dokumente und Release-Notes diesen Status klar widerspiegeln.  
  - Sonst droht Fehlkommunikation gegenüber Testern/Stakeholdern.

