# CONTEXT FOR EXTERNAL AI — TriggerHub 2.0
> Generated: 2026-03-10 | Updated: 2026-03-10 — Phase 1 UI integration reflected | Compact onboarding context for AI systems

---

## WHAT IS THIS PROJECT?

**TriggerHub 2.0** is a Windows desktop application for streamers and content creators.

**Purpose:** A unified automation platform ("OS for creator automation") where users can:
- Define **Triggers** (fire when an event happens, e.g., OBS scene changes)
- Build **Macros** (sequence of automated steps — switch scene, play music, capture clip)
- Control external services: OBS Studio, Spotify, screen clip capture
- Install **Plugins** to extend functionality

**Tech:** React 18 + TypeScript 5.8 + Electron 36, bundled with Vite 6. Installer built via electron-builder (NSIS, Windows x64).

---

## ARCHITECTURE IN ONE PARAGRAPH

The app uses **Clean Architecture / Hexagonal** pattern. The core domain (`src/core/`) contains a **TriggerEngine** (event-based trigger dispatch), **MacroEngine** (step execution: delay, service_call, conditional, parallel), an **InMemoryEventBus** (pub/sub), and an **AppController**. Services (`src/services/`) adapt external APIs (OBS, Spotify, Clip) behind port interfaces with **dual transports** (InMemory for dev, HTTP for production). A **Plugin system** (`src/plugins/`) provides lifecycle-managed extensions. Everything is wired in a **composition root** (`src/app/bootstrap.ts`), exposed via **AppFacade**, and the React UI (`src/ui/`) communicates only through the facade.

---

## CURRENT STATE (as of 2026-03-10)

**What's DONE:**
- Full architecture scaffolding: TriggerEngine, MacroEngine, EventBus, services, plugins
- All port interfaces defined (`src/types/ports.ts`)
- Dual-transport services implemented (InMemory + HTTP)
- Plugin lifecycle fully implemented
- **UI connected to backend** — `AppContext.tsx`, `useAppFacade()` wired; `App.tsx` uses real `getDashboardState()` and `executeTrigger()`; EventBus subscriptions for live refresh
- Dashboard UI renders with real live data (3-column layout, real service connection status)
- 14-file test suite covers all layers (core engines, services, UI, website auth)
- Electron packaging configured (NSIS installer)

**What's MISSING (CRITICAL):**
1. **No Electron IPC** — renderer and main process cannot communicate; no `preload.cjs`; hotkeys/window control/file system/auto-update are all blocked by this
2. **No real service connections** — all services use InMemory transports; HTTP transports exist but not activated; no OBS WebSocket, no Spotify OAuth

**What's MISSING (HIGH):**
3. No CI/CD pipeline (only empty `website-update.yml` exists)
4. No auto-update mechanism (`electron-updater` not installed)
5. No persistent state (all triggers/macros/config lost on restart)

---

## KEY FILE PATHS

```
src/app/bootstrap.ts        # Composition root — wire everything here
src/app/facade.ts           # TriggerHubAppFacade — public API
src/app/container.ts        # AppModuleContainer interface
src/core/trigger-engine/    # TriggerEngine, TriggerExecutor, TriggerGraph
src/core/macro-system/      # MacroEngine, MacroRunner
src/core/event-bus/         # InMemoryEventBus (pub/sub, wildcards)
src/core/app-control/       # AppController, HotkeyManager (stub), WindowManager (stub)
src/services/obs-service/   # OBS adapter (InMemory + HTTP transports)
src/services/spotify-service/ # Spotify adapter
src/services/clip-service/  # Clip capture adapter
src/services/shared/http.ts # Shared HttpClient
src/plugins/pluginRegistry.ts # Plugin lifecycle
src/types/domain.ts         # Trigger, Macro, DashboardState, EventTopics
src/types/ports.ts          # All service interfaces
src/ui/pages/Dashboard.tsx  # Main view (wired to AppFacade — live data)
src/ui/styles/tokens.css    # CSS custom properties (--th-* namespace)
electron/main.cjs           # Electron main process
```

---

## IMPORTANT RULES FOR AI AGENTS

1. **Do NOT modify files in `src/deck-engine/`, `src/event-bus/`, `src/plugin-system/`, `src/profiles/`, `src/store/`** — these are legacy, preserved by ADR-003
2. **Do NOT import from `design/`** into `src/` — design system is a separate project; copy/adapt components
3. **Always respect port interfaces** in `src/types/ports.ts` — never bypass them with direct service calls from UI
4. **Core domain must stay framework-free** — no React, no Electron APIs in `src/core/`
5. **New architecture decisions must be recorded as ADRs** in `architecture-decisions.md`
6. **Update `agents/project-context/`** docs after significant changes

