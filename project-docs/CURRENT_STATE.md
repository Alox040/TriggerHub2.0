## Scope of This Snapshot

- **Sources considered (highest weight first)**:
  - Current **code and tests** under `src/` and `website/src/`.
  - Status and readiness docs in `project-meta/status/*` and `agents/project-context/*`.
  - Implementation and risk summaries under `docs/ai-context/*` and `docs/DEV_STATUS.md`.
- **Sources treated as potentially outdated**:
  - Older snapshot, handoff, and roadmap docs when they conflict with the items above.

## What Already Works (Desktop)

### Core Runtime and Engines

- **Trigger Engine**
  - Registration, update, removal, and execution of triggers via `TriggerEngine` and `TriggerGraph`.
  - Strongly-typed event topics; publishes `trigger:executed` events.
  - Verified by dedicated tests (`core-trigger.test.ts`, `trigger-graph.test.ts`, `trigger-executor.test.ts`).
- **Macro Engine**
  - Macro registration, update, removal, and execution via `MacroEngine` and `MacroRunner`.
  - Supports nested macros and run options; publishes `macro:completed` events.
  - Covered by `core-macro.test.ts` and additional engine tests.
- **Event Bus**
  - In-memory event bus with namespaced topics and wildcard subscriptions.
  - Tested in `event-bus.test.ts`.

### Desktop Services and Persistence

- **Services**
  - OBS, Spotify, Clip, and Twitch services exist with in-memory transports and HTTP transports (OBS/Spotify/Twitch).
  - Service adapters and transports are validated in `services.test.ts`.
  - Clip service supports connect/disconnect, startCapture, and saveClip (with in-memory exporter) and is tested.
- **Persistence**
  - Storage IPC and persistence for triggers and macros:
    - `createAppModuleContainer` accepts a `StoragePort`.
    - `storageBridge` handles `loadOrSeedCoreData` and `persistCoreData`.
    - IPC bridge and persistence behavior are tested via `storage.test.ts` and `ipc-storage-bridge.e2e.test.ts`.
  - Trigger/macro payloads are versioned and migratable according to status docs.

### Desktop UI

- **App wiring**
  - `src/main.tsx` creates a runtime container, calls `start()`, and wraps the React tree in `AppProvider`.
  - `App` uses `TriggerHubAppFacade` to load dashboard/editor/plugins/settings state and execute actions.
  - Dashboard component is tested with the real facade (`ui-dashboard.test.tsx`).
- **Pages**
  - Dashboard:
    - Shows triggers and macros derived from the runtime (`DashboardState` → `DashboardViewModel`).
    - Clicking a trigger executes it through the facade and refreshes state.
  - Settings:
    - Shows runtime status (`RuntimeStatusViewModel`) including OBS/Spotify/Clip/Twitch connectivity flags.
    - Offers actions to activate/deactivate the runtime and connect/disconnect Twitch.
  - Trigger and Macro editors:
    - Pages exist and are wired to CRUD handlers and run actions on the facade.
  - Plugins:
    - Shows plugin inventory based on `PluginRegistry`.
- **Error handling**
  - `ErrorBoundary` is implemented in `src/ui/components` and used in `App` to guard page rendering.
  - `App` shows a toast-like error overlay for asynchronous failures.

### Tooling, Build, and CI/CD

- **Build and typecheck status**
  - `project-meta/status/build-status.json` reports `test`, `typecheck`, `rootBuild`, `websiteBuild`, and `audit` as `pass` (as of 2026‑03‑12).
  - `project-meta/status/release-status.md` confirms green builds (outside the sandbox).
- **CI/CD workflows**
  - `.github/workflows/ci.yml`, `quality-gate.yml`, `release.yml`, `website-update.yml`, `context-sync.yml`, `godai-validation.yml` are present.
  - `IMPLEMENTATION_STATUS.md` and `DEV_STATUS.md` describe the CI/quality-gate setup as complete.
- **Packaging**
  - Electron-builder configuration for an NSIS Windows installer is present and wired via `desktop:build`/`desktop:release` scripts.
  - Release docs describe a manual verification and upload process.

## What Already Works (Website)

- **Auth v1**
  - Owner-based auth with server-side credential verification and JWT cookies.
  - CSRF protection via dedicated token and middleware.
  - Tests for auth flow and browser guards (`website-auth-v1.test.ts`, `website-browser-guards.test.ts`).
- **Profile system**
  - Profile storage, validation, and runtime in `website/src/modules/profile`.
  - Tested in `website-profile-v1.test.ts`.
- **Routing and access control**
  - Route manifest and guards enforce access rules for public vs protected routes.
  - Access modes modeled as `private_prelaunch`, `invite_only`, and `public_product`.
