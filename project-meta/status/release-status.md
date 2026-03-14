# Release Status

## Zweck
Diese Datei beschreibt den aktuell belegten Release-Status des Repositories.

## Aktueller Stand (2026-03-13)
- `npm run test`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS (ausserhalb der Sandbox)
- `npm --prefix website run build`: PASS (ausserhalb der Sandbox)
- Keine aktiven Build-Blocker laut `project-meta/status/build-status.json` (Stand 2026-03-12).

## Vorhandene Bausteine
- `project-meta/status/build-status.json`
- `agents/project-context/active-tasks.md`
- `agents/project-context/known-issues.md`
- Root- und Website-Build-Pipelines im Repository
- Vollstaendige Storage-IPC-Verdrahtung

## Verbleibende Luecken
- `website/src/config/runtimeConfig.ts` erzwingt effektiv weiterhin nur `private_prelaunch`; Invite- und Public-Produktpfade sind vorbereitet, aber kein aktiver Runtime-Modus.
- Desktop-Persistenz ist zwar versioniert und migrierbar, aber nicht als extern versioniertes Oeffentlich-API dokumentiert.
- `deleteMacro()` in `src/app/facade.ts` greift per internem Cast auf `macroMap` zu.
- Desktop-Release-Artefakte (Windows NSIS x64 via `electron-builder`) und Hosting-Konfiguration wurden noch nicht im selben Pruefkontext bestaetigt.
- Build-Aussagen sind umgebungssensitiv: In der Sandbox schlagen Builds mit `spawn EPERM` fehl; ausserhalb der Sandbox erfolgreich.

## Nicht mehr als Blocker fuehren
- Fehlende PNG-Asset-Deklarationen und `ImportMeta.env`-Typisierung -> behoben; `npm run typecheck` PASS.
- Node.js-Imports im Browser-Bundle des Clip-Exports -> behoben; Root-Build PASS.
- Storage-IPC-Verdrahtung unverifiziert -> durch `ipc-storage-bridge.e2e.test.ts` und `storage.test.ts` belegt.
- Unversionierte Trigger-/Makro-Persistenz -> durch versionierte Collection-Envelopes mit Legacy-Migration ersetzt.

## Naechste Schritte
- Website-Access-Modelle ueber `private_prelaunch` hinaus nur mit belegtem Sicherheitsmodell aktivieren.
- Release-Status nach Desktop-Packaging-Verifikation auf Windows erneut aktualisieren.
