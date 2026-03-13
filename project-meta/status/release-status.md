# Release Status

## Zweck
Diese Datei beschreibt den aktuell belegten Release-Status des Repositories.

## Aktueller Stand (2026-03-13)
- `npm run test`: **PASS**
- `npm run typecheck`: **PASS**
- `npm run build`: **PASS** (außerhalb der Sandbox)
- `npm --prefix website run build`: **PASS** (außerhalb der Sandbox)
- Keine aktiven Build-Blocker laut `project-meta/status/build-status.json` (Stand 2026-03-12).

## Vorhandene Bausteine
- `project-meta/status/build-status.json`
- `agents/project-context/active-tasks.md`
- `agents/project-context/known-issues.md`
- Root- und Website-Build-Pipelines im Repository
- Vollständige Storage-IPC-Verdrahtung (verifiziert durch `ipc-storage-bridge.e2e.test.ts` und `storage.test.ts`)

## Verbleibende Lücken (kein Build-Blocker, aber offen)
- `website/src/config/runtimeConfig.ts` erzwingt effektiv weiterhin nur `private_prelaunch`; Invite- und Public-Produktpfade sind vorbereitet, aber kein aktiver Runtime-Modus.
- Storage-Payloads werden noch nicht schema-basiert validiert (nur Array-Shape-Check beim Laden).
- `deleteMacro()` in `src/app/facade.ts` greift per internem Cast auf `macroMap` zu.
- Desktop-Release-Artefakte (Windows NSIS x64 via `electron-builder`) und Hosting-Konfiguration wurden noch nicht im selben Prüfkontext bestätigt.
- Build-Aussagen sind umgebungssensitiv: In der Sandbox schlagen Builds mit `spawn EPERM` fehl; außerhalb der Sandbox erfolgreich.

## Nicht mehr als Blocker führen
- ~~Fehlende PNG-Asset-Deklarationen und `ImportMeta.env`-Typisierung~~ → behoben; `npm run typecheck` PASS.
- ~~Node.js-Imports im Browser-Bundle des Clip-Exports~~ → Clip-Service-Boundary aufgeteilt (`clipExporter.browser.ts`, `clipExporter.node.ts`); Root-Build PASS.
- ~~Storage-IPC-Verdrahtung unverifiziert~~ → durch `ipc-storage-bridge.e2e.test.ts` und `storage.test.ts` vollständig belegt.

## Nächste Schritte
- Website-Access-Modelle über `private_prelaunch` hinaus betriebsfähig machen.
- Storage-Payload-Validierung schema-basiert nachrüsten.
- Release-Status nach Desktop-Packaging-Verifikation auf Windows erneut aktualisieren.
