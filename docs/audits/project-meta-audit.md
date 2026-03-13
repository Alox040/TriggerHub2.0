# Project Meta Audit

Stand: 2026-03-13

## Was angepasst wurde

- `project-meta/features/clip-export.json`
  - Status von `implemented_with_issues` auf `implemented` gesetzt.
  - Veraltete Build-Blocker-Aussage entfernt, weil der Root-Build mit `npm run build` erfolgreich durchläuft.
  - Electron-IPC-Pfad (`electron/preload.cjs`, `electron/main.cjs`) und Service-Testbeleg ergänzt.
- `project-meta/features/storage.json`
  - Status von `partial` auf `implemented` gesetzt.
  - Frühere Unsicherheit zur Main-/Renderer-Verdrahtung entfernt, weil `electron/preload.cjs`, `electron/main.cjs` und `src/tests/ipc-storage-bridge.e2e.test.ts` einen funktionierenden IPC-Roundtrip belegen.
  - Persistenz beim Runtime-Start/-Stop aus `src/app/bootstrap.ts` als Source of Truth ergänzt.
- `project-meta/status/roadmap.json`
  - `updatedAt` auf `2026-03-13` aktualisiert.
  - `durable-automation-storage` von `planned` auf `completed` gesetzt, weil Persistenz und IPC-E2E-Test vorhanden sind.
- `project-meta/status/platform-support.json`
  - Für `macos` und `linux` explizite `sourceOfTruth` ergänzt, da im Packaging nur Windows konfiguriert ist.
  - Bei `website` `website/src/main.tsx` als zusätzlicher technischer Beleg ergänzt.

## Was noch unklar ist

- In `project-meta/features/` und `project-meta/integrations/` existieren zu mehreren Themen parallel `.json`- und `.md`-Dateien. Die JSON-Dateien sind strukturiert nutzbar; die Markdown-Dateien wirken teils als ergänzende Doku. Eine formale Führungsregel zwischen beiden Formaten ist im Repository nicht belegt.
- `project-meta/status/roadmap.json` enthält weiterhin Meta-/Dokumentationsarbeit (`source-of-truth-cleanup`, `metadata-completeness`). Diese Punkte sind als Repo-Arbeit erkennbar, aber ihr exakter Fortschritt lässt sich nicht allein aus Code oder Tests hart quantifizieren.
- Für die Website sind die Modi `invite_only` und `public_product` im Routing vorbereitet, in `website/src/config/runtimeConfig.ts` aber noch nicht aktiv auswählbar. Der Roadmap-Eintrag dazu bleibt deshalb geplant.
- `website/src/content/generated/roadmap.json` ist derzeit leer; das vorhandene Generatorskript schreibt aktuell `features`, `integrations`, `platform-support` und `changelog`, aber kein `roadmap.json`.

## Später automatisierbar

- `project-meta/features/*.json`
  - Felder wie `sourceOfTruth`, `status` und Listen belegbarer Fähigkeiten lassen sich teilweise aus Dateipräsenz, Exports und Testabdeckung ableiten.
- `project-meta/integrations/*.json`
  - Implementierte Integrationen lassen sich aus `src/services/*-service`, registrierten Actions in `src/app/bootstrap.ts` und passenden Tests ableiten.
- `project-meta/status/platform-support.json`
  - Windows/macOS/Linux-Support kann aus `package.json`-Buildtargets und vorhandenen Electron-Artefakten generiert werden.
- `project-meta/status/roadmap.json`
  - Technisch belastbare Teilmengen sollten aus offenen/verifizierten Statusdateien oder expliziten Check-Assertions generiert werden; freie Fortschrittsangaben bleiben sonst manuell und interpretationsanfällig.
- `website/src/content/generated/*`
  - Der bestehende Generator deckt bereits Teile davon ab. `roadmap.json` sollte nur dann mitgeneriert werden, wenn eine eindeutige, strukturierte Quelle im Repository festgelegt ist.
