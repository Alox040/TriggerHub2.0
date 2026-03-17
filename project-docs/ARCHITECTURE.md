## Architecture Overview

- **Architecture style**: Modular **event-driven architecture** with clear layering.
- **Main layers** (per `docs/triggerhub_architecture.md` and current code):
  - **Core Engine Layer**: Trigger engine, macro engine, event bus, app-control, and type system.
  - **Service Layer**: Integrations for OBS, Spotify, Clip, and Twitch, plus shared HTTP/reliability infrastructure.
  - **Plugin Layer**: Plugin registry, plugin context, and example plugins.
  - **UI Layer**: React-based desktop UI and a separate website SPA with its own routing and auth.
- **Cross-cutting concerns**:
  - Persistence and storage (desktop runtime).
  - Runtime hardening and error boundaries.
  - CI/CD and quality gates.

## Modules (Desktop App)

### App Layer (`src/app`)

- **`bootstrap.ts`**
  - Creates the **runtime container** via `createAppModuleContainer(storage?: StoragePort)`.
  - Wires:
    - `InMemoryEventBus`
    - `TriggerGraph` and `TriggerEngine`
    - `MacroEngine`
    - Services: OBS, Spotify, Clip, Twitch (defaulting to in-memory transports).
    - `PluginRegistry` via `createPluginRegistryWithDefaults()`.
    - `AppController` with `HotkeyManager` and `WindowManager`.
    - Runtime activation/deactivation via `createRuntimeActivation`.
    - Persistence via `storageBridge` (`loadOrSeedCoreData`, `persistCoreData`) and `StoragePort`.
  - Manages:
    - `serviceState` flags for obs/spotify/clip/twitch.
    - `runtimeConfig` loaded from storage or `DEFAULT_RUNTIME_CONFIG`.
    - `start()` and `stop()` lifecycle, including persistence and Twitch disconnect on stop.
- **`facade.ts`**
  - `TriggerHubAppFacade` implements `AppFacadePort` (see `src/types/ports.ts`).
  - Provides high-level operations used by the UI:
    - Load dashboard/editor/plugins/settings state.
    - CRUD for triggers and macros.
    - Execute triggers and run macros.
    - Activate/deactivate runtime; connect/disconnect Twitch.
- **`AppContext.tsx`**
  - React context that holds the runtime container and `TriggerHubAppFacade`.
  - Used by `src/App.tsx` and UI components to access the runtime.
- **`storageBridge.ts` and `serviceActivation.ts`**
  - Bridge between runtime engines and the storage implementation.
  - Activates/deactivates services and maintains runtime activation flags.

### Core Layer (`src/core`)

- **Trigger Engine (`src/core/trigger-engine`)**
  - `TriggerEngine` implements `TriggerEnginePort`.
  - `TriggerGraph` implements `TriggerGraphPort` with dual indices (by id and by event).
  - `TriggerExecutor` maps actions to services and macro engine.
  - Publishes `EventTopics.TRIGGER_EXECUTED` on successful execution.
- **Macro System (`src/core/macro-system`)**
  - `MacroEngine` implements `MacroEnginePort`.
  - `MacroRunner` executes macro steps (sequential, with nesting and options).
  - Publishes `EventTopics.MACRO_COMPLETED` when a macro run finishes.
- **Event Bus (`src/core/event-bus`)**
  - `InMemoryEventBus` implements `EventBusPort`.
  - Supports:
    - `publish(topic, payload)`
    - `subscribe` with wildcards (e.g. `obs:*`).
    - `once` subscriptions and `unsubscribe`/`unsubscribeAll`.
- **App Control (`src/core/app-control`)**
  - `AppController`, `HotkeyManager`, `WindowManager`.
  - Currently wired as runtime dependencies; implementations still stubbed for real Electron IPC.

### Services Layer (`src/services`)

- **Shared Infrastructure (`src/services/shared`)**
  - HTTP client wrapper and `OperationPolicy` for retries and timeouts.
