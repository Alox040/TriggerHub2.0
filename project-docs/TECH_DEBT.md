## Scope and Sources

- **Primary sources**:
  - `docs/ai-context/TECH_DEBT_AND_RISKS.md`
  - `docs/ai-context/IMPLEMENTATION_STATUS.md`
  - `docs/DEV_STATUS.md`
  - `agents/project-context/known-issues.md`
  - `project-meta/status/*`
  - Current code (especially `src/app/bootstrap.ts`, `src/core/*`, `src/services/*`, `src/App.tsx`, `website/src/*`).
- **Goal**:
  - Normalize and de-duplicate technical debt descriptions.
  - Mark items that earlier docs list as open but are now resolved.
  - Group debt into **architectural problems**, **code smells**, and **risky areas**.

## Architectural Problems

### 1. Missing Electron IPC Bridge

- **Description**
  - React renderer and Electron main process have **no structured IPC bridge** (no `preload` script or `contextBridge` wiring).
- **Impact**
  - Hotkeys and window management cannot call real Electron APIs.
  - File system operations and system tray features are blocked.
  - Auto-update notifications cannot be surfaced to the UI.
- **Evidence**
  - `DEV_RUN_BUILD_RELEASE.md` and `TECH_DEBT_AND_RISKS.md` flag this as a critical gap.
  - No `electron/preload.cjs` or equivalent exists; `electron/main.cjs` does not configure a preload script.
- **Status**
  - **Open** (CRITICAL).

### 2. Real External Service Integrations Not Wired End-to-End

- **Description**
  - OBS, Spotify, Clip, and Twitch services are implemented with in-memory and HTTP transports, but **real-world integrations** (WebSocket for OBS, OAuth for Spotify, real screen capture for Clip) are not yet configured or exercised in production-like environments.
- **Impact**
  - Out-of-the-box runtime cannot fully control real OBS/Spotify or capture real screen clips.
  - System behaves like a high-fidelity simulation rather than a fully integrated automation hub.
- **Evidence**
  - `TECH_DEBT_AND_RISKS.md` risk “No Real Service Connections”.
  - Tests run against in-memory transports (`services.test.ts`) and HTTP client contracts, not live services.
  - No secrets or production endpoints checked into the repo by design.
- **Status**
  - **Open** (HIGH).

### 3. Transport and Environment Selection

- **Description**
  - Bootstrap currently **hardcodes in-memory transports**; environment-based selection of HTTP or real transports is not implemented.
- **Impact**
  - The runtime cannot be flipped into “real service” mode without code changes.
  - Testing and production environments cannot cleanly distinguish simulation vs real integration.
- **Evidence**
  - `DEV_RUN_BUILD_RELEASE.md` notes missing production transport selection.
  - `createObsService`, `createSpotifyService`, and `createTwitchService` support `transport: 'memory' | 'http'`, but `bootstrap.ts` always calls them without options.
- **Status**
  - **Open** (MEDIUM–HIGH).

### 4. Legacy Module Footprint

- **Description**
  - Legacy modules from v1 (`src/deck-engine`, `src/event-bus`, `src/plugin-system`, `src/profiles`, `src/store`) still exist alongside the new architecture.
- **Impact**
  - Cognitive overhead and risk of accidental imports from legacy modules.
  - Potential type conflicts and confusion for new contributors.
- **Evidence**
  - `TECH_DEBT_AND_RISKS.md` (Legacy Module Pollution).
- **Status**
  - **Open** but deliberately deferred; safe removal requires a focused clean-up pass.

### 5. Website Access Model Ambiguity

- **Description**
  - Website code supports multiple access modes; docs disagree on the **currently effective runtime mode**.
- **Impact**
  - Ambiguous expectations about who can access what in production.
  - Risk of misconfiguring deployments (e.g., unintentionally public vs prelaunch-only).
- **Evidence**
  - `website/README.md` describes `public_product` as the current default and active mode.
  - `alpha-readiness.md` and `release-status.md` state that `runtimeConfig.ts` effectively enforces `private_prelaunch`.
  - `runtimeConfig.ts` itself is neutral and derives the mode from `VITE_ACCESS_MODE`.
- **Status**
  - **Open** (MEDIUM).
  - **Documentation debt:** newer status docs supersede the README; deployment intent should be clarified and made consistent.

## Code Smells and Design Gaps

### 6. Hotkey and Window Manager Stubs

- **Description**
  - `HotkeyManager` and `WindowManager` exist but are **stub implementations** without real Electron integration.
- **Impact**
  - Hotkey-based flows and window control features cannot be implemented without further work.
- **Evidence**
  - `TECH_DEBT_AND_RISKS.md` (RISK‑11, RISK‑12) and IPC gap notes.
  - Implementations in `src/core/app-control` are minimal and lack IPC calls.
- **Status**
  - **Open** (LOW now, becomes HIGH once users expect these features).

### 7. Plugin Action Registry Wiring

- **Description**
  - `PluginContext` includes `actionRegistry: ActionRegistryPort`, but the full wiring and external plugin usage model are still evolving.
- **Impact**
  - Third-party or advanced plugins may not be able to register all desired actions cleanly.
- **Evidence**
  - `TECH_DEBT_AND_RISKS.md` flags the ActionRegistry as not fully wired.
  - `bootstrap.ts` wires an executor/action registry; the long-term plugin extension surface is not yet fully stabilized.
- **Status**
  - **Open** (MEDIUM).

### 8. Website Runtime Configuration vs Tests