- **Deployment**
  - Vercel deployment settings documented in `website/README.md` and `docs/deployment/vercel-deployment.md`.

## What Is Incomplete or In Flux

### Desktop Runtime and Integrations

- **Electron IPC bridge**
  - No `preload` script or `contextBridge` wiring is present in the repo.
  - Risk and roadmap docs consistently flag IPC as a critical gap (e.g., for hotkeys, window control, file access).
- **Real external service integrations**
  - OBS/Spotify/Twitch HTTP transports exist but are not yet wired to production-ready authentication and connection flows (e.g., OBS WebSocket, Spotify OAuth).
  - Clip service uses an in-memory exporter and does not yet implement real screen capture via Electron APIs.
- **Transport selection**
  - Bootstrap uses in-memory transports by default; environment/config-driven selection of HTTP or real transports is described in docs but not yet implemented.

### Desktop UI and UX

- **Editor and management UX**
  - Trigger and macro editor pages are present and wired to the facade, but their forms, validation, and overall UX are still evolving.
  - Docs and tests describe the UI as functionally incomplete for a closed alpha (limited management experience beyond the dashboard).
- **Hotkeys and window management**
  - `HotkeyManager` and `WindowManager` are still effectively stubs; real hotkey and window behavior is blocked on IPC integration.

### Website

- **Access modes and runtime behavior**
  - Code supports multiple access modes via `runtimeConfig.ts`.
  - Status docs describe the effective runtime as still constrained to `private_prelaunch`.
  - README text describes `public_product` as the active default, which conflicts with the newer status docs (see “Uncertainties” below).

### Release and Operational Maturity

- **Release verification**
  - Windows NSIS packaging is configured and build-tested, but release docs stress that actual, externally-verified release artifacts and hosting configuration are still pending.
- **Coverage and metrics**
  - Vitest coverage is not yet configured; no coverage thresholds are enforced.
  - Runtime hardening and structured logging are implemented and tested, but operational observability in production is not described in detail.

## Known Bugs and Issues (From Repo)

> These are based on `agents/project-context/known-issues.md`, `TECH_DEBT_AND_RISKS.md`, and status docs, filtered against current code to avoid already-resolved items.

- **Documentation drift**
  - Multiple snapshot, handoff, and roadmap docs contradict current code and status files.
  - Project meta explicitly states that code, tests, and `project-meta/status/*` must be treated as primary sources when conflicts arise.
- **Website access mode ambiguity**
  - Tests and status docs indicate the website runtime is effectively locked to `private_prelaunch`.
  - `website/README.md` claims `public_product` is the current default mode.
  - Without deployment configuration in the repo, this discrepancy cannot be fully resolved here.
- **Service realism**
  - In-memory transports mean the desktop app cannot yet control real OBS, Spotify, or capture real clips out of the box.
  - HTTP transports exist and are tested, but no production configuration or secrets for real services are checked in (by design).

## Resolved vs Still-Claimed Issues (Cleaned Up)

- **Resolved but still mentioned as open in some docs**
  - **UI disconnected from backend**:
    - Older docs described the UI as using mock data only.
    - Current `AppContext`, `App`, and tests show a fully wired connection to the runtime.
  - **No persistence / unverifizierte Storage-IPC**:
    - Older docs treated persistence and IPC as missing.
    - Current tests (`storage.test.ts`, `ipc-storage-bridge.e2e.test.ts`) and alpha-readiness docs confirm persistence and IPC are implemented and working.
  - **No CI/CD pipeline**:
    - Early docs describe only a website sync workflow.
    - Multiple CI and quality-gate workflows now exist and are referenced in implementation status docs.
  - **No error boundary**:
    - Risk docs list the absence of an error boundary.
    - `ErrorBoundary` exists and is used in `App`.
  - **No Twitch integration**:
    - `known-issues.md` states that Twitch is not present as a service.
    - Runtime and types clearly show Twitch as a wired service (`createTwitchService` and Twitch flags in `DashboardState`/`SettingsState`).

## Explicit Uncertainties

- **Deployed website mode**
  - The repository contains code and configuration for all three access modes.
  - Status docs treat `private_prelaunch` as the current effective mode.
  - `website/README.md` suggests `public_product` as default.
  - **This doc assumes the status docs are authoritative for “current state”, but deployment configuration is not visible here.**
- **Real external integrations**
  - Tests run entirely against in-memory or HTTP transports without real service credentials.
  - It is unclear from the repo alone whether any production environment currently connects to live OBS/Spotify/Twitch APIs; this is intentionally not encoded in versioned config.

