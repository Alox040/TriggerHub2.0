# Facade CRUD Completion

Stand: 2026-03-13

## Zielbild

Die App-Facade ist jetzt der konsistente Einstiegspunkt fuer Trigger- und Makro-CRUD in der Desktop-App:

- `create`
- `read` (listen und einzelne Eintraege)
- `update`
- `delete`

Persistenz wird nach mutierenden Operationen ueber denselben injizierten Persistenzpfad ausgeloest.

## Ergaenzte API

### App-Facade

In `src/app/facade.ts` und `src/types/ports.ts` wurden folgende Pfade ergaenzt:

- `listTriggers()`
- `getTrigger(triggerId)`
- `updateTrigger(trigger)`
- `listMacros()`
- `getMacro(macroId)`
- `updateMacro(macro)`

Create/Delete-Pfade bestanden bereits und bleiben erhalten.

### Trigger-Core

In `src/core/trigger-engine/` wurden ergaenzt:

- `TriggerGraph.getTrigger(...)`
- `TriggerGraph.updateTrigger(...)`
- `TriggerEngine.getTrigger(...)`
- `TriggerEngine.updateTrigger(...)`

Der Update-Pfad verschiebt Event-Subscriptions korrekt, wenn sich das Trigger-Event aendert.

### Macro-Core

In `src/core/macro-system/macroEngine.ts` wurden ergaenzt:

- `updateMacro(...)`
- bestehender Read-Pfad `getMacroById(...)` und `getAllMacros()` wird nun explizit auch ueber den Port genutzt

`updateMacro(...)` validiert wie `registerMacro(...)`, erhaelt aber `createdAt` und `lastRunAt`.

## Fehler- und Rueckgabeverhalten

- `create*` wirft bei invaliden oder doppelten IDs weiterhin die bestehenden Core-Fehler.
- `update*` wirft fuer unbekannte IDs einen Fehler mit `not registered`.
- `delete*` bleibt bewusst tolerant und ist fuer unbekannte IDs weiterhin kein harter Fehler.
- `read` liefert:
  - Listen als Arrays ohne interne Record-Metadaten
  - Einzelobjekte oder `undefined`

## Persistenzverhalten

- Jede mutierende Facade-Operation (`create`, `update`, `delete`) triggert `persist()`.
- Read-Operationen sind seiteneffektfrei.
- Die Persistenz bleibt bewusst in `bootstrap.ts` verdrahtet; die Facade kennt nur den Persistenz-Callback und keine Storage-Details.

## Bewusst nicht umgebaut

- `bootstrap.ts` registriert Seed-Daten und Runtime-Actions weiterhin direkt in der Runtime-Verdrahtung.
- `appFacade.getDashboardState()` bleibt als aggregierter Read-Path bestehen, obwohl nun zusaetzlich CRUD-spezifische Read-Methoden existieren.
- Direkte Core-Zugriffe ueber `container.triggerEngine` und `container.macroEngine` existieren weiterhin fuer interne oder Test-Zwecke. Diese Doppelwege sind dokumentiert, aber nicht groesser umgebaut.

## Tests

Abgesichert wurden insbesondere:

- Facade-Read- und Update-Flows fuer Trigger und Makros
- Persistenz nach Update-Operationen
- Trigger-Update mit Event-Wechsel und korrekter Subscription-Migration
- Macro-Update inkl. Fehlerfall fuer unbekannte IDs
