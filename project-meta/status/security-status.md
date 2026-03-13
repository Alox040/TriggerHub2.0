# Security Status

## Zweck
Diese Datei fasst den aktuell belegten Sicherheits- und Zugriffskontext in grober Form zusammen.

## Aktueller Stand
- Die Electron-Shell haertet laut Architekturuebersicht `webPreferences` und stellt IPC fuer Clip-Export und JSON-Speicherung bereit.
- Die Website besitzt Auth- und Gate-Bausteine sowie einen Prebuild-Check `website/scripts/verify-prelaunch-security.mjs`.
- `npm audit` gilt laut verifiziertem Projektstand vom 2026-03-12 als bestanden.
- Der IPC-Storage-Kanal wurde am 2026-03-12 erneut geprueft; die fruehere Traversal-Sorge aus `SEC-007` in `docs/security/security-audit-phase2.md` ist fuer den aktuellen Code-Stand als behoben verifiziert.

## Vorhandene Bausteine
- `electron/main.cjs`
- `electron/preload.cjs`
- `website/src/modules/auth/`
- `website/api/auth/`
- `website/api/prelaunch-gate/`
- `website/scripts/verify-prelaunch-security.mjs`

## Verifizierte Ergebnisse
- `electron/main.cjs` validiert Storage-Keys vor der Pfadableitung mit einer Allowlist und blockiert damit `../`, `..\\`, Laufwerksangaben und sonstige Separatoren. Audit-Referenz: `SEC-007` in `docs/security/security-audit-phase2.md`.
- `electron/preload.cjs` exponiert nur die minimalen Storage-Methoden `load` und `save`; der Renderer erhaelt keinen direkten Dateisystemzugriff. Audit-Referenz: `SEC-007` in `docs/security/security-audit-phase2.md`.
- `src/storage/ipcStorageBridge.ts` ist nur eine duenne Renderer-Bridge und erzeugt selbst keine Dateipfade.
- Der Roundtrip ueber den echten Electron-Prozess ist durch `src/tests/ipc-storage-bridge.e2e.test.ts` verifiziert.

## Restrisiken
- Die IPC-Bridge schuetzt gegen Pfad-Traversal, aber nicht gegen inhaltlich boesartige Daten in erlaubten Keys wie `triggers`, `macros` oder `runtime-config`. Referenz: Folge-Risiko nach `SEC-007` in `docs/security/security-phase2-1.md`.
- Die Storage-Payloads werden noch nicht per Schema validiert, bevor sie persistiert oder spaeter wieder verarbeitet werden.
- Die Website-Runtime ist weiterhin auf `private_prelaunch` verengt, obwohl weitere Modi im Routing vorbereitet sind.
- Die verteilten Auth-Restrisiken aus `SEC-004` bleiben offen: In-Memory-Rate-Limiting und fehlende JWT-Revocation ueber mehrere Instanzen. Referenz: `docs/security/security-audit-phase2.md`.

## Naechste Schritte
- Bei neuen IPC-Kanaelen Main-Process-Validierung als Pflichtregel beibehalten und in Reviews explizit gegen `SEC-007` spiegeln.
- Fuer Storage-Payloads optionale Schema-Validierung oder Normalisierung vor Persistenz ergaenzen.
- Security-relevante Dokumentation nur aus verifizierten Quellen weiter verdichten.
- Website-Zugriffsmodell und seine Schutzannahmen nach Implementierungsstand erneut pruefen.
