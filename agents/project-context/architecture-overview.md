# Architecture Overview

## Dokumentationsabgleich
Stand: 2026-03-13

### Veraltete oder falsche Aussagen im vorherigen Stand
- `deleteMacro()` in `src/app/facade.ts` wurde als offenes Architekturproblem mit internem `macroMap`-Zugriff beschrieben. Das ist im aktuellen Code nicht mehr der Fall.
- Die Build-Aussagen wurden mit frueheren manuellen Laeufen vom 2026-03-13 begruendet. Der direkt gepruefte, versionierte Nachweis liegt aktuell in `project-meta/status/build-status.json` mit `updatedAt: 2026-03-12`.
- Die Desktop-Praesentationsschicht wurde zu generisch beschrieben. Tatsachlich existiert bereits eine React-UI mit `App.tsx`, `main.tsx`, `AppContext` und `src/ui/`.

### Fehlende Informationen im vorherigen Stand
- `src/app/bootstrap.ts` laedt `runtime-config` aus Storage, seeded Default-Daten und persistiert Trigger/Makros ueber den uebergebenen `StoragePort`.
- Das Desktop-UI ist bereits an `TriggerHubAppFacade` und `eventBus` angebunden; funktional ist aber nur `DashboardPage` verdrahtet.
- `src/app/bootstrap.ts` setzt Service-State-Flags fuer `obs`, `spotify` und `clip` beim Start und zurueck beim Stop.
- Die aktuelle Testsuite deckt neben Domain- und Website-Pfaden auch Storage-E2E, Runtime-Hardening und React-UI-Grundpfade ab.

## Korrigierte Fassung

## Kanonische Nachweise
- Aktueller Code in `src/`, `electron/`, `website/`, `scripts/`
- Verifizierende Tests in `src/tests/` mit 19 Testdateien
- Strukturierte Status- und Release-Metadaten in `project-meta/status/`
- Aktuell direkt belegbarer Gate-Status aus `project-meta/status/build-status.json`:
  - `updatedAt`: `2026-03-12`
  - `test`: `pass`
  - `typecheck`: `pass`
  - `rootBuild`: `pass`
  - `websiteBuild`: `pass`
  - `audit`: `pass`

## Hauptsysteme
- Desktop-App: React-Renderer in `src/`, gestartet ueber `src/main.tsx`, eingebettet in eine Electron-Shell unter `electron/`.
- Website: separates Vite/React-Projekt in `website/` mit UI in `website/src/` und serverlosen API-Endpunkten in `website/api/`.
- Agentensystem: operative Agenten- und Kontextstruktur in `agents/`.
- Prozess- und Statusdokumentation: operative Doku in `docs/`, strukturierte Statusdaten in `project-meta/`.

## Zentrale Einstiegspfade
- Desktop Composition Root: `src/app/bootstrap.ts`
- Desktop Renderer Entry: `src/main.tsx`
- Desktop Root Component: `src/App.tsx`
- Desktop React Context / Facade Access: `src/app/AppContext.tsx`
- Electron Main / Preload: `electron/main.cjs`, `electron/preload.cjs`
- Desktop UI Layer: `src/ui/`
- Automation Core: `src/core/`
- Services: `src/services/`
- Persistence Bridge: `src/storage/`
- Website Entry: `website/src/App.tsx`
- Website Routing und Guards: `website/src/app/routing/`, `website/src/modules/access-control/`

## Architektur-Layer
- Shell Layer:
  - Electron erstellt das Fenster und stellt im Main-/Preload-Paar die Storage-IPC bereit.
- Runtime Composition Layer:
  - `src/app/bootstrap.ts` verdrahtet `InMemoryEventBus`, `TriggerEngine`, `TriggerGraph`, `TriggerExecutor`, `MacroEngine`, OBS-, Spotify- und Clip-Service, `PluginRegistry`, `AppController` und `TriggerHubAppFacade`.