- **OBS Service (`src/services/obs-service`)**
  - `ObsService` wraps `InMemoryObsTransport` or `ObsHttpTransport`.
  - `createObsService` selects `memory` vs `http` transport based on options.
  - Exposes `connect`, `disconnect`, `isConnected`, `switchScene`.
- **Spotify Service (`src/services/spotify-service`)**
  - `SpotifyService` wraps `InMemorySpotifyTransport` or `SpotifyHttpTransport`.
  - `createSpotifyService` selects transport based on options.
  - Exposes `connect`, `disconnect`, `isConnected`, `play`, `pause`, `nextTrack`.
- **Clip Service (`src/services/clip-service`)**
  - `ClipService` builds clip buffers and exports them via a `ClipExporter` (default: `InMemoryClipExporter`).
  - Enforces connection and active capture before saving clips.
- **Twitch Service (`src/services/twitch-service`)**
  - `TwitchService` wraps `InMemoryTwitchTransport` or `TwitchApiTransport`.
  - `createTwitchService` selects `memory` vs `http` transport, requires `http.baseUrl` for HTTP.
  - Emits Twitch-related events into the `EventBus`.

### Plugin Layer (`src/plugins`)

- **Plugin Contracts (`src/types/ports.ts`)**
  - `PluginContext` bundles access to:
    - `AppControllerPort`
    - `TriggerEnginePort`
    - `MacroEnginePort`
    - `EventBusPort`
    - `ActionRegistryPort`
  - `PluginModule` defines `activate`/`deactivate`.
- **Plugin Registry**
  - `PluginRegistry` implements `PluginRegistryPort` for register/unregister/list.
  - `createPluginRegistryWithDefaults` loads and registers built-in plugins (e.g. example plugin).

### UI Layer (`src/ui`, `src/App.tsx`, `src/main.tsx`)

- **Entry and Context**
  - `src/main.tsx` creates the runtime container, calls `start()`, and wraps `<App />` in `<AppProvider>`.
- **Root App (`src/App.tsx`)**
  - Maintains active view (`AppViewId`) and view-model state:
    - `DashboardState`, `EditorState`, `PluginsState`, `SettingsState`.
  - Uses `TriggerHubAppFacade` to:
    - Load state (`getDashboardState`, `getEditorState`, `getPluginsState`, `getSettingsState`).
    - Run UI actions (execute trigger, run macro, CRUD, runtime activation, Twitch connect/disconnect).
  - Subscribes to:
    - `EventTopics.TRIGGER_EXECUTED`
    - `EventTopics.MACRO_COMPLETED`
    - to refresh view state.
  - Wraps rendered pages in `ErrorBoundary` with a localized fallback.
- **Pages (`src/ui/pages`)**
  - `DashboardPage`: shows triggers and macros via a `DashboardViewModel`.
  - `TriggerEditorPage`: lists and edits triggers via `GraphTrigger` props.
  - `MacroEditorPage`: lists and edits macros via `MacroDefinition` props.
  - `PluginsPage`: shows plugin inventory.
  - `SettingsPage`: shows runtime status and allows runtime activation and Twitch connect/disconnect.
- **Components (`src/ui/components`)**
  - Shared primitives (buttons, cards, navigation, status bar, etc.).
  - `ErrorBoundary` component used to guard the active page.

## Modules (Website)

- **Runtime Config (`website/src/config/runtimeConfig.ts`)**
  - Resolves `appAccessMode` from `VITE_ACCESS_MODE` using the `AccessMode` model.
- **Modules**
  - `auth`: backend session handling and JWT-based owner login.
  - `access-control`: access mode and route protections.
  - `profile`: profile storage and validation.
  - `identity`: identity records and roles.
- **Routing**
  - `AppRouter`, `routeManifest`, and route guards enforce access policies.
- **APIs**
  - Auth and profile routes under `website/api`, with security middleware and owner-only protections.

## Runtime Flow (Desktop)

### High-Level Flow

