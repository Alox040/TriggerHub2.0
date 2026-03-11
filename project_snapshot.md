# TriggerHub 2.0 – Architektur-Snapshot

**Generiert:** 2026-03-10
**Version:** 0.1.0

---

## 1. Projektname

**TriggerHub 2.0**

---

## 2. Kurzbeschreibung

TriggerHub 2.0 ist eine modulare Electron-Desktop-Applikation für Streamer und Content Creator. Sie ermöglicht die Steuerung externer Dienste (OBS, Spotify, Clip-Aufnahmen) über ein konfigurierbares Trigger- und Makro-System. Die Anwendung ist als React + TypeScript Single-Page-App gebaut, die über Electron als natives Windows-Programm ausgeliefert wird.

**Tech Stack:** React 18 · TypeScript 5.8 · Vite 6 · Electron 36 · Vitest 3
**Build Target:** Windows x64 (NSIS Installer)

---

## 3. Hauptmodule

| Modul | Pfad | Beschreibung |
|-------|------|--------------|
| **Core Engine** | `src/core/` | Trigger-Engine, Macro-System, App-Control |
| **Plugin System** | `src/plugins/` | Plugin-Registry, Beispiel-Plugin |
| **Services Layer** | `src/services/` | OBS, Spotify, Clip-Service |
| **UI Layer** | `src/ui/` | React-Komponenten, Layouts, Seiten |
| **App Container** | `src/app/` | Bootstrap, DI-Container, Facade |
| **Agent System** | `agent/agents/` | Multi-Agent-Koordination (Markdown-basiert) |
| **Design System** | `design/` | Separates Storybook/Vite-Projekt |
| **Electron Shell** | `electron/` | Nativer Desktop-Wrapper |

---

## 4. Wichtige Ordner

### `src/core/`
Das Herzstück der Applikation. Enthält drei Subsysteme:

- **`trigger-engine/`** – Kernlogik für Trigger-Erkennung und -Ausführung (`triggerEngine.ts`, `triggerExecutor.ts`, `triggerTypes.ts`)
- **`macro-system/`** – Makro-Definition und -Ausführung (`macroEngine.ts`, `macroRunner.ts`, `macroTypes.ts`)
- **`app-control/`** – Systemsteuerung: App-Controller, Hotkey-Manager, Window-Manager

### `src/plugins/`
Das Plugin-System ermöglicht die Erweiterung der Anwendung durch externe Module.

- **`pluginRegistry.ts`** – Zentrale Registry für alle registrierten Plugins
- **`example-plugin/`** – Referenzimplementierung mit `plugin.ts`, `pluginActions.ts`, `pluginConfig.ts`

### `src/services/`
Integrationsschicht für externe Dienste:

- **`obs-service/`** – OBS Studio Integration (WebSocket-Client, Actions, Contracts)
- **`spotify-service/`** – Spotify-API-Integration (Client, Actions, Contracts)
- **`clip-service/`** – Clip-Aufnahme und -Export (Processor, Exporter)
- **`shared/`** – Gemeinsame Utilities: HTTP-Client, Reliability-Wrapper

### `src/ui/`
React-UI-Schicht der Anwendung:

- **`components/`** – Wiederverwendbare UI-Bausteine (Button, Modal, TriggerCard, DeckButton, PanelCard, StatusBar)
- **`layout/`** – App-Layouts (MainLayout, Header, Sidebar)
- **`pages/`** – Hauptseiten (Dashboard, Editor, Plugins, Settings)
- **`styles/`** – CSS Design Tokens und seitenspezifische Styles

### `agent/agents/`
Markdown-basiertes Multi-Agent-System für KI-gestützte Entwicklungskoordination:

- **`core/`** – Spezialisierte Agenten (Orchestrator, Product, Architecture, Implementation, UX, QA, Ops, Docs, AutoUpdate)
- **`project-context/`** – Lebende Projektdokumentation (aktive Tasks, Architektur-Übersicht, Entscheidungslog)
- **`system/`** – Templates für Handoffs, Reviews, Tasks, Entscheidungen

---

## 5. Einstiegspunkte der Anwendung

| Datei | Typ | Beschreibung |
|-------|-----|--------------|
| `index.html` | HTML | Browser/Electron HTML-Einstieg |
| `src/main.tsx` | TypeScript/React | React DOM Render-Einstieg |
| `src/App.tsx` | TypeScript/React | Root React Component |
| `src/app/bootstrap.ts` | TypeScript | App-Initialisierung (DI, Services) |
| `src/app/container.ts` | TypeScript | Dependency Injection Container |
| `src/app/facade.ts` | TypeScript | Öffentliche App-API (Facade Pattern) |
| `electron/main.cjs` | CommonJS | Electron Main Process (BrowserWindow) |

**Start-Reihenfolge:**
1. Electron: `electron/main.cjs` startet und öffnet `dist/index.html`
2. Browser: `index.html` → `src/main.tsx` → React-App mounten
3. App-Init: `src/app/bootstrap.ts` → Container aufbauen → Services initialisieren
4. UI: `src/App.tsx` rendert das Layout mit den konfigurierten Routen

---

## 6. Plugin-Architektur

### Registrierung
Plugins werden über die zentrale Registry in `src/plugins/pluginRegistry.ts` registriert. Die Datei `src/plugins/index.ts` exportiert die öffentliche Plugin-API.

### Speicherort
Plugins liegen unter `src/plugins/<plugin-name>/` und folgen der Struktur des `example-plugin`:

