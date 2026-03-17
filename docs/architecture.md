## Architecture

TriggerHub 2.0 consists of three main product areas:

- **Desktop app**: Electron shell hosting a React SPA that controls the TriggerHub runtime (triggers, macros, plugins, services).
- **Website**: Standalone Vite/React marketing + owner-only app with hardened auth and access control.
- **Support projects**: Design system (`design/`) and packaging tooling (`tools/exe-builder/`), which are not part of the runtime.

The desktop app and website share no runtime code, but both follow a **ports-and-adapters (hexagonal)** style: core logic is isolated behind typed ports and accessed through facades.

---

## Desktop app architecture

### Process model

- **Electron main process** (`electron/main.cjs`)
  - Creates the desktop window and loads `dist/index.html` in production.
  - Hosts IPC handlers exposed via `electron/preload.cjs` (e.g. storage bridge, clip exporter, window management).
  - Integrates with a JSON-file-based storage layer (`electron/jsonFileStorage.cjs`).
- **Preload script** (`electron/preload.cjs`)
  - Uses `contextBridge` to expose a limited `window.triggerHubElectron` API to the React renderer.
  - Bridges storage and desktop-only capabilities into the browser sandbox.
- **Renderer** (desktop UI)
  - Built with Vite + React + TypeScript from `src/`.
  - Entry point mounts `App` and wires the dependency-injected runtime container created in `src/app/bootstrap.ts`.

### Layering

From outermost to innermost:

- **UI layer** (`src/ui/**`, `src/App.tsx`)
  - Renders dashboard, trigger editor, macro editor, plugin inventory and runtime settings.
  - Uses `AppProvider` / `useAppContext` to obtain a fully-wired `TriggerHubAppFacade`.
  - Never talks directly to core engines or services; all user actions go through the facade.
- **Application layer** (`src/app/**`)
  - **Composition root**: `createAppModuleContainer(...)` in `src/app/bootstrap.ts` wires all engines, services, plugin registry and runtime activation.
  - **Facade**: `TriggerHubAppFacade` (`src/app/facade.ts`) is the single public API for the UI. It:
    - Exposes read models (`DashboardState`, `EditorState`, `PluginsState`, `SettingsState`).
    - Wraps trigger/macro CRUD and execution.
    - Orchestrates runtime activation/deactivation and Twitch connectivity.
    - Persists state via a small injected persistence callback.
  - **Read model**: `src/app/readModel.ts` validates and normalizes domain state into UI-facing view models.
  - **Runtime configuration & activation**:
    - `src/app/runtimeConfig.ts` defines the runtime configuration shape and defaults.
    - `src/app/serviceActivation.ts` centralizes runtime start/stop semantics, wiring engines, services and plugins to the event bus.
    - `src/app/storageBridge.ts` and `src/app/storageHelpers.ts` coordinate storage keys, seeds and migration.
- **Domain/core layer** (`src/core/**`)
  - **Trigger engine** (`src/core/trigger-engine/**`)
    - `TriggerGraph` maintains a dual index of triggers (by id and by event name).
    - `TriggerEngine` subscribes to the event bus and dispatches actions when conditions match.
    - `TriggerExecutor` (accessed via the action registry) delegates concrete actions to services.
  - **Macro system** (`src/core/macro-system/**`)
    - `MacroEngine` stores macro definitions and validates invariants.
    - `MacroRunner` executes steps such as delays, service calls, nested macros, conditionals and sequences.
  - **Event bus** (`src/core/event-bus/**`)
    - `InMemoryEventBus` implements namespaced topics (e.g. `obs:scene-changed`, `trigger:executed`) with wildcard subscriptions.
    - All engines and services use this as the primary in-process messaging surface.
  - **App control** (`src/core/app-control/**`)
    - `AppController`, `HotkeyManager` and `WindowManager` encapsulate lifecycle and desktop integration.
    - Currently, hotkey and window operations are wired for future Electron IPC integration.
- **Service layer** (`src/services/**`)
  - Implements typed ports from `src/types/ports.ts` for the external world:
    - `ObsServicePort`, `SpotifyServicePort`, `ClipServicePort`, `TwitchServicePort`.
  - Uses adapter modules to isolate protocol specifics:
    - OBS: `src/services/obs-service/**`
    - Spotify: `src/services/spotify-service/**`
    - Clips: `src/services/clip-service/**`
    - Twitch: `src/services/twitch-service/**`
  - Each service has:
    - A **contract** file (`contracts.ts`) that defines the public interface and payloads.
    - One or more **transport implementations** (e.g. in-memory, HTTP, Node/Electron) behind a shared index.
    - A small **actions** module (`*Actions.ts`) that wraps calls with reliability policies.
- **Plugin system** (`src/plugins/**`)
  - `PluginRegistry` manages registration, activation and deactivation of plugins.
  - `PluginModule` and `PluginContext` (from `src/types/ports.ts`) define the contract:
    - Plugins can access the event bus, trigger and macro engines, app controller and action registry.
  - Plugin execution is hardened with structured logging and error isolation (see `runtime-hardening.md`).

### Cross-cutting concerns

- **Types and ports** (`src/types/**`)
  - `domain.ts` defines core domain models: triggers, macros, dashboard state and well-known event topics.
  - `ports.ts` defines all key port interfaces used across layers.
  - These files are the main source of truth for public contracts inside the desktop runtime.
- **Runtime hardening** (`docs/runtime/runtime-hardening.md`, `src/runtime/**`, `src/utils/logger.ts`)
  - Structured, JSON-style logging with namespaces and contextual payloads.
  - Runtime error boundaries and global window-level error handlers.
  - Metrics for trigger and macro execution times, service latency and lifecycle events.