---

## HOW THE ENGINE WORKS (Runtime Flow)

```
1. bootstrap.ts creates all services and engines
2. TriggerEngine subscribes to EventBus events
3. When an event fires (e.g., 'obs:connected'):
   - TriggerGraph looks up all triggers for that event
   - Each trigger's conditions are evaluated against event payload
   - Passing triggers' actions are sent to TriggerExecutor
   - TriggerExecutor dispatches to the right service handler
   - Service handler calls OBS/Spotify/Clip APIs
4. MacroEngine works similarly but executes sequential steps
5. Plugins hook into engines and EventBus at activation time
6. AppFacade wraps all of this behind a simple read/write API for the UI
```

---

## HOW TO START WORKING

### Adding Electron IPC (Top Priority — RISK-02)

```js
// electron/preload.cjs (new file):
const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen')
})

// electron/main.cjs — add to BrowserWindow:
webPreferences: {
  preload: path.join(__dirname, 'preload.cjs'),
  contextIsolation: true,
  nodeIntegration: false
}
```

### Adding a New Trigger Action Type

```typescript
// 1. Add action type to src/core/trigger-engine/triggerTypes.ts
// 2. Register handler in TriggerExecutor (src/core/trigger-engine/triggerExecutor.ts)
// 3. Add service method if needed
// 4. Add test in src/tests/core-trigger.test.ts
```

### Adding a New Macro Step Type

```typescript
// 1. Add step type to src/core/macro-system/macroTypes.ts
// 2. Handle in MacroRunner switch statement (src/core/macro-system/macroRunner.ts)
// 3. Add test in src/tests/core-macro.test.ts
```

---

## COMMON PATTERNS IN THIS CODEBASE

### Service Factory Pattern
```typescript
// All services use factory functions:
const obsService = createObsService({ transport: 'memory' | 'http', ... })
```

### Port Interface Pattern
```typescript
// All inter-layer communication goes through Port interfaces:
interface ObsServicePort {
  connect(): Promise<void>
  disconnect(): Promise<void>
  switchScene(sceneName: string): Promise<void>
}
```

### Invariant Validation Pattern
```typescript
// Engines validate at registration boundaries:
if (!trigger.id || !trigger.name || !trigger.event) {
  throw new TriggerValidationError('...')
}
```

### Error Type Pattern
```typescript
// Each module has typed error classes:
class TriggerExecutorError extends Error { ... }
class HttpRequestError extends Error { statusCode: number }
class ResponseValidationError extends Error { ... }
class DashboardReadModelValidationError extends Error { ... }
```

---

## DESIGN TOKENS (CSS)

All UI uses CSS custom properties with `--th-` prefix:
```css
--th-accent         /* primary accent color */
--th-bg             /* background */
--th-bg-card        /* card background */
--th-border         /* border color */
--th-text           /* primary text */
--th-text-muted     /* secondary text */
--th-radius         /* border radius */
--th-spacing-*      /* spacing scale */
```
Source: `src/ui/styles/tokens.css`

---

## AGENT SYSTEM

The project has 11+ specialized AI agent prompts in `agents/core/`:
- 00-agent-rules (global constraints)
- 01-orchestrator, 02-product, 03-architecture, 04-implementation
- 05-uiux, 06-qa, 07-ops, 08-docs, 09-autoupdate, 40-security
- Additional: 20-content-sync-agent, 30-release-agent, master-orchestrator

Living state docs: `agents/project-context/`

---

## RECOMMENDED FIRST ACTIONS FOR NEW AI AGENT

1. Read `agents/core/00-agent-rules.md` (global rules)
2. Read `agents/project-context/active-tasks.md` (current work items)
3. Read `agents/project-context/known-issues.md` (existing bugs)
4. Read `docs/ai-context/TECH_DEBT_AND_RISKS.md` (RISK-02 Electron IPC is current top blocker)
5. Read `src/app/bootstrap.ts` to understand wiring
6. Read `src/app/facade.ts` to understand public API
7. Read `src/app/AppContext.tsx` to understand UI integration
8. Begin with Electron IPC bridge (PRIORITY 2 in NEXT_STEPS_ROADMAP.md)