```
src/plugins/
  pluginRegistry.ts      ← Zentrale Registry
  index.ts               ← Öffentliche API
  example-plugin/
    plugin.ts            ← Plugin-Hauptklasse / Metadaten
    pluginActions.ts     ← Aktionen, die das Plugin bereitstellt
    pluginConfig.ts      ← Konfigurationsschema
    index.ts             ← Plugin-Einstieg / Export
```

### Laden
Plugins werden beim App-Bootstrap über den DI-Container (`src/app/container.ts`) geladen und in der Registry registriert. Die UI-Seite `src/ui/pages/Plugins.tsx` stellt die Verwaltungsoberfläche bereit.

### Erweiterungspunkte
- Eigene Trigger-Typen registrieren
- Neue Actions für den Makro-Runner bereitstellen
- UI-Elemente in die Plugin-Seite einbetten
- Service-Contracts implementieren (via `src/types/ports.ts`)

---

## 7. Agent System

Das Agent-System ist ein Markdown-basiertes Koordinationssystem für KI-gestützte Entwicklung. Es definiert Rollen, Verantwortlichkeiten und Kommunikationsprotokolle für spezialisierte Agenten.

### Agent-Dateien unter `agent/agents/core/`

| Datei | Agent-Rolle |
|-------|-------------|
| `00-agent-rules.md` | Grundregeln für alle Agenten |
| `01-orchestrator.md` | Master-Koordination und Aufgabenverteilung |
| `02-product.md` | Produktstrategie und Roadmap |
| `03-architecture.md` | Systemarchitektur und technische Entscheidungen |
| `04-implementation.md` | Code-Implementierung und Feature-Entwicklung |
| `05-uiux.md` | UI/UX Design und Komponenten |
| `06-qa.md` | Qualitätssicherung und Testing |
| `07-ops.md` | DevOps, Build und Deployment |
| `08-docs.md` | Dokumentation und Wissensverwaltung |
| `09-autoupdate.md` | Auto-Update-Mechanismus |

### Orchestrierung
`agent/agents/master-orchestrator.md` definiert den übergeordneten Koordinationsprozess.

### Projekt-Kontext
`agent/agents/project-context/` enthält lebende Dokumentation:
- `active-tasks.md` – Aktuelle Aufgaben
- `architecture-overview.md` – Architekturübersicht
- `changelog.md` – Änderungsprotokoll
- `decision-log.md` – Architekturentscheidungen
- `design-guidelines.md` – Design-Richtlinien
- `known-issues.md` – Bekannte Probleme
- `product-overview.md` – Produktübersicht

---

## 8. Services

### OBS Service (`src/services/obs-service/`)

**Zweck:** Integration mit OBS Studio über die OBS WebSocket-API

| Datei | Beschreibung |
|-------|--------------|
| `obsClient.ts` | WebSocket-Client für OBS-Verbindung |
| `obsActions.ts` | Verfügbare OBS-Aktionen (Szenen wechseln, Aufnahme starten, etc.) |
| `contracts.ts` | TypeScript-Interfaces und Typen für OBS |
| `index.ts` | Öffentliche Service-API |

### Spotify Service (`src/services/spotify-service/`)

**Zweck:** Integration mit der Spotify Web API

| Datei | Beschreibung |
|-------|--------------|
| `spotifyClient.ts` | HTTP-Client für Spotify API |
| `spotifyActions.ts` | Verfügbare Aktionen (Play/Pause, Skip, Volume, etc.) |
| `contracts.ts` | TypeScript-Interfaces für Spotify-Objekte |
| `index.ts` | Öffentliche Service-API |

### Clip Service (`src/services/clip-service/`)

**Zweck:** Verwaltung und Export von Video-Clips

| Datei | Beschreibung |
|-------|--------------|
| `clipProcessor.ts` | Verarbeitung und Analyse von Clips |
| `clipExporter.ts` | Export in verschiedene Formate |
| `contracts.ts` | TypeScript-Interfaces für Clip-Objekte |
| `index.ts` | Öffentliche Service-API |

### Shared Utilities (`src/services/shared/`)

| Datei | Beschreibung |
|-------|--------------|
| `http.ts` | Gemeinsamer HTTP-Client für alle Services |
| `reliability.ts` | Retry-Logik, Circuit Breaker, Fehlerbehandlung |
| `index.ts` | Re-Exports der Shared-Utilities |

---

## 9. Typ-System

`src/types/` enthält die zentralen TypeScript-Definitionen:

| Datei | Inhalt |
|-------|--------|
| `domain.ts` | Domain-Objekte (Trigger, Macro, Plugin, etc.) |
| `ports.ts` | Service-Interfaces / Ports für Dependency Inversion |
| `globalTypes.ts` | Globale Utility-Typen |
| `index.ts` | Re-Exports |

---

## 10. Test-Abdeckung

Tests liegen unter `src/tests/` und nutzen **Vitest 3**:

| Testdatei | Bereich |
|-----------|---------|
| `app-container.test.ts` | DI-Container Funktionalität |
| `app-facade.test.ts` | Facade-Pattern API |
| `core-macro.test.ts` | Macro-System |
| `core-trigger.test.ts` | Trigger-Engine |
| `plugins.test.ts` | Plugin-System |
| `services.test.ts` | Services (OBS, Spotify, Clip) |
| `ui-dashboard.test.tsx` | React UI-Komponenten |

---

## 11. Build & Deployment

```
npm run dev              → Vite Dev-Server starten
npm run build            → Production Build (dist/)
npm run desktop:build    → Electron NSIS Installer bauen
npm run desktop:release  → Build + Artifacts sammeln
npm run test             → Vitest Tests ausführen
npm run typecheck        → TypeScript Type-Check
```

**Output:** `release/TriggerHubSetup.exe` (Windows x64 Installer)
