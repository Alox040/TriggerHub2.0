## Scope and Principles

- This roadmap consolidates existing plans from:
  - `docs/ai-context/NEXT_STEPS_ROADMAP.md`
  - `docs/ai-context/TECH_DEBT_AND_RISKS.md`
  - `docs/DEV_STATUS.md`
  - `project-meta/status/*`
- It reflects only what is **supported by the repository** and **updates obviously outdated items** (for example, CI and error boundary are already implemented).
- Phases are aligned with the existing phase model but re-focused based on current code and status.

## Phase 3 — Runtime & Developer Foundations

> Focus: solid desktop runtime, CI, and documentation hygiene.

- **3.1 Electron IPC Bridge (CRITICAL)**
  - Implement `electron/preload` with `contextBridge.exposeInMainWorld`.
  - Add IPC handlers in `electron/main.cjs` for:
    - Hotkey-triggered actions (e.g. toggle fullscreen).
    - Window control (minimize, maximize).
    - File system access where needed.
  - Define TypeScript types for `window.electronAPI` and consume them in `src/core/app-control`.
- **3.2 HotkeyManager and WindowManager Completion**
  - Wire `HotkeyManager` to real Electron IPC calls (register/unregister, dispatch).
  - Implement `WindowManager` operations via IPC handlers.
  - Add tests that simulate IPC calls (where feasible) to prevent regressions.
- **3.3 CI/Quality Gate Hardening**
  - Keep existing workflows (`ci.yml`, `quality-gate.yml`, `release.yml`) as the primary quality gates.
  - Add:
    - Coverage reporting with minimum thresholds for core packages.
    - Clear failure conditions for website build and audits.
  - Ensure `project-meta/status/build-status.json` is updated automatically or via a documented process.
- **3.4 Documentation Drift Cleanup**
  - Systematically align:
    - `website/README.md` with `alpha-readiness.md` and `release-status.md` on access modes.
    - Older risk and status docs with the current implementation of persistence, CI, error handling, and Twitch integration.
  - Mark legacy snapshot/handoff docs as explicitly superseded where needed.

## Phase 4 — Real Integrations and Persistence Experience

> Focus: “real” creator workflows and durable configuration.

- **4.1 OBS Integration (HIGH)**
  - Introduce an OBS WebSocket transport (for example, via `obs-websocket-js`).
  - Add OBS connection settings to a configuration layer (with safe env handling).
  - Map key OBS events (scene changes, stream status) to `EventTopics` and triggers.
  - Provide at least one end-to-end trigger/macro scenario that controls OBS.
- **4.2 Spotify Integration (MEDIUM–HIGH)**
  - Implement OAuth2/OIDC-based token flow for Spotify, using secure storage for tokens.
  - Create a production-ready `SpotifyTransport` that uses the official Web API.
  - Map playback events into the event bus (e.g. track changed, playback started/paused).
- **4.3 Clip Capture (MEDIUM)**
  - Replace purely in-memory clip export with an Electron-based capture path (e.g. `desktopCapturer` + export pipeline).
  - Wire capture and export to the existing clip service API and tests.
- **4.4 Persistence UX and Migration**
  - Document the persistence format for triggers and macros as an internal API.
  - Provide simple tooling (CLI or in-app) to inspect and reset stored automation data.
  - Extend tests to cover real-world migration scenarios beyond the current versioned envelopes.

## Phase 5 — Desktop UX and Release Readiness

> Focus: complete in-app management and production-ready delivery.

- **5.1 Trigger and Macro Editor UX**
  - Flesh out editor pages with:
    - Validated forms for triggers (events, conditions, actions).
    - Visual representation of macro step sequences, including nested steps.
    - Inline error messaging based on engine invariants.
  - Add tests that cover editing flows and failure cases.
- **5.2 Plugin Management UX**
  - Enhance the plugins page with:
    - Enable/disable toggles per plugin.
    - Basic plugin health/status indicators.
    - Clear messaging for example vs custom plugins.
- **5.3 Auto-Update Implementation**
  - Integrate an auto-update solution (such as `electron-updater`), consistent with existing release workflows.
  - Add IPC handlers and UI surfaces for:
    - Checking for updates.
    - Download progress.
    - Ready-to-install prompts.
  - Ensure updates fit into the NSIS packaging flow and GitHub Releases or equivalent.
- **5.4 Release Verification and Security**
  - Run tracked, documented release test runs on real Windows environments.
  - Audit electron security settings in `main.cjs` (contextIsolation, sandbox, CSP, etc.).
  - Update `project-meta/status/release-status.*` once a full release cycle is verified.

## Phase 6 — Website Access Model & Experience

> Focus: clarifying and evolving the website’s role around onboarding and owner/creator UX.

- **6.1 Canonical Access Model**
  - Decide and document whether the primary runtime mode is:
    - `private_prelaunch`
    - `invite_only`
    - `public_product`
  - Align:
    - `runtimeConfig.ts`
    - Tests under `src/tests/website-*`
    - `website/README.md`
    - `alpha-readiness.md` and `release-status.md`
  - Ensure build-time guards enforce the intended access mode.
- **6.2 Onboarding and Profile Experience**
  - Refine onboarding flows on the website so they match the decided access model.
  - Ensure profile-related routes and components surface all relevant status content exported from `project-meta`.
- **6.3 Website Status and Marketing Content**
  - Keep using `project-context/website-status.json` as the source of truth and run the export script as part of release preparation.
  - Harden tests around generated status content and public pages.

## Phase 7 — Ecosystem and Design Consolidation

> Focus: plugins, design system, and long-term maintainability.

- **7.1 Plugin Ecosystem Foundations**
  - Finalize the `PluginContext` surface (including `ActionRegistryPort`).
  - Document a stable plugin API with examples derived from the existing example plugin.
  - Add tests and sample plugins that illustrate recommended patterns.
- **7.2 Design System Sharing**
  - Decide on a strategy:
    - Make `design/` a workspace package importable by desktop and website UIs.
    - Or establish an explicit “copy from design” convention with clear tracking.
  - Reduce duplication between `design/`, `src/ui`, and `website/src/components/ui`.
- **7.3 Observability and Quality Metrics**
  - Enable coverage metrics in Vitest and add thresholds for critical modules.
  - Expand runtime-hardening and logging tests to cover newly introduced IPC and integration flows.

## Phase 8 — Stretch Goals (Explicitly Not Started)

> These are mentioned in existing docs as long-term directions; they are **not started** and should not be assumed to exist.

- **8.1 Marketplace and Remote Control**
  - Plugin marketplace, remote control apps, and cloud sync have been discussed conceptually but are not implemented.
- **8.2 AI-Assisted Automation**
  - AI-trigger generation or cloud automation agents are referenced in some architecture docs as future ideas.
- **8.3 Multi-Device Control**
  - Multi-device orchestration is mentioned as a future scaling goal, but no code currently exists for it.

## Uncertainties and How to Resolve Them

- **Website deployment mode**
  - The repo does not contain deployed env values; to fully resolve discrepancies, check the actual environment configuration used by the website deployment.
- **External service readiness**
  - The presence of HTTP transports and tests indicates intent, not necessarily live integration. Confirm real endpoints and secrets with deployment configuration and monitoring data.
- **Release status**
  - Status docs stress that some statements (especially around releases) remain environment-sensitive; treat `project-meta/status/*` as authoritative, but expect them to be updated after real release exercises.

