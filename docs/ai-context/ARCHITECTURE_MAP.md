# ARCHITECTURE MAP — TriggerHub 2.0
> Generated: 2026-03-10 | Updated: 2026-03-10 — Phase 1 UI integration reflected | CONFIRMED_BY_CODE

---

## ARCHITECTURE STYLE

**Clean Architecture / Hexagonal (Ports & Adapters)**

- Core domain is framework-agnostic (no React, no Electron, no HTTP in `src/core/`)
- Services implement port interfaces defined in `src/types/ports.ts`
- UI communicates only through `AppFacade` — never directly to engines
- Dependency Injection via explicit composition root in `src/app/bootstrap.ts`

---

## LAYER DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                     ELECTRON SHELL                           │
│  electron/main.cjs — BrowserWindow, app lifecycle           │
└──────────────────────────┬──────────────────────────────────┘
                           │ loads dist/index.html
┌──────────────────────────▼──────────────────────────────────┐
│                     REACT UI LAYER                           │
│  src/ui/pages/      — Dashboard, Editor, Plugins, Settings   │
│  src/ui/components/ — TriggerCard, StatusBar, Modal, etc.   │
│  src/ui/layout/     — MainLayout (3-col), Sidebar, Header    │
│  src/ui/styles/     — tokens.css (CSS custom properties)     │
│  src/App.tsx        — Root component (live data via AppFacade)│
└──────────────────────────┬──────────────────────────────────┘
                           │ via AppFacade only
┌──────────────────────────▼──────────────────────────────────┐
│                  APP COMPOSITION ROOT                        │
│  src/app/bootstrap.ts  — Wires all services & engines        │
│  src/app/container.ts  — AppModuleContainer interface        │
│  src/app/facade.ts     — TriggerHubAppFacade (public API)    │
│  src/app/readModel.ts  — DashboardState validation           │
└───────────────┬─────────────────────┬───────────────────────┘
                │                     │
┌───────────────▼──────────┐  ┌──────▼──────────────────────┐
│   CORE DOMAIN            │  │   SERVICE LAYER (Adapters)   │
│                          │  │                              │
│ src/core/trigger-engine/ │  │ src/services/obs-service/    │
│  TriggerEngine           │  │  ObsService (switchScene)    │
│  TriggerExecutor         │  │  InMemoryObsTransport        │
│  TriggerGraph            │  │  ObsHttpTransport            │
│                          │  │                              │
│ src/core/macro-system/   │  │ src/services/spotify-service/│
│  MacroEngine             │  │  SpotifyService (play/pause) │
│  MacroRunner             │  │  InMemorySpotifyTransport    │
│                          │  │  SpotifyHttpTransport        │
│ src/core/event-bus/      │  │                              │
│  InMemoryEventBus        │  │ src/services/clip-service/   │
│  (pub/sub, wildcards)    │  │  ClipProcessor               │
│                          │  │  ClipExporter                │
│ src/core/app-control/    │  │                              │
│  AppController           │  │ src/services/shared/         │
│  HotkeyManager           │  │  HttpClient (fetch wrapper)  │
│  WindowManager           │  │  OperationPolicy (retry)     │
└───────────┬──────────────┘  └──────────────┬───────────────┘
            │                                │
            └────────────────┬───────────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                    PLUGIN SYSTEM                            │
│  src/plugins/pluginRegistry.ts — register/activate/list    │
│  src/plugins/example-plugin/  — ExamplePlugin impl         │
│  PluginContext: full access to engines, eventBus, registry │
└───────────────────────────────────────────────────────────┘
```

---

## MODULE DESCRIPTIONS

### `electron/main.cjs` — ELECTRON PROCESS
- Creates BrowserWindow (1280×800, min 980×640)
- Loads `dist/index.html` after app ready
- Auto-hides menu bar
- Handles activate/close lifecycle
- **CONFIRMED_BY_CODE**

### `src/main.tsx` — REACT ENTRYPOINT
- Calls `createAppModuleContainer()` and `container.appController.start()` before render
- Wraps `<App />` in `<AppProvider container={container}>` for DI injection
- Mounts to `#root` div; imports global CSS tokens
- **CONFIRMED_BY_CODE** (Phase 1 complete 2026-03-10)

