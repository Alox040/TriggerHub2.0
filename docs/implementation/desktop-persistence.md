# Desktop Persistence

Stand: 2026-03-13

## Ist-Zustand

- Trigger und Makros werden in `src/app/bootstrap.ts` beim Runtime-Start geladen.
- Die Persistenz läuft über `StoragePort` und damit über `src/storage/` abstrahiert.
- In Electron führt `src/storage/ipcStorageBridge.ts` auf `window.triggerHubElectron.storage`, das in `electron/preload.cjs` exponiert und in `electron/main.cjs` auf JSON-Dateien verdrahtet wird.
- Vor dieser Anpassung hatte die Facade zwei Schwächen:
  - sie speicherte immer auf den festen Keys `triggers` und `macros`, selbst wenn `runtime-config` andere Storage-Keys vorgab
  - sie löschte Makros über einen direkten Zugriff auf die interne `macroMap` statt über eine Core-API

## Umgesetzte Änderungen

- `src/app/bootstrap.ts`
  - gemeinsamer Helper `persistCoreData(...)` für konsistentes Speichern von Triggern und Makros ergänzt
  - `loadOrSeedCoreData(...)` so angepasst, dass Seed-Daten nur noch als Fallback verwendet werden
  - Seed-Fallback wird bei vorhandenem Storage direkt nach dem Seeding gespeichert, damit der nächste Start denselben Zustand wieder laden kann
  - explizit persistierte leere Arrays gelten als gültiger Zustand und lösen kein Reseeding aus
  - unbrauchbare Persistenz-Payloads ohne nutzbare Arrays führen auf den Fallback-Seed
- `src/app/facade.ts`
  - Persistenz läuft jetzt über eine injizierte Callback-Schnittstelle statt über hart codierte Storage-Keys
  - `deleteMacro(...)` nutzt jetzt eine offizielle Engine-Methode statt interner State-Manipulation
- `src/core/macro-system/macroEngine.ts`
  - `removeMacro(...)` als kleine, direkte Ergänzung der bestehenden Engine-API eingeführt
- `src/types/ports.ts`
  - `MacroEnginePort` um `removeMacro(...)` ergänzt

## Laufzeitfluss

1. Runtime liest optional `runtime-config`.
2. Trigger und Makros werden über die konfigurierten Storage-Keys geladen.
3. Wenn nutzbare persistierte Arrays vorhanden sind, werden sie registriert.
4. Wenn keine nutzbare Persistenz vorhanden ist, werden Seed-Daten als Fallback registriert.
5. Bei vorhandenem Storage wird der Fallback-Seed sofort persistiert.
6. Mutationen über die Facade speichern Trigger und Makros immer zusammen über denselben Persistenzpfad.
7. Beim Stop speichert die Runtime den aktuellen Zustand erneut, bevor Services heruntergefahren werden.

## Tests

Ergänzt bzw. abgesichert wurden folgende Fälle:

- Seed-Daten werden bei leerem Storage direkt nach `start()` persistiert.
- Facade-Mutationen respektieren konfigurierbare Storage-Keys aus `runtime-config`.
- Explizit persistierte leere Arrays lösen kein Reseeding aus.
- Unbrauchbare Persistenz-Payloads fallen auf Seed-Daten zurück.
- Die Facade persistiert Änderungen über den injizierten Persistenz-Callback und löscht Makros ohne direkten Zugriff auf Engine-Interna.
