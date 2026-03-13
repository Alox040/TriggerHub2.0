# Development Status Report

## Dokumentationsabgleich
Stand: 2026-03-13

### Veraltete oder falsche Aussagen im vorherigen Stand
- Build- und Typecheck-Status wurden als aktuelle Laufzeitverifikation vom 2026-03-13 formuliert. Der direkt versionierte Nachweis im Repository ist `project-meta/status/build-status.json` mit `updatedAt: 2026-03-12`.
- `deleteMacro()` wurde indirekt noch als offene technische Baustelle transportiert. Im aktuellen Code ist dieser Punkt behoben.
- Der vorhandene Stand der Desktop-UI war unterbelichtet; die React-Schicht existiert bereits, ist aber noch nicht komplett.

### Fehlende Informationen im vorherigen Stand
- `src/app/bootstrap.ts` seeded Default-Daten, laedt optional `runtime-config` und persistiert Trigger/Makros ueber den `StoragePort`.
- `storage.test.ts` deckt Seed-, Reload-, CRUD- und Storage-Key-Pfade ab.
- `runtime-hardening.test.ts` deckt strukturierte Logs, Laufzeitmetriken und Plugin-Fehlerisolation ab.
- Die aktuelle Desktop-UI ist auf ein verdrahtetes Dashboard plus Skeleton-Pages begrenzt.

## Korrigierte Fassung

## Statusbasis
- Primaer: Code und Tests
- Sekundaer: `project-meta/status/`
- Tertiaer: Snapshot- und Handoff-Dokumente

## Aktuell direkt belegbarer Stand
- `project-meta/status/build-status.json`
  - `updatedAt: 2026-03-12`
  - `test: pass`
  - `typecheck: pass`
  - `rootBuild: pass`
  - `websiteBuild: pass`
  - `audit: pass`
- `project-meta/status/release-status.md`
  - Release- und Deployment-Pfade sind dokumentiert bzw. konfiguriert, aber nicht als live verifiziert ausgewiesen.
- `project-meta/status/alpha-readiness.md`
  - bewertet die technische Basis als fortgeschritten, laesst aber offene Punkte bei Website-Access-Modi, Payload-Validierung und Release-Nachweisen stehen.

## Code- und Teststand
- `src/app/bootstrap.ts` verdrahtet Event-Bus, Trigger-Engine, Macro-Engine, OBS-, Spotify- und Clip-Service, Plugin-Registry, App-Controller und `TriggerHubAppFacade`.
- `src/app/bootstrap.ts` seeded Default-Kerndaten, wenn keine nutzbare Persistenz vorhanden ist.
- `src/app/bootstrap.ts` persistiert Trigger und Makros bei vorhandenem Storage.
- `src/main.tsx` und `src/App.tsx` bilden eine bestehende Desktop-React-App.
- `src/App.tsx` rendert aktuell nur das Dashboard; weitere Pages unter `src/ui/pages/` sind Skeletons.
- `src/tests/` enthaelt 19 Testdateien plus eine `README.md`.

## Wichtige Testschwerpunkte
- Runtime und Composition:
  - `app-container.test.ts`
  - `app-facade.test.ts`
  - `storage.test.ts`
  - `runtime-hardening.test.ts`
  - `ipc-storage-bridge.e2e.test.ts`
- Desktop UI:
  - `app-context.test.tsx`
  - `ui-dashboard.test.tsx`
- Domain:
  - Trigger-, Macro-, Graph-, Executor- und Event-Bus-Tests
- Website:
  - Auth, Owner-only Access, Browser Guards, Prelaunch Gate und Profile

## Belastbare offene Punkte
- `website/src/config/runtimeConfig.ts` verengt die Website-Runtime weiterhin effektiv auf `private_prelaunch`.
- Die Website besitzt weiterhin kein belegtes Invite- oder Public-Produkt-Laufzeitmodell.
- Storage-Payloads werden noch nicht schema-basiert validiert.
- Die Desktop-UI ist fuer Closed Alpha noch nicht vollstaendig; Trigger-/Macro-Management-Screens fehlen.
- Mehrere Snapshot- und Kontextdokumente muessen weiter gegen Drift gepflegt werden.

## Einordnung der Entwicklungsreife
- Technische Basis: belastbar
- Verifizierte Gates im Repository: gruen laut `project-meta/status/build-status.json`
- Dokumentationskonsistenz: verbessert, aber weiter pflegebeduerftig
- Release-Reife: vorsichtig formulieren, bis Packaging- und Deployment-Nachweise im selben Pruefkontext vorliegen