### `src/app/AppContext.tsx` — REACT DI CONTEXT
- `AppProvider` — provides container to React tree
- `useAppContext()` — access full container
- `useAppFacade()` — shortcut to `TriggerHubAppFacade`
- **CONFIRMED_BY_CODE** (added Phase 1)

### `src/App.tsx` — ROOT COMPONENT
- Loads real `DashboardState` via `useAppFacade().getDashboardState()` on mount
- Subscribes to `trigger:executed` and `macro:completed` on EventBus for live refresh
- `onToggleTrigger` calls `facade.executeTrigger(triggerId)` — real dispatch
- Has loading and error states
- Renders `<Dashboard />` with live data
- **CONFIRMED_BY_CODE** (Phase 1 complete 2026-03-10)

### `src/app/bootstrap.ts` — COMPOSITION ROOT
Creates and wires:
```
InMemoryEventBus
  ↓
OBS Service (InMemory transport)
Spotify Service (InMemory transport)
Clip Service
  ↓
TriggerExecutor (maps action types → service calls)
TriggerEngine (registers event subscriptions)
MacroEngine (manages macro definitions)
AppController (start/stop lifecycle + hotkeys)
PluginRegistry (register + activate plugins)
  ↓
TriggerHubAppFacade (public read/write API)
```
Seeds default data: 1 macro, 1 trigger.
**CONFIRMED_BY_CODE**

### `src/app/container.ts` — DI CONTAINER INTERFACE
Defines `AppModuleContainer` — typed bag of all initialized services.
**CONFIRMED_BY_CODE**

### `src/app/facade.ts` — APP FACADE
Public API surface:
- `getDashboardState()` — returns validated `DashboardState`
- `executeTrigger(id)` — fires a trigger by ID
- `runMacro(id)` — runs a macro by ID
Validates output via `readModel.ts` before returning.
**CONFIRMED_BY_CODE**

### `src/core/trigger-engine/` — TRIGGER ENGINE
- `TriggerGraph`: dual-index (eventIndex + triggerIndex) for O(1) event lookup
- `TriggerEngine`: subscribes to EventBus; on event → filter by conditions → dispatch actions
- `TriggerExecutor`: maps `TriggerAction.type` to handler (obs.switchScene, spotify.play, etc.)
- Validates invariants at registration: non-empty id, name, event
- **CONFIRMED_BY_CODE**

### `src/core/macro-system/` — MACRO ENGINE
- `MacroEngine`: manages macro registry; validates invariants
- `MacroRunner`: executes steps: delay, service_call, plugin_action, macro_call, conditional, parallel, sequence
- Supports nested macros (max depth: 5)
- Execution context: variables, triggerPayload, depth
- **CONFIRMED_BY_CODE**

### `src/core/event-bus/` — EVENT BUS
- Async pub/sub with namespace topics (`obs:scene-changed`, etc.)
- Wildcard subscriptions (`obs:*`)
- Handlers awaited sequentially
- `once()` for single-fire subscriptions
- **CONFIRMED_BY_CODE**

### `src/core/app-control/` — APP CONTROLLER
- Manages start/stop lifecycle
- Registers F11 hotkey (toggle fullscreen) by default
- HotkeyManager and WindowManager are placeholder stubs currently
- **CONFIRMED_BY_CODE** (stubs noted)

### `src/services/` — SERVICE ADAPTERS
Each service follows the same pattern:
```
ServicePort interface (from src/types/ports.ts)
  ↑ implements
ServiceWrapper (obsActions.ts / spotifyActions.ts)
  ↑ delegates to
Transport interface
  ↑ implemented by
InMemoryTransport | HttpTransport
```
`HttpClient` in `shared/http.ts` wraps `fetch()` with error mapping and optional response validation.
**CONFIRMED_BY_CODE**