- **Persistence** (`docs/implementation/desktop-persistence.md`, `src/app/storageBridge.ts`, `src/storage/**`, `electron/jsonFileStorage.cjs`)
  - All desktop state persists through a `StoragePort` abstraction.
  - In Electron, storage is backed by JSON files under the app’s user data directory, bridged via IPC.
  - Seed data is used only as a fallback when no usable persisted data is available, and is immediately persisted when used.

---

## Website architecture

The website is an independent Vite/React project in `website/` with its own configuration and build.

### Runtime structure

- **Entry points**
  - `website/src/main.tsx` mounts the React app.
  - `website/src/App.tsx` wires providers (auth, profile) and renders the routed application.
- **Routing and guards** (`website/src/app/routing/**`)
  - `routeManifest.ts` defines all known routes and mode-specific policies (e.g. which routes are public vs protected in each access mode).
  - `accessGuard.ts` evaluates route policies given:
    - The current access mode.
    - The current identity/session snapshot.
    - The prelaunch gate status.
  - `AppRouter.tsx` coordinates initialization of auth and prelaunch providers and applies redirects.
- **Providers**
  - `AuthProvider.tsx`:
    - Manages owner session state based on server-side `GET /api/auth/me` snapshots.
    - Performs login/logout by calling the website API.
  - `PrelaunchGateProvider.tsx`:
    - Manages the prelaunch gate (owner-only prelaunch) state.
    - Talks to `/api/prelaunch-gate/login` and `/api/prelaunch-gate/me`.
  - `ProfileProvider.tsx`:
    - Attaches a browser-local profile runtime to an authenticated identity.
    - Coordinates with the profile service module.
- **Modules**
  - `website/src/modules/auth/**`:
    - Types for auth/session.
    - `backendSession.ts` validates session snapshots from the server.
    - `errors.ts` standardizes auth error handling.
  - `website/src/modules/access-control/**`:
    - Access mode constants and validation (`ACCESS_MODES`, `DEFAULT_ACCESS_MODE`, `isAccessMode`).
    - Policy evaluation for routes across modes.
  - `website/src/modules/identity/**` and `website/src/modules/profile/**`:
    - Identity and profile storage interfaces, validation and runtime.
    - Decouple identity (`users`) from profile data (`profiles`) for future multi-user support.
  - `website/src/config/runtimeConfig.ts`:
    - Derives the effective access mode and other public runtime flags from `import.meta.env`.
    - Intentionally restricts the active mode to `private_prelaunch` today, with `invite_only` and `public_product` reserved for later.
- **Pages and components**
  - `website/src/pages/**` implements the main pages:
    - Marketing landing and feature pages.
    - `/login`, `/access`, `/app`, `/dashboard`, `/profile`, `/settings`, `/forbidden`, etc.
  - `website/src/components/**` provides a design-system-inspired component library (buttons, cards, diagrams, flows).

### Website backend/API

The website backend surface is implemented as Vercel serverless functions in `website/api/**`. Auth is intentionally owner-only and hardens session handling:

- **Prelaunch gate** (`website/api/_prelaunchGate.ts`, `website/api/prelaunch-gate/*.ts`)
  - Validates a shared prelaunch access key.
  - Issues an HMAC-signed HttpOnly gate cookie (`th_prelaunch_gate`).
  - All owner auth endpoints require a valid gate cookie.
- **Owner auth** (`website/api/_auth.ts`, `website/api/auth/*.ts`)
  - Provides `POST /api/auth/login`, `GET /api/auth/me` and `POST /api/auth/logout`.
  - Uses PBKDF2-SHA256 with a server-only hash/salt for password verification.
  - Issues an HMAC-signed HttpOnly session cookie (`th_prelaunch_session`) with strict SameSite and Secure flags.
- **Configuration and hardening**
  - Sensitive env vars are server-only (no `VITE_` prefix); the build is blocked if auth secrets would leak into the bundle.
  - `docs/WEBSITE_AUTH_V1.md`, `docs/WEBSITE_PROFILE_V1.md`, `docs/WEBSITE_BACKEND_AUTH_CONTRACT.md`, `docs/WEBSITE_AUTH_SEQUENCE_DIAGRAM.md` and `docs/implementation/website-access-model.md` contain deep-dive details and should be read as extensions of this architecture, not as separate sources of truth.

---

## Supporting projects

- **Design system** (`design/`)
  - Independent Vite + Tailwind/shadcn UI library.
  - Acts as a visual and interaction reference for both desktop app and website; it is not bundled into the main runtimes.
- **EXE builder** (`tools/exe-builder/`)
  - Utility project for packaging the desktop application into Windows installers and running smoke tests.
  - Invoked via root scripts like `tool:exe-builder:start` and `tool:exe-builder:smoke`.

---

## Architectural principles

- **Ports and adapters**
  - All external integrations (OBS, Spotify, Twitch, clips, storage, plugins) are represented as ports in `src/types/ports.ts` and implemented by adapter modules.
- **Single composition root per runtime**
  - `src/app/bootstrap.ts` is the only place that wires the desktop runtime.
  - `website/src/main.tsx` and `website/src/app/providers/*` encapsulate website wiring.
- **Event-driven runtime**
  - Internally, the desktop app relies on the in-memory event bus rather than direct references between engines and services.
  - Well-known event topics are declared in `src/types/domain.ts` and used consistently across the codebase.
- **Separation of product and planning**
  - This document, together with `modules.md`, `data-flow.md`, `api.md` and `development.md`, is the canonical description of the current architecture.
  - Planning- and roadmap-oriented documents are intentionally kept separate in `docs/roadmap.md` and historical files to avoid conflating future intent with implemented behavior.

