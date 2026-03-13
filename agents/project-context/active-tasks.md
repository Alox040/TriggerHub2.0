# Active Tasks

## Dokumentationsabgleich
Stand: 2026-03-13

### Veraltete oder falsche Aussagen im vorherigen Stand
- `deleteMacro()` in `src/app/facade.ts` wurde als interner `macroMap`-Zugriff beschrieben. Der aktuelle Code ruft `macroEngine.removeMacro(macroId)` auf.
- "Verifizierter Status" mischte Dateistand und fruehere manuelle Laufzeitverifikation. Aus den aktuell geprueften Repository-Dateien ist belastbar vor allem `project-meta/status/build-status.json` mit `updatedAt: 2026-03-12`.

### Fehlende Informationen im vorherigen Stand
- Die Desktop-React-UI existiert bereits in `src/App.tsx`, `src/main.tsx` und `src/ui/`, ist aber funktional im Wesentlichen auf `DashboardPage` begrenzt; `EditorPage`, `PluginsPage` und `SettingsPage` sind nur Skeletons.
- `src/app/bootstrap.ts` seeded Default-Daten, laedt optional `runtime-config` aus Storage und persistiert Trigger/Makros bei Storage-Nutzung.
- Die Testsuite umfasst 19 echte Testdateien in `src/tests/`; zusaetzlich liegt dort `README.md`, die keine Testdatei ist.
- Die neuen Storage-/Runtime-Tests decken Seed-, Reload-, CRUD-, Runtime-Metrik- und IPC-E2E-Pfade ab.

## Korrigierte Fassung

## Source-of-Truth-Regel
- Primaer: ausfuehrbarer Code und verifizierende Tests
- Sekundaer: `project-meta/`
- Tertiaer: Snapshot-, Handoff- und Kontextdokumente

## Aktuelle Phasen

### Phase 1: Kontext- und Statusdokumente an Repository-Stand anpassen
Status: in progress
- `agents/project-context/` gegen `src/app/bootstrap.ts`, `src/tests/` und `project-meta/status/` synchron halten.
- Nachweisbare Drift in `docs/DEV_STATUS.md` und Snapshot-Dateien sichtbar korrigieren.
- Widersprueche zwischen Code, Tests, `project-meta/` und Doku dokumentieren statt ueberdecken.

### Phase 2: Website-Access-Modelle ueber `private_prelaunch` hinaus verifizieren
Status: planned
- `website/src/config/runtimeConfig.ts` ist laut bestehender Tests und Doku weiterhin effektiv auf `private_prelaunch` fixiert.
- Bereits modellierte Modi `invite_only` und `public_product` muessen in Runtime, Tests und Doku wieder zusammengefuehrt werden.

### Phase 3: Generatoren und Snapshot-Quellen entdriften
Status: in progress
- `scripts/context-sync.ts` und `scripts/generate-ai-context.ts` duerfen keine Aussagen ueber Code und Tests stellen, die vom aktuellen Repository-Stand abweichen.
- Generierte Artefakte in `docs/` und `website/src/content/generated/` nur aus aktuellen, belastbaren Quellen ableiten.

## Priorisierte Arbeitspakete
- Hoechste Prioritaet: operative Kontextdateien konsistent mit Code, Tests und `project-meta/` halten.
- Hoch: Website-Access-Mode-Erweiterung abschliessen; Routing und Policies sind weiter als die aktive Runtime.
- Hoch: Generatorgestuetzte Kontextartefakte (`docs/DEV_STATUS.md`, `docs/AI_CONTEXT_PACK.json`, `docs/project-context-snapshot.json`, `docs/ai-context/*`) gegen Drift absichern.
- Mittel: Storage-Payloads fuer Trigger, Makros und Runtime-Config inhaltlich staerker validieren; aktuell werden nur Teil-Shapes defensiv behandelt.
- Mittel: Bestehende Desktop-UI von einem Dashboard plus Skeleton-Pages zu einer belastbaren Alpha-Navigation erweitern.
- Mittel: Release-Aussagen nur mit verifizierten Artefakten und belastbarer Deployment-Konfiguration hochstufen.

## Verifizierter Repository-Stand
- `project-meta/status/build-status.json` meldet mit `updatedAt: 2026-03-12` alle Gates auf `pass` fuer `test`, `typecheck`, `rootBuild`, `websiteBuild` und `audit`.
- `project-meta/status/release-status.md` fuehrt den Release-Status als konfiguriert, aber nicht als live verifiziertes Release.
- `src/app/bootstrap.ts` verdrahtet Event-Bus, Trigger-Engine, Macro-Engine, OBS-, Spotify- und Clip-Service, Plugin-Registry und `TriggerHubAppFacade`.
- `src/app/bootstrap.ts` laedt optional `runtime-config`, seeded Default-Daten, persistiert Trigger/Makros ueber `StoragePort` und aktiviert Plugins beim Start.
- `src/main.tsx` bootstrapped die Desktop-React-App; `src/App.tsx` rendert aktuell nur ein Dashboard auf Basis von `appFacade.getDashboardState()`.
- Aktuelle Testsuite unter `src/tests/`: 19 Testdateien plus eine `README.md`.

## Aktuell belastbare offene Punkte
- `website/src/config/runtimeConfig.ts` erzwingt effektiv weiter nur `private_prelaunch`.
- Die Website besitzt weiterhin kein durchgaengig belegtes Invite- oder Public-Produkt-Laufzeitmodell.
- Die Storage-Schicht prueft beim Laden Trigger-/Macro-Payloads nur auf Array-Form; schema-basierte Inhaltsvalidierung fehlt weiterhin.
- `project-meta/product/faq.json` bleibt leer und ist weiterhin eine Produkt-Metadatenluecke.
- Ein Teil der Snapshot- und Generator-Dokumente driftet weiterhin gegen den Code- und Teststand.
