# TriggerHub 2.0 — Projektstatus
> Stand: 2026-03-17 | Version: 0.1.1

## Übersicht

TriggerHub 2.0 ist eine Desktop-Automatisierungsplattform für Creator und Stream-Workflows. Das Projekt befindet sich in der **Foundation Phase** (Phase 1) mit ersten funktionierenden Komponenten.

---

## Aktuelle Version

**Version:** `0.1.1`  
**Release Branch:** `release/v0.1.1-prep`  
**Letzte Release-Vorbereitung:** 2026-03-17

---

## Projektstruktur

### Hauptkomponenten

1. **Desktop App** (`src/`)
   - Electron-basierte Desktop-Anwendung
   - React UI mit TypeScript
   - Core Engine (Trigger, Macro, Event Bus)
   - Service-Integrationen (OBS, Spotify, Clip)

2. **Website** (`website/`)
   - Vite + React
   - Product Landing Page
   - i18n-Implementierung geplant (DE/EN)

3. **Design System** (`design/`)
   - Separate Vite-Projekt
   - 60+ shadcn/ui Komponenten
   - Wird manuell in Haupt-App integriert

4. **Tools** (`tools/`)
   - `exe-builder/` — Windows Installer Builder

---

## Entwicklungsstand

### ✅ Abgeschlossen

1. **UI-Backend-Integration** (PRIORITY 1 — COMPLETE)
   - `AppContext.tsx` mit `AppProvider`, `useAppContext()`, `useAppFacade()`
   - `App.tsx` lädt echte Daten via `facade.getDashboardState()`
   - EventBus-Subscriptions für `trigger:executed` und `macro:completed`
   - StatusBar zeigt echte Service-Verbindungszustände

2. **CI/CD Pipeline** (RISK-04 — PARTIALLY RESOLVED)
   - `.github/workflows/ci-quality.yml` — Quality Gate
     - Typecheck, Tests, Build-Checks
     - Separate Jobs für Core und Website
   - `.github/workflows/release.yml` — Release Pipeline
     - Validierung, Build, Artifact-Collection
     - GitHub Release Publishing
     - Vercel Deployment Hook

3. **Release Workflow**
   - Version 0.1.1 vorbereitet
   - Windows Installer (NSIS) + Portable Build
   - Code-Signing Support (optional)
   - Artifact-Collection und Validierung

4. **Website**
   - Product Landing Page implementiert
   - Router-Integration angepasst
   - i18n-Implementierungsplan dokumentiert

---

## Offene Risiken & Tech Debt

### CRITICAL

- **RISK-02** — No Electron IPC Bridge
  - Keine Kommunikation zwischen Main Process und Renderer
  - Blockiert: Hotkeys, Window Control, File System, Auto-Update

### HIGH

- **RISK-03** — No Real Service Connections
  - OBS, Spotify, Clip verwenden InMemory-Transports
  - Keine echte Integration mit externen Services

- **RISK-04** — CI/CD Pipeline
  - ✅ **PARTIALLY RESOLVED** — Quality Gate und Release Pipeline existieren
  - ⚠️ **Residual:** Keine automatischen Tests auf jedem Push (nur auf bestimmten Branches)

- **RISK-05** — No Auto-Update Mechanism
  - `electron-updater` installiert, aber nicht konfiguriert
  - Keine Update-Notifications

### MEDIUM

- **RISK-06** — Legacy Module Pollution
  - 5 Legacy-Ordner existieren noch (v1)
  - Geplant für Phase 3+ Entfernung

- **RISK-07** — No Error Boundary
  - React UI hat keine Error Boundaries
  - App-Crash bei Render-Fehlern

- **RISK-09** — No Persistent State
  - Alle Daten nur im Speicher
  - Keine Persistierung zwischen Sessions

---

## Nächste Schritte (Prioritäten)

### PRIORITY 2 — Electron IPC Bridge (CRITICAL)
- `electron/preload.cjs` erstellen
- IPC-Handler in `main.cjs` registrieren
- TypeScript-Typen für `window.electronAPI`

### PRIORITY 3 — CI/CD Pipeline (HIGH)
- ✅ Quality Gate existiert
- ⚠️ Automatische Tests auf jedem Push aktivieren

### PRIORITY 4 — Error Boundary (HIGH, Low Effort)
- `ErrorBoundary.tsx` Komponente
- Wrap `<App />` in `main.tsx`

### PRIORITY 5 — Real OBS Integration (HIGH)
- `obs-websocket-js` integrieren
- WebSocket-Transport aktivieren
- OBS-Events auf EventBus mappen

---

## Dokumentation

### Aktive Dokumente

- `/docs/triggerhub_roadmap.md` — Entwicklungsphasen
- `/docs/ai-context/TECH_DEBT_AND_RISKS.md` — Risiken und Tech Debt
- `/docs/ai-context/NEXT_STEPS_ROADMAP.md` — Prioritäten
- `/website/docs/i18n-implementation-plan.md` — i18n-Plan

### Veraltete Dokumente

- Keine identifiziert (Stand: 2026-03-17)

---

## Metriken

- **Codebase:** TypeScript, React, Electron
- **Build System:** Vite, Electron Builder
- **Testing:** Vitest
- **CI/CD:** GitHub Actions
- **Deployment:** GitHub Releases, Vercel (Website)

---

## Bekannte Widersprüche

Keine identifiziert (Stand: 2026-03-17)

---

## Änderungen seit letztem Snapshot

1. **Version 0.1.1 Release-Vorbereitung**
   - CI Quality Gate Workflow erstellt
   - Release Workflow gehärtet
   - Branch-Trigger-Kompatibilität verbessert

2. **Website Updates**
   - Product Landing Page implementiert
   - Router-Integration angepasst

3. **CI/CD Verbesserungen**
   - Quality Gate mit separaten Build-Jobs
   - Release Pipeline mit Validierung und Artifact-Collection

---

*Dieser Snapshot wird bei größeren Änderungen aktualisiert.*