- **Description**
  - Tests and status docs assume certain constraints (e.g. `private_prelaunch`), while the resolver now supports all access modes via `VITE_ACCESS_MODE`.
- **Impact**
  - Future changes to env configuration could break assumptions in tests and docs if not updated together.
- **Evidence**
  - `runtimeConfig.ts`, tests under `src/tests/website-*`, and status docs.
- **Status**
  - **Open** (documentation and contract alignment issue).

### 9. Design System Integration

- **Description**
  - The design system (`design/`) is a separate project with its own UI components and tokens; the desktop UI (`src/ui`) and website UI reference similar patterns but **no shared package or automated sync** exists.
- **Impact**
  - UI divergence and duplicated component work over time.
- **Evidence**
  - `TECH_DEBT_AND_RISKS.md` (Design System Import Gap).
  - Distinct Vite projects for design vs product apps.
- **Status**
  - **Open** (MEDIUM).

## Risky Areas (Operational and Release)

### 10. Incomplete Auto-Update Story

- **Description**
  - Auto-update is planned (agents and prompts exist) but **not implemented** in code.
- **Impact**
  - Users must manually download and install each new version.
  - Harder to roll out fixes and security patches.
- **Evidence**
  - `TECH_DEBT_AND_RISKS.md` and `NEXT_STEPS_ROADMAP.md` (RISK‑05, Auto-Update planned).
  - No `electron-updater` dependency or update handlers found in Electron main.
- **Status**
  - **Open** (HIGH for production scenarios).

### 11. Release Process Verification

- **Description**
  - NSIS packaging and release workflows exist, but release docs emphasize that live, externally verified release runs and hosting configuration are not yet fully proven.
- **Impact**
  - Risk of release or installer issues not caught before distribution.
- **Evidence**
  - `project-meta/status/release-status.md`, `DEV_STATUS.md`.
  - Manual steps documented under release process.
- **Status**
  - **Open** (MEDIUM).

### 12. Observability and Coverage

- **Description**
  - Tests are comprehensive for core logic, but **coverage metrics are disabled**, and operational observability is not fully documented.
- **Impact**
  - Harder to quantify gaps in test coverage and detect regressions.
  - Production monitoring and metrics story is not explicit.
- **Evidence**
  - `IMPLEMENTATION_STATUS.md` notes coverage disabled in `vitest.config.ts`.
  - Runtime-hardening tests exist, but pipeline-level observability is not extensively documented.
- **Status**
  - **Open** (LOW–MEDIUM).

## Resolved or Partially Resolved Items (Previously Listed as Debt)

> These items still appear as risks or TODOs in some older docs but are resolved or superseded in current code and status files.

### A. UI Disconnected from Backend

- **Old claim**
  - UI rendered mock data; `bootstrap.ts` was not wired.
- **Current state**
  - `AppContext`, `App`, and tests confirm a fully wired runtime:
    - `createAppModuleContainer` is called before render.
    - `App` calls `facade.getDashboardState()` and other facade methods.
    - Events from `TriggerEngine` and `MacroEngine` drive UI refresh.
- **Status**
  - **Resolved**.

### B. No Persistence / Unverified Storage IPC

- **Old claim**
  - Triggers and macros were in-memory only, and storage IPC was unverified.
- **Current state**
  - Persistence via `storageBridge` and `StoragePort` is implemented and validated in:
    - `storage.test.ts`
    - `ipc-storage-bridge.e2e.test.ts`
  - Alpha readiness and release status docs treat persistence as implemented.
- **Status**
  - **Resolved** (remaining concerns are about API documentation, not basic functionality).

### C. No CI/CD Pipeline

- **Old claim**
  - Only a website sync workflow existed; no typecheck/test/build in CI.
- **Current state**
  - CI and quality-gate workflows are present and described as complete in later docs (`IMPLEMENTATION_STATUS.md`, `DEV_STATUS.md`).
  - `project-meta/status/build-status.json` lists all gates as `pass`.
- **Status**
  - **Resolved** (further refinement is still possible but core gap is closed).

### D. No Error Boundary in UI

- **Old claim**
  - React UI had no error boundary and could crash to a blank screen.
- **Current state**
  - `ErrorBoundary` exists in `src/ui/components`.
  - `App` wraps the active page in `<ErrorBoundary>` with a fallback message.
- **Status**
  - **Resolved**.

### E. Twitch Integration Missing

- **Old claim**
  - Known-issues doc claimed Twitch was not present as a service.
- **Current state**
  - `createTwitchService` and Twitch service contracts are implemented.
  - Runtime container wires Twitch into the service state and facade (`connectTwitch`, `disconnectTwitch`).
  - UI reflects Twitch connectivity in `RuntimeStatusViewModel` and `SettingsPage`.
- **Status**
  - **Resolved**.

## Prioritized Focus Areas (From Tech-Debt Perspective)

- **Highest priority architectural problems**
  - Implement Electron IPC bridge (enables hotkeys, window control, file access, and future features).
  - Introduce configuration-driven transport selection and begin connecting at least one real external service end-to-end (OBS is the most obvious candidate).
- **Medium priority design/code improvements**
  - Clean up legacy modules once a deprecation window is agreed.
  - Stabilize the plugin action registry surface and document it for plugin authors.
  - Align website runtime configuration, tests, and docs on a single canonical access model description.
- **Lower priority but important quality work**
  - Enable coverage metrics and set thresholds.
  - Tighten electron security defaults and document security posture (referenced in existing security docs).
  - Formalize design system sharing between `design/`, desktop UI, and website UI.

