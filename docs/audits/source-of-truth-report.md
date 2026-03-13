# Source-of-Truth Consolidation Report

Stand: 2026-03-12

## Regelhierarchie
1. Code und Tests sind primär
2. `project-meta/` ist sekundär
3. Snapshot-, Übergabe- und Kontextdokumente sind tertiär

## Geprüfte Zieldateien
- `agents/project-context/active-tasks.md`
- `agents/project-context/architecture-overview.md`
- `agents/project-context/known-issues.md`
- `docs/DEV_STATUS.md`

## Gefundene Widersprüche und Korrekturen

| Bereich | Vorheriger Widerspruch | Primäre Evidenz | Korrektur |
|---|---|---|---|
| Root-Typecheck | Mehrere Dateien führten `npm run typecheck` noch als FAIL mit PNG-/`ImportMeta.env`-Blockern | `npm run typecheck` lief am 2026-03-12 erfolgreich | FAIL-Aussagen entfernt und auf PASS aktualisiert |
| Root-Build | Mehrere Dateien führten `npm run build` noch als FAIL wegen Clip-Exporter-Boundary | `npm run build` lief am 2026-03-12 außerhalb der Sandbox erfolgreich | alten Build-Blocker als nicht mehr offen markiert |
| Storage-IPC | Kontextdateien beschrieben die Main-/Renderer-IPC noch als unbestätigt | `electron/main.cjs`, `electron/preload.cjs`, `src/tests/ipc-storage-bridge.e2e.test.ts` | IPC nicht mehr als offene Grundsatzlücke geführt |
| Entwicklungsstatus | `docs/DEV_STATUS.md` bewertete die lokalen Qualitätsgates als rot | lokale Verifikation: Tests, Typecheck, Root-Build, Website-Build grün | Datei auf aktuellen Prüfstand und Sandbox-Hinweis umgestellt |
| Task-Priorisierung | `active-tasks.md` priorisierte weiter die Reparatur bereits behobener Gates | aktueller Code- und Buildstand | Fokus auf Doku-Drift, Access-Mode-Erweiterung und Generator-Korrektur verschoben |
| Architekturübersicht | `architecture-overview.md` enthielt veraltete Release-Blocker | lokaler Prüfstand plus aktueller Runtime- und Website-Code | Build- und Test-Abschnitt auf aktuellen Stand gebracht |
| Known Issues | `known-issues.md` listete bereits geschlossene Probleme als offen | Code, Tests, lokale Builds | offene Liste auf reale Restrisiken reduziert |

## Sekundäre Wahrheiten mit Konflikten
- `project-meta/features/storage.json` behauptet weiter eine nicht verifizierte Main-/Renderer-Verdrahtung.
- `project-meta/features/desktop-runtime.md` nennt weiter einen Root-Build-Blocker und offene IPC-Verifikation.
- `project-meta/features/website-platform.md` nennt weiter frühere Typecheck-Probleme.
- `project-meta/status/alpha-readiness.md` und `project-meta/status/release-status.md` führen weiter veraltete FAIL-Aussagen.

Diese Dateien wurden in diesem Schritt nicht geändert, aber die Widersprüche sind jetzt in den primären Kontextdateien sichtbar gemacht.

## Aktuell belastbare offene Punkte nach Konsolidierung
- `website/src/config/runtimeConfig.ts` unterstützt effektiv weiter nur `private_prelaunch`.
- Invite- und Public-Produktpfade sind im Routing vorbereitet, aber nicht als belegter Runtime-Modus aktiviert.
- Storage-Payloads sind pfadseitig gehärtet, aber noch nicht schema-validiert.
- `src/app/facade.ts` greift für `deleteMacro()` weiter intern auf `macroMap` zu.
- Generatorgestützte Snapshot-Dokumente können weiterhin veraltete Aussagen reproduzieren.

## Getroffene Korrekturen
- Veraltete FAIL-Aussagen zu Root-Typecheck und Root-Build entfernt.
- Veraltete Aussage zur unbestätigten Storage-IPC entfernt.
- Sandbox-`spawn EPERM` klar als Umgebungsgrenze statt Codefehler markiert.
- Offene Punkte auf reale, im aktuellen Codezustand belegte Risiken reduziert.
- Die Source-of-Truth-Hierarchie explizit in den Kontextdateien verankert.