### `src/plugins/` — PLUGIN SYSTEM
- `PluginRegistry`: manages plugin lifecycle (register → activate → deactivate)
- Plugins receive `PluginContext` with full engine/bus access
- `ExamplePlugin`: reference implementation
- **CONFIRMED_BY_CODE**

### `src/types/` — SHARED TYPE SYSTEM
- `domain.ts`: Trigger, Macro, DashboardState, EventTopics, all payload types
- `ports.ts`: All port interfaces (TriggerEnginePort, ObsServicePort, etc.)
- `globalTypes.ts`: Global utility types
- **CONFIRMED_BY_CODE**

### `src/ui/` — REACT UI
- `pages/Dashboard.tsx`: Main view — TriggerGrid + AutomationPanel + Status
- `pages/Editor.tsx`: Trigger/macro editor (status: scaffolded)
- `pages/Plugins.tsx`: Plugin management (status: scaffolded)
- `pages/Settings.tsx`: App settings (status: scaffolded)
- `layout/MainLayout.tsx`: 3-column grid layout
- `components/`: TriggerCard, StatusBar, PanelCard, DeckButton, Button, Modal
- `styles/tokens.css`: CSS custom properties (--th-* namespace)
- **CONFIRMED_BY_CODE** (pages beyond Dashboard are scaffolds)

### `design/` — DESIGN SYSTEM (SEPARATE PROJECT)
- Standalone Vite project with shadcn/ui (60+ components)
- Contains: Sidebar, DashboardHeader, TriggerGrid, StatusBar, AutomationPanel
- Not imported by main app — serves as visual reference / prototype
- **CONFIRMED_BY_CODE**

---

## PORT INTERFACES (src/types/ports.ts)

```typescript
TriggerEnginePort      registerTrigger, removeTrigger, executeTrigger, getAll
MacroEnginePort        registerMacro, runMacro
AppControllerPort      start, stop
ObsServicePort         connect, disconnect, switchScene
SpotifyServicePort     play, pause, nextTrack
ClipServicePort        startCapture, saveClip
EventBusPort           publish, subscribe, once, unsubscribe
PluginRegistryPort     register, unregister, list, activateAll, deactivateAll
AppFacadePort          getDashboardState, executeTrigger, runMacro
PluginModule           id, name, activate(context), deactivate()
PluginContext           appController, triggerEngine, macroEngine, eventBus, actionRegistry
```

---

## EVENT TOPICS (src/types/domain.ts)

```typescript
OBS_SCENE_CHANGED      = 'obs:scene-changed'
OBS_CONNECTED          = 'obs:connected'
OBS_DISCONNECTED       = 'obs:disconnected'
SPOTIFY_TRACK_CHANGED  = 'spotify:track-changed'
SPOTIFY_PLAYBACK_STARTED = 'spotify:playback-started'
SPOTIFY_PLAYBACK_PAUSED  = 'spotify:playback-paused'
TRIGGER_EXECUTED       = 'trigger:executed'
MACRO_COMPLETED        = 'macro:completed'
```

---

## DEPENDENCY GRAPH (simplified)

```
electron/main.cjs
  └── dist/index.html (built by Vite)
        └── src/main.tsx
              ├── createAppModuleContainer() → src/app/bootstrap.ts
              │     ├── src/core/event-bus/
              │     ├── src/core/trigger-engine/
              │     ├── src/core/macro-system/
              │     ├── src/core/app-control/
              │     ├── src/services/obs-service/
              │     ├── src/services/spotify-service/
              │     ├── src/services/clip-service/
              │     ├── src/plugins/
              │     └── src/app/facade.ts  ← TriggerHubAppFacade
              └── <AppProvider container={container}>
                    └── src/App.tsx  ← useAppFacade() → live data
                          └── src/ui/pages/Dashboard.tsx
                                └── src/ui/components/*
```

**CONFIRMED_BY_CODE:** UI is fully connected to bootstrap via AppContext. `src/App.tsx` calls `facade.getDashboardState()` on mount and subscribes to EventBus for live refresh. Connection established in Phase 1 (2026-03-10).