1. **Startup**
   - Electron main process loads `dist/index.html` and starts the React app.
   - `src/main.tsx` calls `createAppModuleContainer(storage)` and `container.start()`.
   - `start()`:
     - Loads `runtimeConfig` from storage or falls back to `DEFAULT_RUNTIME_CONFIG`.
     - Loads or seeds triggers and macros via `loadOrSeedCoreData`.
     - Persists seeded/migrated data via `persistCoreData`.
2. **UI Initialization**
   - `AppProvider` exposes `appFacade` and `eventBus` via React context.
   - `App` calls `getDashboardState`, `getEditorState`, `getPluginsState`, and `getSettingsState` to populate initial UI state.
3. **Normal Operation**
   - User interactions (clicking a trigger, running a macro, modifying triggers/macros, connecting Twitch, activating runtime) are all routed through `TriggerHubAppFacade`.
   - `TriggerHubAppFacade` delegates to:
     - `TriggerEngine` and `MacroEngine` for domain operations.
     - `PluginRegistry` for plugin-related state.
     - Runtime activation helpers and services for connectivity operations.
   - `TriggerEngine` and `MacroEngine` publish events on the `EventBus`:
     - `trigger:executed` and `macro:completed`.
   - `App` subscribes to these events and refreshes dashboard/editor state when they occur.
4. **Persistence**
   - Mutating operations (e.g. creating/updating/deleting triggers and macros) call the `persist` function provided to the facade, which delegates to `persistCoreData`.
   - Storage is bridged via `StoragePort` and Electron IPC to on-disk persistence.
5. **Shutdown**
   - `RuntimeContainer.stop()` deactivates runtime, disconnects Twitch if needed, persists, and destroys the trigger engine.

## Runtime Flow (Website)

1. **Startup**
   - Vite builds the SPA and serves it via `website/dist`.
   - `resolveRuntimeConfig` computes `appAccessMode` from env; UI and route guards read it.
2. **Auth**
   - Owner login posts to `/api/auth/login` and sets an HttpOnly cookie with a signed JWT.
   - Protected routes call `/api/auth/me` to validate session.
3. **Routing and Guards**
   - Route manifest maps URLs to page components with access requirements.
   - Guards check:
     - `appAccessMode` (e.g. `private_prelaunch` vs `public_product`).
     - Owner session presence for protected routes.
4. **Profile**
   - Profile pages use the profile module and APIs to load and update profile data.

## Architectural Boundaries

- **Codebase-level boundaries**
  - Desktop app (`src/`, `electron/`) is independent from:
    - Website (`website/`).
    - Design system (`design/`).
    - Tools (`tools/exe-builder/`).
- **Within the desktop app**
  - UI never talks directly to services; all interactions go through:
    - `TriggerHubAppFacade` → engines + services.
    - `EventBus` for events.
  - Services do not depend on UI; they only depend on ports and the event bus.
  - Plugins depend only on ports (`PluginContext`), not concrete implementations.

## Documented vs Actual Architecture (Drift)

- **CI/CD and workflows**
  - Older docs (`DEV_RUN_BUILD_RELEASE.md`, `TECH_DEBT_AND_RISKS.md`, `NEXT_STEPS_ROADMAP.md`) describe CI/CD as missing.
  - Current repo contains multiple workflows (`ci.yml`, `quality-gate.yml`, `release.yml`, `website-update.yml`, `context-sync.yml`, `godai-validation.yml`), and `build-status.json` lists all gates as `pass`.
- **Error boundaries**
  - Older risk docs flag “No Error Boundary in UI”.
  - Current `src/App.tsx` imports and uses `ErrorBoundary` from `src/ui/components`.
- **Persistence**
  - Older risk docs mark “No Persistent State” as open.
  - Current code and tests (including IPC storage bridge tests and alpha readiness docs) confirm persistence is implemented and active.
- **Twitch integration**
  - `agents/project-context/known-issues.md` states that Twitch is not present as a service.
  - Current runtime (`bootstrap.ts`, `src/services/twitch-service`) fully wires Twitch as a first-class service, including in the runtime status model.

> **When in doubt:** Prefer the combination of **code + tests + `project-meta/status/*`** over older snapshot/handoff docs when they contradict each other.