- Domain Layer:
  - `src/core/event-bus/`
  - `src/core/trigger-engine/`
  - `src/core/macro-system/`
  - `src/core/app-control/`
- Integration Layer:
  - `src/services/` fuer OBS, Spotify und Clip
  - `src/plugins/` fuer Plugin-Lifecycle und Standard-Plugin
- Persistence Layer:
  - `src/storage/ipcStorageBridge.ts` spricht ueber `window.triggerHubElectron.storage` mit Electron.
  - `bootstrap.ts` persistiert Trigger und Makros ueber einen `StoragePort`.
- Presentation Layer:
  - Desktop: React-UI in `src/App.tsx` und `src/ui/`
  - Website: separates React-Frontend in `website/src/`

## Desktop Runtime im aktuellen Code
- `createAppModuleContainer(storage?)` erstellt die Runtime und liefert `start()` und `stop()`.
- `start()` fuehrt in dieser Reihenfolge aus:
  1. optional `runtime-config` aus Storage laden
  2. Trigger/Makros aus Storage laden oder Default-Daten seeden
  3. seeded Fallback bei vorhandenem Storage direkt persistieren
  4. `appController.start()`
  5. `obsService.connect()`
  6. `spotifyService.play()`
  7. `clipService.startCapture()`
  8. Service-State-Flags auf `true` setzen
  9. Plugins aktivieren
- `stop()` fuehrt in dieser Reihenfolge aus:
  1. Trigger/Makros persistieren
  2. `triggerEngine.destroy()`
  3. Plugins deaktivieren
  4. `obsService.disconnect()`
  5. `spotifyService.pause()`
  6. `appController.stop()`
  7. Service-State-Flags auf `false` setzen

## Desktop UI im aktuellen Code
- `src/main.tsx` erstellt den Container, startet ihn und rendert `App` innerhalb von `AppProvider` und `RuntimeErrorBoundary`.
- `src/App.tsx` laedt `appFacade.getDashboardState()`, subscribed auf `TRIGGER_EXECUTED` und `MACRO_COMPLETED` und rendert aktuell nur `DashboardPage`.
- `src/ui/pages/Dashboard.tsx` ist der einzige funktional angebundene Screen.
- `src/ui/pages/Editor.tsx`, `src/ui/pages/Plugins.tsx` und `src/ui/pages/Settings.tsx` sind derzeit nur Skeletons.

## Testabdeckung mit Architekturbezug
- Container und Facade:
  - `app-container.test.ts`
  - `app-facade.test.ts`
- Domain:
  - `core-trigger.test.ts`
  - `core-macro.test.ts`
  - `trigger-graph.test.ts`
  - `trigger-executor.test.ts`
  - `event-bus.test.ts`
- Integrationen:
  - `services.test.ts`
  - `plugins.test.ts`
  - `storage.test.ts`
  - `ipc-storage-bridge.e2e.test.ts`
  - `runtime-hardening.test.ts`
- React/UI:
  - `app-context.test.tsx`
  - `ui-dashboard.test.tsx`
- Website:
  - `website-auth-v1.test.ts`
  - `website-browser-guards.test.ts`
  - `website-owner-only-access.test.ts`
  - `website-prelaunch-gate.test.ts`
  - `website-profile-v1.test.ts`

## Belastbare Risiken und Grenzen
- `website/src/config/runtimeConfig.ts` ist weiterhin effektiv auf `private_prelaunch` beschraenkt.
- Storage-Payloads fuer Trigger und Makros werden nur oberflaechlich validiert; ungueltige Eintraege werden beim Laden uebersprungen oder fuehren zum Seed-Fallback.
- `project-meta/status/release-status.json` beschreibt Konfiguration, nicht live verifizierte Releases.
- Das Desktop-UI ist vorhanden, aber fuer Alpha noch nicht vollstaendig: echte Listen-/Editor-Screens fuer Trigger und Makros fehlen.
